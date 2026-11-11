import { bumpVersion } from '../model/mutate';
import type { RichTextContent } from '../model/richtext';
import { resolveRichTextHeights } from '../model/richtext-layout';
import type { RichTextElement } from '../scene/types';
import { refreshBindings } from './binding-actions';
import type { WhiteboardStore } from './store';

export function startRichTextEditing(store: WhiteboardStore, id: string): void {
  const el = store.getState().elements.find((item) => item.id === id);
  if (!el || el.type !== 'richtext' || el.isDeleted || el.locked) return;
  store.setState({ editingRichTextId: id, selectedIds: new Set([id]), editingGroupId: null });
}

export function stopRichTextEditing(store: WhiteboardStore): void {
  if (store.getState().editingRichTextId) store.setState({ editingRichTextId: null });
}

export function commitRichTextContent(
  store: WhiteboardStore,
  id: string,
  content: RichTextContent,
): void {
  store.commit(({ elements }) => {
    const next = elements.map((el) =>
      el.id === id && el.type === 'richtext'
        ? bumpVersion(el, { content } as Partial<RichTextElement>)
        : el,
    );
    return { elements: refreshBindings(resolveRichTextHeights(next), new Set([id])) };
  });
}
