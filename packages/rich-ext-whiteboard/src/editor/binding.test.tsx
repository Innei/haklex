// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../tests/harness';
import { click, drag, key, mountEditor, pointer } from '../../tests/harness';
import {
  BINDING_GAP,
  getBindingPoint,
  getHoveredBindable,
  updateBoundArrows,
} from '../model/binding';
import { getLinearAbsolutePoints } from '../model/bounds';
import { newElement, newLinearElement } from '../model/create';
import { bumpVersion } from '../model/mutate';
import type { ExcalidrawElement, LinearElement } from '../scene/types';
import { createWhiteboardStore } from './store';

let mounted: Mounted | undefined;
afterEach(() => mounted?.unmount());

const box = (extra: Partial<ExcalidrawElement> = {}) =>
  ({
    ...newElement('rectangle', { x: 200, y: 0, width: 100, height: 100 }),
    id: 'box',
    ...extra,
  }) as ExcalidrawElement;

const arrowOf = (store: ReturnType<typeof createWhiteboardStore>) =>
  store.getState().elements.find((el) => el.type === 'arrow') as LinearElement;

describe('binding geometry', () => {
  it('finds a shape near the pointer', () => {
    expect(getHoveredBindable([box()], [195, 50], 1)?.id).toBe('box');
    expect(getHoveredBindable([box()], [150, 50], 1)).toBeNull();
  });

  it('places the endpoint on the outline facing the other end, minus the gap', () => {
    const p = getBindingPoint(box(), 0, BINDING_GAP, [0, 50]);
    expect(p[0]).toBeCloseTo(200 - BINDING_GAP);
    expect(p[1]).toBeCloseTo(50);
  });

  it('respects the focus offset', () => {
    const p = getBindingPoint(box(), 0.5, BINDING_GAP, [0, 50]);
    expect(p[1]).toBeGreaterThan(50);
  });

  it('follows the outline of a rotated shape', () => {
    const rotated = box({ angle: Math.PI / 4 });
    const p = getBindingPoint(rotated, 0, 0, [0, 50]);
    const half = Math.SQRT2 * 50;
    expect(p[0]).toBeCloseTo(250 - half, 0);
  });

  it('moves bound arrow ends when the target changes', () => {
    const target = box();
    const arrow = {
      ...newLinearElement('arrow', {
        x: 0,
        y: 50,
        width: 196,
        height: 0,
        points: [
          [0, 0],
          [196, 0],
        ],
      }),
      endBinding: { elementId: 'box', focus: 0, gap: BINDING_GAP },
    } as LinearElement;
    const moved = bumpVersion(target, { y: 100 });
    const [, next] = updateBoundArrows([moved, arrow], new Set(['box'])) as [
      ExcalidrawElement,
      LinearElement,
    ];
    const end = getLinearAbsolutePoints(next).at(-1)!;
    expect(end[0]).toBeCloseTo(200 - BINDING_GAP, 0);
    expect(end[1]).toBeGreaterThan(100);
    expect(next.version).toBe((arrow.version ?? 0) + 1);
  });
});

