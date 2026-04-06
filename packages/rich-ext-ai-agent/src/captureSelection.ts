import type { CapturedSelection } from '@haklex/rich-agent-core';
import { $getRootBlock, $getTextOffsetInBlock, $resolveSelectionPoint } from '@haklex/rich-editor';
import { blockIdState } from '@haklex/rich-editor/plugins';
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
    const anchorBlock = $getRootBlock(sel.anchor.getNode());
    const focusBlock = $getRootBlock(sel.focus.getNode());
    if (!anchorBlock || !focusBlock) return null;

    const anchorBlockId = $getState(anchorBlock, blockIdState);
    const focusBlockId = $getState(focusBlock, blockIdState);
    if (!anchorBlockId || !focusBlockId) return null;

    const anchorPoint = $resolveSelectionPoint(sel, 'anchor');
    const focusPoint = $resolveSelectionPoint(sel, 'focus');

    const anchorOffset = $getTextOffsetInBlock(anchorBlock, anchorPoint.node, anchorPoint.offset);
    const focusOffset = $getTextOffsetInBlock(focusBlock, focusPoint.node, focusPoint.offset);

    return {
      type: 'text',
      text: sel.getTextContent(),
      anchorBlockId,
      anchorOffset,
      focusBlockId,
      focusOffset,
    };
  }

  return null;
}
