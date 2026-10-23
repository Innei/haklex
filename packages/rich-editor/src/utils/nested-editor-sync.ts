import type { LexicalEditor, NodeKey } from 'lexical';
import { $addUpdateTag, $getNodeByKey, HISTORY_MERGE_TAG, SKIP_DOM_SELECTION_TAG } from 'lexical';

// A nested editor commits on its own, so the parent sees no change and
// listeners such as autosave or collab miss the edit. Re-dirtying the owner
// node makes the parent re-export it, which reads the nested state live.
// The parent must not restore its own stale selection, or typing loses focus.
export function registerNestedEditorSync(
  parentEditor: LexicalEditor,
  nestedEditor: LexicalEditor,
  ownerKey: NodeKey,
): () => void {
  return nestedEditor.registerUpdateListener(({ dirtyElements, dirtyLeaves }) => {
    if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
    parentEditor.update(() => {
      const owner = $getNodeByKey(ownerKey);
      if (!owner) return;
      $addUpdateTag(HISTORY_MERGE_TAG);
      $addUpdateTag(SKIP_DOM_SELECTION_TAG);
      owner.markDirty();
    });
  });
}
