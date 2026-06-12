import type { CapturedSelection } from './protocol';
import type { ReviewState } from './review-types';
import type { DiffState } from './types';

export type ToolCallItemStatus = 'pending' | 'running' | 'completed' | 'error';

export type ToolCallGroupItem = {
  id: string;
  toolName: string;
  description?: string;
  params: Record<string, unknown>;
  status: ToolCallItemStatus;
  result?: string;
  resultPreview?: string;
  error?: string;
  startedAt?: number;
  finishedAt?: number;
};

export type ChatBubble =
  | { type: 'user'; content: string; selection?: CapturedSelection }
  | { type: 'assistant'; content: string; streaming?: boolean }
  | { type: 'tool_call'; toolName: string; params: Record<string, unknown> }
  | { type: 'tool_result'; toolName: string; success: boolean; summary: string }
  | {
      type: 'thinking';
      content: string;
      id?: string;
      rawText?: string;
      steps?: string[];
      isStreaming?: boolean;
    }
  | { type: 'tool_call_group'; id: string; items: ToolCallGroupItem[] }
  | { type: 'error'; message: string }
  | { type: 'diff_summary'; accepted: number; rejected: number; pending: number }
  | { type: 'diff_review'; batchId: string };

export type AgentStoreStatus =
  | 'idle'
  | 'running'
  | 'thinking'
  | 'calling_tool'
  | 'writing'
  | 'done';

export type AgentStoreState = {
  status: AgentStoreStatus;
  bubbles: ChatBubble[];
  diffState: DiffState | null;
  reviewState: ReviewState | null;
  liveSelection: CapturedSelection | null;
  pinnedSelection: CapturedSelection | null;
};

export function createInitialAgentStoreState(initialBubbles?: ChatBubble[]): AgentStoreState {
  return {
    status: 'idle',
    bubbles: initialBubbles ?? [],
    diffState: null,
    reviewState: null,
    liveSelection: null,
    pinnedSelection: null,
  };
}
