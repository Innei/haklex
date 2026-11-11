import type { ExcalidrawElement, FixedSegment, LinearElement } from '../scene/types';
import { isBindable } from './bindable';
import { getElementBounds, getLinearAbsolutePoints } from './bounds';
import type { Bounds, Point } from './geometry';
import { angleOf, boundsOfPoints } from './geometry';
import { bumpVersion } from './mutate';

export const ELBOW_PADDING = 20;
const BEND_PENALTY = 60;

export type Heading = [number, number];

export interface ElbowRouteOptions {
  endHeading?: Heading;
  endTarget?: ExcalidrawElement | null;
  obstacles: readonly Bounds[];
  startHeading?: Heading;
  startTarget?: ExcalidrawElement | null;
}

const DIRS: Heading[] = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

const dirIndex = ([x, y]: Heading) => DIRS.findIndex((d) => d[0] === x && d[1] === y);
const same = (a: Point, b: Point) => a[0] === b[0] && a[1] === b[1];

export function headingForPoint(target: ExcalidrawElement, p: Point): Heading {
  const [minX, minY, maxX, maxY] = getElementBounds(target);
  const dx = (p[0] - (minX + maxX) / 2) / Math.max((maxX - minX) / 2, 1e-9);
  const dy = (p[1] - (minY + maxY) / 2) / Math.max((maxY - minY) / 2, 1e-9);
  if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? [-1, 0] : [1, 0];
  return dy < 0 ? [0, -1] : [0, 1];
}

function towards(from: Point, to: Point): Heading {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? [-1, 0] : [1, 0];
  return dy < 0 ? [0, -1] : [0, 1];
}

const expand = ([minX, minY, maxX, maxY]: Bounds, pad: number): Bounds => [
  minX - pad,
  minY - pad,
  maxX + pad,
  maxY + pad,
];

const strictlyInside = ([x, y]: Point, [minX, minY, maxX, maxY]: Bounds) =>
  x > minX && x < maxX && y > minY && y < maxY;

function crosses(a: Point, b: Point, [minX, minY, maxX, maxY]: Bounds): boolean {
  const x0 = Math.min(a[0], b[0]);
  const x1 = Math.max(a[0], b[0]);
  const y0 = Math.min(a[1], b[1]);
  const y1 = Math.max(a[1], b[1]);
  if (x0 === x1) return x0 > minX && x0 < maxX && y1 > minY && y0 < maxY;
  if (y0 === y1) return y0 > minY && y0 < maxY && x1 > minX && x0 < maxX;
  return x1 > minX && x0 < maxX && y1 > minY && y0 < maxY;
}

function exitPoint(
  p: Point,
  heading: Heading,
  target: ExcalidrawElement | null | undefined,
): Point {
  if (!target) return p;
  const [minX, minY, maxX, maxY] = expand(getElementBounds(target), ELBOW_PADDING);
  if (heading[0] > 0) return [Math.max(maxX, p[0]), p[1]];
  if (heading[0] < 0) return [Math.min(minX, p[0]), p[1]];
  if (heading[1] > 0) return [p[0], Math.max(maxY, p[1])];
  return [p[0], Math.min(minY, p[1])];
}

class MinHeap {
  private items: Array<{ f: number; key: number; seq: number }> = [];
  private seq = 0;

  get size() {
    return this.items.length;
  }

  push(key: number, f: number) {
    const item = { f, key, seq: this.seq++ };
    const { items } = this;
    items.push(item);
    let i = items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!this.less(items[i], items[parent])) break;
      [items[i], items[parent]] = [items[parent], items[i]];
      i = parent;
    }
  }

  pop(): number {
    const { items } = this;
    const top = items[0];
    const last = items.pop()!;
    if (items.length > 0) {
      items[0] = last;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        if (l < items.length && this.less(items[l], items[m])) m = l;
        if (r < items.length && this.less(items[r], items[m])) m = r;
        if (m === i) break;
        [items[i], items[m]] = [items[m], items[i]];
        i = m;
      }
    }
    return top.key;
  }

  private less(a: { f: number; seq: number }, b: { f: number; seq: number }) {
    return a.f < b.f || (a.f === b.f && a.seq < b.seq);
  }
}

const sortedUnique = (values: number[]) => [...new Set(values)].sort((a, b) => a - b);

