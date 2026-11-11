import { elementsInBox, hitTestElement } from '../model/bounds';
import type { Bounds, Point } from '../model/geometry';
import type { ExcalidrawElement } from '../scene/types';
import type { EditorState } from './types';

export interface SelectionTarget {
  hitId: string;
  ids: string[];
}

const isAlive = (el: ExcalidrawElement) => !el.isDeleted;

export function isSelectable(el: ExcalidrawElement): boolean {
  return !el.isDeleted && !el.locked;
}

export function getContainerId(el: ExcalidrawElement): string | null {
  return el.type === 'text' ? (el.containerId ?? null) : null;
}

export function groupMembers(elements: readonly ExcalidrawElement[], groupId: string): string[] {
  return elements.filter((el) => isAlive(el) && el.groupIds?.includes(groupId)).map((el) => el.id);
}

export function selectionForElement(state: EditorState, el: ExcalidrawElement): string[] {
  const groups = el.groupIds ?? [];
  if (groups.length === 0) return [el.id];
  const editing = state.editingGroupId;
  const depth = editing ? groups.indexOf(editing) : -1;
  if (depth === 0) return [el.id];
  const target = depth > 0 ? groups[depth - 1] : groups.at(-1)!;
  return groupMembers(state.elements, target);
}

export function getHitElement(
  elements: readonly ExcalidrawElement[],
  p: Point,
  tolerance: number,
): ExcalidrawElement | null {
  const byId = new Map(elements.map((el) => [el.id, el]));
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (!isSelectable(el)) continue;
    if (!hitTestElement(el, p, tolerance)) continue;
    const containerId = getContainerId(el);
    const container = containerId ? byId.get(containerId) : undefined;
    if (container && isSelectable(container)) return container;
    return el;
  }
  return null;
}

export function getSelectionTarget(
  state: EditorState,
  p: Point,
  tolerance: number,
): SelectionTarget | null {
  const hit = getHitElement(state.elements, p, tolerance);
  if (!hit) return null;
  return { hitId: hit.id, ids: selectionForElement(state, hit) };
}

export function withBoundText(
  elements: readonly ExcalidrawElement[],
  ids: ReadonlySet<string>,
): Set<string> {
  const out = new Set(ids);
  for (const el of elements) {
    const containerId = getContainerId(el);
    if (containerId && ids.has(containerId) && isAlive(el)) out.add(el.id);
  }
  return out;
}

export function selectInBox(state: EditorState, box: Bounds): Set<string> {
  const candidates = state.elements.filter((el) => isSelectable(el) && !getContainerId(el));
  const inside = new Set(elementsInBox(candidates, box).map((el) => el.id));
  const result = new Set<string>();
  for (const id of inside) {
    const el = state.elements.find((e) => e.id === id)!;
    const ids = selectionForElement(state, el);
    if (ids.every((member) => inside.has(member))) for (const member of ids) result.add(member);
  }
  return result;
}

export function getSelectedElements(state: EditorState): ExcalidrawElement[] {
  return state.elements.filter((el) => isAlive(el) && state.selectedIds.has(el.id));
}
