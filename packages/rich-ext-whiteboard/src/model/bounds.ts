import type { ExcalidrawElement } from '../scene/types';
import type { Bounds, Point } from './geometry';
import { angleOf, boundsContain, boundsOfPoints, distanceToSegment, rotatePoint } from './geometry';

export const FRAME_NAME_HEIGHT = 20;

type WithPoints = ExcalidrawElement & { points: Array<[number, number]> };

export function isLinear(el: ExcalidrawElement): el is WithPoints {
  return el.type === 'line' || el.type === 'arrow' || el.type === 'freedraw';
}

function pointsOf(el: WithPoints): Point[] {
  return el.points && el.points.length > 0 ? el.points : [[0, 0]];
}

export function getElementCenter(el: ExcalidrawElement): Point {
  if (isLinear(el)) {
    const [minX, minY, maxX, maxY] = boundsOfPoints(pointsOf(el));
    return [el.x + (minX + maxX) / 2, el.y + (minY + maxY) / 2];
  }
  return [el.x + el.width / 2, el.y + el.height / 2];
}

export function getLinearAbsolutePoints(el: WithPoints): Point[] {
  const center = getElementCenter(el);
  return pointsOf(el).map(([px, py]) => rotatePoint([el.x + px, el.y + py], center, angleOf(el)));
}

export function getElementAbsoluteCorners(el: ExcalidrawElement): Point[] {
  if (isLinear(el)) return getLinearAbsolutePoints(el);
  const center = getElementCenter(el);
  const { x, y, width: w, height: h } = el;
  const corners: Point[] = [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
  return corners.map((p) => rotatePoint(p, center, angleOf(el)));
}

export function getElementBounds(el: ExcalidrawElement): Bounds {
  return boundsOfPoints(getElementAbsoluteCorners(el));
}

export function getCommonBounds(elements: readonly ExcalidrawElement[]): Bounds {
  if (elements.length === 0) return [0, 0, 0, 0];
  return boundsOfPoints(elements.flatMap((el) => getElementAbsoluteCorners(el)));
}

export function toLocalPoint(el: ExcalidrawElement, p: Point): Point {
  const [x, y] = rotatePoint(p, getElementCenter(el), -angleOf(el));
  return [x - el.x, y - el.y];
}

const isFilled = (el: ExcalidrawElement) =>
  !!el.backgroundColor && el.backgroundColor !== 'transparent';

function hitRectangle(w: number, h: number, [lx, ly]: Point, tol: number, filled: boolean) {
  const inside = lx >= -tol && lx <= w + tol && ly >= -tol && ly <= h + tol;
  if (!inside) return false;
  if (filled) return true;
  return lx <= tol || lx >= w - tol || ly <= tol || ly >= h - tol;
}

function hitEllipse(w: number, h: number, [lx, ly]: Point, tol: number, filled: boolean) {
  const rx = w / 2;
  const ry = h / 2;
  if (rx <= 0 || ry <= 0) return false;
  const dx = lx - rx;
  const dy = ly - ry;
  const norm = Math.sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry));
  const edgeDistance = Math.abs(norm - 1) * Math.min(rx, ry);
  if (filled && norm <= 1) return true;
  return edgeDistance <= tol;
}

function hitDiamond(w: number, h: number, p: Point, tol: number, filled: boolean) {
  const top: Point = [w / 2, 0];
  const right: Point = [w, h / 2];
  const bottom: Point = [w / 2, h];
  const left: Point = [0, h / 2];
  if (filled && w > 0 && h > 0) {
    const inside = Math.abs(p[0] - w / 2) / (w / 2) + Math.abs(p[1] - h / 2) / (h / 2) <= 1;
    if (inside) return true;
  }
  return [
    [top, right],
    [right, bottom],
    [bottom, left],
    [left, top],
  ].some(([a, b]) => distanceToSegment(p, a as Point, b as Point) <= tol);
}

function hitPolyline(points: readonly Point[], p: Point, tol: number) {
  if (points.length === 1) return distanceToSegment(p, points[0], points[0]) <= tol;
  for (let i = 0; i < points.length - 1; i++) {
    if (distanceToSegment(p, points[i], points[i + 1]) <= tol) return true;
  }
  return false;
}

export function hitTestElement(el: ExcalidrawElement, p: Point, tolerance: number): boolean {
  if (el.isDeleted) return false;
  const tol = tolerance + (Number.isFinite(el.strokeWidth) ? el.strokeWidth : 0) / 2;
  if (isLinear(el)) return hitPolyline(getLinearAbsolutePoints(el), p, tol);
  const local = toLocalPoint(el, p);
  const { width: w, height: h } = el;
  switch (el.type) {
    case 'rectangle':
    case 'embeddable':
    case 'iframe': {
      return hitRectangle(w, h, local, tol, isFilled(el));
    }
    case 'ellipse': {
      return hitEllipse(w, h, local, tol, isFilled(el));
    }
    case 'diamond': {
      return hitDiamond(w, h, local, tol, isFilled(el));
    }
    case 'frame':
    case 'magicframe': {
      const [lx, ly] = local;
      const onLabel = lx >= 0 && lx <= w && ly >= -FRAME_NAME_HEIGHT && ly < 0;
      return onLabel || hitRectangle(w, h, local, tol, false);
    }
    default: {
      return hitRectangle(w, h, local, tol, true);
    }
  }
}

export function elementsInBox<T extends ExcalidrawElement>(
  elements: readonly T[],
  box: Bounds,
): T[] {
  return elements.filter((el) => !el.isDeleted && boundsContain(box, getElementBounds(el)));
}
