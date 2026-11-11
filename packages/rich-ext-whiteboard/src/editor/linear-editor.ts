import { getLinearAbsolutePoints } from '../model/bounds';
import type { Point } from '../model/geometry';
import { fromAbsolutePoints, movePoint } from '../model/linear-points';
import { bumpVersion } from '../model/mutate';
import type { ExcalidrawElement, LinearElement } from '../scene/types';
import { getSelectedElements } from './selection-utils';
import type { EditorState } from './types';

export { fromAbsolutePoints, movePoint };

export const POINT_HIT_RADIUS = 8;

export function isEditableLinear(el: ExcalidrawElement | undefined): el is LinearElement {
  return !!el && (el.type === 'line' || el.type === 'arrow') && !el.locked;
}

export function insertPoint(el: LinearElement, segmentIndex: number, p: Point): LinearElement {
  const abs = getLinearAbsolutePoints(el);
  abs.splice(segmentIndex + 1, 0, p);
  return bumpVersion(el, fromAbsolutePoints(el, abs));
}

export function removePoint(el: LinearElement, index: number): LinearElement {
  if (el.points.length <= 2) return el;
  const abs = getLinearAbsolutePoints(el);
  abs.splice(index, 1);
  return bumpVersion(el, fromAbsolutePoints(el, abs));
}

export function getMidpoints(el: LinearElement): Point[] {
  const abs = getLinearAbsolutePoints(el);
  const mids: Point[] = [];
  for (let i = 0; i < abs.length - 1; i++) {
    mids.push([(abs[i][0] + abs[i + 1][0]) / 2, (abs[i][1] + abs[i + 1][1]) / 2]);
  }
  return mids;
}

export function getEditedLinear(state: EditorState): LinearElement | null {
  const selected = getSelectedElements(state);
  if (selected.length !== 1) return null;
  return isEditableLinear(selected[0]) ? selected[0] : null;
}

export function getElbowSegmentHandles(el: LinearElement): Array<{ index: number; point: Point }> {
  const abs = getLinearAbsolutePoints(el);
  const handles: Array<{ index: number; point: Point }> = [];
  for (let i = 1; i < abs.length - 2; i++) {
    handles.push({
      index: i,
      point: [(abs[i][0] + abs[i + 1][0]) / 2, (abs[i][1] + abs[i + 1][1]) / 2],
    });
  }
  return handles;
}

export function moveElbowSegment(el: LinearElement, index: number, p: Point): LinearElement {
  const abs = getLinearAbsolutePoints(el);
  const horizontal = abs[index][1] === abs[index + 1][1];
  const axis = horizontal ? 1 : 0;
  abs[index][axis] = p[axis];
  abs[index + 1][axis] = p[axis];
  const moved = fromAbsolutePoints(el, abs);
  const rel = (q: Point): [number, number] => [q[0] - moved.x, q[1] - moved.y];
  const others = (el.fixedSegments ?? []).filter((seg) => seg.index !== index + 1);
  return bumpVersion(el, {
    ...moved,
    fixedSegments: [
      ...others,
      { index: index + 1, start: rel(abs[index]), end: rel(abs[index + 1]) },
    ].sort((a, b) => a.index - b.index),
  });
}

export type PointHit =
  | { index: number; kind: 'point' }
  | { index: number; kind: 'midpoint' }
  | { index: number; kind: 'segment' };

export function hitPointHandle(el: LinearElement, p: Point, zoom: number): PointHit | null {
  const radius = POINT_HIT_RADIUS / zoom;
  const near = ([x, y]: Point) => Math.hypot(p[0] - x, p[1] - y) <= radius;
  const abs = getLinearAbsolutePoints(el);
  for (let i = abs.length - 1; i >= 0; i--) {
    const isEnd = i === 0 || i === abs.length - 1;
    if ((isEnd || !el.elbowed) && near(abs[i])) return { kind: 'point', index: i };
  }
  if (el.elbowed) {
    for (const handle of getElbowSegmentHandles(el))
      if (near(handle.point)) return { kind: 'segment', index: handle.index };
    return null;
  }
  const mids = getMidpoints(el);
  for (let i = 0; i < mids.length; i++) if (near(mids[i])) return { kind: 'midpoint', index: i };
  return null;
}
