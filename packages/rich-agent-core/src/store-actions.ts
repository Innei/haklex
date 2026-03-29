import type { StoreApi } from 'zustand/vanilla';

import {
  type AgentStoreStatus,
  type ChatBubble,
  createInitialAgentStoreState,
} from './initialState';
import type { StoreSetter } from './store-types';
import type { DiffState } from './types';

type AgentStoreShape = {
  bubbles: ChatBubble[];
  diffState: DiffState | null;
  status: AgentStoreStatus;
};

export type AgentStoreActionMethods = {
  addBubble: (bubble: ChatBubble) => void;
  reset: () => void;
  setDiffState: (diffState: DiffState | null) => void;
  setStatus: (status: AgentStoreStatus) => void;
  updateLastBubble: (bubble: ChatBubble) => void;
};

type Setter = StoreSetter<AgentStoreShape & AgentStoreActionMethods>;

export const createAgentStoreSlice = (
  set: Setter,
  get: () => AgentStoreShape & AgentStoreActionMethods,
  api?: StoreApi<AgentStoreShape & AgentStoreActionMethods>,
) => new AgentStoreActionImpl(set, get, api);

export class AgentStoreActionImpl {
  readonly #get: () => AgentStoreShape & AgentStoreActionMethods;
  readonly #set: Setter;

  constructor(
    set: Setter,
    get: () => AgentStoreShape & AgentStoreActionMethods,
    api?: StoreApi<AgentStoreShape & AgentStoreActionMethods>,
  ) {
    void api;
    this.#set = set;
    this.#get = get;
  }

  addBubble = (bubble: ChatBubble) => {
    this.#set((state) => ({ bubbles: [...state.bubbles, bubble] }));
  };

  reset = () => {
    this.#set(createInitialAgentStoreState());
  };

  setDiffState = (diffState: DiffState | null) => {
    this.#set({ diffState });
  };

  setStatus = (status: AgentStoreStatus) => {
    this.#set({ status });
  };

  updateLastBubble = (bubble: ChatBubble) => {
    const { bubbles } = this.#get();
    if (bubbles.length === 0) return;

    const nextBubbles = [...bubbles];
    nextBubbles[nextBubbles.length - 1] = bubble;

    this.#set({ bubbles: nextBubbles });
  };
}

export type AgentStoreActions = Pick<AgentStoreActionImpl, keyof AgentStoreActionImpl>;
