import type { LexicalEditor } from 'lexical';
import { useSyncExternalStore } from 'react';

export interface FileUploadEntry {
  error?: string;
  percent: number;
  remove: () => void;
  retry: () => void;
  status: 'uploading' | 'error';
}

interface FileUploadStore {
  entries: Map<string, FileUploadEntry>;
  listeners: Set<() => void>;
}

const stores = new WeakMap<LexicalEditor, FileUploadStore>();

function getStore(editor: LexicalEditor): FileUploadStore {
  let store = stores.get(editor);
  if (!store) {
    store = { entries: new Map(), listeners: new Set() };
    stores.set(editor, store);
  }
  return store;
}

export function setFileUploadEntry(
  editor: LexicalEditor,
  nodeKey: string,
  entry: FileUploadEntry | null,
): void {
  const store = getStore(editor);
  if (entry) {
    store.entries.set(nodeKey, entry);
  } else {
    store.entries.delete(nodeKey);
  }
  for (const listener of store.listeners) listener();
}

export function useFileUploadEntry(
  editor: LexicalEditor,
  nodeKey: string | undefined,
): FileUploadEntry | undefined {
  return useSyncExternalStore(
    (onChange) => {
      const store = getStore(editor);
      store.listeners.add(onChange);
      return () => store.listeners.delete(onChange);
    },
    () => (nodeKey ? getStore(editor).entries.get(nodeKey) : undefined),
    () => undefined,
  );
}
