import { refreshFrames } from '../../model/frames';
import type { ExcalidrawElement } from '../../scene/types';
import type { WhiteboardStore } from '../store';

export function replaceElement(store: WhiteboardStore, next: ExcalidrawElement): void {
  store.updateTransient(({ elements }) => ({
    elements: elements.map((el) => (el.id === next.id ? next : el)),
  }));
}

export function appendElement(store: WhiteboardStore, el: ExcalidrawElement): void {
  store.updateTransient(({ elements }) => ({ elements: [...elements, el] }));
}

export function finishCreation(store: WhiteboardStore, id: string, select = true): void {
  store.updateTransient(({ elements }) => ({ elements: refreshFrames(elements, new Set([id])) }));
  store.endTransient(true);
  const state = store.getState();
  store.setState({
    selectedIds: select ? new Set([id]) : state.selectedIds,
    tool: state.toolLocked ? state.tool : 'selection',
  });
}

export function cancelCreation(store: WhiteboardStore): void {
  store.endTransient(false);
}

export function findElement(store: WhiteboardStore, id: string): ExcalidrawElement | undefined {
  return store.getState().elements.find((el) => el.id === id);
}
