import type { ExcalidrawElement, LinearElement, PointBinding } from '../scene/types';
import { isBindable } from './bindable';
import { getElementCenter, getLinearAbsolutePoints, toLocalPoint } from './bounds';
import { updateElbowArrow } from './elbow';
import type { Point } from './geometry';
import { angleOf, distanceToSegment, rotatePoint } from './geometry';
import { fromAbsolutePoints, movePoint } from './linear-points';
import { bumpVersion } from './mutate';

export { isBindable };

export const BINDING_DISTANCE = 15;
export const BINDING_GAP = 4;

export type LinearEnd = 'start' | 'end';

const bindingKey = (end: LinearEnd) => (end === 'start' ? 'startBinding' : 'endBinding');

function fromLocal(el: ExcalidrawElement, [lx, ly]: Point): Point {
  return rotatePoint([el.x + lx, el.y + ly], getElementCenter(el), angleOf(el));
}

function outlineSegments(el: ExcalidrawElement): Array<[Point, Point]> {
  const { width: w, height: h } = el;
  const corners: Point[] =
    el.type === 'diamond'
      ? [
          [w / 2, 0],
          [w, h / 2],
          [w / 2, h],
          [0, h / 2],
        ]
      : [
          [0, 0],
          [w, 0],
          [w, h],
          [0, h],
        ];
  return corners.map((p, i) => [p, corners[(i + 1) % corners.length]]);
}

function distanceToOutline(el: ExcalidrawElement, p: Point): number {
  const [lx, ly] = toLocalPoint(el, p);
  const { width: w, height: h } = el;
  if (el.type === 'ellipse') {
    const rx = w / 2;
    const ry = h / 2;
    if (rx <= 0 || ry <= 0) return Infinity;
    const norm = Math.hypot((lx - rx) / rx, (ly - ry) / ry);
    return norm <= 1 ? 0 : (norm - 1) * Math.min(rx, ry);
  }
  if (el.type === 'diamond') {
    if (w > 0 && h > 0 && Math.abs(lx - w / 2) / (w / 2) + Math.abs(ly - h / 2) / (h / 2) <= 1)
      return 0;
    return Math.min(...outlineSegments(el).map(([a, b]) => distanceToSegment([lx, ly], a, b)));
  }
  return Math.hypot(Math.max(-lx, 0, lx - w), Math.max(-ly, 0, ly - h));
}

export function getHoveredBindable(
  elements: readonly ExcalidrawElement[],
  p: Point,
  zoom: number,
  excludeIds: ReadonlySet<string> = new Set(),
): ExcalidrawElement | null {
  const threshold = BINDING_DISTANCE / zoom;
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (excludeIds.has(el.id) || !isBindable(el)) continue;
    if (distanceToOutline(el, p) <= threshold) return el;
  }
  return null;
}

function raySegment(o: Point, d: Point, a: Point, b: Point): number | null {
  const e: Point = [b[0] - a[0], b[1] - a[1]];
  const denom = d[0] * e[1] - d[1] * e[0];
  if (Math.abs(denom) < 1e-12) return null;
  const ax = a[0] - o[0];
  const ay = a[1] - o[1];
  const t = (ax * e[1] - ay * e[0]) / denom;
  const s = (ax * d[1] - ay * d[0]) / denom;
  return s >= 0 && s <= 1 ? t : null;
}

function rayHits(el: ExcalidrawElement, o: Point, d: Point): number[] {
  if (el.type !== 'ellipse') {
    return outlineSegments(el)
      .map(([a, b]) => raySegment(o, d, a, b))
      .filter((t): t is number => t !== null);
  }
  const rx = el.width / 2;
  const ry = el.height / 2;
  if (rx <= 0 || ry <= 0) return [];
  const ox = (o[0] - rx) / rx;
  const oy = (o[1] - ry) / ry;
  const dx = d[0] / rx;
  const dy = d[1] / ry;
  const a = dx * dx + dy * dy;
  const b = 2 * (ox * dx + oy * dy);
  const c = ox * ox + oy * oy - 1;
  const disc = b * b - 4 * a * c;
  if (disc < 0 || a === 0) return [];
  const root = Math.sqrt(disc);
  return [(-b - root) / (2 * a), (-b + root) / (2 * a)];
}

