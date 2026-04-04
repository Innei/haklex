import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla';

import {
  type AgentStoreState,
  type ChatBubble,
  createInitialAgentStoreState,
} from './initialState';
import { type AgentStoreActions, createAgentStoreSlice } from './store-actions';
import { flattenActions } from './store-utils';

export type { AgentStoreState, ChatBubble } from './initialState';
export type { AgentStoreActions } from './store-actions';

export type AgentStoreSlice = AgentStoreState & AgentStoreActions;
export type AgentStore = StoreApi<AgentStoreSlice>;

export function createAgentStore(initialBubbles?: ChatBubble[]): AgentStore {
  const stateCreator: StateCreator<AgentStoreSlice> = (...params) => ({
    ...createInitialAgentStoreState(initialBubbles),
    ...flattenActions<AgentStoreActions>([createAgentStoreSlice(...params)]),
  });
  return createStore<AgentStoreSlice>()(stateCreator);
}