describe('binding in the editor', () => {
  it('binds an arrow drawn onto a shape in both directions', () => {
    const store = createWhiteboardStore({ elements: [box()] });
    store.setState({ tool: 'arrow' });
    mounted = mountEditor(store);
    drag(mounted.canvas, [0, 50], [205, 50]);
    const arrow = arrowOf(store);
    const target = store.getState().elements.find((el) => el.id === 'box')!;
    expect(arrow.endBinding?.elementId).toBe('box');
    expect(arrow.startBinding).toBeNull();
    expect(target.boundElements).toEqual([{ id: arrow.id, type: 'arrow' }]);
    expect(getLinearAbsolutePoints(arrow).at(-1)![0]).toBeCloseTo(200 - BINDING_GAP);
  });

  it('does not bind while ctrl is held', () => {
    const store = createWhiteboardStore({ elements: [box()] });
    store.setState({ tool: 'arrow' });
    mounted = mountEditor(store);
    drag(mounted.canvas, [0, 50], [205, 50], { ctrlKey: true });
    expect(arrowOf(store).endBinding).toBeNull();
  });

  it('drags the arrow end along when the shape moves', () => {
    const store = createWhiteboardStore({ elements: [box({ backgroundColor: '#fff' })] });
    store.setState({ tool: 'arrow' });
    mounted = mountEditor(store);
    drag(mounted.canvas, [0, 50], [205, 50]);
    store.setState({ tool: 'selection', selectedIds: new Set() });
    drag(mounted.canvas, [250, 50], [250, 250]);
    const end = getLinearAbsolutePoints(arrowOf(store)).at(-1)!;
    expect(end[1]).toBeGreaterThan(200);
    store.undo();
    expect(getLinearAbsolutePoints(arrowOf(store)).at(-1)![1]).toBeCloseTo(50);
  });

  it('unbinds when the end point is dragged away', () => {
    const store = createWhiteboardStore({ elements: [box()] });
    store.setState({ tool: 'arrow' });
    mounted = mountEditor(store);
    drag(mounted.canvas, [0, 50], [205, 50]);
    store.setState({ tool: 'selection' });
    click(mounted.canvas, 100, 50);
    drag(mounted.canvas, [196, 50], [120, 150]);
    expect(arrowOf(store).endBinding).toBeNull();
    const target = store.getState().elements.find((el) => el.id === 'box')!;
    expect(target.boundElements ?? []).toEqual([]);
  });
});

describe('binding lifecycle', () => {
  it('highlights the shape under the arrow end while drawing', () => {
    const store = createWhiteboardStore({ elements: [box()] });
    store.setState({ tool: 'arrow' });
    mounted = mountEditor(store);
    pointer(mounted.canvas, 'pointerdown', 0, 50);
    pointer(mounted.canvas, 'pointermove', 205, 50);
    expect(mounted.container.querySelector('[data-binding-highlight="box"]')).not.toBeNull();
    pointer(mounted.canvas, 'pointerup', 205, 50);
    expect(mounted.container.querySelector('[data-binding-highlight]')).toBeNull();
  });

  it('clears the binding when the target is deleted', () => {
    const store = createWhiteboardStore({ elements: [box({ backgroundColor: '#fff' })] });
    store.setState({ tool: 'arrow' });
    mounted = mountEditor(store);
    drag(mounted.canvas, [0, 50], [205, 50]);
    store.setState({ tool: 'selection', selectedIds: new Set(['box']) });
    key(mounted.canvas, 'Delete');
    expect(arrowOf(store).endBinding).toBeNull();
  });
});

describe('foreign binding shapes', () => {
  const arrowTo = (binding: Record<string, unknown>) =>
    ({
      ...newLinearElement('arrow', {
        x: 0,
        y: 50,
        width: 196,
        height: 0,
        points: [
          [0, 0],
          [196, 0],
        ],
      }),
      endBinding: binding,
    }) as unknown as LinearElement;

  it('keeps coordinates finite when focus and gap are missing', () => {
    const moved = bumpVersion(box(), { y: 100 });
    const [, next] = updateBoundArrows(
      [moved, arrowTo({ elementId: 'box', mode: 'orbit' })],
      new Set(['box']),
    ) as [ExcalidrawElement, LinearElement];
    const pts = getLinearAbsolutePoints(next);
    expect(pts.flat().every(Number.isFinite)).toBe(true);
    expect(Number.isFinite(next.x) && Number.isFinite(next.width)).toBe(true);
  });

  it('attaches at a fixedPoint ratio of the target', () => {
    const moved = bumpVersion(box(), { y: 100 });
    const [, next] = updateBoundArrows(
      [moved, arrowTo({ elementId: 'box', fixedPoint: [0, 0.5], mode: 'orbit' })],
      new Set(['box']),
    ) as [ExcalidrawElement, LinearElement];
    const end = getLinearAbsolutePoints(next).at(-1)!;
    expect(end[0]).toBeCloseTo(200);
    expect(end[1]).toBeCloseTo(150);
  });
});
