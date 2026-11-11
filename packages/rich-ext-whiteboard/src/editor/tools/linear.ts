import { newLinearElement } from '../../model/create';
import { elbowObstacles, routeElbowArrow } from '../../model/elbow';
import type { Point } from '../../model/geometry';
import { boundsOfPoints } from '../../model/geometry';
import type { LinearElement } from '../../scene/types';
import { bindArrowEnds, findBindingTarget } from '../binding-actions';
import { activeGrid, snapPoint } from '../grid';
import type { WhiteboardStore } from '../store';
import {
  appendElement,
  cancelCreation,
  findElement,
  finishCreation,
  replaceElement,
} from './creation';
import type { PointerInfo, ToolContext, ToolHandler } from './types';
import { DRAG_THRESHOLD } from './types';

const SNAP = Math.PI / 12;

export interface LinearToolOptions {
  onFinished?: (ctx: ToolContext, el: LinearElement) => void;
  onPointMoved?: (ctx: ToolContext, el: LinearElement, e: PointerInfo) => LinearElement;
}

export function withPoints(el: LinearElement, absolute: Point[]): LinearElement {
  const [ox, oy] = absolute[0];
  const points = absolute.map(([x, y]) => [x - ox, y - oy] as [number, number]);
  const [minX, minY, maxX, maxY] = boundsOfPoints(points);
  return { ...el, x: ox, y: oy, points, width: maxX - minX, height: maxY - minY };
}

function snapAngle(from: Point, to: Point): Point {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy);
  const angle = Math.round(Math.atan2(dy, dx) / SNAP) * SNAP;
  return [from[0] + Math.cos(angle) * length, from[1] + Math.sin(angle) * length];
}

function absolutePoints(el: LinearElement): Point[] {
  return el.points.map(([x, y]) => [el.x + x, el.y + y]);
}

export function createLinearTool(
  type: 'line' | 'arrow',
  options: LinearToolOptions = {},
): ToolHandler {
  let id: string | null = null;
  let phase: 'idle' | 'dragging' | 'multi' = 'idle';
  let downAt: Point = [0, 0];
  let origin: Point = [0, 0];
  let suppressBinding = false;

  const suggest = (ctx: ToolContext, el: LinearElement, p: Point) => {
    const { elements, viewport } = ctx.store.getState();
    const target =
      type === 'arrow' && !suppressBinding
        ? findBindingTarget(elements, el.id, p, viewport.zoom)
        : null;
    ctx.store.setState({ suggestedBindingId: target?.id ?? null });
  };

  const update = (ctx: ToolContext, e: PointerInfo) => {
    const el = id ? (findElement(ctx.store, id) as LinearElement | undefined) : undefined;
    if (!el) return;
    const at = snapPoint(e.scene, activeGrid(ctx.store, e));
    let next: LinearElement;
    if (el.elbowed) {
      const { elements, viewport } = ctx.store.getState();
      const targetAt = (p: Point) =>
        suppressBinding ? null : findBindingTarget(elements, el.id, p, viewport.zoom);
      next = withPoints(
        el,
        routeElbowArrow(origin, at, {
          obstacles: elbowObstacles(elements, el.id),
          startTarget: targetAt(origin),
          endTarget: targetAt(at),
        }),
      );
    } else {
      const pts = absolutePoints(el);
      const anchor = pts.at(-2) ?? pts[0];
      pts[pts.length - 1] = e.shiftKey ? snapAngle(anchor, at) : at;
      next = withPoints(el, pts);
    }
    if (options.onPointMoved) next = options.onPointMoved(ctx, next, e);
    replaceElement(ctx.store, next);
    suggest(ctx, next, absolutePoints(next).at(-1)!);
  };

  const finish = (store: WhiteboardStore, dropPreview: boolean, ctx?: ToolContext) => {
    const el = id ? (findElement(store, id) as LinearElement | undefined) : undefined;
    const createdId = id;
    id = null;
    phase = 'idle';
    if (!el || !createdId) return;
    const pts = absolutePoints(el);
    if (dropPreview && el.elbowed) pts.length = 0;
    if (dropPreview) pts.pop();
    if (pts.length < 2) {
      cancelCreation(store);
      return;
    }
    const finalEl = withPoints(el, pts);
    replaceElement(store, finalEl);
    if (type === 'arrow' && !suppressBinding) {
      const zoom = store.getState().viewport.zoom;
      store.updateTransient(({ elements }) => ({
        elements: bindArrowEnds(elements, createdId, ['start', 'end'], zoom),
      }));
    }
    store.setState({ suggestedBindingId: null });
    finishCreation(store, createdId);
    if (ctx) options.onFinished?.(ctx, finalEl);
  };

  return {
    onPointerDown(ctx, e) {
      const { store } = ctx;
      downAt = e.screen;
      suppressBinding = e.ctrlKey;
      if (phase !== 'multi') origin = snapPoint(e.scene, activeGrid(store, e));
      if (phase === 'multi' && id) {
        const el = findElement(store, id) as LinearElement;
        if (el.elbowed) {
          update(ctx, e);
          finish(store, false, ctx);
          return;
        }
        const pts = absolutePoints(el);
        replaceElement(store, withPoints(el, [...pts, pts.at(-1)!]));
        return;
      }
      const el = newLinearElement(
        type,
        {
          x: origin[0],
          y: origin[1],
          points: [
            [0, 0],
            [0, 0],
          ],
        },
        store.getState().currentStyle,
      );
      id = el.id;
      phase = 'dragging';
      store.beginTransient();
      appendElement(store, el);
      store.setState({ selectedIds: new Set() });
    },
    onPointerMove(ctx, e) {
      if (phase === 'idle') return;
      suppressBinding = e.ctrlKey;
      update(ctx, e);
    },
    onPointerUp(ctx, e) {
      if (phase !== 'dragging') return;
      suppressBinding = e.ctrlKey;
      const moved = Math.hypot(e.screen[0] - downAt[0], e.screen[1] - downAt[1]);
      if (moved < DRAG_THRESHOLD) {
        phase = 'multi';
        return;
      }
      finish(ctx.store, false, ctx);
    },
    onDoubleClick(ctx) {
      if (phase === 'multi') finish(ctx.store, true, ctx);
    },
    onKeyDown(ctx, e) {
      if (phase === 'idle') return false;
      if (e.key === 'Enter' || e.key === 'Escape') {
        finish(ctx.store, true, ctx);
        return true;
      }
      return false;
    },
    cancel(ctx) {
      if (!id) return;
      if (phase === 'multi') {
        finish(ctx.store, true, ctx);
        return;
      }
      id = null;
      phase = 'idle';
      ctx.store.setState({ suggestedBindingId: null });
      cancelCreation(ctx.store);
    },
  };
}
