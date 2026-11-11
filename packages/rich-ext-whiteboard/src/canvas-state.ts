import type { WhiteboardStore } from './editor/store';
import { finishTextEditing } from './editor/text-actions';

const EDITOR_SELECTOR = '[data-whiteboard-editor]';

export function isEditorTarget(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest(EDITOR_SELECTOR);
}

export function editorOwnsEscape(store: WhiteboardStore): boolean {
  const state = store.getState();
  return !!(
    state.editingTextId ||
    state.editingRichTextId ||
    state.editingFrameId ||
    store.isTransient() ||
    (state.tool !== 'selection' && !state.toolLocked)
  );
}

export function releaseEscape(store: WhiteboardStore, canvas: Element | null): void {
  const state = store.getState();
  if (state.editingTextId) {
    finishTextEditing(store);
    return;
  }
  if (state.editingRichTextId) {
    store.setState({ editingRichTextId: null });
    return;
  }
  if (state.editingFrameId) {
    store.setState({ editingFrameId: null });
    return;
  }
  canvas?.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
  );
}
