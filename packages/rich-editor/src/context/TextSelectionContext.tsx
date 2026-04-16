import type { ReactNode } from 'react';
import { createContext, use, useRef, useSyncExternalStore } from 'react';

import type { TextSelectionSnapshot } from '../utils/text-selection';

export interface TextSelectionStoreState {
  snapshot: TextSelectionSnapshot | null;
}

export interface TextSelectionStore {
  clearSnapshot: () => void;
  getState: () => TextSelectionStoreState;
  setSnapshot: (snapshot: TextSelectionSnapshot | null) => void;
  subscribe: (listener: () => void) => () => void;
}

function areSnapshotsEqual(
  a: TextSelectionSnapshot | null,
  b: TextSelectionSnapshot | null,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;

  return (
    a.text === b.text &&
    a.anchorBlockId === b.anchorBlockId &&
    a.anchorOffset === b.anchorOffset &&
    a.focusBlockId === b.focusBlockId &&
    a.focusOffset === b.focusOffset
  );
}

export function createTextSelectionStore(
  initialState: TextSelectionStoreState = { snapshot: null },
): TextSelectionStore {
  let state = initialState;
  const listeners = new Set<() => void>();

  const emit = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setSnapshot: (snapshot) => {
      if (areSnapshotsEqual(state.snapshot, snapshot)) {
        return;
      }

      state = { ...state, snapshot };
      emit();
    },
    clearSnapshot: () => {
      if (state.snapshot === null) {
        return;
      }

      state = { ...state, snapshot: null };
      emit();
    },
  };
}

const TextSelectionStoreContext = createContext<TextSelectionStore | null>(null);

export function TextSelectionStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<TextSelectionStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createTextSelectionStore();
  }

  return (
    <TextSelectionStoreContext.Provider value={storeRef.current}>
      {children}
    </TextSelectionStoreContext.Provider>
  );
}

export function useTextSelectionStore(): TextSelectionStore {
  const store = use(TextSelectionStoreContext);
  if (!store) {
    throw new Error('useTextSelectionStore must be used within TextSelectionStoreProvider');
  }
  return store;
}

export function useTextSelectionSnapshot(): TextSelectionSnapshot | null {
  const store = useTextSelectionStore();
  return useSyncExternalStore(
    store.subscribe,
    () => store.getState().snapshot,
    () => store.getState().snapshot,
  );
}
