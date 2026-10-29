import { $createCodeNode } from '@lexical/code-core';
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
import { $setBlocksType } from '@lexical/selection';
import type { ElementNode, Klass, LexicalCommand, LexicalEditor, LexicalNode } from 'lexical';
import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
} from 'lexical';

const LIST_COMMANDS: Record<string, LexicalCommand<void>> = {
  bullet: INSERT_UNORDERED_LIST_COMMAND,
  number: INSERT_ORDERED_LIST_COMMAND,
  check: INSERT_CHECK_LIST_COMMAND,
};

const ELEMENT_CREATORS: Record<string, () => ElementNode> = {
  paragraph: () => $createParagraphNode(),
  h1: () => $createHeadingNode('h1'),
  h2: () => $createHeadingNode('h2'),
  h3: () => $createHeadingNode('h3'),
  quote: () => $createQuoteNode(),
};

export function $getBlockTypeId(node: LexicalNode | null): string | null {
  if (!node) return null;
  if ($isParagraphNode(node)) return 'paragraph';
  if ($isHeadingNode(node)) {
    const tag = node.getTag();
    return tag === 'h1' || tag === 'h2' || tag === 'h3' ? tag : null;
  }
  if ($isQuoteNode(node)) return 'quote';
  if ($isListNode(node)) {
    const listType = node.getListType();
    return listType === 'bullet' || listType === 'number' || listType === 'check' ? listType : null;
  }
  return node.getType() === 'code' ? 'code' : null;
}

type CodeBlockKlass = Klass<LexicalNode> & { new (code: string, language: string): LexicalNode };

function getCodeBlockKlass(editor: LexicalEditor): CodeBlockKlass | null {
  const nodes = (editor as unknown as { _nodes: Map<string, { klass: Klass<LexicalNode> }> })
    ._nodes;
  return (nodes.get('code-block')?.klass as CodeBlockKlass | undefined) ?? null;
}

export function turnBlockInto(editor: LexicalEditor, nodeKey: string, type: string): void {
  const listCommand = LIST_COMMANDS[type];
  if (listCommand) {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isElementNode(node)) node.selectStart();
    });
    editor.dispatchCommand(listCommand, undefined);
    return;
  }

  editor.update(() => {
    const node = $getNodeByKey(nodeKey);
    if (!$isElementNode(node)) return;
    if (type === 'code') {
      const CodeBlock = getCodeBlockKlass(editor);
      if (CodeBlock) {
        node.replace(new CodeBlock(node.getTextContent(), 'text'));
        return;
      }
    }
    node.selectStart();
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    const create = type === 'code' ? () => $createCodeNode() : ELEMENT_CREATORS[type];
    if (create) $setBlocksType(selection, create);
  });
}
