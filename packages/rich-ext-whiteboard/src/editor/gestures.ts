import type { Point } from '../model/geometry';
import type { Viewport } from './types';
import { clampZoom, screenToScene } from './viewport';

export type GestureStart = 'single' | 'pinch' | 'ignored';

export interface GestureTracker {
  down: (id: number, screen: Point, viewport: Viewport) => GestureStart;
  isActive: () => boolean;
  move: (id: number, screen: Point) => Viewport | null;
  up: (id: number) => void;
}

interface Pinch {
  anchor: Point;
  distance: number;
  ids: [number, number];
  zoom: number;
}

const midpoint = (a: Point, b: Point): Point => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

export function createGestureTracker(): GestureTracker {
  const points = new Map<number, Point>();
  let pinch: Pinch | null = null;
  let suppressed = false;

  return {
    down(id, screen, viewport) {
      points.set(id, screen);
      if (pinch || suppressed) return 'ignored';
      if (points.size < 2) return 'single';
      const [a, b] = [...points.keys()].slice(-2) as [number, number];
      const pa = points.get(a)!;
      const pb = points.get(b)!;
      pinch = {
        ids: [a, b],
        distance: Math.max(Math.hypot(pb[0] - pa[0], pb[1] - pa[1]), 1),
        zoom: viewport.zoom,
        anchor: screenToScene(midpoint(pa, pb), viewport),
      };
      return 'pinch';
    },
    move(id, screen) {
      if (!points.has(id)) return null;
      points.set(id, screen);
      if (!pinch) return null;
      const pa = points.get(pinch.ids[0])!;
      const pb = points.get(pinch.ids[1])!;
      const zoom = clampZoom(
        (pinch.zoom * Math.hypot(pb[0] - pa[0], pb[1] - pa[1])) / pinch.distance,
      );
      const [mx, my] = midpoint(pa, pb);
      return { zoom, scrollX: mx / zoom - pinch.anchor[0], scrollY: my / zoom - pinch.anchor[1] };
    },
    up(id) {
      points.delete(id);
      if (pinch) {
        pinch = null;
        suppressed = true;
      }
      if (points.size === 0) suppressed = false;
    },
    isActive: () => pinch !== null || suppressed,
  };
}
