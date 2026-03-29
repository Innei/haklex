import type { DiffState } from './types';

export type ChatBubble =
  | { type: 'user'; content: string }
  | { type: 'assistant'; content: string; streaming?: boolean }
  | { type: 'tool_call'; toolName: string; params: Record<string, unknown> }
  | { type: 'tool_result'; toolName: string; success: boolean; summary: string }
  | { type: 'thinking'; content: string }
  | { type: 'error'; message: string }
  | { type: 'diff_summary'; accepted: number; rejected: number; pending: number };

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
};

export function createInitialAgentStoreState(): AgentStoreState {
  return {
    status: 'idle',
    bubbles: [],
    diffState: null,
  };
}
