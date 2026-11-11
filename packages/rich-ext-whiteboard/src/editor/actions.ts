import { cloneElements } from '../model/clone';
import { refreshFrames } from '../model/frames';
import { bumpVersion } from '../model/mutate';
import { randomId } from '../model/random';
import type { ExcalidrawElement, LinearElement } from '../scene/types';
import { getSelectedElements, withBoundText } from './selection-utils';
import type { WhiteboardStore } from './store';

const DUPLICATE_OFFSET = 10;

function selectedWithText(store: WhiteboardStore): Set<string> {
  const state = store.getState();
  return withBoundText(state.elements, state.selectedIds);
}

function reorder(
  store: WhiteboardStore,
  arrange: (elements: ExcalidrawElement[], ids: ReadonlySet<string>) => ExcalidrawElement[],
): void {
  const ids = selectedWithText(store);
  if (ids.size === 0) return;
  store.commit(({ elements }) => {
    const arranged = arrange([...elements], ids);
    if (arranged.every((el, i) => el === elements[i])) return;
    return {
      elements: arranged.map((el) => (ids.has(el.id) ? bumpVersion(el, { index: null }) : el)),
    };
  });
}

export const bringToFront = (store: WhiteboardStore) =>
  reorder(store, (els, ids) => [
    ...els.filter((el) => !ids.has(el.id)),
    ...els.filter((el) => ids.has(el.id)),
  ]);

export const sendToBack = (store: WhiteboardStore) =>
  reorder(store, (els, ids) => [
    ...els.filter((el) => ids.has(el.id)),
    ...els.filter((el) => !ids.has(el.id)),
  ]);

export const bringForward = (store: WhiteboardStore) =>
  reorder(store, (els, ids) => {
    for (let i = els.length - 2; i >= 0; i--) {
      if (ids.has(els[i].id) && !ids.has(els[i + 1].id))
        [els[i], els[i + 1]] = [els[i + 1], els[i]];
    }
    return els;
  });

export const sendBackward = (store: WhiteboardStore) =>
  reorder(store, (els, ids) => {
    for (let i = 1; i < els.length; i++) {
      if (ids.has(els[i].id) && !ids.has(els[i - 1].id))
        [els[i], els[i - 1]] = [els[i - 1], els[i]];
    }
    return els;
  });

export function groupSelection(store: WhiteboardStore): void {
  const ids = selectedWithText(store);
  if (getSelectedElements(store.getState()).length < 2) return;
  const groupId = randomId();
  store.commit(({ elements }) => ({
    elements: elements.map((el) =>
      ids.has(el.id) ? bumpVersion(el, { groupIds: [...(el.groupIds ?? []), groupId] }) : el,
    ),
  }));
}

export function ungroupSelection(store: WhiteboardStore): void {
  const ids = selectedWithText(store);
  const outer = new Set(
    getSelectedElements(store.getState())
      .map((el) => el.groupIds?.at(-1))
      .filter((g): g is string => !!g),
  );
  if (outer.size === 0) return;
  store.commit(({ elements }) => ({
    elements: elements.map((el) =>
      ids.has(el.id) && el.groupIds?.some((g) => outer.has(g))
        ? bumpVersion(el, { groupIds: el.groupIds.filter((g) => !outer.has(g)) })
        : el,
    ),
  }));
  store.setState({ editingGroupId: null });
}

export function duplicateSelection(store: WhiteboardStore): void {
  const state = store.getState();
  const ids = selectedWithText(store);
  if (ids.size === 0) return;
  const source = state.elements.filter((el) => ids.has(el.id) && !el.isDeleted);
  const { clones, idMap } = cloneElements(source, [DUPLICATE_OFFSET, DUPLICATE_OFFSET]);
  store.commit(({ elements }) => ({
    elements: refreshFrames([...elements, ...clones], new Set(clones.map((el) => el.id))),
  }));
  store.setState({
    selectedIds: new Set(
      [...state.selectedIds].map((id) => idMap.get(id)).filter((id): id is string => !!id),
    ),
  });
}

export function deleteElements(
  elements: readonly ExcalidrawElement[],
  ids: ReadonlySet<string>,
): ExcalidrawElement[] {
  return elements.map((el) => {
    if (ids.has(el.id)) return bumpVersion(el, { isDeleted: true });
    const patch: Record<string, unknown> = {};
    if (el.boundElements?.some((b) => ids.has(b.id))) {
      patch.boundElements = el.boundElements.filter((b) => !ids.has(b.id));
    }
    if (el.type === 'arrow' || el.type === 'line') {
      const linear = el as LinearElement;
      if (linear.startBinding && ids.has(linear.startBinding.elementId)) patch.startBinding = null;
      if (linear.endBinding && ids.has(linear.endBinding.elementId)) patch.endBinding = null;
    }
    if (el.frameId && ids.has(el.frameId)) patch.frameId = null;
    return Object.keys(patch).length > 0
      ? bumpVersion(el, patch as Partial<ExcalidrawElement>)
      : el;
  });
}

export function deleteSelection(store: WhiteboardStore): void {
  const ids = selectedWithText(store);
  if (ids.size === 0) return;
  store.commit(({ elements }) => ({ elements: deleteElements(elements, ids) }));
  store.setState({ selectedIds: new Set(), selectedPointIndex: null });
}

export function selectAll(store: WhiteboardStore): void {
  const state = store.getState();
  store.setState({
    selectedIds: new Set(
      state.elements
        .filter((el) => !el.isDeleted && !el.locked && !(el.type === 'text' && el.containerId))
        .map((el) => el.id),
    ),
    editingGroupId: null,
  });
}
