import type { Point } from '../../model/geometry';
import { deleteElements } from '../actions';
import { getHitElement, withBoundText } from '../selection-utils';
import type { ToolContext, ToolHandler } from './types';
import { HIT_TOLERANCE } from './types';

const SAMPLE_STEP = 4;

function collect(ctx: ToolContext, from: Point, to: Point) {
  const state = ctx.store.getState();
  const tol = HIT_TOLERANCE / state.viewport.zoom;
  const erasing = new Set(state.erasingIds);
  const steps = Math.max(1, Math.ceil(Math.hypot(to[0] - from[0], to[1] - from[1]) / SAMPLE_STEP));
  const alive = state.elements.filter((el) => !erasing.has(el.id));
  for (let i = 0; i <= steps; i++) {
    const p: Point = [
      from[0] + ((to[0] - from[0]) * i) / steps,
      from[1] + ((to[1] - from[1]) * i) / steps,
    ];
    const hit = getHitElement(alive, p, tol);
    if (hit) erasing.add(hit.id);
  }
  if (erasing.size !== state.erasingIds.size) ctx.store.setState({ erasingIds: erasing });
}

export function createEraserTool(): ToolHandler {
  let last: Point | null = null;

  return {
    onPointerDown(ctx, e) {
      last = e.scene;
      ctx.store.setState({ erasingIds: new Set(), selectedIds: new Set() });
      collect(ctx, e.scene, e.scene);
    },
    onPointerMove(ctx, e) {
      if (!last) return;
      collect(ctx, last, e.scene);
      last = e.scene;
    },
    onPointerUp(ctx) {
      if (!last) return;
      last = null;
      const { store } = ctx;
      const ids = withBoundText(store.getState().elements, store.getState().erasingIds);
      store.setState({ erasingIds: new Set() });
      if (ids.size === 0) return;
      store.commit(({ elements }) => ({ elements: deleteElements(elements, ids) }));
    },
    cancel(ctx) {
      last = null;
      ctx.store.setState({ erasingIds: new Set() });
    },
  };
}