function searchGrid(
  from: Point,
  to: Point,
  startDir: number,
  endDir: number,
  boxes: readonly Bounds[],
): Point[] | null {
  const xs = sortedUnique([
    from[0],
    to[0],
    (from[0] + to[0]) / 2,
    ...boxes.flatMap((b) => [b[0], b[2]]),
  ]);
  const ys = sortedUnique([
    from[1],
    to[1],
    (from[1] + to[1]) / 2,
    ...boxes.flatMap((b) => [b[1], b[3]]),
  ]);
  const cols = xs.length;
  const nodeAt = (i: number): Point => [xs[i % cols], ys[Math.floor(i / cols)]];
  const indexOf = ([x, y]: Point) => ys.indexOf(y) * cols + xs.indexOf(x);
  const blocked = (p: Point) => p !== from && p !== to && boxes.some((b) => strictlyInside(p, b));
  const edgeBlocked = (a: Point, b: Point) =>
    boxes.some((box) => !strictlyInside(a, box) && !strictlyInside(b, box) && crosses(a, b, box));

  const startNode = indexOf(from);
  const goalNode = indexOf(to);
  const g = new Map<number, number>();
  const parent = new Map<number, number>();
  const heap = new MinHeap();
  const h = (p: Point) => Math.abs(p[0] - to[0]) + Math.abs(p[1] - to[1]);
  const startKey = startNode * 4 + startDir;
  g.set(startKey, 0);
  heap.push(startKey, h(from));
  let best: { cost: number; key: number } | null = null;

  while (heap.size > 0) {
    const key = heap.pop();
    const cost = g.get(key)!;
    if (best && cost >= best.cost) break;
    const node = Math.floor(key / 4);
    const dir = key % 4;
    const p = node === startNode ? from : node === goalNode ? to : nodeAt(node);
    if (node === goalNode) {
      const total = cost + (dir === endDir ? 0 : BEND_PENALTY * 1.5);
      if (!best || total < best.cost) best = { cost: total, key };
      continue;
    }
    const xi = node % cols;
    const yi = Math.floor(node / cols);
    for (let d = 0; d < 4; d++) {
      if ((d + 2) % 4 === dir) continue;
      const nx = xi + DIRS[d][0];
      const ny = yi + DIRS[d][1];
      if (nx < 0 || ny < 0 || nx >= cols || ny >= ys.length) continue;
      const next = ny * cols + nx;
      const q = next === goalNode ? to : nodeAt(next);
      if (blocked(q) || edgeBlocked(p, q)) continue;
      const nextKey = next * 4 + d;
      const ng =
        cost + Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1]) + (d === dir ? 0 : BEND_PENALTY);
      if (ng >= (g.get(nextKey) ?? Infinity)) continue;
      g.set(nextKey, ng);
      parent.set(nextKey, key);
      heap.push(nextKey, ng + h(q));
    }
  }
  if (!best) return null;
  const path: Point[] = [];
  let key: number | undefined = best.key;
  while (key !== undefined) {
    const node = Math.floor(key / 4);
    path.push(node === startNode ? from : node === goalNode ? to : nodeAt(node));
    key = parent.get(key);
  }
  return path.reverse();
}

function simplify(points: readonly Point[], keep: ReadonlySet<string> = new Set()): Point[] {
  const out: Point[] = [];
  for (const p of points) {
    if (out.length > 0 && same(out.at(-1)!, p)) continue;
    out.push(p);
  }
  for (let i = out.length - 2; i > 0; i--) {
    const [a, b, c] = [out[i - 1], out[i], out[i + 1]];
    const collinear = (a[0] === b[0] && b[0] === c[0]) || (a[1] === b[1] && b[1] === c[1]);
    if (collinear && !keep.has(`${b[0]},${b[1]}`)) out.splice(i, 1);
  }
  return out;
}

export function routeElbowArrow(start: Point, end: Point, opts: ElbowRouteOptions): Point[] {
  const startHeading =
    opts.startHeading ??
    (opts.startTarget ? headingForPoint(opts.startTarget, end) : towards(start, end));
  const endHeading =
    opts.endHeading ??
    (opts.endTarget ? headingForPoint(opts.endTarget, start) : towards(end, start));
  const from = exitPoint(start, startHeading, opts.startTarget);
  const to = exitPoint(end, endHeading, opts.endTarget);
  const targets = [opts.startTarget, opts.endTarget]
    .filter((el): el is ExcalidrawElement => !!el)
    .map((el) => getElementBounds(el));
  const boxes = [...opts.obstacles, ...targets].map((b) => expand(b, ELBOW_PADDING));
  const startDir = dirIndex(startHeading);
  const endDir = (dirIndex(endHeading) + 2) % 4;
  const middle = searchGrid(from, to, startDir, endDir, boxes);
  if (!middle) {
    const mx = (from[0] + to[0]) / 2;
    return simplify([start, from, [mx, from[1]], [mx, to[1]], to, end]);
  }
  return simplify([start, ...middle, end]);
}

