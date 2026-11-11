import type { Point } from '../../model/geometry';
import type { Viewport } from '../types';
import type { ToolHandler } from './types';

export function createHandTool(): ToolHandler {
  let start: Point | null = null;
  let origin: Viewport | null = null;
  return {
    onPointerDown(ctx, e) {
      start = e.screen;
      origin = ctx.store.getState().viewport;
    },
    onPointerMove(ctx, e) {
      if (!start || !origin) return;
      ctx.store.setState({
        viewport: {
          ...origin,
          scrollX: origin.scrollX + (e.screen[0] - start[0]) / origin.zoom,
          scrollY: origin.scrollY + (e.screen[1] - start[1]) / origin.zoom,
        },
      });
    },
    onPointerUp() {
      start = null;
      origin = null;
    },
  };
}
