import type { Plugin } from 'vite';

function extractProviderHeaders(req: any): {
  apiKey: string;
  baseUrl: string;
  providerType: 'claude' | 'openai-compatible';
} {
  const apiKey = req.headers['x-api-key'] as string;
  const baseUrl = req.headers['x-base-url'] as string;
  const providerType = req.headers['x-provider-type'] as 'claude' | 'openai-compatible';
  return { apiKey, baseUrl, providerType };
}

export function apiProxyPlugin(): Plugin {
  return {
    name: 'api-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method === 'POST' && req.url?.startsWith('/api/models')) {
          const { apiKey, baseUrl, providerType } = extractProviderHeaders(req);

          if (!apiKey || !baseUrl) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing x-api-key or x-base-url header' }));
            return;
          }

          try {
            let response: Response;
            if (providerType === 'claude') {
              response = await fetch(`${baseUrl}/models`, {
                headers: {
                  'x-api-key': apiKey,
                  'anthropic-version': '2023-06-01',
                },
              });
            } else {
              response = await fetch(`${baseUrl}/models`, {
                headers: {
                  Authorization: `Bearer ${apiKey}`,
                },
              });
            }

            if (!response.ok) {
              res.writeHead(response.status, { 'Content-Type': 'text/plain' });
              res.end(await response.text());
              return;
            }

            const data = await response.json();
            const models = (data.data || []).map((m: any) => ({
              id: m.id,
              name: m.display_name || m.id,
            }));

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ models }));
          } catch (err: any) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(err.message || 'Failed to fetch models');
          }
          return;
        }

        if (req.method !== 'POST' || !req.url?.startsWith('/api/chat')) {
          return next();
        }

        let body = '';
        for await (const chunk of req) {
          body += chunk;
        }

        let parsed: {
          model: string;
          messages: any[];
          tools?: any[];
        };
        try {
          parsed = JSON.parse(body);
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
          return;
        }

        const { apiKey, baseUrl, providerType } = extractProviderHeaders(req);

        if (!apiKey) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing x-api-key header' }));
          return;
        }

        try {
          if (providerType === 'claude') {
            await proxyClaude(parsed, res, apiKey, baseUrl || 'https://api.anthropic.com/v1');
          } else {
            await proxyOpenAI(parsed, res, apiKey, baseUrl || 'https://api.openai.com/v1');
          }
        } catch (err: any) {
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        }
      });
    },
  };
}

async function proxyClaude(body: any, res: any, apiKey: string, baseUrl: string) {
  const { model, messages, tools } = body;

  const systemMsgs = messages.filter((m: any) => m.role === 'system');
  const nonSystemMsgs = messages.filter((m: any) => m.role !== 'system');

  const claudeMessages = nonSystemMsgs.map((m: any) => {
    if (m.role === 'user') return { role: 'user', content: m.content };
    if (m.role === 'assistant') return { role: 'assistant', content: m.content };
    if (m.role === 'assistant_tool_call') {
      return {
        role: 'assistant',
        content: m.toolCalls.map((tc: any) => ({
          type: 'tool_use',
          id: tc.id,
          name: tc.name,
          input: JSON.parse(tc.arguments),
        })),
      };
    }
    if (m.role === 'tool_result') {
      return {
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: m.toolCallId,
            content: m.content,
            is_error: m.isError,
          },
        ],
      };
    }
    return { role: m.role, content: m.content };
  });

  const claudeTools = tools?.map((t: any) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters,
  }));

  const claudeBody: any = {
    model,
    max_tokens: 4096,
    stream: true,
    messages: claudeMessages,
  };
  if (systemMsgs.length > 0) {
    claudeBody.system = systemMsgs.map((m: any) => ({ type: 'text', text: m.content }));
  }
  if (claudeTools?.length) {
    claudeBody.tools = claudeTools;
  }
  if (model.includes('opus') || model.includes('sonnet')) {
    claudeBody.thinking = { type: 'enabled', budget_tokens: 2048 };
  }

  const upstream = await fetch(`${baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'interleaved-thinking-2025-05-14',
    },
    body: JSON.stringify(claudeBody),
  });

  if (!upstream.ok) {
    const errText = await upstream.text();
    res.writeHead(upstream.status, { 'Content-Type': 'application/json' });
    res.end(errText);
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const reader = upstream.body!.getReader();
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
  } finally {
    res.end();
  }
}

async function proxyOpenAI(body: any, res: any, apiKey: string, baseUrl: string) {
  const { model, messages, tools } = body;

  const openaiMessages = messages.map((m: any) => {
    if (m.role === 'system') return { role: 'system', content: m.content };
    if (m.role === 'user') return { role: 'user', content: m.content };
    if (m.role === 'assistant') return { role: 'assistant', content: m.content };
    if (m.role === 'assistant_tool_call') {
      return {
        role: 'assistant',
        content: null,
        tool_calls: m.toolCalls.map((tc: any) => ({
          id: tc.id,
          type: 'function',
          function: { name: tc.name, arguments: tc.arguments },
        })),
      };
    }
    if (m.role === 'tool_result') {
      return {
        role: 'tool',
        tool_call_id: m.toolCallId,
        content: m.content,
      };
    }
    return { role: m.role, content: m.content };
  });

  const openaiTools = tools?.map((t: any) => ({
    type: 'function' as const,
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }));

  const openaiBody: any = {
    model,
    stream: true,
    messages: openaiMessages,
  };
  if (openaiTools?.length) {
    openaiBody.tools = openaiTools;
  }

  const upstream = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(openaiBody),
  });

  if (!upstream.ok) {
    const errText = await upstream.text();
    res.writeHead(upstream.status, { 'Content-Type': 'application/json' });
    res.end(errText);
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const reader = upstream.body!.getReader();
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
  } finally {
    res.end();
  }
}
