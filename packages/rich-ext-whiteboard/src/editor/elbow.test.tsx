// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../tests/harness';
import { drag, mountEditor } from '../../tests/harness';
import { getLinearAbsolutePoints } from '../model/bounds';
import { newElement } from '../model/create';
import { DEFAULT_STYLE } from '../model/defaults';
import type { Point } from '../model/geometry';
import type { ExcalidrawElement, LinearElement } from '../scene/types';
import { createWhiteboardStore } from './store';
import { applyStyle } from './style-props';

let mounted: Mounted | undefined;
afterEach(() => mounted?.unmount());

const rect = (id: string, x: number, y: number) =>
  ({
    ...newElement('rectangle', { x, y, width: 100, height: 100 }),
    id,
    backgroundColor: '#fff',
  }) as ExcalidrawElement;

const isOrthogonal = (pts: Point[]) =>
  pts.slice(1).every((p, i) => p[0] === pts[i][0] || p[1] === pts[i][1]);

const arrowOf = (store: ReturnType<typeof createWhiteboardStore>) =>
  store.getState().elements.find((el) => el.type === 'arrow') as LinearElement;

function drawElbow(store: ReturnType<typeof createWhiteboardStore>, from: Point, to: Point) {
  store.setState({ tool: 'arrow', currentStyle: { ...DEFAULT_STYLE, arrowType: 'elbow' } });
  mounted = mountEditor(store);
  drag(mounted.canvas, from, to);
  return arrowOf(store);
}

describe('elbow arrows in the editor', () => {
  it('draws an orthogonal path', () => {
    const store = createWhiteboardStore({ elements: [] });
    const arrow = drawElbow(store, [0, 0], [150, 90]);
    expect(arrow.elbowed).toBe(true);
    const pts = getLinearAbsolutePoints(arrow);
    expect(pts.length).toBeGreaterThan(2);
    expect(isOrthogonal(pts)).toBe(true);
    expect(pts.at(-1)).toEqual([150, 90]);
  });

  it('re-routes when a bound shape moves', () => {
    const store = createWhiteboardStore({ elements: [rect('a', 0, 0), rect('b', 300, 300)] });
    drawElbow(store, [50, 50], [350, 350]);
    expect(arrowOf(store).startBinding?.elementId).toBe('a');
    expect(arrowOf(store).endBinding?.elementId).toBe('b');
    store.setState({ tool: 'selection', selectedIds: new Set() });
    drag(mounted!.canvas, [350, 350], [350, 550]);
    const pts = getLinearAbsolutePoints(arrowOf(store));
    expect(isOrthogonal(pts)).toBe(true);
    const end = pts.at(-1)!;
    expect(end[1]).toBeGreaterThan(450);
  });

  it('keeps a dragged middle segment when shapes move', () => {
    const store = createWhiteboardStore({ elements: [rect('a', 0, 0), rect('b', 300, 300)] });
    const arrow = drawElbow(store, [50, 50], [350, 350]);
    const pts = getLinearAbsolutePoints(arrow);
    expect(pts).toHaveLength(4);
    const mid: Point = [(pts[1][0] + pts[2][0]) / 2, (pts[1][1] + pts[2][1]) / 2];
    drag(mounted!.canvas, mid, [mid[0] + 30, mid[1]]);
    const pinned = arrowOf(store);
    expect(pinned.fixedSegments).toHaveLength(1);
    const x = mid[0] + 30;
    const pinnedPts = getLinearAbsolutePoints(pinned);
    expect(pinnedPts.filter((p) => p[0] === x)).toHaveLength(2);
    const segment = [pinnedPts[1], pinnedPts[2]];

    store.setState({ selectedIds: new Set() });
    drag(mounted!.canvas, [350, 350], [380, 380]);
    const after = getLinearAbsolutePoints(arrowOf(store));
    expect(isOrthogonal(after)).toBe(true);
    const kept = after.some(
      (p, k) =>
        k < after.length - 1 &&
        p.join() === segment[0].join() &&
        after[k + 1].join() === segment[1].join(),
    );
    expect(kept).toBe(true);
  });

  it('offers no rotate or resize handles for a single elbow arrow', () => {
    const store = createWhiteboardStore({ elements: [] });
    drawElbow(store, [0, 0], [150, 90]);
    expect(mounted!.container.querySelector('[data-transform-handles]')).toBeNull();
    expect(mounted!.container.querySelectorAll('[data-segment]')).toHaveLength(1);
  });

  it('becomes orthogonal when switched to the elbow type', () => {
    const store = createWhiteboardStore({ elements: [] });
    store.setState({ tool: 'arrow' });
    mounted = mountEditor(store);
    drag(mounted.canvas, [0, 0], [150, 90]);
    applyStyle(store, { arrowType: 'elbow' });
    const pts = getLinearAbsolutePoints(arrowOf(store));
    expect(arrowOf(store).elbowed).toBe(true);
    expect(isOrthogonal(pts)).toBe(true);
    expect(pts.at(-1)).toEqual([150, 90]);
  });
});
