import type { AgentStoreState } from './initialState';

export const agentStoreSelectors = {
  bubbles: (state: AgentStoreState) => state.bubbles,
  diffState: (state: AgentStoreState) => state.diffState,
  status: (state: AgentStoreState) => state.status,
};
