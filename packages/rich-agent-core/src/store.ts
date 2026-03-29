import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla';

import { type AgentStoreState, createInitialAgentStoreState } from './initialState';
import { type AgentStoreActions, createAgentStoreSlice } from './store-actions';
import { flattenActions } from './store-utils';

export type { AgentStoreState, ChatBubble } from './initialState';
export type { AgentStoreActions } from './store-actions';

export type AgentStoreSlice = AgentStoreState & AgentStoreActions;
export type AgentStore = StoreApi<AgentStoreSlice>;

const createAgentStoreState: StateCreator<AgentStoreSlice> = (...params) => ({
  ...createInitialAgentStoreState(),
  ...flattenActions<AgentStoreActions>([createAgentStoreSlice(...params)]),
});

export function createAgentStore(): AgentStore {
  return createStore<AgentStoreSlice>()(createAgentStoreState);
}
