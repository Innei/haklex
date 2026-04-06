import type { AgentStoreState } from './initialState';

export const agentStoreSelectors = {
  bubbles: (state: AgentStoreState) => state.bubbles,
  diffState: (state: AgentStoreState) => state.diffState,
  pinnedSelection: (state: AgentStoreState) => state.pinnedSelection,
  reviewState: (state: AgentStoreState) => state.reviewState,
  status: (state: AgentStoreState) => state.status,
};
