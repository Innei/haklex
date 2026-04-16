import type { CapturedSelection } from '@haklex/rich-agent-core';
import { $captureTextSelection, blockIdState } from '@haklex/rich-editor';
import { $getRoot, $getSelection, $getState, $isNodeSelection, $isRangeSelection } from 'lexical';

export function $captureSelection(): CapturedSelection | null {
  const sel = $getSelection();
  const root = $getRoot();

  if ($isNodeSelection(sel)) {
    const rootChildKeys = new Set(root.getChildrenKeys());
    const blockIds: string[] = [];
    for (const node of sel.getNodes()) {
      if (!rootChildKeys.has(node.getKey())) continue;
      const blockId = $getState(node, blockIdState);
      if (blockId) blockIds.push(blockId);
    }
    return blockIds.length ? { type: 'block', blockIds } : null;
  }

  if ($isRangeSelection(sel) && !sel.isCollapsed()) {
    const textSelection = $captureTextSelection();
    if (!textSelection) return null;

    return {
      type: 'text',
      ...textSelection,
    };
  }

  return null;
}
