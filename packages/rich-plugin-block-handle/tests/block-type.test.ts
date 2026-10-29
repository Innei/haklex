import { $createListItemNode, $createListNode, ListItemNode, ListNode } from '@lexical/list';
import { $createHeadingNode, $createQuoteNode, HeadingNode, QuoteNode } from '@lexical/rich-text';
import type { LexicalNode } from 'lexical';
import { $createParagraphNode, $getRoot, createEditor } from 'lexical';
import { describe, expect, it } from 'vitest';

import { $getBlockTypeId } from '../src/blockType';

const editor = createEditor({
  nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
  onError: (error) => {
    throw error;
  },
});

function typeOf(create: () => LexicalNode) {
  let result: string | null = null;
  editor.update(
    () => {
      const node = create();
      $getRoot().clear().append(node);
      result = $getBlockTypeId(node);
    },
    { discrete: true },
  );
  return result;
}

describe('$getBlockTypeId', () => {
  it('maps top-level blocks to registry ids', () => {
    expect(typeOf(() => $createParagraphNode())).toBe('paragraph');
    expect(typeOf(() => $createHeadingNode('h2'))).toBe('h2');
    expect(typeOf(() => $createQuoteNode())).toBe('quote');
    expect(typeOf(() => $createListNode('check').append($createListItemNode()))).toBe('check');
    expect(typeOf(() => $createListNode('number').append($createListItemNode()))).toBe('number');
  });
});
