import { newRichTextElement } from '../../model/create';
import type { Point } from '../../model/geometry';
import { resolveRichTextHeights } from '../../model/richtext-layout';
import { activeGrid, snapPoint } from '../grid';
import { startRichTextEditing } from '../richtext-actions';
import {
  appendElement,
  cancelCreation,
  findElement,
  finishCreation,
  replaceElement,
} from './creation';
import type { ToolHandler } from './types';
import { DRAG_THRESHOLD } from './types';

export const CARD_WIDTH = 200;
export const CARD_HEIGHT = 120;

export function createCardTool(): ToolHandler {
  let id: string | null = null;
  let start: Point = [0, 0];
  let origin: Point = [0, 0];

  return {
    onPointerDown(ctx, e) {
      const { store } = ctx;
      origin = e.scene;
      start = snapPoint(e.scene, activeGrid(store, e));
      const el = newRichTextElement({ x: start[0], y: start[1], width: 0, height: 0 });
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
      replaceElement(ctx.store, {
        ...current,
        x: Math.min(start[0], at[0]),
        y: Math.min(start[1], at[1]),
        width: Math.abs(at[0] - start[0]),
        height: Math.abs(at[1] - start[1]),
      });
    },
    onPointerUp(ctx, e) {
      if (!id) return;
      const { store } = ctx;
      const createdId = id;
      id = null;
      const current = findElement(store, createdId);
      if (!current) {
        cancelCreation(store);
        return;
      }
      const zoom = store.getState().viewport.zoom;
      const travel = Math.hypot(e.scene[0] - origin[0], e.scene[1] - origin[1]) * zoom;
      const sized =
        travel < DRAG_THRESHOLD
          ? {
              ...current,
              x: origin[0] - CARD_WIDTH / 2,
              y: origin[1] - CARD_HEIGHT / 2,
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
            }
          : current;
      replaceElement(store, resolveRichTextHeights([sized])[0]);
      finishCreation(store, createdId);
      startRichTextEditing(store, createdId);
    },
    cancel(ctx) {
      if (!id) return;
      id = null;
      cancelCreation(ctx.store);
    },
  };
}
