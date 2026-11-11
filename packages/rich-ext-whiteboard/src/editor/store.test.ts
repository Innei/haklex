import { describe, expect, it } from 'vitest';

import { newElement } from '../model/create';
import { bumpVersion } from '../model/mutate';
import { HISTORY_LIMIT } from './history';
import { createWhiteboardStore } from './store';

function rect(id: string, x = 0) {
  return { ...newElement('rectangle', { x, y: 0, width: 10, height: 10 }), id, index: `a${id}` };
}

const original = {
  type: 'excalidraw',
  version: 2,
  source: 'https://excalidraw.com',
  appState: { viewBackgroundColor: '#ffffff', gridSize: null, theme: 'dark', zenModeEnabled: true },
  elements: [
    { ...rect('1'), customData: { a: 1 }, futureKey: 'kept' },
    { ...rect('2'), isDeleted: true },
    { id: '3', type: 'ellipse', x: 1, y: 2, width: 3, height: 4 },
  ],
  files: { f1: { id: 'f1', dataURL: 'data:,', mimeType: 'image/png' } },
  unknownTopLevel: { keep: true },
};

describe('createWhiteboardStore', () => {
  it('returns the loaded scene unchanged apart from deleted elements', () => {
    const store = createWhiteboardStore(structuredClone(original));
    const expected = structuredClone(original);
    expected.elements = expected.elements.filter(
      (el) => !(el as { isDeleted?: boolean }).isDeleted,
    );
    expect(store.getScene()).toEqual(expected);
    expect(JSON.stringify(store.getScene())).toBe(JSON.stringify(expected));
    expect(store.isDirty()).toBe(false);
  });

  it('only overwrites viewBackgroundColor and gridSize in appState', () => {
    const store = createWhiteboardStore(structuredClone(original));
    store.setState({ gridSize: 20 });
    expect(store.getScene().appState).toEqual({ ...original.appState, gridSize: 20 });
  });

  it('commits create one history entry and undo restores the same array', () => {
    const store = createWhiteboardStore(structuredClone(original));
    const before = store.getState().elements;
    store.commit(({ elements }) => ({ elements: [...elements, rect('9', 50)] }));
    expect(store.getState().elements).toHaveLength(4);
    expect(store.isDirty()).toBe(true);
    store.undo();
    expect(store.getState().elements).toBe(before);
    expect(store.isDirty()).toBe(false);
    store.redo();
    expect(store.getState().elements).toHaveLength(4);
  });

  it('fills missing fields only on elements a commit changed', () => {
    const store = createWhiteboardStore(structuredClone(original));
    store.commit(({ elements }) => ({
      elements: elements.map((el) => (el.id === '3' ? bumpVersion(el, { x: 9 }) : el)),
    }));
    const [first, , third] = store.getState().elements as unknown as Array<Record<string, unknown>>;
    expect(third.groupIds).toEqual([]);
    expect(third.x).toBe(9);
    expect(first).toBe(store.getState().elements[0]);
    expect(first.futureKey).toBe('kept');
  });

  it('turns a transient drag into a single history entry', () => {
    const store = createWhiteboardStore({ elements: [rect('1')] });
    store.beginTransient();
    for (let i = 1; i <= 5; i++) {
      store.updateTransient(({ elements }) => ({
        elements: elements.map((el) => ({ ...el, x: i })),
      }));
    }
    store.endTransient(true);
    expect(store.getState().elements[0].x).toBe(5);
    store.undo();
    expect(store.getState().elements[0].x).toBe(0);
    expect(store.canUndo()).toBe(false);
  });

  it('restores the snapshot when a transient edit is cancelled', () => {
    const store = createWhiteboardStore({ elements: [rect('1')] });
    store.beginTransient();
    store.updateTransient(({ elements }) => ({
      elements: elements.map((el) => ({ ...el, x: 99 })),
    }));
    store.endTransient(false);
    expect(store.getState().elements[0].x).toBe(0);
    expect(store.canUndo()).toBe(false);
  });

  it('keeps at most HISTORY_LIMIT entries', () => {
    const store = createWhiteboardStore({ elements: [] });
    for (let i = 0; i < HISTORY_LIMIT + 5; i++) {
      store.commit(({ elements }) => ({ elements: [...elements, rect(String(i))] }));
    }
    let undos = 0;
    while (store.canUndo()) {
      store.undo();
      undos++;
    }
    expect(undos).toBe(HISTORY_LIMIT);
  });

  it('does not record selection or viewport changes in history', () => {
    const store = createWhiteboardStore({ elements: [rect('1')] });
    store.setState({ selectedIds: new Set(['1']), viewport: { scrollX: 5, scrollY: 5, zoom: 2 } });
    expect(store.canUndo()).toBe(false);
  });

  it('drops selection of elements removed by undo', () => {
    const store = createWhiteboardStore({ elements: [] });
    store.commit(() => ({ elements: [rect('1')] }));
    store.setState({ selectedIds: new Set(['1']) });
    store.undo();
    expect(store.getState().selectedIds.size).toBe(0);
  });

  it('notifies subscribers on change', () => {
    const store = createWhiteboardStore({ elements: [] });
    let calls = 0;
    const off = store.subscribe(() => calls++);
    store.setState({ tool: 'rectangle' });
    off();
    store.setState({ tool: 'ellipse' });
    expect(calls).toBe(1);
  });

  it('adds new files only when an element references them', () => {
    const store = createWhiteboardStore({ elements: [] });
    store.commit(() => ({
      elements: [],
      files: { orphan: { id: 'orphan', dataURL: 'data:,' } },
    }));
    expect(store.getScene().files).toBeUndefined();
  });
});
