import { newElement, newFrameElement } from '../../model/create';
import type { Point } from '../../model/geometry';
import type { ExcalidrawElement } from '../../scene/types';
import { activeGrid, snapPoint } from '../grid';
import {
  appendElement,
  cancelCreation,
  findElement,
  finishCreation,
  replaceElement,
} from './creation';
import type { ToolContext, ToolHandler } from './types';
import { DRAG_THRESHOLD } from './types';

export type ShapeToolType = 'rectangle' | 'diamond' | 'ellipse' | 'frame';

export interface ShapeToolOptions {
  onCreated?: (ctx: ToolContext, el: ExcalidrawElement) => void;
}

export function shapeBox(start: Point, current: Point, square: boolean, fromCenter: boolean) {
  let w = current[0] - start[0];
  let h = current[1] - start[1];
  if (square) {
    const size = Math.max(Math.abs(w), Math.abs(h));
    w = Math.sign(w || 1) * size;
    h = Math.sign(h || 1) * size;
  }
  if (fromCenter) {
    return {
      x: start[0] - Math.abs(w),
      y: start[1] - Math.abs(h),
      width: Math.abs(w) * 2,
      height: Math.abs(h) * 2,
    };
  }
  return {
    x: Math.min(start[0], start[0] + w),
    y: Math.min(start[1], start[1] + h),
    width: Math.abs(w),
    height: Math.abs(h),
  };
}

export function createShapeTool(type: ShapeToolType, options: ShapeToolOptions = {}): ToolHandler {
  let id: string | null = null;
  let start: Point = [0, 0];

  return {
    onPointerDown(ctx, e) {
      const { store } = ctx;
      const style = store.getState().currentStyle;
      start = snapPoint(e.scene, activeGrid(store, e));
      const partial = { x: start[0], y: start[1], width: 0, height: 0 };
      const el =
        type === 'frame' ? newFrameElement(partial, style) : newElement(type, partial, style);
      id = el.id;
      store.beginTransient();
      appendElement(store, el);
      store.setState({ selectedIds: new Set() });
    },
    onPointerMove(ctx, e) {
      if (!id) return;
      const current = findElement(ctx.store, id);
      if (!current) return;
      const at = snapPoint(e.scene, activeGrid(ctx.store, e));
      replaceElement(ctx.store, { ...current, ...shapeBox(start, at, e.shiftKey, e.altKey) });
    },
    onPointerUp(ctx) {
      if (!id) return;
      const { store } = ctx;
      const el = findElement(store, id);
      const zoom = store.getState().viewport.zoom;
      const createdId = id;
      id = null;
      if (!el || Math.max(el.width, el.height) * zoom < DRAG_THRESHOLD) {
        cancelCreation(store);
        return;
      }
      finishCreation(store, createdId);
      options.onCreated?.(ctx, el);
    },
    cancel(ctx) {
      if (!id) return;
      id = null;
      cancelCreation(ctx.store);
    },
  };
}
