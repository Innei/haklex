import type { PollDataAdapter, PollState } from '@haklex/rich-ext-poll';
import { useSyncExternalStore } from 'react';

interface PollStore {
  byPollId: Record<string, PollState>;
}

const STORAGE_KEY = 'haklex-demo-poll-store-v1';

const seedTallies: Record<string, Record<string, number>> = {
  p_demo_single: {
    o_ragdoll: 412,
    o_amshort: 287,
    o_orange: 158,
  },
  p_demo_multi: {
    o_cat: 893,
    o_dog: 1124,
    o_hamster: 142,
    o_fish: 309,
  },
};

function loadInitialStore(): PollStore {
  if (typeof window === 'undefined') return { byPollId: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PollStore;
  } catch {
    /* fall through */
  }
  return { byPollId: {} };
}

function totalOf(tallies: Record<string, number>): number {
  return Object.values(tallies).reduce((acc, n) => acc + n, 0);
}

function buildState(pollId: string, prev: PollState | undefined): PollState {
  const tallies = prev?.tallies ?? { ...seedTallies[pollId] };
  return {
    tallies,
    totalVotes: totalOf(tallies),
    userVote: prev?.userVote,
    status: 'ready',
    closed: false,
    canVote: prev?.userVote === undefined,
  };
}

class PollMockBackend {
  private store: PollStore = loadInitialStore();
  private listeners = new Set<() => void>();

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getState = (pollId: string): PollState => {
    if (!this.store.byPollId[pollId]) {
      this.store.byPollId[pollId] = buildState(pollId, undefined);
    }
    return this.store.byPollId[pollId];
  };

  submit = async (pollId: string, optionIds: string[]): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 280));
    const current = this.getState(pollId);
    const tallies = { ...current.tallies };
    for (const id of optionIds) {
      tallies[id] = (tallies[id] ?? 0) + 1;
    }
    this.store = {
      ...this.store,
      byPollId: {
        ...this.store.byPollId,
        [pollId]: {
          ...current,
          tallies,
          totalVotes: totalOf(tallies),
          userVote: optionIds,
          canVote: false,
          status: 'ready',
        },
      },
    };
    this.persist();
    this.emit();
  };

  private emit() {
    for (const listener of this.listeners) listener();
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store));
    } catch {
      /* ignore quota errors */
    }
  }
}

const backend = new PollMockBackend();

export const mockPollAdapter: PollDataAdapter = {
  usePollState: (pollId) =>
    useSyncExternalStore(
      backend.subscribe,
      () => backend.getState(pollId),
      () => backend.getState(pollId),
    ),
  useSubmit: (pollId) => (optionIds) => backend.submit(pollId, optionIds),
};
