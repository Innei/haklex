import { getCommonBounds } from '../../model/bounds';
import { refreshFrames, withFrameChildren } from '../../model/frames';
import type { Point } from '../../model/geometry';
import { normalizeBox } from '../../model/geometry';
import { bumpVersion } from '../../model/mutate';
import type { ExcalidrawElement } from '../../scene/types';
import { refreshBindings } from '../binding-actions';
import { activeGrid, snapValue } from '../grid';
import { startRichTextEditing } from '../richtext-actions';
import { getSelectionTarget, selectInBox, withBoundText } from '../selection-utils';
import { canHoldText, startTextEditing } from '../text-actions';
import type { PointGesture, PointMoveHook } from './point-gesture';
import { startPointGesture } from './point-gesture';
import type { TransformGesture } from './transform-gesture';
import { startTransformGesture } from './transform-gesture';
import type { PointerInfo, ToolContext, ToolHandler } from './types';
import { DRAG_THRESHOLD, HIT_TOLERANCE } from './types';

type Mode = 'idle' | 'drag' | 'box' | 'transform' | 'point';

export function moveElements(
  originals: ReadonlyMap<string, ExcalidrawElement>,
  dx: number,
  dy: number,
) {
  return (elements: readonly ExcalidrawElement[]) =>
    elements.map((el) => {
      const original = originals.get(el.id);
      return original ? bumpVersion(original, { x: original.x + dx, y: original.y + dy }) : el;
    });
}

export interface SelectionToolOptions {
  onPointMove?: PointMoveHook;
}

export function createSelectionTool(options: SelectionToolOptions = {}): ToolHandler {
  let mode: Mode = 'idle';
  let start: Point = [0, 0];
  let moved = false;
  let originals = new Map<string, ExcalidrawElement>();
  let dragOrigin: Point = [0, 0];
  let baseSelection = new Set<string>();
  let gesture: TransformGesture | null = null;
  let pointGesture: PointGesture | null = null;

  return {
    onPointerDown(ctx: ToolContext, e: PointerInfo) {
      const { store } = ctx;
      pointGesture = startPointGesture(ctx, e, options.onPointMove);
      if (pointGesture) {
        mode = 'point';
        return;
      }
      gesture = startTransformGesture(ctx, e);
      if (gesture) {
        mode = 'transform';
        return;
      }
      const state = store.getState();
      const target = getSelectionTarget(state, e.scene, HIT_TOLERANCE / state.viewport.zoom);
      start = e.scene;
      moved = false;

      if (!target) {
        baseSelection = e.shiftKey ? new Set(state.selectedIds) : new Set();
        store.setState({
          selectedIds: baseSelection,
          editingGroupId: e.shiftKey ? state.editingGroupId : null,
          selectedPointIndex: null,
        });
        mode = 'box';
        return;
      }

      let selected = new Set(state.selectedIds);
      if (e.shiftKey) {
        const all = target.ids.every((id) => selected.has(id));
        for (const id of target.ids) {
          if (all) selected.delete(id);
          else selected.add(id);
        }
      } else if (!selected.has(target.hitId)) {
        selected = new Set(target.ids);
      }
      store.setState({ selectedIds: selected, selectedPointIndex: null });
      if (!selected.has(target.hitId)) {
        mode = 'idle';
        return;
      }
      const ids = withBoundText(state.elements, withFrameChildren(state.elements, selected));
      originals = new Map(state.elements.filter((el) => ids.has(el.id)).map((el) => [el.id, el]));
      const [minX, minY] = getCommonBounds([...originals.values()]);
      dragOrigin = [minX, minY];
      mode = 'drag';
      store.beginTransient();
    },

    onPointerMove(ctx, e) {
      const { store } = ctx;
      if (mode === 'transform') {
        gesture?.move(e);
        return;
      }
      if (mode === 'point') {
        pointGesture?.move(e);
        return;
      }
      let dx = e.scene[0] - start[0];
      let dy = e.scene[1] - start[1];
      if (mode === 'drag') {
        const zoom = store.getState().viewport.zoom;
        if (!moved && Math.hypot(dx, dy) * zoom < DRAG_THRESHOLD) return;
        moved = true;
        const grid = activeGrid(store, e);
        if (grid) {
          dx = snapValue(dragOrigin[0] + dx, grid) - dragOrigin[0];
          dy = snapValue(dragOrigin[1] + dy, grid) - dragOrigin[1];
        }
        const move = moveElements(originals, dx, dy);
        const ids = new Set(originals.keys());
        store.updateTransient(({ elements }) => ({
          elements: refreshFrames(refreshBindings(move(elements), ids), ids),
        }));
        return;
      }
      if (mode === 'box') {
        const box = normalizeBox(start, e.scene);
        const state = store.getState();
        const inside = selectInBox(state, box);
        store.setState({ selectionBox: box, selectedIds: new Set([...baseSelection, ...inside]) });
      }
    },

    onPointerUp(ctx) {
      const { store } = ctx;
      if (mode === 'transform') gesture?.end(true);
      if (mode === 'point') pointGesture?.end();
      gesture = null;
      pointGesture = null;
      if (mode === 'drag') store.endTransient(moved);
      if (mode === 'box') store.setState({ selectionBox: null });
      mode = 'idle';
    },

    cancel(ctx) {
      const { store } = ctx;
      if (mode === 'transform') gesture?.end(false);
      if (mode === 'point') pointGesture?.cancel();
      if (mode === 'drag') store.endTransient(false);
      if (mode === 'box') store.setState({ selectionBox: null });
      gesture = null;
      pointGesture = null;
      mode = 'idle';
    },

    onDoubleClick(ctx, e) {
      const { store } = ctx;
      const state = store.getState();
      const target = getSelectionTarget(state, e.scene, HIT_TOLERANCE / state.viewport.zoom);
      if (!target) {
        store.setState({ editingGroupId: null });
        startTextEditing(store, { at: e.scene });
        return;
      }
      const el = state.elements.find((item) => item.id === target.hitId);
      if (!el) return;
      if (el.type === 'frame' || el.type === 'magicframe') {
        store.setState({ editingFrameId: el.id, selectedIds: new Set([el.id]) });
        return;
      }
      const groups = el.groupIds ?? [];
      const depth = state.editingGroupId ? groups.indexOf(state.editingGroupId) : groups.length;
      if (groups.length > 0 && depth > 0) {
        const nextGroup = groups[depth - 1];
        const inner = depth - 1 > 0 ? groups[depth - 2] : null;
        const members = inner
          ? state.elements.filter((item) => item.groupIds?.includes(inner)).map((item) => item.id)
          : [el.id];
        store.setState({ editingGroupId: nextGroup, selectedIds: new Set(members) });
        return;
      }
      if (el.type === 'richtext') startRichTextEditing(store, el.id);
      else if (el.type === 'text') startTextEditing(store, { elementId: el.id });
      else if (canHoldText(el)) startTextEditing(store, { containerId: el.id });
    },
  };
}
