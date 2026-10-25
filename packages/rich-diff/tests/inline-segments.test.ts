import type { InlineDiffBlock, InlineDiffBlockType } from '@haklex/rich-diff-core';
import { describe, expect, it } from 'vitest';

import { buildInlineSegments } from '../src/inline-segments';

const block = (type: InlineDiffBlockType, id: string): InlineDiffBlock => ({
  type,
  node: { type: 'paragraph', version: 1, id } as any,
});

const shape = (blocks: InlineDiffBlock[], collapse: boolean) =>
  buildInlineSegments(blocks, { collapseUnchanged: collapse, context: 1 }).map((s) =>
    s.kind === 'collapsed' ? `…${s.count}` : `${s.type}:${s.nodes.map((n: any) => n.id).join(',')}`,
  );

describe('buildInlineSegments', () => {
  it('groups consecutive blocks of the same type when not collapsing', () => {
    const blocks = [
      block('equal', 'a'),
      block('equal', 'b'),
      block('delete', 'c'),
      block('insert', 'd'),
      block('insert', 'e'),
      block('equal', 'f'),
    ];
    expect(shape(blocks, false)).toEqual(['equal:a,b', 'delete:c', 'insert:d,e', 'equal:f']);
  });

  it('collapses the middle of a long unchanged run, keeping context on both sides', () => {
    const blocks = [
      block('modify', 'm1'),
      block('equal', 'a'),
      block('equal', 'b'),
      block('equal', 'c'),
      block('equal', 'd'),
      block('equal', 'e'),
      block('modify', 'm2'),
    ];
    expect(shape(blocks, true)).toEqual(['modify:m1', 'equal:a', '…3', 'equal:e', 'modify:m2']);
  });

  it('keeps only the context next to the change for leading and trailing runs', () => {
    const blocks = [
      block('equal', 'a'),
      block('equal', 'b'),
      block('equal', 'c'),
      block('insert', 'x'),
      block('equal', 'd'),
      block('equal', 'e'),
      block('equal', 'f'),
    ];
    expect(shape(blocks, true)).toEqual(['…2', 'equal:c', 'insert:x', 'equal:d', '…2']);
  });

  it('keeps a short unchanged run between changes intact', () => {
    const blocks = [
      block('delete', 'x'),
      block('equal', 'a'),
      block('equal', 'b'),
      block('insert', 'y'),
    ];
    expect(shape(blocks, true)).toEqual(['delete:x', 'equal:a,b', 'insert:y']);
  });

  it('collapses everything when nothing changed', () => {
    const blocks = [block('equal', 'a'), block('equal', 'b')];
    expect(shape(blocks, true)).toEqual(['…2']);
  });

  it('does not collapse when only one block would be hidden', () => {
    const blocks = [
      block('insert', 'x'),
      block('equal', 'a'),
      block('equal', 'b'),
      block('equal', 'c'),
      block('delete', 'y'),
    ];
    expect(shape(blocks, true)).toEqual(['insert:x', 'equal:a,b,c', 'delete:y']);
  });
});
