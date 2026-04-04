import { describe, expect, it } from 'vitest';

import {
  getSanitizedOperationNode,
  stripBlockIdFromSerializedNode,
} from './sanitize-operation-node';

describe('sanitize-operation-node', () => {
  it('strips blockId from serialized nodes recursively', () => {
    const node = stripBlockIdFromSerializedNode({
      type: 'paragraph',
      version: 1,
      $: { blockId: 'p1', other: 'ok' },
      children: [
        {
          type: 'text',
          version: 1,
          text: 'hello',
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          $: { blockId: 'text-1' },
        },
      ],
    });

    expect(node.$).toEqual({ other: 'ok' });
    expect((node.children?.[0] as any).$).toBeUndefined();
  });

  it('sanitizes insert and replace operations before parsing', () => {
    const insertNode = getSanitizedOperationNode({
      op: 'insert',
      position: { type: 'after', blockId: 'p1' },
      node: {
        type: 'paragraph',
        version: 1,
        $: { blockId: 'new-block' },
        children: [],
      } as any,
    });

    const replaceNode = getSanitizedOperationNode({
      op: 'replace',
      blockId: 'p1',
      node: {
        type: 'paragraph',
        version: 1,
        $: { blockId: 'p1' },
        children: [],
      } as any,
    });

    expect((insertNode as any).$).toBeUndefined();
    expect((replaceNode as any).$).toBeUndefined();
  });

  it('returns null for delete operations', () => {
    expect(
      getSanitizedOperationNode({
        op: 'delete',
        blockId: 'p1',
      }),
    ).toBeNull();
  });
});
