import { describe, expect, it } from 'vitest';

import type { ExcalidrawElement, LinearElement } from '../scene/types';
import { getLinearAbsolutePoints } from './bounds';
import { newElement, newLinearElement } from './create';
import { headingForPoint, routeElbowArrow, updateElbowArrow } from './elbow';
import type { Bounds, Point } from './geometry';

const isOrthogonal = (pts: Point[]) =>
  pts.slice(1).every((p, i) => p[0] === pts[i][0] || p[1] === pts[i][1]);

const crossesBox = (a: Point, b: Point, [minX, minY, maxX, maxY]: Bounds) => {
  const x0 = Math.min(a[0], b[0]);
  const x1 = Math.max(a[0], b[0]);
  const y0 = Math.min(a[1], b[1]);
  const y1 = Math.max(a[1], b[1]);
  return x1 > minX && x0 < maxX && y1 > minY && y0 < maxY;
};

const rect = (id: string, x: number, y: number, w = 100, h = 100) =>
  ({ ...newElement('rectangle', { x, y, width: w, height: h }), id }) as ExcalidrawElement;

describe('routeElbowArrow', () => {
  it('draws a straight line when nothing is in the way', () => {
    expect(routeElbowArrow([0, 0], [200, 0], { obstacles: [] })).toEqual([
      [0, 0],
      [200, 0],
    ]);
  });

  it('keeps every segment axis-aligned', () => {
    const pts = routeElbowArrow([0, 0], [150, 90], { obstacles: [] });
    expect(pts[0]).toEqual([0, 0]);
    expect(pts.at(-1)).toEqual([150, 90]);
    expect(isOrthogonal(pts)).toBe(true);
  });

  it('bends around an obstacle between the endpoints', () => {
    const obstacle: Bounds = [80, -40, 120, 40];
    const pts = routeElbowArrow([0, 0], [200, 0], { obstacles: [obstacle] });
    expect(isOrthogonal(pts)).toBe(true);
    expect(pts.length).toBeGreaterThan(2);
    for (let i = 0; i < pts.length - 1; i++) {
      expect(crossesBox(pts[i], pts[i + 1], obstacle)).toBe(false);
    }
  });

  it('is deterministic', () => {
    const opts = { obstacles: [[80, -40, 120, 40] as Bounds] };
    expect(routeElbowArrow([0, 0], [200, 30], opts)).toEqual(
      routeElbowArrow([0, 0], [200, 30], opts),
    );
  });
});

describe('headingForPoint', () => {
  it('names the side facing the point', () => {
    const box = rect('a', 0, 0);
    expect(headingForPoint(box, [400, 60])).toEqual([1, 0]);
    expect(headingForPoint(box, [50, -300])).toEqual([0, -1]);
  });
});

describe('updateElbowArrow', () => {
  const arrowBetween = (start: string, end: string) =>
    ({
      ...newLinearElement('arrow', {
        x: 104,
        y: 50,
        points: [
          [0, 0],
          [192, 0],
        ],
        elbowed: true,
      }),
      startBinding: { elementId: start, focus: 0, gap: 4 },
      endBinding: { elementId: end, focus: 0, gap: 4 },
    }) as LinearElement;

  it('leaves a bound shape from the side facing the other end', () => {
    const a = rect('a', 0, 0);
    const b = rect('b', 300, 300);
    const next = updateElbowArrow(arrowBetween('a', 'b'), [a, b]);
    const pts = getLinearAbsolutePoints(next);
    expect(isOrthogonal(pts)).toBe(true);
    const [p0, p1] = pts;
    const leavesRight = p0[0] >= 100 && p1[0] > p0[0];
    const leavesBottom = p0[1] >= 100 && p1[1] > p0[1];
    expect(leavesRight || leavesBottom).toBe(true);
    const end = pts.at(-1)!;
    expect(end[0] <= 300 || end[1] <= 300).toBe(true);
  });

  it('keeps a fixed segment the user dragged', () => {
    const a = rect('a', 0, 0);
    const b = rect('b', 300, 300);
    const routed = updateElbowArrow(arrowBetween('a', 'b'), [a, b]);
    const abs = getLinearAbsolutePoints(routed);
    const i = abs.findIndex((p, k) => k > 0 && k < abs.length - 2);
    const horizontal = abs[i][1] === abs[i + 1][1];
    const shift: Point = horizontal ? [0, 20] : [20, 0];
    const start: Point = [abs[i][0] + shift[0], abs[i][1] + shift[1]];
    const end: Point = [abs[i + 1][0] + shift[0], abs[i + 1][1] + shift[1]];
    const pinned = {
      ...routed,
      fixedSegments: [
        {
          index: i + 1,
          start: [start[0] - routed.x, start[1] - routed.y] as [number, number],
          end: [end[0] - routed.x, end[1] - routed.y] as [number, number],
        },
      ],
    } as LinearElement;
    const moved = { ...b, x: 320 };
    const next = updateElbowArrow(pinned, [a, moved]);
    const pts = getLinearAbsolutePoints(next);
    expect(isOrthogonal(pts)).toBe(true);
    const has = pts.some(
      (p, k) =>
        k < pts.length - 1 &&
        p[0] === start[0] &&
        p[1] === start[1] &&
        pts[k + 1][0] === end[0] &&
        pts[k + 1][1] === end[1],
    );
    expect(has).toBe(true);
    expect(next.fixedSegments).toHaveLength(1);
  });
});
