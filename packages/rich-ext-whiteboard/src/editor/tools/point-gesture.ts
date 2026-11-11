import type { LinearEnd } from '../../model/binding';
import { unbindLinearEnd } from '../../model/binding';
import { updateElbowArrow } from '../../model/elbow';
import type { LinearElement } from '../../scene/types';
import { bindArrowEnds, findBindingTarget } from '../binding-actions';
import {
  getEditedLinear,
  hitPointHandle,
  insertPoint,
  moveElbowSegment,
  movePoint,
} from '../linear-editor';
import { relayoutBoundTexts } from '../text-actions';
import type { PointerInfo, ToolContext } from './types';
import { DRAG_THRESHOLD } from './types';

export interface PointGesture {
  cancel: () => void;
  end: () => void;
  move: (e: PointerInfo) => void;
}

export type PointMoveHook = (
  ctx: ToolContext,
  el: LinearElement,
  index: number,
  e: PointerInfo,
) => LinearElement;

export function startPointGesture(
  ctx: ToolContext,
  e: PointerInfo,
  onMove?: PointMoveHook,
): PointGesture | null {
  const { store } = ctx;
  const state = store.getState();
  const el = getEditedLinear(state);
  if (!el) return null;
  const hit = hitPointHandle(el, e.scene, state.viewport.zoom);
  if (!hit) return null;

  const original = el;
  const baseIndex = hit.kind === 'point' ? hit.index : hit.kind === 'midpoint' ? hit.index + 1 : -1;
  let index = baseIndex;
  let moved = false;
  let suppressBinding = e.ctrlKey;
  const downAt = e.screen;
  const endOf = (i: number, count: number): LinearEnd | null =>
    el.type !== 'arrow' ? null : i === 0 ? 'start' : i === count - 1 ? 'end' : null;
  store.setState({ selectedPointIndex: hit.kind === 'point' ? hit.index : null });
  store.beginTransient();

  return {
    cancel() {
      store.setState({ suggestedBindingId: null });
      store.endTransient(false);
      index = -1;
    },
    move(ev) {
      if (!moved && Math.hypot(ev.screen[0] - downAt[0], ev.screen[1] - downAt[1]) < DRAG_THRESHOLD)
        return;
      moved = true;
      let next: LinearElement;
      if (hit.kind === 'segment') next = moveElbowSegment(original, hit.index, ev.scene);
      else if (hit.kind === 'midpoint')
        next = movePoint(insertPoint(original, hit.index, ev.scene), baseIndex, ev.scene);
      else next = movePoint(original, baseIndex, ev.scene);
      const dragged = endOf(baseIndex, next.points.length);
      if (original.elbowed && dragged) {
        const key = dragged === 'start' ? 'startBinding' : 'endBinding';
        const routed = updateElbowArrow({ ...next, [key]: null }, store.getState().elements);
        next = { ...routed, [key]: original[key] };
        index = dragged === 'start' ? 0 : next.points.length - 1;
      }
      if (onMove) next = onMove(ctx, next, index, ev);
      store.updateTransient(({ elements }) => ({
        elements: relayoutBoundTexts(
          elements.map((item) => (item.id === next.id ? next : item)),
          new Set([next.id]),
        ),
      }));
      suppressBinding = ev.ctrlKey;
      const end = endOf(index, next.points.length);
      const { elements, viewport } = store.getState();
      const target =
        end && !suppressBinding
          ? findBindingTarget(elements, next.id, ev.scene, viewport.zoom)
          : null;
      store.setState({
        selectedPointIndex: index >= 0 ? index : null,
        suggestedBindingId: target?.id ?? null,
      });
    },
    end() {
      const current = store.getState().elements.find((item) => item.id === el.id) as
        LinearElement | undefined;
      const end = current && moved ? endOf(index, current.points.length) : null;
      if (end) {
        const zoom = store.getState().viewport.zoom;
        store.updateTransient(({ elements }) => ({
          elements: suppressBinding
            ? unbindLinearEnd(elements, el.id, end)
            : bindArrowEnds(elements, el.id, [end], zoom),
        }));
      }
      store.setState({ suggestedBindingId: null });
      store.endTransient(moved);
      index = -1;
    },
  };
}
