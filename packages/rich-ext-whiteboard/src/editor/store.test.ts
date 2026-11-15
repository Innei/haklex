import { describe, expect, it } from 'vitest';

import { newElement } from '../model/create';
import { bumpVersion } from '../model/mutate';
import { bringToFront } from './actions';
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

describe('sync versioning', () => {
  const moved =
    (x: number) =>
    ({ elements }: { elements: readonly { id: string }[] }) => ({
      elements: elements.map((el) => bumpVersion(el as never, { x } as never)),
    });

  it('undo restores the old geometry under a newer version', () => {
    const store = createWhiteboardStore({ elements: [rect('1')] }, { sync: true });
    store.commit(moved(40));
    const after = store.getState().elements[0];
    store.undo();
    const undone = store.getState().elements[0];
    expect(undone.x).toBe(0);
    expect(undone.version).toBeGreaterThan(after.version!);
    expect(undone.versionNonce).not.toBe(after.versionNonce);
    store.redo();
    const redone = store.getState().elements[0];
    expect(redone.x).toBe(40);
    expect(redone.version).toBeGreaterThan(undone.version!);
  });

  it('undoing a creation leaves a deleted element behind', () => {
    const store = createWhiteboardStore({ elements: [] }, { sync: true });
    store.commit(() => ({ elements: [rect('1')] }));
    const created = store.getState().elements[0];
    store.undo();
    const [gone] = store.getState().elements;
    expect(gone.isDeleted).toBe(true);
    expect(gone.version).toBeGreaterThan(created.version!);
    expect(store.getScene().elements).toHaveLength(0);
    store.redo();
    const [back] = store.getState().elements;
    expect(back.isDeleted).toBe(false);
    expect(back.version).toBeGreaterThan(gone.version!);
  });

  it('a kept gesture ends above every version it showed on the way', () => {
    const store = createWhiteboardStore({ elements: [rect('1')] }, { sync: true });
    const original = store.getState().elements[0];
    store.beginTransient();
    store.updateTransient(() => ({ elements: [bumpVersion(original, { x: 5 })] }));
    const midway = store.getState().elements[0].version!;
    store.updateTransient(() => ({ elements: [bumpVersion(original, { x: 9 })] }));
    store.endTransient(true);
    const final = store.getState().elements[0];
    expect(final.x).toBe(9);
    expect(final.version).toBeGreaterThan(midway);
  });

  it('a cancelled gesture returns above the versions it showed', () => {
    const store = createWhiteboardStore({ elements: [rect('1')] }, { sync: true });
    const original = store.getState().elements[0];
    store.beginTransient();
    store.updateTransient(() => ({ elements: [bumpVersion(original, { x: 5 })] }));
    const midway = store.getState().elements[0].version!;
    store.endTransient(false);
    const final = store.getState().elements[0];
    expect(final.x).toBe(0);
    expect(final.version).toBeGreaterThan(midway);
  });

  it('keeps identity on undo without the sync option', () => {
    const store = createWhiteboardStore({ elements: [rect('1')] });
    const before = store.getState().elements;
    store.commit(moved(40));
    store.undo();
    expect(store.getState().elements).toBe(before);
  });
});

describe('applyRemote', () => {
  it('merges remote elements without adding an undo entry', () => {
    const store = createWhiteboardStore({ elements: [rect('1')] }, { sync: true });
    store.applyRemote({ elements: [rect('2', 30)] });
    expect(store.getState().elements.map((el) => el.id)).toEqual(['1', '2']);
    expect(store.canUndo()).toBe(false);
  });

  it('undo keeps what the remote side changed', () => {
    const store = createWhiteboardStore({ elements: [rect('1'), rect('2', 30)] }, { sync: true });
    store.commit(({ elements }) => ({
      elements: elements.map((el) => (el.id === '1' ? bumpVersion(el, { x: 5 }) : el)),
    }));
    const remote = bumpVersion(store.getState().elements[1], { x: 77 });
    store.applyRemote({ elements: [remote], files: { f9: { id: 'f9', dataURL: 'data:,' } } });
    store.undo();
    const [one, two] = store.getState().elements;
    expect(one.x).toBe(0);
    expect(two.x).toBe(77);
    expect(store.getState().files.f9).toBeDefined();
  });

  it('holds a remote change to an element in a gesture until the gesture ends', () => {
    const store = createWhiteboardStore({ elements: [rect('1')] }, { sync: true });
    const original = store.getState().elements[0];
    store.beginTransient();
    store.updateTransient(() => ({ elements: [bumpVersion(original, { x: 5 })] }));
    store.applyRemote({ elements: [{ ...original, version: 50, x: 400 }] });
    expect(store.getState().elements[0].x).toBe(5);
    store.endTransient(true);
    expect(store.getState().elements[0].x).toBe(400);
  });

  it('keeps layer order through a save and a shuffled reload', () => {
    const store = createWhiteboardStore(
      { elements: [rect('1'), rect('2'), rect('3')] },
      { sync: true },
    );
    store.setState({ selectedIds: new Set(['1']) });
    bringToFront(store);
    expect(store.getState().elements.map((el) => el.id)).toEqual(['2', '3', '1']);
    const saved = store.getScene().elements;
    const reloaded = createWhiteboardStore(
      { elements: [saved[2], saved[0], saved[1]] },
      { sync: true },
    );
    expect(reloaded.getState().elements.map((el) => el.id)).toEqual(['2', '3', '1']);
  });
});
