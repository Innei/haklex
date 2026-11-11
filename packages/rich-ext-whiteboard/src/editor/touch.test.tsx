// @vitest-environment happy-dom
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../tests/harness';
import { mountEditor, pointer } from '../../tests/harness';
import { newElement } from '../model/create';
import { createGestureTracker } from './gestures';
import { createWhiteboardStore } from './store';
import { sceneToScreen, screenToScene } from './viewport';

let mounted: Mounted | undefined;
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
});

const touch = (id: number) => ({ pointerId: id, pointerType: 'touch' });

describe('createGestureTracker', () => {
  it('zooms about the midpoint of two pointers', () => {
    const tracker = createGestureTracker();
    const vp = { scrollX: 0, scrollY: 0, zoom: 1 };
    expect(tracker.down(1, [120, 100], vp)).toBe('single');
    expect(tracker.down(2, [300, 100], vp)).toBe('pinch');
    const anchor = screenToScene([210, 100], vp);
    tracker.move(1, [20, 100]);
    const next = tracker.move(2, [400, 100])!;
    expect(next.zoom).toBeCloseTo(380 / 180);
    const [x, y] = sceneToScreen(anchor, next);
    expect(x).toBeCloseTo(210);
    expect(y).toBeCloseTo(100);
  });

  it('pans when both pointers move together', () => {
    const tracker = createGestureTracker();
    const vp = { scrollX: 0, scrollY: 0, zoom: 2 };
    tracker.down(1, [100, 100], vp);
    tracker.down(2, [200, 100], vp);
    tracker.move(1, [150, 140]);
    const next = tracker.move(2, [250, 140])!;
    expect(next.zoom).toBeCloseTo(2);
    expect(next.scrollX).toBeCloseTo(25);
    expect(next.scrollY).toBeCloseTo(20);
  });

  it('ignores the remaining pointer until every pointer lifts', () => {
    const tracker = createGestureTracker();
    const vp = { scrollX: 0, scrollY: 0, zoom: 1 };
    tracker.down(1, [100, 100], vp);
    tracker.down(2, [200, 100], vp);
    tracker.up(2);
    expect(tracker.isActive()).toBe(true);
    tracker.up(1);
    expect(tracker.isActive()).toBe(false);
    expect(tracker.down(3, [0, 0], vp)).toBe('single');
  });
});

describe('touch on the canvas', () => {
  it('cancels the drawing when a second finger lands and pinches instead', () => {
    const store = createWhiteboardStore({ elements: [] });
    store.setState({ tool: 'rectangle' });
    mounted = mountEditor(store);
    const { canvas } = mounted;
    pointer(canvas, 'pointerdown', 100, 100, touch(1));
    pointer(canvas, 'pointermove', 120, 120, touch(1));
    expect(store.getState().elements).toHaveLength(1);
    pointer(canvas, 'pointerdown', 300, 100, touch(2));
    expect(store.getState().elements).toHaveLength(0);
    pointer(canvas, 'pointermove', 20, 100, touch(1));
    pointer(canvas, 'pointermove', 400, 100, touch(2));
    expect(store.getState().viewport.zoom).toBeGreaterThan(1);
    pointer(canvas, 'pointerup', 400, 100, touch(2));
    pointer(canvas, 'pointermove', 60, 160, touch(1));
    pointer(canvas, 'pointerup', 60, 160, touch(1));
    expect(store.getState().elements).toHaveLength(0);
    expect(store.canUndo()).toBe(false);
  });

  it('cancels a selection drag when a second finger lands', () => {
    const el = newElement('rectangle', {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      backgroundColor: '#fff',
    });
    const store = createWhiteboardStore({ elements: [el] });
    mounted = mountEditor(store);
    const { canvas } = mounted;
    pointer(canvas, 'pointerdown', 50, 50, touch(1));
    pointer(canvas, 'pointermove', 80, 50, touch(1));
    pointer(canvas, 'pointerdown', 300, 50, touch(2));
    expect(store.getState().elements[0].x).toBe(0);
    pointer(canvas, 'pointerup', 300, 50, touch(2));
    pointer(canvas, 'pointerup', 80, 50, touch(1));
    expect(store.canUndo()).toBe(false);
  });
});

describe('narrow layout', () => {
  const narrow = (store: ReturnType<typeof createWhiteboardStore>) =>
    act(() => store.setState({ canvasSize: { width: 390, height: 700 } }));

  it('moves the tools into a bottom dock', () => {
    const store = createWhiteboardStore({ elements: [] });
    mounted = mountEditor(store);
    expect(mounted.container.querySelector('[data-mobile-dock]')).toBeNull();
    narrow(store);
    const dock = mounted.container.querySelector('[data-mobile-dock]')!;
    expect(dock).not.toBeNull();
    expect(mounted.container.querySelectorAll('[data-tool="rectangle"]')).toHaveLength(1);
    act(() => dock.querySelector<HTMLButtonElement>('[data-tool="rectangle"]')!.click());
    expect(store.getState().tool).toBe('rectangle');
  });

  it('shows four style rows in a sheet with a more toggle', () => {
    const el = newElement('rectangle', { x: 0, y: 0, width: 100, height: 100 });
    const store = createWhiteboardStore({ elements: [el] });
    mounted = mountEditor(store);
    narrow(store);
    act(() => store.setState({ selectedIds: new Set([el.id]) }));
    expect(mounted.container.querySelector('[data-style-panel]')).toBeNull();
    const sheet = mounted.container.querySelector('[data-style-sheet]')!;
    expect(sheet).not.toBeNull();
    expect(sheet.querySelectorAll('[data-style-row]')).toHaveLength(4);
    act(() => sheet.querySelector<HTMLButtonElement>('[data-style-more]')!.click());
    expect(sheet.querySelectorAll('[data-style-row]').length).toBeGreaterThan(4);
  });
});
