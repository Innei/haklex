// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../tests/harness';
import { click, drag, key, mountEditor, pointer } from '../../tests/harness';
import { newElement } from '../model/create';
import { DEFAULT_STYLE } from '../model/defaults';
import type { FreedrawElement, LinearElement } from '../scene/types';
import { createWhiteboardStore } from './store';

let mounted: Mounted | undefined;
afterEach(() => mounted?.unmount());

function setup(tool: Parameters<ReturnType<typeof createWhiteboardStore>['setState']>[0]) {
  const store = createWhiteboardStore({ elements: [] });
  store.setState(tool);
  mounted = mountEditor(store);
  return store;
}

describe('shape tools', () => {
  it('drags out a rectangle with the current style and selects it', () => {
    const store = setup({
      tool: 'rectangle',
      currentStyle: { ...DEFAULT_STYLE, strokeColor: '#e03131' },
    });
    drag(mounted!.canvas, [10, 20], [110, 70]);
    const [el] = store.getState().elements;
    expect(el).toMatchObject({ type: 'rectangle', x: 10, y: 20, width: 100, height: 50 });
    expect(el.strokeColor).toBe('#e03131');
    expect([...store.getState().selectedIds]).toEqual([el.id]);
    expect(store.getState().tool).toBe('selection');
    store.undo();
    expect(store.getState().elements).toHaveLength(0);
  });

  it('draws a square with shift and allows dragging up-left', () => {
    const store = setup({ tool: 'ellipse' });
    drag(mounted!.canvas, [100, 100], [40, 70], { shiftKey: true });
    const [el] = store.getState().elements;
    expect(el.width).toBe(el.height);
    expect(el.x + el.width).toBe(100);
    expect(el.y + el.height).toBe(100);
  });

  it('keeps the tool when the tool lock is on', () => {
    const store = setup({ tool: 'diamond', toolLocked: true });
    drag(mounted!.canvas, [0, 0], [50, 50]);
    expect(store.getState().tool).toBe('diamond');
  });

  it('creates nothing on a bare click', () => {
    const store = setup({ tool: 'rectangle' });
    click(mounted!.canvas, 10, 10);
    expect(store.getState().elements).toHaveLength(0);
    expect(store.canUndo()).toBe(false);
  });
});

describe('linear tools', () => {
  it('drags a two-point arrow', () => {
    const store = setup({ tool: 'arrow' });
    drag(mounted!.canvas, [10, 10], [110, 60]);
    const el = store.getState().elements[0] as LinearElement;
    expect(el).toMatchObject({ type: 'arrow', x: 10, y: 10, width: 100, height: 50 });
    expect(el.points).toEqual([
      [0, 0],
      [100, 50],
    ]);
    expect(el.endArrowhead).toBe('arrow');
  });

  it('builds a multi-point arrow by clicking and finishes on Enter', () => {
    const store = setup({ tool: 'arrow' });
    click(mounted!.canvas, 0, 0);
    pointer(mounted!.canvas, 'pointermove', 100, 0);
    click(mounted!.canvas, 100, 0);
    pointer(mounted!.canvas, 'pointermove', 100, 100);
    click(mounted!.canvas, 100, 100);
    key(mounted!.canvas, 'Enter');
    const el = store.getState().elements[0] as LinearElement;
    expect(el.points).toEqual([
      [0, 0],
      [100, 0],
      [100, 100],
    ]);
    expect(store.getState().tool).toBe('selection');
    store.undo();
    expect(store.getState().elements).toHaveLength(0);
  });

  it('cancels a line with fewer than two points on Escape', () => {
    const store = setup({ tool: 'line' });
    click(mounted!.canvas, 0, 0);
    key(mounted!.canvas, 'Escape');
    expect(store.getState().elements).toHaveLength(0);
  });
});

