import { getCommonBounds, getElementCenter, isLinear } from '../model/bounds';
import type { Bounds, Point } from '../model/geometry';
import { angleOf, boundsOfPoints, rotatePoint } from '../model/geometry';
import { bumpVersion } from '../model/mutate';
import { resolveRichTextHeights } from '../model/richtext-layout';
import type { ExcalidrawElement, TextElement } from '../scene/types';

export type TransformHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | 'rotation';

export const HANDLE_PADDING = 8;
export const ROTATION_OFFSET = 24;
export const HANDLE_HIT_RADIUS = 8;
const MIN_SIZE = 1;
const SNAP_ANGLE = Math.PI / 12;

export interface ResizeOptions {
  fromCenter?: boolean;
  keepRatio?: boolean;
}

interface Frame {
  angle: number;
  box: Bounds;
  center: Point;
}

type WithPoints = ExcalidrawElement & { points: Array<[number, number]> };

function unrotatedBox(el: ExcalidrawElement): Bounds {
  if (isLinear(el)) {
    const [minX, minY, maxX, maxY] = boundsOfPoints(el.points.length ? el.points : [[0, 0]]);
    return [el.x + minX, el.y + minY, el.x + maxX, el.y + maxY];
  }
  return [el.x, el.y, el.x + el.width, el.y + el.height];
}

export function getTransformFrame(elements: readonly ExcalidrawElement[]): Frame {
  if (elements.length === 1) {
    const el = elements[0];
    return { box: unrotatedBox(el), angle: angleOf(el), center: getElementCenter(el) };
  }
  const box = getCommonBounds(elements);
  return { box, angle: 0, center: [(box[0] + box[2]) / 2, (box[1] + box[3]) / 2] };
}

export function getTransformHandles(
  box: Bounds,
  zoom: number,
  angle = 0,
): Record<TransformHandle, Point> {
  const pad = HANDLE_PADDING / zoom;
  const [x1, y1, x2, y2] = [box[0] - pad, box[1] - pad, box[2] + pad, box[3] + pad];
  const cx = (box[0] + box[2]) / 2;
  const cy = (box[1] + box[3]) / 2;
  const raw: Record<TransformHandle, Point> = {
    nw: [x1, y1],
    n: [cx, y1],
    ne: [x2, y1],
    e: [x2, cy],
    se: [x2, y2],
    s: [cx, y2],
    sw: [x1, y2],
    w: [x1, cy],
    rotation: [cx, y1 - ROTATION_OFFSET / zoom],
  };
  if (!angle) return raw;
  const out = {} as Record<TransformHandle, Point>;
  for (const [k, p] of Object.entries(raw))
    out[k as TransformHandle] = rotatePoint(p, [cx, cy], angle);
  return out;
}

export function hitTransformHandle(
  handles: Record<TransformHandle, Point>,
  p: Point,
  zoom: number,
): TransformHandle | null {
  const radius = HANDLE_HIT_RADIUS / zoom;
  for (const [k, [hx, hy]] of Object.entries(handles)) {
    if (Math.hypot(p[0] - hx, p[1] - hy) <= radius) return k as TransformHandle;
  }
  return null;
}

function resizeBox(
  box: Bounds,
  handle: TransformHandle,
  delta: Point,
  opts: ResizeOptions,
): Bounds {
  let [x1, y1, x2, y2] = box;
  const [dx, dy] = delta;
  if (handle.includes('e')) x2 += dx;
  if (handle.includes('w')) x1 += dx;
  if (handle.includes('s')) y2 += dy;
  if (handle.includes('n')) y1 += dy;
  if (opts.fromCenter) {
    if (handle.includes('e')) x1 -= dx;
    if (handle.includes('w')) x2 -= dx;
    if (handle.includes('s')) y1 -= dy;
    if (handle.includes('n')) y2 -= dy;
  }
  if (opts.keepRatio) {
    const ow = box[2] - box[0] || 1;
    const oh = box[3] - box[1] || 1;
    const horizontal = handle.includes('e') || handle.includes('w');
    const vertical = handle.includes('n') || handle.includes('s');
    const sx = (x2 - x1) / ow;
    const sy = (y2 - y1) / oh;
    const s =
      horizontal && vertical ? (Math.abs(sx) > Math.abs(sy) ? sx : sy) : horizontal ? sx : sy;
    const w = ow * s;
    const h = oh * s;
    const cx = (box[0] + box[2]) / 2;
    const cy = (box[1] + box[3]) / 2;
    if (opts.fromCenter) return [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2];
    const ax = handle.includes('w') ? box[2] : handle.includes('e') ? box[0] : cx - w / 2;
    const ay = handle.includes('n') ? box[3] : handle.includes('s') ? box[1] : cy - h / 2;
    const nx1 = handle.includes('w') ? ax - w : ax;
    const ny1 = handle.includes('n') ? ay - h : ay;
    return [nx1, ny1, nx1 + w, ny1 + h];
  }
  return [Math.min(x1, x2), Math.min(y1, y2), Math.max(x1, x2), Math.max(y1, y2)];
}

