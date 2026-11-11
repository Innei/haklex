import { getCommonBounds } from '../model/bounds';
import { refreshFrames, withFrameChildren } from '../model/frames';
import {
  bringForward,
  bringToFront,
  deleteSelection,
  duplicateSelection,
  groupSelection,
  selectAll,
  sendBackward,
  sendToBack,
  ungroupSelection,
} from './actions';
import { refreshBindings } from './binding-actions';
import { DEFAULT_GRID_SIZE } from './grid';
import { getEditedLinear, removePoint } from './linear-editor';
import { withBoundText } from './selection-utils';
import type { WhiteboardStore } from './store';
import { nudge } from './transform';
import type { ToolType } from './types';
import { fitToContent, zoomAt } from './viewport';

const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

export const TOOL_KEYS: Record<string, ToolType> = {
  v: 'selection',
  h: 'hand',
  r: 'rectangle',
  d: 'diamond',
  o: 'ellipse',
  a: 'arrow',
  l: 'line',
  p: 'freedraw',
  t: 'text',
  i: 'image',
  f: 'frame',
  e: 'eraser',
};

export const ZOOM_STEP = 1.2;

export interface ShortcutEvent {
  altKey: boolean;
  ctrlKey: boolean;
  key: string;
  metaKey: boolean;
  shiftKey: boolean;
}

export function zoomBy(store: WhiteboardStore, factor: number): void {
  const { viewport, canvasSize } = store.getState();
  const center: [number, number] = [canvasSize.width / 2, canvasSize.height / 2];
  store.setState({ viewport: zoomAt(viewport, center, viewport.zoom * factor) });
}

export function resetZoom(store: WhiteboardStore): void {
  const { viewport, canvasSize } = store.getState();
  store.setState({ viewport: zoomAt(viewport, [canvasSize.width / 2, canvasSize.height / 2], 1) });
}

export function zoomToFit(store: WhiteboardStore): void {
  const { elements, canvasSize } = store.getState();
  const alive = elements.filter((el) => !el.isDeleted);
  if (alive.length === 0 || canvasSize.width === 0) return;
  store.setState({ viewport: fitToContent(getCommonBounds(alive), canvasSize) });
}

function handleModified(store: WhiteboardStore, e: ShortcutEvent): boolean {
  const k = e.key.toLowerCase();
  if (k === 'z') {
    if (e.shiftKey) store.redo();
    else store.undo();
    return true;
  }
  if (k === 'y') {
    store.redo();
    return true;
  }
  if (k === 'g') {
    if (e.shiftKey) ungroupSelection(store);
    else groupSelection(store);
    return true;
  }
  if (k === 'd') {
    duplicateSelection(store);
    return true;
  }
  if (k === 'a') {
    selectAll(store);
    return true;
  }
  if (e.key === ']' || e.key === '}') {
    if (e.shiftKey) bringToFront(store);
    else bringForward(store);
    return true;
  }
  if (e.key === '[' || e.key === '{') {
    if (e.shiftKey) sendToBack(store);
    else sendBackward(store);
    return true;
  }
  if (e.key === '=' || e.key === '+') {
    zoomBy(store, ZOOM_STEP);
    return true;
  }
  if (e.key === '-') {
    zoomBy(store, 1 / ZOOM_STEP);
    return true;
  }
  if (e.key === '0') {
    resetZoom(store);
    return true;
  }
  if (e.key === "'") {
    store.setState({ gridSize: store.getState().gridSize ? null : DEFAULT_GRID_SIZE });
    return true;
  }
  return false;
}

export function handleShortcut(store: WhiteboardStore, e: ShortcutEvent): boolean {
  const state = store.getState();
  if (state.editingTextId) return false;
  if (e.ctrlKey || e.metaKey) return handleModified(store, e);

  const arrow = ARROWS[e.key];
  if (arrow && state.selectedIds.size > 0) {
    const step = e.shiftKey ? 10 : 1;
    const ids = withBoundText(state.elements, withFrameChildren(state.elements, state.selectedIds));
    store.commit(({ elements }) => ({
      elements: refreshFrames(
        refreshBindings(nudge(elements, ids, arrow[0] * step, arrow[1] * step), ids),
        ids,
      ),
    }));
    return true;
  }
  if (e.key === 'Delete' || e.key === 'Backspace') {
    const linear = getEditedLinear(state);
    if (linear && state.selectedPointIndex !== null && linear.points.length > 2) {
      const index = state.selectedPointIndex;
      store.commit(({ elements }) => ({
        elements: elements.map((el) => (el.id === linear.id ? removePoint(linear, index) : el)),
      }));
      store.setState({ selectedPointIndex: null });
      return true;
    }
    deleteSelection(store);
    return true;
  }
  if (e.key === 'Escape') {
    store.setState({
      selectedIds: new Set(),
      editingGroupId: null,
      editingLinearId: null,
      selectedPointIndex: null,
      tool: state.toolLocked ? state.tool : 'selection',
    });
    return true;
  }
  if (e.key === '!' || (e.shiftKey && e.key === '1')) {
    zoomToFit(store);
    return true;
  }
  if (e.key.toLowerCase() === 'q') {
    store.setState({ toolLocked: !state.toolLocked });
    return true;
  }
  const tool = !e.altKey && !e.shiftKey ? TOOL_KEYS[e.key.toLowerCase()] : undefined;
  if (tool) {
    store.setState({ tool, selectedIds: tool === 'selection' ? state.selectedIds : new Set() });
    return true;
  }
  return false;
}
