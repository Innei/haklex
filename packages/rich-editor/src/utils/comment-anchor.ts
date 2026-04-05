import type { ElementNode, LexicalEditor, LexicalNode, RangeSelection } from 'lexical';
import {
  $getRoot,
  $getSelection,
  $getState,
  $isElementNode,
  $isLineBreakNode,
  $isRangeSelection,
  $isTextNode,
} from 'lexical';

import { blockIdState } from '../plugins/BlockIdPlugin';

export interface BlockAnchor {
  blockFingerprint: string;
  blockId: string;
  blockType: string;
  mode: 'block';
  snapshotText: string;
}

export interface RangeAnchor {
  blockFingerprint: string;
  blockId: string;
  blockType: string;
  endOffset: number;
  mode: 'range';
  prefix: string;
  quote: string;
  snapshotText: string;
  startOffset: number;
  suffix: string;
}

export type CommentAnchor = BlockAnchor | RangeAnchor;

export type AnchorError =
  | 'no-selection'
  | 'cross-block'
  | 'collapsed'
  | 'no-block-id'
  | 'not-root-block';

export type AnchorResult<T> = { ok: true; anchor: T } | { ok: false; error: AnchorError };

function computeBlockFingerprint(block: ElementNode): string {
  const text = block.getTextContent();
  const input = text.slice(0, 200) + String(text.length);
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + (input.codePointAt(i) ?? 0)) | 0;
  }
  return (hash >>> 0).toString(16);
}

export function $getRootBlock(node: LexicalNode): ElementNode | null {
  const root = $getRoot();
  let current: LexicalNode | null = node;
  while (current) {
    const parent: ElementNode | null = current.getParent();
    if (parent === root && 'getChildren' in current) {
      return current as ElementNode;
    }
    current = parent;
  }
  return null;
}

export function $resolveSelectionPoint(
  selection: RangeSelection,
  which: 'anchor' | 'focus',
): { node: LexicalNode; offset: number } {
  const point = selection[which];
  const node = point.getNode();

  if ($isElementNode(node)) {
    const children = node.getChildren();
    if (point.offset < children.length) {
      return { node: children[point.offset], offset: 0 };
    }
    const last = children.at(-1);
    if (last && $isTextNode(last)) {
      return { node: last, offset: last.getTextContentSize() };
    }
    return { node, offset: 0 };
  }

  return { node, offset: point.offset };
}

export function $getTextOffsetInBlock(
  block: ElementNode,
  targetNode: LexicalNode,
  targetOffset: number,
): number {
  let offset = 0;

  function walk(node: LexicalNode): boolean {
    if (node.is(targetNode)) {
      offset += targetOffset;
      return true;
    }
    if ($isTextNode(node)) {
      offset += node.getTextContentSize();
    } else if ($isLineBreakNode(node)) {
      offset += 1;
    } else if ($isElementNode(node)) {
      for (const child of node.getChildren()) {
        if (walk(child)) return true;
      }
    }
    return false;
  }

  for (const child of block.getChildren()) {
    if (walk(child)) break;
  }

  return offset;
}

function $buildBlockAnchorData(block: ElementNode): AnchorResult<BlockAnchor> {
  const blockId = $getState(block, blockIdState);
  if (!blockId) {
    return { ok: false, error: 'no-block-id' };
  }

  return {
    ok: true,
    anchor: {
      mode: 'block',
      blockId,
      blockType: block.getType(),
      blockFingerprint: computeBlockFingerprint(block),
      snapshotText: block.getTextContent().slice(0, 300),
    },
  };
}

export function buildBlockAnchor(
  editor: LexicalEditor,
  blockKey?: string,
): AnchorResult<BlockAnchor> {
  return editor.read(() => {
    if (blockKey) {
      const node = $getRoot()
        .getChildren()
        .find((c) => c.getKey() === blockKey);
      if (!node || !('getChildren' in node)) {
        return { ok: false, error: 'not-root-block' };
      }
      return $buildBlockAnchorData(node as ElementNode);
    }

    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return { ok: false, error: 'no-selection' };
    }

    const anchorNode = selection.anchor.getNode();
    const block = $getRootBlock(anchorNode);
    if (!block) {
      return { ok: false, error: 'not-root-block' };
    }

    return $buildBlockAnchorData(block);
  });
}

export function buildRangeAnchor(editor: LexicalEditor): AnchorResult<RangeAnchor> {
  return editor.read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return { ok: false, error: 'no-selection' };
    }

    if (selection.isCollapsed()) {
      return { ok: false, error: 'collapsed' };
    }

    const anchorBlock = $getRootBlock(selection.anchor.getNode());
    const focusBlock = $getRootBlock(selection.focus.getNode());

    if (!anchorBlock || !focusBlock) {
      return { ok: false, error: 'not-root-block' };
    }

    if (anchorBlock !== focusBlock) {
      return { ok: false, error: 'cross-block' };
    }

    const block = anchorBlock;
    const blockId = $getState(block, blockIdState);
    if (!blockId) {
      return { ok: false, error: 'no-block-id' };
    }

    const anchorPoint = $resolveSelectionPoint(selection, 'anchor');
    const focusPoint = $resolveSelectionPoint(selection, 'focus');

    let startOffset = $getTextOffsetInBlock(block, anchorPoint.node, anchorPoint.offset);
    let endOffset = $getTextOffsetInBlock(block, focusPoint.node, focusPoint.offset);

    if (startOffset > endOffset) {
      [startOffset, endOffset] = [endOffset, startOffset];
    }

    const text = block.getTextContent();
    const quote = text.slice(startOffset, endOffset);
    const prefix = text.slice(Math.max(0, startOffset - 50), startOffset);
    const suffix = text.slice(endOffset, endOffset + 50);

    return {
      ok: true,
      anchor: {
        mode: 'range',
        blockId,
        blockType: block.getType(),
        blockFingerprint: computeBlockFingerprint(block),
        snapshotText: text.slice(0, 300),
        quote,
        prefix,
        suffix,
        startOffset,
        endOffset,
      },
    };
  });
}
