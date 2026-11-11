// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../tests/harness';
import { click, doubleClick, drag, mountEditor, pointer, wheel } from '../../tests/harness';
import { newElement } from '../model/create';
import { createWhiteboardStore } from './store';
import { screenToScene, zoomAt } from './viewport';

let mounted: Mounted | undefined;
afterEach(() => mounted?.unmount());

function filled(id: string, x: number, y: number, extra: Record<string, unknown> = {}) {
  return {
    ...newElement('rectangle', { x, y, width: 100, height: 100, backgroundColor: '#ffc9c9' }),
    id,
    ...extra,
  };
}

describe('viewport math', () => {
  it('converts screen to scene with scroll and zoom', () => {
    expect(screenToScene([100, 50], { scrollX: 10, scrollY: 0, zoom: 2 })).toEqual([40, 25]);
  });

  it('keeps the scene point under the cursor fixed when zooming', () => {
    const vp = { scrollX: 30, scrollY: -20, zoom: 1 };
    const before = screenToScene([200, 120], vp);
    const next = zoomAt(vp, [200, 120], 2.5);
    expect(next.zoom).toBe(2.5);
    const after = screenToScene([200, 120], next);
    expect(after[0]).toBeCloseTo(before[0]);
    expect(after[1]).toBeCloseTo(before[1]);
  });

  it('clamps zoom between 0.1 and 30', () => {
    const vp = { scrollX: 0, scrollY: 0, zoom: 1 };
    expect(zoomAt(vp, [0, 0], 100).zoom).toBe(30);
    expect(zoomAt(vp, [0, 0], 0.01).zoom).toBe(0.1);
  });
});

describe('selection tool', () => {
  it('selects an element on click', () => {
    const store = createWhiteboardStore({ elements: [filled('a', 100, 100)] });
    mounted = mountEditor(store);
    click(mounted.canvas, 150, 150);
    expect([...store.getState().selectedIds]).toEqual(['a']);
  });

  it('adds to the selection with shift and clears on empty click', () => {
    const store = createWhiteboardStore({
      elements: [filled('a', 0, 0), filled('b', 200, 0)],
    });
    mounted = mountEditor(store);
    click(mounted.canvas, 50, 50);
    click(mounted.canvas, 250, 50, { shiftKey: true });
    expect([...store.getState().selectedIds].sort()).toEqual(['a', 'b']);
    click(mounted.canvas, 500, 500);
    expect(store.getState().selectedIds.size).toBe(0);
  });

  it('box-selects elements that are fully inside the box', () => {
    const store = createWhiteboardStore({
      elements: [filled('a', 10, 10, { width: 20, height: 20 }), filled('b', 40, 40)],
    });
    mounted = mountEditor(store);
    pointer(mounted.canvas, 'pointerdown', 0, 0);
    pointer(mounted.canvas, 'pointermove', 60, 60);
    expect(store.getState().selectionBox).toEqual([0, 0, 60, 60]);
    pointer(mounted.canvas, 'pointerup', 60, 60);
    expect([...store.getState().selectedIds]).toEqual(['a']);
    expect(store.getState().selectionBox).toBeNull();
  });

  it('selects the whole group when clicking a grouped element', () => {
    const store = createWhiteboardStore({
      elements: [
        filled('a', 0, 0, { groupIds: ['g1'] }),
        filled('b', 200, 0, { groupIds: ['g1'] }),
        filled('c', 400, 0),
      ],
    });
    mounted = mountEditor(store);
    click(mounted.canvas, 50, 50);
    expect([...store.getState().selectedIds].sort()).toEqual(['a', 'b']);
  });

  it('enters a group on double click and then selects single members', () => {
    const store = createWhiteboardStore({
      elements: [
        filled('a', 0, 0, { groupIds: ['g1'] }),
        filled('b', 200, 0, { groupIds: ['g1'] }),
      ],
    });
    mounted = mountEditor(store);
    click(mounted.canvas, 50, 50);
    doubleClick(mounted.canvas, 50, 50);
    expect(store.getState().editingGroupId).toBe('g1');
    click(mounted.canvas, 250, 50);
    expect([...store.getState().selectedIds]).toEqual(['b']);
  });

  it('moves the selection as one history entry', () => {
    const store = createWhiteboardStore({ elements: [filled('a', 100, 100)] });
    mounted = mountEditor(store);
    drag(mounted.canvas, [150, 150], [170, 160]);
    const moved = store.getState().elements[0];
    expect([moved.x, moved.y]).toEqual([120, 110]);
    expect(moved.version).toBe(2);
    store.undo();
    expect(store.getState().elements[0].x).toBe(100);
    expect(store.canUndo()).toBe(false);
  });

  it('moves bound text together with its container', () => {
    const store = createWhiteboardStore({
      elements: [
        filled('box', 0, 0, { boundElements: [{ id: 't', type: 'text' }] }),
        {
          ...newElement('rectangle', {}),
          id: 't',
          type: 'text',
          x: 20,
          y: 40,
          width: 60,
          height: 20,
          containerId: 'box',
          text: 'x',
        },
      ],
    });
    mounted = mountEditor(store);
    drag(mounted.canvas, [10, 10], [30, 10]);
    expect(store.getState().elements[1].x).toBe(40);
  });

  it('ignores locked elements', () => {
    const store = createWhiteboardStore({ elements: [filled('a', 0, 0, { locked: true })] });
    mounted = mountEditor(store);
    click(mounted.canvas, 50, 50);
    expect(store.getState().selectedIds.size).toBe(0);
  });
});

describe('canvas navigation', () => {
  it('pans with the wheel', () => {
    const store = createWhiteboardStore({ elements: [] });
    mounted = mountEditor(store);
    wheel(mounted.canvas, 0, 0, { deltaX: 10, deltaY: 20 });
    expect(store.getState().viewport).toMatchObject({ scrollX: -10, scrollY: -20, zoom: 1 });
  });

  it('zooms with ctrl + wheel around the pointer', () => {
    const store = createWhiteboardStore({ elements: [] });
    mounted = mountEditor(store);
    wheel(mounted.canvas, 100, 100, { deltaY: -100, ctrlKey: true });
    const vp = store.getState().viewport;
    expect(vp.zoom).toBeGreaterThan(1);
    const [x, y] = screenToScene([100, 100], vp);
    expect(x).toBeCloseTo(100);
    expect(y).toBeCloseTo(100);
  });

  it('pans with the hand tool', () => {
    const store = createWhiteboardStore({ elements: [] });
    store.setState({ tool: 'hand' });
    mounted = mountEditor(store);
    drag(mounted.canvas, [100, 100], [130, 90]);
    expect(store.getState().viewport).toMatchObject({ scrollX: 30, scrollY: -10 });
  });
});
