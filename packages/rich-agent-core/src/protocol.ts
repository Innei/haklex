import type { LitexmlRegistryProvider } from './litexml';

export type ChatMessage =
  | { role: 'system'; content: string; cacheBreakpoint?: boolean }
  | {
      role: 'user';
      content: string;
      cacheBreakpoint?: boolean;
      metadata?: UserMessageMetadata;
    }
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
  /**
   * Opens a streaming tool call. Emitted as soon as `(id, name)` are both known,
   * before any argument bytes arrive — useful for upstream providers (e.g. pi-ai)
   * that surface a dedicated start event. The executor renders a placeholder row
   * immediately with empty params; subsequent `tool_call_partial` / `tool_call`
   * frames with the same `id` overwrite it.
   */
  | { type: 'tool_call_start'; id: string; name: string }
  /**
   * Streaming snapshot of a tool call still under construction. `argumentsPartial`
   * is the accumulated raw JSON text up to this frame (may be unparseable mid-stream)
   * — providers emit the latest snapshot per id, not incremental deltas, so the
   * executor can render the in-progress params without maintaining accumulator state.
   */
  | { type: 'tool_call_partial'; id: string; name: string; argumentsPartial: string }
  /**
   * Final, complete tool call. Serves as the implicit "end" of a streaming call
   * (if `tool_call_start` / `tool_call_partial` were previously emitted with the
   * same `id`, the executor reuses the existing item) and as a standalone atomic
   * tool call for providers that don't stream arguments.
   */
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
  compact?: boolean;
  litexmlRegistry?: LitexmlRegistryProvider;
  mode: 'full' | 'structure' | 'selection-window';
  selectedBlockIds?: Set<string>;
  windowSize?: number;
};

export type PageSelection = {
  xml: string;
  startLine?: number;
  endLine?: number;
};

export type CapturedSelection =
  | { type: 'block'; blockIds: string[] }
  | {
      type: 'text';
      text: string;
      anchorBlockId: string;
      anchorOffset: number;
      focusBlockId: string;
      focusOffset: number;
    };

export type CapturedTextSelection = {
  text: string;
  anchorBlockId: string;
  anchorOffset: number;
  focusBlockId: string;
  focusOffset: number;
  containingBlocksXml: string;
};

export type UserMessageMetadata = {
  pageSelections?: PageSelection[];
  capturedSelection?: CapturedSelection;
} & Record<string, unknown>;

export type PageContentMetadata = {
  charCount?: number;
  fileType?: string;
  lineCount?: number;
  title: string;
};

export type PageContentContext = {
  markdown?: string;
  metadata: PageContentMetadata;
  xml?: string;
};

export type MessageEngineInitialContext = {
  pageEditor?: PageContentContext;
};

export type MessageEngineStepContext = {
  stepPageEditor?: {
    xml?: string;
  };
};

export type MessageEngineContext = {
  messages: ChatMessage[];
  pageContentContext?: PageContentContext;
  initialContext?: MessageEngineInitialContext;
  stepContext?: MessageEngineStepContext;
  textSelection?: CapturedTextSelection;
};

export type MessageDraft = {
  systemMessages: Array<Extract<ChatMessage, { role: 'system' }>>;
  messages: ChatMessage[];
};

export interface MessageEngine {
  process: (context: MessageEngineContext) => PreparedMessages;
}

export type PreparedMessages = {
  systemMessages: ChatMessage[];
  preambleMessages: ChatMessage[];
  turns: ChatMessage[];
};
