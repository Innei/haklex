export type ChatMessage =
  | { role: 'system'; content: string; cacheBreakpoint?: boolean }
  | { role: 'user'; content: string; cacheBreakpoint?: boolean }
  | { role: 'assistant'; content: string }
  | { role: 'assistant_tool_call'; toolCalls: ToolCall[] }
  | { role: 'tool_result'; toolCallId: string; content: string; isError?: boolean };

export type ToolCall = {
  id: string;
  name: string;
  arguments: string;
};

export type ToolSchema = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export type LLMChunk =
  | { type: 'text'; text: string }
  | { type: 'thinking'; text: string }
  | { type: 'tool_call'; id: string; name: string; arguments: string }
  | { type: 'done' };

export type LLMProvider = {
  chat: (messages: ChatMessage[], tools?: ToolSchema[]) => AsyncIterable<LLMChunk>;
};

export type AgentToolResult = { ok: true; content: string } | { ok: false; error: ToolError };

export type ToolError = {
  error: 'block_modified' | 'block_not_found' | string;
  blockId?: string;
  message: string;
  currentContent?: string;
};

export type AgentToolConfig = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (params: unknown) => Promise<AgentToolResult>;
  describeCall?: (params: unknown) => string;
};

export type DocumentContextOptions = {
  mode: 'full' | 'structure' | 'selection-window';
  windowSize?: number;
};

export type MessagePipeline = {
  systemMessages: ChatMessage[];
  actionPrompt: ChatMessage;
  turns: ChatMessage[];
};
