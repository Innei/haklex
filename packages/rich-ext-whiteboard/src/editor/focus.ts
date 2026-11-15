import { getCommonBounds } from '../model/bounds';
import type { Bounds } from '../model/geometry';
import type { FitInsets, FitOptions } from '../model/viewport-fit';
import { viewportFor } from '../model/viewport-fit';
import type { WhiteboardStore } from './store';
import type { Viewport } from './types';
import { MAX_ZOOM, MIN_ZOOM } from './viewport';

export type FocusInsets = FitInsets;

export interface FocusOptions extends FitOptions {
  animate?: boolean;
  duration?: number;
}

export type FocusTarget = readonly string[] | Bounds | null;

const DEFAULT_DURATION = 280;

const isBounds = (target: FocusTarget): target is Bounds =>
  !!target && target.length === 4 && target.every((value) => typeof value === 'number');

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
  const viewport = viewportFor(bounds, canvasSize, {
    ...options,
    minZoom: MIN_ZOOM,
    maxZoom: Math.min(options.maxZoom ?? MAX_ZOOM, MAX_ZOOM),
  });
  if (options.animate && typeof requestAnimationFrame === 'function')
    animateTo(store, viewport, options.duration ?? DEFAULT_DURATION);
  else store.setState({ viewport });
  return true;
}