function extentAlong(el: ExcalidrawElement, [nx, ny]: Point): number {
  const rx = el.width / 2;
  const ry = el.height / 2;
  if (el.type === 'ellipse') return Math.hypot(rx * nx, ry * ny);
  if (el.type === 'diamond') return Math.max(Math.abs(rx * nx), Math.abs(ry * ny));
  return Math.abs(rx * nx) + Math.abs(ry * ny);
}

function frameFor(target: ExcalidrawElement, from: Point) {
  const c: Point = [target.width / 2, target.height / 2];
  const o = toLocalPoint(target, from);
  const len = Math.hypot(c[0] - o[0], c[1] - o[1]);
  if (len < 1e-9) return null;
  const u: Point = [(c[0] - o[0]) / len, (c[1] - o[1]) / len];
  const n: Point = [-u[1], u[0]];
  return { c, o, u, n, len, half: extentAlong(target, n) };
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function computeFocus(target: ExcalidrawElement, from: Point, to: Point): number {
  const f = frameFor(target, from);
  if (!f || f.half === 0) return 0;
  const p = toLocalPoint(target, to);
  const v: Point = [p[0] - f.o[0], p[1] - f.o[1]];
  const along = v[0] * f.u[0] + v[1] * f.u[1];
  if (along < 1e-9) return 0;
  const s = f.len / along;
  const k = s * (v[0] * f.n[0] + v[1] * f.n[1]);
  return clamp(k / f.half, -1, 1);
}

export function getBindingPoint(
  target: ExcalidrawElement,
  focus: number,
  gap: number,
  otherPoint: Point,
): Point {
  const f = frameFor(target, otherPoint);
  if (!f) return getElementCenter(target);
  const offset = clamp(focus, -1, 1) * f.half;
  const aim: Point = [f.c[0] + f.n[0] * offset, f.c[1] + f.n[1] * offset];
  const dist = Math.hypot(aim[0] - f.o[0], aim[1] - f.o[1]);
  if (dist < 1e-9) return fromLocal(target, aim);
  const d: Point = [(aim[0] - f.o[0]) / dist, (aim[1] - f.o[1]) / dist];
  const hits = rayHits(target, f.o, d).filter((t) => t > 1e-9);
  if (hits.length === 0) return fromLocal(target, aim);
  const t = Math.max(0, Math.min(...hits) - gap);
  return fromLocal(target, [f.o[0] + d[0] * t, f.o[1] + d[1] * t]);
}

function withBoundElement(
  target: ExcalidrawElement,
  id: string,
  type: string,
  present: boolean,
): ExcalidrawElement {
  const list = target.boundElements ?? [];
  const has = list.some((b) => b.id === id);
  if (has === present) return target;
  return bumpVersion(target, {
    boundElements: present ? [...list, { id, type }] : list.filter((b) => b.id !== id),
  });
}

function endIndices(linear: LinearElement, end: LinearEnd): [number, number] {
  const last = linear.points.length - 1;
  return end === 'start' ? [0, Math.min(1, last)] : [last, Math.max(0, last - 1)];
}

export function unbindLinearEnd(
  elements: readonly ExcalidrawElement[],
  linearId: string,
  end: LinearEnd,
): ExcalidrawElement[] {
  const linear = elements.find((el) => el.id === linearId) as LinearElement | undefined;
  const binding = linear?.[bindingKey(end)];
  if (!linear || !binding) return [...elements];
  const other = linear[bindingKey(end === 'start' ? 'end' : 'start')];
  const keepRegistration = other?.elementId === binding.elementId;
  const next = bumpVersion(linear, { [bindingKey(end)]: null });
  return elements.map((el) => {
    if (el.id === linearId) return next;
    if (el.id === binding.elementId && !keepRegistration)
      return withBoundElement(el, linearId, linear.type, false);
    return el;
  });
}

export function bindLinearEnd(
  elements: readonly ExcalidrawElement[],
  linearId: string,
  end: LinearEnd,
  targetId: string,
): ExcalidrawElement[] {
  let current = unbindLinearEnd(elements, linearId, end);
  const linear = current.find((el) => el.id === linearId) as LinearElement | undefined;
  const target = current.find((el) => el.id === targetId);
  if (!linear || !target || linear.points.length < 2) return current;
  const abs = getLinearAbsolutePoints(linear);
  const [index, adjacentIndex] = endIndices(linear, end);
  const focus = computeFocus(target, abs[adjacentIndex], abs[index]);
  const binding: PointBinding = { elementId: targetId, focus, gap: BINDING_GAP };
  const snapped = getBindingPoint(target, focus, BINDING_GAP, abs[adjacentIndex]);
  const next = { ...movePoint(linear, index, snapped), [bindingKey(end)]: binding };
  current = current.map((el) => {
    if (el.id === linearId) return next;
    if (el.id === targetId) return withBoundElement(el, linearId, linear.type, true);
    return el;
  });
  return current;
}

const finiteOr = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

function attachmentPoint(target: ExcalidrawElement, binding: PointBinding, other: Point): Point {
  const fixed = binding.fixedPoint;
  if (Array.isArray(fixed) && fixed.length === 2 && fixed.every(Number.isFinite)) {
    return fromLocal(target, [fixed[0] * target.width, fixed[1] * target.height]);
  }
  return getBindingPoint(
    target,
    finiteOr(binding.focus, 0),
    finiteOr(binding.gap, BINDING_GAP),
    other,
  );
}

function recomputeEnds(
  linear: LinearElement,
  byId: ReadonlyMap<string, ExcalidrawElement>,
  ends: readonly LinearEnd[],
): LinearElement {
  const abs = getLinearAbsolutePoints(linear);
  let changed = false;
  for (const end of ends) {
    const binding = linear[bindingKey(end)];
    const target = binding && byId.get(binding.elementId);
    if (!binding || !target || target.isDeleted) continue;
    const [index, adjacentIndex] = endIndices(linear, end);
    const next = attachmentPoint(target, binding, abs[adjacentIndex]);
    if (!next.every(Number.isFinite)) continue;
    abs[index] = next;
    changed = true;
  }
  return changed ? bumpVersion(linear, fromAbsolutePoints(linear, abs)) : linear;
}

export function updateBoundArrows(
  elements: readonly ExcalidrawElement[],
  changedIds: ReadonlySet<string>,
): ExcalidrawElement[] {
  const byId = new Map(elements.map((el) => [el.id, el]));
  return elements.map((el) => {
    if (changedIds.has(el.id) || (el.type !== 'arrow' && el.type !== 'line')) return el;
    const linear = el as LinearElement;
    const ends = (['start', 'end'] as const).filter((end) => {
      const binding = linear[bindingKey(end)];
      return !!binding && changedIds.has(binding.elementId);
    });
    if (ends.length === 0) return el;
    return linear.elbowed ? updateElbowArrow(linear, elements) : recomputeEnds(linear, byId, ends);
  });
}

export function unbindDetached(
  elements: readonly ExcalidrawElement[],
  movedIds: ReadonlySet<string>,
): ExcalidrawElement[] {
  let current = [...elements];
  for (const el of elements) {
    if (!movedIds.has(el.id) || (el.type !== 'arrow' && el.type !== 'line')) continue;
    for (const end of ['start', 'end'] as const) {
      const binding = (el as LinearElement)[bindingKey(end)];
      if (binding && !movedIds.has(binding.elementId))
        current = unbindLinearEnd(current, el.id, end);
    }
  }
  return current;
}
