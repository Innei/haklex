import { useSyncExternalStore } from 'react';

import { DEFAULT_STYLE } from '../model/defaults';
import { syncIndices } from '../model/fractional-index';
import { bumpVersion } from '../model/mutate';
import { orderByIndex, reconcileElements } from '../model/reconcile';
import { normalizeElement } from '../model/restore';
import { resolveRichTextHeights } from '../model/richtext-layout';
import { supersede } from '../model/supersede';
import type { BinaryFiles, ExcalidrawElement } from '../scene/types';
import { createHistory } from './history';
import type { Doc, DocUpdater, EditorState, SceneDoc } from './types';

export interface RemoteUpdate {
  elements?: readonly ExcalidrawElement[];
  files?: BinaryFiles;
}

export interface WhiteboardStore {
  amend: (fn: (doc: Doc) => Doc) => void;
  applyRemote: (update: RemoteUpdate) => void;
  beginTransient: () => void;
  canRedo: () => boolean;
  canUndo: () => boolean;
  commit: (updater: DocUpdater) => void;
  endTransient: (keep: boolean) => void;
  getScene: () => SceneDoc;
  getState: () => EditorState;
  isDirty: () => boolean;
  isTransient: () => boolean;
  redo: () => void;
  setState: (patch: Partial<EditorState>) => void;
  subscribe: (listener: () => void) => () => void;
  undo: () => void;
  updateTransient: (updater: DocUpdater) => void;
}

const DEFAULT_BACKGROUND = '#ffffff';

function normalizeChanged(
  prev: readonly ExcalidrawElement[],
  next: readonly ExcalidrawElement[],
): ExcalidrawElement[] {
  const before = new Map(prev.map((el) => [el.id, el]));
  const normalized = next.map((el) => (before.get(el.id) === el ? el : normalizeElement(el)));
  return syncIndices(normalized);
}

function referencedFileIds(elements: readonly ExcalidrawElement[]): Set<string> {
  const ids = new Set<string>();
  for (const el of elements) {
    if (!el.isDeleted && el.type === 'image' && el.fileId) ids.add(el.fileId);
  }
  return ids;
}

export interface WhiteboardStoreOptions {
  sync?: boolean;
}

