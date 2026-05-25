import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { $createHeadingNode, $isHeadingNode } from '@lexical/rich-text';
import { $patchStyleText, $setBlocksType } from '@lexical/selection';
import type { ElementNode, LexicalEditor } from 'lexical';
import { $createParagraphNode, $getSelection, $isRangeSelection } from 'lexical';

import type { BlockType } from './constants';

/**
 * Derive the canonical block type from an element node.
 * Exposed so downstream toolbars can recompute block type for any selection target.
 */
export function getBlockType(anchorNode: ElementNode): BlockType {
  if ($isHeadingNode(anchorNode)) {
    const tag = anchorNode.getTag();
    if (tag === 'h1' || tag === 'h2' || tag === 'h3') return tag;
    return 'other';
  }
  if ($isListNode(anchorNode)) {
    const listType = anchorNode.getListType();
    if (listType === 'bullet') return 'bullet';
    if (listType === 'number') return 'number';
    if (listType === 'check') return 'check';
    return 'other';
  }
  const type = anchorNode.getType();
  if (type === 'paragraph') return 'paragraph';
  return 'other';
}

/**
 * Apply a block type (paragraph / heading / list) to the current selection.
 * For list types this delegates to the corresponding INSERT_*_LIST_COMMAND.
 */
export function applyBlockType(editor: LexicalEditor, type: BlockType): void {
  if (type === 'bullet') {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    return;
  }
  if (type === 'number') {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    return;
  }
  if (type === 'check') {
    editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    return;
  }

  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    if (type === 'paragraph' || type === 'other') {
      $setBlocksType(selection, () => $createParagraphNode());
      return;
    }
    if (type === 'h1' || type === 'h2' || type === 'h3') {
      $setBlocksType(selection, () => $createHeadingNode(type));
    }
  });
}

/**
 * Patch the `font-family` style on the current selection.
 * Passing an empty string clears the override and inherits the editor default.
 */
export function applyFontFamily(editor: LexicalEditor, value: string): void {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $patchStyleText(selection, { 'font-family': value || '' });
    }
  });
}
