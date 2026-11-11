import { isLinear } from '../../model/bounds';
import { refreshFrames } from '../../model/frames';
import type { Point } from '../../model/geometry';
import type { ExcalidrawElement, LinearElement } from '../../scene/types';
import { refreshBindings } from '../binding-actions';
import { activeGrid, snapPoint } from '../grid';
import { getSelectedElements } from '../selection-utils';
import { relayoutBoundTexts } from '../text-actions';
import type { TransformHandle } from '../transform';
import {
  getTransformFrame,
  getTransformHandles,
  hitTransformHandle,
  resizeElements,
  rotateElements,
} from '../transform';
import type { EditorState } from '../types';
import type { PointerInfo, ToolContext } from './types';

export interface TransformGesture {
  end: (keep: boolean) => void;
  move: (e: PointerInfo) => void;
}

export function getTransformTargets(state: EditorState): ExcalidrawElement[] {
  const selected = getSelectedElements(state).filter(
    (el) => !(el.type === 'text' && el.containerId),
  );
  if (selected.length === 0) return [];
  if (selected.length === 1) {
    const [el] = selected;
    if (el.locked) return [];
    if (isLinear(el) && el.type !== 'freedraw' && el.points.length <= 2) return [];
    if (el.type === 'arrow' && (el as LinearElement).elbowed) return [];
    if (state.editingLinearId === el.id) return [];
  }
  return selected;
}

export function getActiveHandles(state: EditorState): Record<TransformHandle, Point> | null {
  const targets = getTransformTargets(state);
  if (targets.length === 0) return null;
  const frame = getTransformFrame(targets);
  return getTransformHandles(frame.box, state.viewport.zoom, frame.angle);
}

const angleOf = (p: Point, c: Point) => Math.atan2(p[1] - c[1], p[0] - c[0]);

export function startTransformGesture(ctx: ToolContext, e: PointerInfo): TransformGesture | null {
  const { store } = ctx;
  const state = store.getState();
  const handles = getActiveHandles(state);
  if (!handles) return null;
  const handle = hitTransformHandle(handles, e.scene, state.viewport.zoom);
  if (!handle) return null;

  const originals = getTransformTargets(state);
  const ids = new Set(originals.map((el) => el.id));
  const frame = getTransformFrame(originals);
  const start = e.scene;
  const startAngle = angleOf(start, frame.center);
  let changed = false;
  store.beginTransient();

  const replace = (next: readonly ExcalidrawElement[]) => {
    const byId = new Map(next.map((el) => [el.id, el]));
    store.updateTransient(({ elements }) => ({
      elements: refreshFrames(
        refreshBindings(
          relayoutBoundTexts(
            elements.map((el) => (ids.has(el.id) ? byId.get(el.id)! : el)),
            ids,
          ),
          ids,
        ),
        ids,
      ),
    }));
  };

  return {
    move(ev) {
      changed = true;
      if (handle === 'rotation') {
        const delta = angleOf(ev.scene, frame.center) - startAngle;
        replace(rotateElements(originals, frame.center, delta, { snap: ev.shiftKey }));
        return;
      }
      replace(
        resizeElements(originals, handle, start, snapPoint(ev.scene, activeGrid(store, ev)), {
          keepRatio: ev.shiftKey,
          fromCenter: ev.altKey,
        }),
      );
    },
    end(keep) {
      store.endTransient(keep && changed);
    },
  };
}