export function createWhiteboardStore(
  input: Record<string, unknown> | undefined,
  options: WhiteboardStoreOptions = {},
): WhiteboardStore {
  const { sync = false } = options;
  const original = (input ?? {}) as Record<string, unknown>;
  const originalAppState = original.appState as Record<string, unknown> | undefined;
  const originalFiles = (original.files as BinaryFiles | undefined) ?? {};
  const loaded = (Array.isArray(original.elements) ? original.elements : []) as ExcalidrawElement[];
  const initialElements = resolveRichTextHeights(sync ? orderByIndex(loaded) : loaded);
  const initialBackground =
    (originalAppState?.viewBackgroundColor as string | undefined) ?? DEFAULT_BACKGROUND;
  const initialGrid = (originalAppState?.gridSize as number | null | undefined) ?? null;

  let state: EditorState = {
    elements: initialElements,
    files: originalFiles,
    canvasSize: { width: 0, height: 0 },
    selectedIds: new Set(),
    selectedPointIndex: null,
    selectionBox: null,
    suggestedBindingId: null,
    editingGroupId: null,
    editingFrameId: null,
    editingLinearId: null,
    editingRichTextId: null,
    editingTextId: null,
    erasingIds: new Set(),
    tool: 'selection',
    toolLocked: false,
    currentStyle: DEFAULT_STYLE,
    viewport: { scrollX: 0, scrollY: 0, zoom: 1 },
    gridSize: initialGrid,
    viewBackgroundColor: initialBackground,
  };
  const listeners = new Set<() => void>();
  const history = createHistory();
  let transientSnapshot: Doc | null = null;

  const emit = () => {
    for (const listener of listeners) listener();
  };

  const pending = new Map<string, ExcalidrawElement>();

  const protectedIds = (): Set<string> => {
    const ids = new Set<string>();
    for (const id of [state.editingTextId, state.editingRichTextId, state.editingLinearId])
      if (id) ids.add(id);
    if (state.editingTextId) {
      const container = state.elements.find((el) => el.id === state.editingTextId);
      const owner = (container as { containerId?: string | null } | undefined)?.containerId;
      if (owner) ids.add(owner);
    }
    if (transientSnapshot) {
      const before = new Map(transientSnapshot.elements.map((el) => [el.id, el]));
      for (const el of state.elements) if (before.get(el.id) !== el) ids.add(el.id);
    }
    return ids;
  };

  const mergeRemote = (remote: readonly ExcalidrawElement[]): Partial<EditorState> | null => {
    const result = reconcileElements(state.elements, remote, protectedIds());
    for (const el of result.deferred) pending.set(el.id, el);
    if (result.accepted.length === 0) return null;
    const taken = new Map(result.accepted.map((el) => [el.id, el]));
    const rewrite = (doc: Doc): Doc => {
      const known = new Set(doc.elements.map((el) => el.id));
      return {
        ...doc,
        elements: [
          ...doc.elements.map((el) => taken.get(el.id) ?? el),
          ...result.accepted.filter((el) => !known.has(el.id)),
        ],
      };
    };
    history.rewrite(rewrite);
    if (transientSnapshot) transientSnapshot = rewrite(transientSnapshot);
    const alive = new Set(result.elements.filter((el) => !el.isDeleted).map((el) => el.id));
    return {
      elements: resolveRichTextHeights(syncIndices(result.elements)),
      selectedIds: new Set([...state.selectedIds].filter((id) => alive.has(id))),
    };
  };

  const flushPending = () => {
    if (pending.size === 0) return;
    const waiting = [...pending.values()];
    pending.clear();
    const patch = mergeRemote(waiting);
    if (patch) state = { ...state, ...patch };
  };

  const set = (patch: Partial<EditorState>) => {
    state = { ...state, ...patch };
    flushPending();
    emit();
  };

  const docOf = (): Doc => ({ elements: state.elements, files: state.files });

  const apply = (updater: DocUpdater): Doc | null => {
    const current = docOf();
    const result = updater(current);
    if (!result) return null;
    const elements = result.elements
      ? resolveRichTextHeights(normalizeChanged(current.elements, result.elements))
      : current.elements;
    const files = result.files ?? current.files;
    if (elements === current.elements && files === current.files) return null;
    return { elements, files };
  };

  const restore = (doc: Doc) => {
    const elements = sync ? supersede(state.elements, doc.elements) : doc.elements;
    const alive = new Set(elements.filter((el) => !el.isDeleted).map((el) => el.id));
    set({
      elements,
      files: doc.files,
      selectedIds: new Set([...state.selectedIds].filter((id) => alive.has(id))),
      editingTextId: null,
      editingFrameId: null,
      editingLinearId: null,
      selectedPointIndex: null,
      suggestedBindingId: null,
    });
  };

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setState: set,
    commit(updater) {
      if (transientSnapshot) {
        const next = apply(updater);
        if (next) set(next);
        return;
      }
      const before = docOf();
      const next = apply(updater);
      if (!next) return;
      history.push(before);
      set(next);
    },
    applyRemote(update) {
      const patch: Partial<EditorState> = update.elements
        ? (mergeRemote(update.elements) ?? {})
        : {};
      if (update.files && Object.keys(update.files).length > 0) {
        const added = update.files;
        const withFiles = (doc: Doc): Doc => ({ ...doc, files: { ...doc.files, ...added } });
        history.rewrite(withFiles);
        if (transientSnapshot) transientSnapshot = withFiles(transientSnapshot);
        patch.files = { ...state.files, ...added };
      }
      if (Object.keys(patch).length > 0) set(patch);
    },
    amend(fn) {
      history.rewrite(fn);
      if (transientSnapshot) transientSnapshot = fn(transientSnapshot);
      const next = apply((doc) => fn(doc));
      if (next) set(next);
    },
    beginTransient() {
      transientSnapshot ??= docOf();
    },
    updateTransient(updater) {
      const next = apply(updater);
      if (next) set(next);
    },
    endTransient(keep) {
      const snapshot = transientSnapshot;
      transientSnapshot = null;
      if (!snapshot) return;
      const unchanged = snapshot.elements === state.elements && snapshot.files === state.files;
      if (!keep) {
        if (!unchanged) restore(snapshot);
        return;
      }
      if (unchanged) return;
      history.push(snapshot);
      if (!sync) return;
      const before = new Map(snapshot.elements.map((el) => [el.id, el]));
      set({
        elements: state.elements.map((el) => (before.get(el.id) === el ? el : bumpVersion(el))),
      });
    },
    isTransient: () => transientSnapshot !== null,
    undo() {
      const entry = history.undo(docOf());
      if (entry) restore(entry);
    },
    redo() {
      const entry = history.redo(docOf());
      if (entry) restore(entry);
    },
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    isDirty: () =>
      state.elements !== initialElements ||
      state.files !== originalFiles ||
      state.viewBackgroundColor !== initialBackground ||
      state.gridSize !== initialGrid,
    getScene() {
      const scene: SceneDoc = {
        ...original,
        elements: state.elements.filter((el) => !el.isDeleted),
      };
      const appStatePatch: Record<string, unknown> = {};
      if (state.viewBackgroundColor !== initialBackground) {
        appStatePatch.viewBackgroundColor = state.viewBackgroundColor;
      }
      if (state.gridSize !== initialGrid) appStatePatch.gridSize = state.gridSize;
      if (originalAppState || Object.keys(appStatePatch).length > 0) {
        scene.appState = { ...originalAppState, ...appStatePatch };
      }
      const referenced = referencedFileIds(state.elements);
      const files: BinaryFiles = { ...originalFiles };
      for (const [id, file] of Object.entries(state.files)) {
        if (!(id in originalFiles) && referenced.has(id)) files[id] = file;
      }
      if ('files' in original || Object.keys(files).length > 0) scene.files = files;
      return scene;
    },
  };
}

export function useStore<T>(store: WhiteboardStore, selector: (state: EditorState) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
}