describe('freedraw tool', () => {
  it('records points relative to the start and simulates pressure for mice', () => {
    const store = setup({ tool: 'freedraw' });
    drag(mounted!.canvas, [10, 10], [40, 25], {}, 3);
    const el = store.getState().elements[0] as FreedrawElement;
    expect(el.type).toBe('freedraw');
    expect([el.x, el.y]).toEqual([10, 10]);
    expect(el.points[0]).toEqual([0, 0]);
    expect(el.points.at(-1)).toEqual([30, 15]);
    expect(el.simulatePressure).toBe(true);
    expect(store.getState().tool).toBe('freedraw');
  });

  it('records real pressure for pens', () => {
    const store = setup({ tool: 'freedraw' });
    drag(mounted!.canvas, [0, 0], [10, 0], { pointerType: 'pen', pressure: 0.8 }, 2);
    const el = store.getState().elements[0] as FreedrawElement;
    expect(el.simulatePressure).toBe(false);
    expect(el.pressures.every((p) => p === 0.8)).toBe(true);
  });
});

describe('switching tools mid-gesture', () => {
  it('keeps the committed points of a multi-point arrow', () => {
    const store = createWhiteboardStore({ elements: [] });
    store.setState({ tool: 'arrow' });
    mounted = mountEditor(store);
    click(mounted.canvas, 0, 0);
    pointer(mounted.canvas, 'pointermove', 100, 0);
    click(mounted.canvas, 100, 0);
    pointer(mounted.canvas, 'pointermove', 150, 50);
    key(mounted.canvas, 'v');
    expect(store.getState().tool).toBe('selection');
    expect(store.isTransient()).toBe(false);
    const arrows = store.getState().elements.filter((el) => el.type === 'arrow') as LinearElement[];
    expect(arrows).toHaveLength(1);
    expect(arrows[0].points).toEqual([
      [0, 0],
      [100, 0],
    ]);
    store.undo();
    expect(store.getState().elements).toHaveLength(0);
  });

  it('drops an arrow that has only its first point', () => {
    const store = createWhiteboardStore({ elements: [] });
    store.setState({ tool: 'arrow' });
    mounted = mountEditor(store);
    click(mounted.canvas, 0, 0);
    pointer(mounted.canvas, 'pointermove', 150, 50);
    key(mounted.canvas, 'r');
    expect(store.getState().elements).toHaveLength(0);
    expect(store.isTransient()).toBe(false);
  });
});

describe('eraser tool', () => {
  it('deletes every element the stroke crosses as one history entry', () => {
    const a = newElement('rectangle', {
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      backgroundColor: '#000',
    });
    const b = newElement('rectangle', {
      x: 100,
      y: 0,
      width: 40,
      height: 40,
      backgroundColor: '#000',
    });
    const c = newElement('rectangle', {
      x: 0,
      y: 200,
      width: 40,
      height: 40,
      backgroundColor: '#000',
    });
    const store = createWhiteboardStore({ elements: [a, b, c] });
    store.setState({ tool: 'eraser' });
    mounted = mountEditor(store);
    pointer(mounted.canvas, 'pointerdown', 20, 20);
    pointer(mounted.canvas, 'pointermove', 120, 20);
    expect([...store.getState().erasingIds].sort()).toEqual([a.id, b.id].sort());
    pointer(mounted.canvas, 'pointerup', 120, 20);
    const alive = store
      .getState()
      .elements.filter((el) => !el.isDeleted)
      .map((el) => el.id);
    expect(alive).toEqual([c.id]);
    expect(store.getState().erasingIds.size).toBe(0);
    store.undo();
    expect(store.getState().elements.filter((el) => !el.isDeleted)).toHaveLength(3);
  });

  it('releases arrows and frame children of erased elements', () => {
    const box = {
      ...newElement('rectangle', { x: 0, y: 0, width: 40, height: 40, backgroundColor: '#000' }),
      id: 'box',
      boundElements: [{ id: 'arr', type: 'arrow' }],
      frameId: null,
    };
    const arrow = {
      ...newElement('rectangle', { x: 300, y: 300, width: 10, height: 10 }),
      id: 'arr',
      type: 'arrow',
      points: [
        [0, 0],
        [50, 0],
      ],
      endBinding: { elementId: 'box', focus: 0, gap: 4 },
    } as unknown as LinearElement;
    const store = createWhiteboardStore({ elements: [box, arrow] });
    store.setState({ tool: 'eraser' });
    mounted = mountEditor(store);
    pointer(mounted.canvas, 'pointerdown', 20, 20);
    pointer(mounted.canvas, 'pointerup', 20, 20);
    const after = store.getState().elements.find((el) => el.id === 'arr') as LinearElement;
    expect(after.endBinding).toBeNull();
  });
});
