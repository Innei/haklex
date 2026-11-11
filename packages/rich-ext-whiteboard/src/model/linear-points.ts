import type { LinearElement } from '../scene/types';
import { getElementCenter, getLinearAbsolutePoints } from './bounds';
import type { Point } from './geometry';
import { angleOf, boundsOfPoints, rotatePoint } from './geometry';
import { bumpVersion } from './mutate';

export function fromAbsolutePoints(el: LinearElement, abs: readonly Point[]): LinearElement {
  const angle = angleOf(el);
  const c0 = getElementCenter(el);
  const locals = abs.map((p) => rotatePoint(p, c0, -angle));
  const [minX, minY, maxX, maxY] = boundsOfPoints(locals);
  const c1: Point = [(minX + maxX) / 2, (minY + maxY) / 2];
  const d: Point = [c1[0] - c0[0], c1[1] - c0[1]];
  const rd = rotatePoint(d, [0, 0], angle);
  const t: Point = [rd[0] - d[0], rd[1] - d[1]];
  const q = locals.map(([x, y]) => [x + t[0], y + t[1]] as Point);
  const [ox, oy] = q[0];
  const points = q.map(([x, y]) => [x - ox, y - oy] as [number, number]);
  return {
    ...el,
    x: ox,
    y: oy,
    points,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function movePoint(el: LinearElement, index: number, p: Point): LinearElement {
  const abs = getLinearAbsolutePoints(el);
  abs[index] = p;
  return bumpVersion(el, fromAbsolutePoints(el, abs));
}
