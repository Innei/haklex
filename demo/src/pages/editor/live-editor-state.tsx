import type { SerializedEditorState } from 'lexical';
import type { ComponentProps } from 'react';
import { useDeferredValue, useState, useSyncExternalStore } from 'react';

import { Panel } from '../../components/Panel';
import { JsonPanel } from '../../components/workbench/JsonPanel';
import { LexicalRenderer } from '../../lexical';

export interface LiveEditorState {
  get: () => SerializedEditorState;
  set: (state: SerializedEditorState) => void;
  subscribe: (listener: () => void) => () => void;
}

function createLiveEditorState(initial: SerializedEditorState): LiveEditorState {
  let current = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => current,
    set: (state) => {
      if (state === current) return;
      current = state;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function useLiveEditorState(initial: SerializedEditorState): LiveEditorState {
  const [store] = useState(() => createLiveEditorState(initial));
  return store;
}

function useLiveValue(store: LiveEditorState) {
  return useDeferredValue(useSyncExternalStore(store.subscribe, store.get, store.get));
}

export function LiveJsonPanel({ store }: { store: LiveEditorState }) {
  const data = useLiveValue(store);
  return <JsonPanel data={data} note="Live EditorState. Updates as you type." />;
}

type RendererProps = Omit<ComponentProps<typeof LexicalRenderer>, 'value'>;

export function LiveRendererPanel({ store, ...props }: RendererProps & { store: LiveEditorState }) {
  const value = useLiveValue(store);
  return (
    <Panel badge={props.variant} title="Renderer (readonly)">
      <LexicalRenderer {...props} value={value} />
    </Panel>
  );
}
