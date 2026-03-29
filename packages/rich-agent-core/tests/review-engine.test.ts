import { describe, expect, it } from 'vitest';

import { applyOpsToSnapshot, createReviewBatch } from '../src/review-engine';
import type { AgentOperation } from '../src/types';

function makeDoc(children: any[]) {
  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  };
}

function makeParagraph(text: string, blockId: string) {
  return {
    type: 'paragraph',
    children: [{ type: 'text', text, detail: 0, format: 0, mode: 'normal', style: '', version: 1 }],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    textFormat: 0,
    textStyle: '',
    $: { blockId },
  };
}

describe('applyOpsToSnapshot', () => {
  const base = makeDoc([makeParagraph('Hello', 'b1'), makeParagraph('World', 'b2')]);

  it('inserts a node after a block', () => {
    const ops: AgentOperation[] = [
      {
        op: 'insert',
        position: { type: 'after', blockId: 'b1' },
        node: makeParagraph('Middle', 'new1') as any,
      },
    ];
    const result = applyOpsToSnapshot(base, ops);
    const children = (result.root as any).children;
    expect(children).toHaveLength(3);
    expect(children[1].children[0].text).toBe('Middle');
  });

  it('replaces a block', () => {
    const ops: AgentOperation[] = [
      {
        op: 'replace',
        blockId: 'b1',
        node: makeParagraph('Replaced', 'b1') as any,
      },
    ];
    const result = applyOpsToSnapshot(base, ops);
    const children = (result.root as any).children;
    expect(children).toHaveLength(2);
    expect(children[0].children[0].text).toBe('Replaced');
  });

  it('deletes a block', () => {
    const ops: AgentOperation[] = [{ op: 'delete', blockId: 'b1' }];
    const result = applyOpsToSnapshot(base, ops);
    const children = (result.root as any).children;
    expect(children).toHaveLength(1);
    expect(children[0].children[0].text).toBe('World');
  });

  it('handles multiple ops sequentially', () => {
    const ops: AgentOperation[] = [
      { op: 'delete', blockId: 'b1' },
      {
        op: 'insert',
        position: { type: 'after', blockId: 'b2' },
        node: makeParagraph('New', 'b3') as any,
      },
    ];
    const result = applyOpsToSnapshot(base, ops);
    const children = (result.root as any).children;
    expect(children).toHaveLength(2);
    expect(children[0].children[0].text).toBe('World');
    expect(children[1].children[0].text).toBe('New');
  });
});

describe('createReviewBatch', () => {
  const base = makeDoc([makeParagraph('Hello', 'b1'), makeParagraph('World', 'b2')]);

  it('captures an anchor after the insertion point for root prepends', () => {
    const ops: AgentOperation[] = [
      {
        op: 'insert',
        position: { type: 'root', index: 0 },
        node: makeParagraph('Intro', 'b0') as any,
      },
    ];

    const batch = createReviewBatch(ops, base, 3);
    const [entry] = batch.entries;

    expect(entry.anchorBeforeId).toBeUndefined();
    expect(entry.anchorAfterId).toBe('b1');
    expect(entry.targetBlockId).toBe('b1');
    expect(batch.touchedBlockIds).toEqual(['b1']);
  });

  it('captures an anchor before the insertion point for root appends', () => {
    const ops: AgentOperation[] = [
      {
        op: 'insert',
        position: { type: 'root', index: 99 },
        node: makeParagraph('Outro', 'b3') as any,
      },
    ];

    const batch = createReviewBatch(ops, base, 3);
    const [entry] = batch.entries;

    expect(entry.anchorBeforeId).toBe('b2');
    expect(entry.anchorAfterId).toBeUndefined();
    expect(entry.targetBlockId).toBe('b2');
    expect(batch.touchedBlockIds).toEqual(['b2']);
  });

  it('captures both adjacent anchors for between-block inserts', () => {
    const ops: AgentOperation[] = [
      {
        op: 'insert',
        position: { type: 'after', blockId: 'b1' },
        node: makeParagraph('Middle', 'b1-5') as any,
      },
    ];

    const batch = createReviewBatch(ops, base, 3);
    const [entry] = batch.entries;

    expect(entry.anchorBeforeId).toBe('b1');
    expect(entry.anchorAfterId).toBe('b2');
    expect(entry.targetBlockId).toBe('b1');
  });
});
