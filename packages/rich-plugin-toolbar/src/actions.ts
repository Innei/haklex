import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
} from '@lexical/rich-text';
import { $patchStyleText, $setBlocksType } from '@lexical/selection';
import type { ElementNode, Klass, LexicalEditor, LexicalNode, RangeSelection } from 'lexical';
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
  if ($isQuoteNode(anchorNode)) return 'quote';
  const type = anchorNode.getType();
  if (type === 'paragraph') return 'paragraph';
  if (type === 'code') return 'code';
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
      return;
    }
    if (type === 'quote') {
      $setBlocksType(selection, () => $createQuoteNode());
      return;
    }
    if (type === 'code') $replaceWithCodeBlock(editor, selection);
  });
}

type CodeBlockKlass = Klass<LexicalNode> & { new (code: string, language: string): LexicalNode };

export function getCodeBlockKlass(editor: LexicalEditor): CodeBlockKlass | null {
  const nodes = (editor as unknown as { _nodes: Map<string, { klass: Klass<LexicalNode> }> })
    ._nodes;
  return (nodes.get('code-block')?.klass as CodeBlockKlass | undefined) ?? null;
}

function $replaceWithCodeBlock(editor: LexicalEditor, selection: RangeSelection) {
  const CodeBlock = getCodeBlockKlass(editor);
  if (!CodeBlock) return;
  const blocks = [
    ...new Set(
      selection
        .getNodes()
        .concat(selection.anchor.getNode())
        .map((node) => node.getTopLevelElement())
        .filter((node): node is ElementNode => node !== null),
    ),
  ];
  if (blocks.length === 0) return;
  const code = blocks.map((block) => block.getTextContent()).join('\n');
  blocks[0].replace(new CodeBlock(code, 'text'));
  for (const block of blocks.slice(1)) block.remove();
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
