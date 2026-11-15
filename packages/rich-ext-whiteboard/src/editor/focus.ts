import { getCommonBounds } from '../model/bounds';
import type { Bounds } from '../model/geometry';
import type { WhiteboardStore } from './store';
import type { Viewport } from './types';
import { clampZoom } from './viewport';

export interface FocusInsets {
  bottom?: number;
  left?: number;
  right?: number;
  top?: number;
}

export interface FocusOptions {
  animate?: boolean;
  duration?: number;
  insets?: FocusInsets;
  maxZoom?: number;
  padding?: number;
  zoomFactor?: number;
}

export type FocusTarget = readonly string[] | Bounds | null;

const DEFAULT_DURATION = 280;

const isBounds = (target: FocusTarget): target is Bounds =>
  !!target && target.length === 4 && target.every((value) => typeof value === 'number');

export function viewportFor(
  bounds: Bounds,
  size: { height: number; width: number },
  { insets = {}, maxZoom = Infinity, padding = 0, zoomFactor = 1 }: FocusOptions = {},
): Viewport {
  const left = insets.left ?? 0;
  const top = insets.top ?? 0;
  const width = Math.max(1, size.width - left - (insets.right ?? 0));
  const height = Math.max(1, size.height - top - (insets.bottom ?? 0));
  const [minX, minY, maxX, maxY] = bounds;
  const w = Math.max(1, maxX - minX);
  const h = Math.max(1, maxY - minY);
  const fit = Math.min((width - padding * 2) / w, (height - padding * 2) / h) * zoomFactor;
  const zoom = clampZoom(Math.min(maxZoom, fit));
  return {
    zoom,
    scrollX: (left + width / 2) / zoom - (minX + w / 2),
    scrollY: (top + height / 2) / zoom - (minY + h / 2),
  };
}

const running = new WeakMap<WhiteboardStore, number>();

function animateTo(store: WhiteboardStore, target: Viewport, duration: number) {
  const from = store.getState().viewport;
  const started = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - started) / duration);
    const eased = 1 - (1 - t) ** 3;
    const mix = (a: number, b: number) => a + (b - a) * eased;
    store.setState({
      viewport: {
        zoom: mix(from.zoom, target.zoom),
        scrollX: mix(from.scrollX, target.scrollX),
        scrollY: mix(from.scrollY, target.scrollY),
      },
    });
    if (t < 1) running.set(store, requestAnimationFrame(step));
    else running.delete(store);
  };
  running.set(store, requestAnimationFrame(step));
}

export function focusElements(
  store: WhiteboardStore,
  target: FocusTarget,
  options: FocusOptions = {},
): boolean {
  const { elements, canvasSize } = store.getState();
  let bounds: Bounds | null = null;
  if (isBounds(target)) bounds = target;
  else {
    const wanted = target ? new Set(target) : null;
    const picked = elements.filter((el) => !el.isDeleted && (!wanted || wanted.has(el.id)));
    if (picked.length > 0) bounds = getCommonBounds(picked);
  }
  if (!bounds || canvasSize.width <= 0 || canvasSize.height <= 0) return false;
  const pendingFrame = running.get(store);
  if (pendingFrame !== undefined) cancelAnimationFrame(pendingFrame);
  running.delete(store);
  const viewport = viewportFor(bounds, canvasSize, options);
  if (options.animate && typeof requestAnimationFrame === 'function')
    animateTo(store, viewport, options.duration ?? DEFAULT_DURATION);
  else store.setState({ viewport });
  return true;
}
