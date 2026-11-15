import type { Bounds } from './geometry';

export interface FitInsets {
  bottom?: number;
  left?: number;
  right?: number;
  top?: number;
}

export interface FitOptions {
  insets?: FitInsets;
  maxZoom?: number;
  minZoom?: number;
  padding?: number;
  zoomFactor?: number;
}

export interface FittedViewport {
  scrollX: number;
  scrollY: number;
  zoom: number;
}

export function viewportFor(
  bounds: Bounds,
  size: { height: number; width: number },
  { insets = {}, maxZoom = 30, minZoom = 0.1, padding = 0, zoomFactor = 1 }: FitOptions = {},
): FittedViewport {
  const left = insets.left ?? 0;
  const top = insets.top ?? 0;
  const width = Math.max(1, size.width - left - (insets.right ?? 0));
  const height = Math.max(1, size.height - top - (insets.bottom ?? 0));
  const [minX, minY, maxX, maxY] = bounds;
  const w = Math.max(1, maxX - minX);
  const h = Math.max(1, maxY - minY);
  const fit = Math.min((width - padding * 2) / w, (height - padding * 2) / h) * zoomFactor;
  const zoom = Math.min(maxZoom, Math.max(minZoom, fit));
  return {
    zoom,
    scrollX: (left + width / 2) / zoom - (minX + w / 2),
    scrollY: (top + height / 2) / zoom - (minY + h / 2),
  };
}
