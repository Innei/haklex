import type { StoreApi } from 'zustand/vanilla';

import {
  type AgentStoreStatus,
  type ChatBubble,
  createInitialAgentStoreState,
} from './initialState';
import {
  acceptAndRebaseBatch,
  reconcileReviewBatches,
  rejectBatch as rejectBatchFn,
  resolveReviewEntry,
} from './review-engine';
import type { ReviewBatch, ReviewState } from './review-types';
import type { StoreSetter } from './store-types';
import type { DiffState } from './types';

type AgentStoreShape = {
  bubbles: ChatBubble[];
  diffState: DiffState | null;
  reviewState: ReviewState | null;
  status: AgentStoreStatus;
};

export type AgentStoreActionMethods = {
  addBubble: (bubble: ChatBubble) => void;
  addReviewBatch: (batch: ReviewBatch) => void;
  acceptReviewBatch: (batchId: string) => void;
  acceptReviewEntry: (batchId: string, entryId: string) => void;
  rejectReviewBatch: (batchId: string) => void;
  rejectReviewEntry: (batchId: string, entryId: string) => void;
  reset: () => void;
  setDiffState: (diffState: DiffState | null) => void;
  setReviewState: (state: ReviewState | null) => void;
  setStatus: (status: AgentStoreStatus) => void;
  updateLastBubble: (bubble: ChatBubble) => void;
  updateToolCallItem: (
    groupId: string,
    itemId: string,
    patch: Partial<import('./initialState').ToolCallGroupItem>,
  ) => void;
  addToolCallItem: (groupId: string, item: import('./initialState').ToolCallGroupItem) => void;
};

type Setter = StoreSetter<AgentStoreShape & AgentStoreActionMethods>;

export function createAgentStoreSlice(
  set: Setter,
  get: () => AgentStoreShape & AgentStoreActionMethods,
  api?: StoreApi<AgentStoreShape & AgentStoreActionMethods>,
): AgentStoreActionImpl {
  return new AgentStoreActionImpl(set, get, api);
}

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

  addReviewBatch = (batch: ReviewBatch) => {
    this.#set((state) => {
      const current = state.reviewState ?? { documentRevision: 0, batches: [] };
      const next: ReviewState = {
        ...current,
        batches: [...current.batches, batch],
      };
      return { reviewState: reconcileReviewBatches(next) };
    });
  };

  acceptReviewBatch = (batchId: string) => {
    this.#set((state) => {
      if (!state.reviewState) return {};
      return { reviewState: acceptAndRebaseBatch(state.reviewState, batchId) };
    });
  };

  acceptReviewEntry = (batchId: string, entryId: string) => {
    this.#set((state) => {
      if (!state.reviewState) return {};
      return { reviewState: resolveReviewEntry(state.reviewState, batchId, entryId, 'accepted') };
    });
  };

  rejectReviewBatch = (batchId: string) => {
    this.#set((state) => {
      if (!state.reviewState) return {};
      return { reviewState: reconcileReviewBatches(rejectBatchFn(state.reviewState, batchId)) };
    });
  };

  rejectReviewEntry = (batchId: string, entryId: string) => {
    this.#set((state) => {
      if (!state.reviewState) return {};
      return { reviewState: resolveReviewEntry(state.reviewState, batchId, entryId, 'rejected') };
    });
  };

  setReviewState = (reviewState: ReviewState | null) => {
    this.#set({ reviewState });
  };

  setStatus = (status: AgentStoreStatus) => {
    this.#set({ status });
  };

  updateToolCallItem = (
    groupId: string,
    itemId: string,
    patch: Partial<import('./initialState').ToolCallGroupItem>,
  ) => {
    this.#set((state) => {
      const idx = state.bubbles.findIndex((b) => b.type === 'tool_call_group' && b.id === groupId);
      if (idx === -1) return {};

      const group = state.bubbles[idx] as Extract<
        (typeof state.bubbles)[number],
        { type: 'tool_call_group' }
      >;
      const itemIdx = group.items.findIndex((item) => item.id === itemId);
      if (itemIdx === -1) return {};

      const nextItems = [...group.items];
      nextItems[itemIdx] = { ...nextItems[itemIdx], ...patch };

      const nextBubbles = [...state.bubbles];
      nextBubbles[idx] = { ...group, items: nextItems };

      return { bubbles: nextBubbles };
    });
  };

  addToolCallItem = (groupId: string, item: import('./initialState').ToolCallGroupItem) => {
    this.#set((state) => {
      const idx = state.bubbles.findIndex((b) => b.type === 'tool_call_group' && b.id === groupId);
      if (idx === -1) return {};

      const group = state.bubbles[idx] as Extract<
        (typeof state.bubbles)[number],
        { type: 'tool_call_group' }
      >;
      if (group.items.some((it) => it.id === item.id)) return {};

      const nextBubbles = [...state.bubbles];
      nextBubbles[idx] = { ...group, items: [...group.items, item] };
      return { bubbles: nextBubbles };
    });
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
