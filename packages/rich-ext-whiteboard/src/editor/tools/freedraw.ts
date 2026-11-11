import { newFreedrawElement } from '../../model/create';
import { boundsOfPoints } from '../../model/geometry';
import type { FreedrawElement } from '../../scene/types';
import { appendElement, findElement, replaceElement } from './creation';
import type { ToolHandler } from './types';

export function createFreedrawTool(): ToolHandler {
  let id: string | null = null;

  return {
    onPointerDown(ctx, e) {
      const { store } = ctx;
      const isPen = e.pointerType === 'pen';
      const el = newFreedrawElement(
        {
          x: e.scene[0],
          y: e.scene[1],
          points: [[0, 0]],
          pressures: isPen ? [e.pressure] : [],
          simulatePressure: !isPen,
        },
        store.getState().currentStyle,
      );
      id = el.id;
      store.beginTransient();
      appendElement(store, el);
      store.setState({ selectedIds: new Set() });
    },
    onPointerMove(ctx, e) {
      if (!id) return;
      const el = findElement(ctx.store, id) as FreedrawElement | undefined;
      if (!el) return;
      const points = [...el.points, [e.scene[0] - el.x, e.scene[1] - el.y] as [number, number]];
      const [minX, minY, maxX, maxY] = boundsOfPoints(points);
      replaceElement(ctx.store, {
        ...el,
        points,
        pressures: el.simulatePressure ? el.pressures : [...el.pressures, e.pressure],
        width: maxX - minX,
        height: maxY - minY,
      });
    },
    onPointerUp(ctx) {
      if (!id) return;
      id = null;
      ctx.store.endTransient(true);
    },
    cancel(ctx) {
      if (!id) return;
      id = null;
      ctx.store.endTransient(false);
    },
  };
}
