// @vitest-environment happy-dom
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../tests/harness';
import { drag, key, mountEditor } from '../../tests/harness';
import { newElement } from '../model/create';
import type { LinearElement } from '../scene/types';
import { createWhiteboardStore } from './store';

let mounted: Mounted | undefined;
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
});

const filled = () => ({
  ...newElement('rectangle', { x: 0, y: 0, width: 40, height: 40 }),
  id: 'r',
  backgroundColor: '#000',
});

const gridScene = (elements: unknown[] = [filled()]) => ({
  elements,
  appState: { gridSize: 20 },
});

const rect = (store: ReturnType<typeof createWhiteboardStore>) =>
  store.getState().elements.find((el) => el.type === 'rectangle')!;

describe('grid snapping', () => {
  it('snaps a dragged selection to the grid', () => {
    const store = createWhiteboardStore(gridScene());
    mounted = mountEditor(store);
    drag(mounted.canvas, [10, 10], [37, 22]);
    expect(rect(store).x).toBe(20);
    expect(rect(store).y).toBe(20);
  });

  it('moves freely without a grid or while ctrl is held', () => {
    const free = createWhiteboardStore({ elements: [filled()] });
    mounted = mountEditor(free);
    drag(mounted.canvas, [10, 10], [37, 22]);
    expect(rect(free).x).toBe(27);
    mounted.unmount();

    const held = createWhiteboardStore(gridScene());
    mounted = mountEditor(held);
    drag(mounted.canvas, [10, 10], [37, 22], { ctrlKey: true });
    expect(rect(held).x).toBe(27);
  });

  it('snaps new shapes and line points', () => {
    const store = createWhiteboardStore(gridScene([]));
    store.setState({ tool: 'rectangle' });
    mounted = mountEditor(store);
    drag(mounted.canvas, [3, 4], [58, 61]);
    expect(rect(store)).toMatchObject({ x: 0, y: 0, width: 60, height: 60 });

    store.setState({ tool: 'line' });
    drag(mounted.canvas, [103, 98], [178, 141]);
    const line = store.getState().elements.find((el) => el.type === 'line') as LinearElement;
    expect([line.x, line.y]).toEqual([100, 100]);
    expect(line.points.at(-1)).toEqual([80, 40]);
  });

  it('toggles the grid with ctrl+quote', () => {
    const store = createWhiteboardStore({ elements: [] });
    mounted = mountEditor(store);
    key(mounted.canvas, "'", { ctrlKey: true });
    expect(store.getState().gridSize).toBe(20);
    expect(store.isDirty()).toBe(true);
    act(() => key(mounted!.canvas, "'", { ctrlKey: true }));
    expect(store.getState().gridSize).toBeNull();
  });
});