function sidePoint(target: ExcalidrawElement, heading: Heading, gap: number): Point {
  const [minX, minY, maxX, maxY] = getElementBounds(target);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  if (heading[0] > 0) return [maxX + gap, cy];
  if (heading[0] < 0) return [minX - gap, cy];
  if (heading[1] > 0) return [cx, maxY + gap];
  return [cx, minY - gap];
}

const centerOf = (el: ExcalidrawElement): Point => {
  const [minX, minY, maxX, maxY] = getElementBounds(el);
  return [(minX + maxX) / 2, (minY + maxY) / 2];
};

export function elbowObstacles(elements: readonly ExcalidrawElement[], arrowId: string): Bounds[] {
  return elements
    .filter((el) => el.id !== arrowId && isBindable(el))
    .map((el) => getElementBounds(el));
}

function lookupTarget(
  byId: ReadonlyMap<string, ExcalidrawElement>,
  id: string | undefined,
): ExcalidrawElement | null {
  const el = id ? byId.get(id) : undefined;
  return el && !el.isDeleted ? el : null;
}

export function updateElbowArrow(
  arrow: LinearElement,
  elements: readonly ExcalidrawElement[],
): LinearElement {
  const byId = new Map(elements.map((el) => [el.id, el]));
  const abs = getLinearAbsolutePoints(arrow);
  if (abs.length < 2) return arrow;
  const startTarget = lookupTarget(byId, arrow.startBinding?.elementId);
  const endTarget = lookupTarget(byId, arrow.endBinding?.elementId);
  const fixed = [...(arrow.fixedSegments ?? [])]
    .sort((a, b) => a.index - b.index)
    .map((seg) => ({
      start: [arrow.x + seg.start[0], arrow.y + seg.start[1]] as Point,
      end: [arrow.x + seg.end[0], arrow.y + seg.end[1]] as Point,
    }))
    .filter((seg) => !same(seg.start, seg.end));

  const firstAnchor = fixed[0]?.start ?? (endTarget ? centerOf(endTarget) : abs.at(-1)!);
  const lastAnchor = fixed.at(-1)?.end ?? (startTarget ? centerOf(startTarget) : abs[0]);
  let start = abs[0];
  let startHeading: Heading | undefined;
  if (startTarget) {
    startHeading = headingForPoint(startTarget, firstAnchor);
    start = sidePoint(startTarget, startHeading, arrow.startBinding?.gap ?? 4);
  }
  let end = abs.at(-1)!;
  let endHeading: Heading | undefined;
  if (endTarget) {
    endHeading = headingForPoint(endTarget, lastAnchor);
    end = sidePoint(endTarget, endHeading, arrow.endBinding?.gap ?? 4);
  }

  const obstacles = elbowObstacles(elements, arrow.id);
  const route: Point[] = [];
  let from = start;
  let fromHeading = startHeading;
  let fromTarget = startTarget;
  for (const seg of fixed) {
    const d = towards(seg.start, seg.end);
    route.push(
      ...routeElbowArrow(from, seg.start, {
        obstacles,
        startTarget: fromTarget,
        startHeading: fromHeading,
        endHeading: [-d[0], -d[1]],
      }),
    );
    from = seg.end;
    fromHeading = d;
    fromTarget = null;
  }
  route.push(
    ...routeElbowArrow(from, end, {
      obstacles,
      startTarget: fromTarget,
      startHeading: fromHeading,
      endTarget,
      endHeading,
    }),
  );

  const keep = new Set(fixed.flatMap((seg) => [seg.start, seg.end]).map((p) => `${p[0]},${p[1]}`));
  const points = simplify(route, keep);
  const [ox, oy] = points[0];
  const rel = points.map(([x, y]) => [x - ox, y - oy] as [number, number]);
  const unchanged =
    ox === arrow.x &&
    oy === arrow.y &&
    rel.length === arrow.points.length &&
    rel.every((p, i) => same(p, arrow.points[i]));
  if (unchanged && angleOf(arrow) === 0) return arrow;

  const fixedSegments: FixedSegment[] = [];
  for (const seg of fixed) {
    const k = points.findIndex(
      (p, i) => i > 0 && same(points[i - 1], seg.start) && same(p, seg.end),
    );
    if (k > 0)
      fixedSegments.push({
        index: k,
        start: [seg.start[0] - ox, seg.start[1] - oy],
        end: [seg.end[0] - ox, seg.end[1] - oy],
      });
  }
  const [minX, minY, maxX, maxY] = boundsOfPoints(rel);
  return bumpVersion(arrow, {
    x: ox,
    y: oy,
    angle: 0,
    points: rel,
    width: maxX - minX,
    height: maxY - minY,
    fixedSegments: arrow.fixedSegments ? fixedSegments : arrow.fixedSegments,
  });
}
