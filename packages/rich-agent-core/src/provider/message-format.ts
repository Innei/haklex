import type { ChatMessage, ToolSchema } from '../protocol';

export function buildClaudeBody(
  messages: ChatMessage[],
  tools: ToolSchema[] | undefined,
  model: string,
) {
  const systemMsgs = messages.filter((m) => m.role === 'system');
  const nonSystemMsgs = messages.filter((m) => m.role !== 'system');

  const claudeMessages = nonSystemMsgs.map((m) => {
    if (m.role === 'user') return { role: 'user', content: m.content };
    if (m.role === 'assistant') return { role: 'assistant', content: m.content };
    if (m.role === 'assistant_tool_call') {
      return {
        role: 'assistant',
        content: m.toolCalls.map((tc) => ({
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
    return { role: (m as any).role, content: (m as any).content };
  });

  const claudeTools = tools?.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters,
  }));

  const body: Record<string, unknown> = {
    model,
    max_tokens: 4096,
    stream: true,
    messages: claudeMessages,
  };

  if (systemMsgs.length > 0) {
    body.system = systemMsgs.map((m) => ({ type: 'text', text: m.content }));
  }
  if (claudeTools?.length) {
    body.tools = claudeTools;
  }
  if (model.includes('opus') || model.includes('sonnet')) {
    body.thinking = { type: 'enabled', budget_tokens: 2048 };
  }

  return body;
}

export function buildOpenAIBody(
  messages: ChatMessage[],
  tools: ToolSchema[] | undefined,
  model: string,
) {
  const openaiMessages = messages.map((m) => {
    if (m.role === 'system') return { role: 'system', content: m.content };
    if (m.role === 'user') return { role: 'user', content: m.content };
    if (m.role === 'assistant') return { role: 'assistant', content: m.content };
    if (m.role === 'assistant_tool_call') {
      return {
        role: 'assistant',
        content: null,
        tool_calls: m.toolCalls.map((tc) => ({
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
    return { role: (m as any).role, content: (m as any).content };
  });

  const openaiTools = tools?.map((t) => ({
    type: 'function' as const,
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }));

  const body: Record<string, unknown> = {
    model,
    stream: true,
    messages: openaiMessages,
  };
  if (openaiTools?.length) {
    body.tools = openaiTools;
  }

  return body;
}