function placeElement(
  el: ExcalidrawElement,
  frame: Frame,
  next: Bounds,
  single: boolean,
): ExcalidrawElement {
  const [ox1, oy1, ox2, oy2] = frame.box;
  const sx = (next[2] - next[0]) / (ox2 - ox1 || 1);
  const sy = (next[3] - next[1]) / (oy2 - oy1 || 1);
  const elBox = unrotatedBox(el);
  const newElBox: Bounds = single
    ? next
    : [
        next[0] + (elBox[0] - ox1) * sx,
        next[1] + (elBox[1] - oy1) * sy,
        next[0] + (elBox[2] - ox1) * sx,
        next[1] + (elBox[3] - oy1) * sy,
      ];
  const w = Math.max(MIN_SIZE, newElBox[2] - newElBox[0]);
  const h = Math.max(MIN_SIZE, newElBox[3] - newElBox[1]);
  const localCenter: Point = [(newElBox[0] + newElBox[2]) / 2, (newElBox[1] + newElBox[3]) / 2];
  const center = single ? rotatePoint(localCenter, frame.center, frame.angle) : localCenter;
  const patch: Record<string, unknown> = { width: w, height: h };

  if (isLinear(el)) {
    const pts = (el as WithPoints).points.length
      ? (el as WithPoints).points
      : [[0, 0] as [number, number]];
    const [minX, minY] = boundsOfPoints(pts);
    patch.points = pts.map(([px, py]) => [minX + (px - minX) * sx, minY + (py - minY) * sy]);
    patch.x = center[0] - w / 2 - minX;
    patch.y = center[1] - h / 2 - minY;
  } else {
    patch.x = center[0] - w / 2;
    patch.y = center[1] - h / 2;
  }
  if (el.type === 'text') patch.fontSize = (el as TextElement).fontSize * Math.min(sx, sy);
  return bumpVersion(el, patch as Partial<ExcalidrawElement>);
}

export function resizeElements(
  elements: readonly ExcalidrawElement[],
  handle: TransformHandle,
  start: Point,
  current: Point,
  opts: ResizeOptions,
): ExcalidrawElement[] {
  if (elements.length === 0 || handle === 'rotation') return [...elements];
  const frame = getTransformFrame(elements);
  const delta = rotatePoint([current[0] - start[0], current[1] - start[1]], [0, 0], -frame.angle);
  const keepRatio =
    opts.keepRatio || elements.every((el) => el.type === 'text' || el.type === 'svg');
  const next = resizeBox(frame.box, handle, delta, { ...opts, keepRatio });
  const single = elements.length === 1;
  return resolveRichTextHeights(elements.map((el) => placeElement(el, frame, next, single)));
}

function normalizeAngle(angle: number): number {
  const full = Math.PI * 2;
  return ((angle % full) + full) % full;
}

export function rotateElements(
  elements: readonly ExcalidrawElement[],
  center: Point,
  delta: number,
  opts: { snap?: boolean },
): ExcalidrawElement[] {
  if (elements.length === 1) {
    const el = elements[0];
    let angle = normalizeAngle(angleOf(el) + delta);
    if (opts.snap) angle = normalizeAngle(Math.round(angle / SNAP_ANGLE) * SNAP_ANGLE);
    return [bumpVersion(el, { angle })];
  }
  const step = opts.snap ? Math.round(delta / SNAP_ANGLE) * SNAP_ANGLE : delta;
  return elements.map((el) => {
    const c = getElementCenter(el);
    const [nx, ny] = rotatePoint(c, center, step);
    return bumpVersion(el, {
      x: el.x + nx - c[0],
      y: el.y + ny - c[1],
      angle: normalizeAngle(angleOf(el) + step),
    });
  });
}

export function nudge(
  elements: readonly ExcalidrawElement[],
  ids: ReadonlySet<string>,
  dx: number,
  dy: number,
): ExcalidrawElement[] {
  return elements.map((el) =>
    ids.has(el.id) ? bumpVersion(el, { x: el.x + dx, y: el.y + dy }) : el,
  );
}
