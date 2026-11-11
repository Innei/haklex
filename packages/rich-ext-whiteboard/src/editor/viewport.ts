import type { Bounds, Point } from '../model/geometry';
import type { Viewport } from './types';

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 30;

export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export function screenToScene([sx, sy]: Point, vp: Viewport): Point {
  return [sx / vp.zoom - vp.scrollX, sy / vp.zoom - vp.scrollY];
}

export function sceneToScreen([x, y]: Point, vp: Viewport): Point {
  return [(x + vp.scrollX) * vp.zoom, (y + vp.scrollY) * vp.zoom];
}

export function zoomAt(vp: Viewport, screen: Point, nextZoom: number): Viewport {
  const zoom = clampZoom(nextZoom);
  const [x, y] = screenToScene(screen, vp);
  return { zoom, scrollX: screen[0] / zoom - x, scrollY: screen[1] / zoom - y };
}

export function panBy(vp: Viewport, dxScreen: number, dyScreen: number): Viewport {
  return {
    ...vp,
    scrollX: vp.scrollX + dxScreen / vp.zoom,
    scrollY: vp.scrollY + dyScreen / vp.zoom,
  };
}

export function fitToContent(
  bounds: Bounds,
  size: { height: number; width: number },
  padding = 48,
): Viewport {
  const [minX, minY, maxX, maxY] = bounds;
  const w = Math.max(1, maxX - minX);
  const h = Math.max(1, maxY - minY);
  const zoom = clampZoom(
    Math.min(1, (size.width - padding * 2) / w, (size.height - padding * 2) / h),
  );
  return {
    zoom,
    scrollX: size.width / 2 / zoom - (minX + w / 2),
    scrollY: size.height / 2 / zoom - (minY + h / 2),
  };
}
