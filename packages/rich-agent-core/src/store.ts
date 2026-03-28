import type { DiffState } from './types';

export type ChatBubble =
  | { type: 'user'; content: string }
  | { type: 'assistant'; content: string; streaming?: boolean }
  | { type: 'tool_call'; toolName: string; params: Record<string, unknown> }
  | { type: 'tool_result'; toolName: string; success: boolean; summary: string }
  | { type: 'error'; message: string }
  | { type: 'diff_summary'; accepted: number; rejected: number; pending: number };

export type AgentStoreState = {
  status: 'idle' | 'running' | 'done';
  bubbles: ChatBubble[];
  diffState: DiffState | null;
};

export type AgentStoreAction =
  | { type: 'set_status'; status: AgentStoreState['status'] }
  | { type: 'add_bubble'; bubble: ChatBubble }
  | { type: 'update_last_bubble'; bubble: ChatBubble }
  | { type: 'set_diff_state'; diffState: DiffState | null }
  | { type: 'reset' };

export type AgentStore = {
  getState: () => AgentStoreState;
  subscribe: (listener: (state: AgentStoreState) => void) => () => void;
  dispatch: (action: AgentStoreAction) => void;
};

function initialState(): AgentStoreState {
  return { status: 'idle', bubbles: [], diffState: null };
}

function reduce(state: AgentStoreState, action: AgentStoreAction): AgentStoreState {
  switch (action.type) {
    case 'set_status': {
      return { ...state, status: action.status };
    }
    case 'add_bubble': {
      return { ...state, bubbles: [...state.bubbles, action.bubble] };
    }
    case 'update_last_bubble': {
      if (state.bubbles.length === 0) return state;
      const bubbles = [...state.bubbles];
      bubbles[bubbles.length - 1] = action.bubble;
      return { ...state, bubbles };
    }
    case 'set_diff_state': {
      return { ...state, diffState: action.diffState };
    }
    case 'reset': {
      return initialState();
    }
  }
}

export function createAgentStore(): AgentStore {
  let state = initialState();
  const listeners = new Set<(state: AgentStoreState) => void>();

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispatch: (action) => {
      state = reduce(state, action);
      for (const listener of listeners) {
        listener(state);
      }
    },
  };
}
