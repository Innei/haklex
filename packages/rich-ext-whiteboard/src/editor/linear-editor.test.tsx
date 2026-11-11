// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../tests/harness';
import { click, drag, key, mountEditor } from '../../tests/harness';
import { getLinearAbsolutePoints } from '../model/bounds';
import { newLinearElement } from '../model/create';
import type { LinearElement } from '../scene/types';
import { getMidpoints, insertPoint, movePoint, removePoint } from './linear-editor';
import { createWhiteboardStore } from './store';

let mounted: Mounted | undefined;
afterEach(() => mounted?.unmount());

const line = (extra: Partial<LinearElement> = {}) =>
  newLinearElement('line', {
    x: 10,
    y: 10,
    width: 100,
    height: 50,
    points: [
      [0, 0],
      [100, 0],
      [100, 50],
    ],
    ...extra,
  });

describe('point operations', () => {
  it('renormalizes when the first point moves', () => {
    const next = movePoint(line(), 0, [0, -10]);
    expect([next.x, next.y]).toEqual([0, -10]);
    expect(next.points).toEqual([
      [0, 0],
      [110, 20],
      [110, 70],
    ]);
    expect([next.width, next.height]).toEqual([110, 70]);
  });

  it('inserts a point after a segment', () => {
    const next = insertPoint(line(), 0, [60, 10]);
    expect(next.points).toEqual([
      [0, 0],
      [50, 0],
      [100, 0],
      [100, 50],
    ]);
  });

  it('removes a point but keeps at least two', () => {
    const two = removePoint(line(), 1);
    expect(two.points).toHaveLength(2);
    expect(removePoint(two, 0).points).toHaveLength(2);
  });

  it('keeps the other points in place on a rotated line', () => {
    const el = line({ angle: Math.PI / 3 });
    const before = getLinearAbsolutePoints(el);
    const next = movePoint(el, 2, [500, 500]);
    const after = getLinearAbsolutePoints(next);
    expect(after[0][0]).toBeCloseTo(before[0][0]);
    expect(after[0][1]).toBeCloseTo(before[0][1]);
    expect(after[1][0]).toBeCloseTo(before[1][0]);
    expect(after[2][0]).toBeCloseTo(500);
    expect(after[2][1]).toBeCloseTo(500);
  });

  it('lists segment midpoints', () => {
    expect(getMidpoints(line())).toEqual([
      [60, 10],
      [110, 35],
    ]);
  });
});

describe('point handles in the editor', () => {
  const arrow = () =>
    newLinearElement('arrow', {
      x: 0,
      y: 0,
      width: 200,
      height: 0,
      points: [
        [0, 0],
        [200, 0],
      ],
    });

  it('drags an end point as one history entry', () => {
    const store = createWhiteboardStore({ elements: [arrow()] });
    mounted = mountEditor(store);
    click(mounted.canvas, 100, 0);
    drag(mounted.canvas, [200, 0], [200, 80]);
    const el = store.getState().elements[0] as LinearElement;
    expect(el.points[1]).toEqual([200, 80]);
    expect(store.getState().selectedPointIndex).toBe(1);
    store.undo();
    expect((store.getState().elements[0] as LinearElement).points[1]).toEqual([200, 0]);
  });

  it('adds a point by dragging a segment midpoint', () => {
    const store = createWhiteboardStore({ elements: [arrow()] });
    mounted = mountEditor(store);
    click(mounted.canvas, 50, 0);
    drag(mounted.canvas, [100, 0], [100, -60]);
    const el = store.getState().elements[0] as LinearElement;
    expect(el.points).toHaveLength(3);
    expect(getLinearAbsolutePoints(el)[1]).toEqual([100, -60]);
  });

  it('deletes the selected point with Delete', () => {
    const store = createWhiteboardStore({ elements: [line({ x: 0, y: 0 })] });
    mounted = mountEditor(store);
    click(mounted.canvas, 50, 0);
    click(mounted.canvas, 100, 0);
    expect(store.getState().selectedPointIndex).toBe(1);
    key(mounted.canvas, 'Delete');
    const el = store.getState().elements[0] as LinearElement;
    expect(el.isDeleted).toBeFalsy();
    expect(el.points).toHaveLength(2);
  });
});
