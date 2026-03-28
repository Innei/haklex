import type { Plugin } from 'vite';

export function apiProxyPlugin(): Plugin {
  return {
    name: 'api-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'POST' || req.url !== '/api/chat') {
          return next();
        }

        let body = '';
        for await (const chunk of req) {
          body += chunk;
        }

        let parsed: {
          provider: 'claude' | 'openai';
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

        const { provider, model, messages, tools } = parsed;

        try {
          if (provider === 'claude') {
            await proxyClaude(res, model, messages, tools);
          } else if (provider === 'openai') {
            await proxyOpenAI(res, model, messages, tools);
          } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Unknown provider: ${provider}` }));
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

async function proxyClaude(res: any, model: string, messages: any[], tools?: any[]) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }));
    return;
  }

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

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
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

async function proxyOpenAI(res: any, model: string, messages: any[], tools?: any[]) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'OPENAI_API_KEY not set' }));
    return;
  }

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

  const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
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
