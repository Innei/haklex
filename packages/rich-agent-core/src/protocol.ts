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
