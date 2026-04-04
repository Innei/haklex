import { describe, expect, it } from 'vitest';

import {
  acceptAndRebaseBatch,
  applyOpsToSnapshot,
  createReviewBatch,
  detectConflicts,
} from '../src/review-engine';
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

  it('keeps replace anchors stable for a following insert-after op', () => {
    const ops: AgentOperation[] = [
      {
        op: 'replace',
        blockId: 'b1',
        node: makeParagraph('Replaced', 'b1') as any,
      },
      {
        op: 'insert',
        position: { type: 'after', blockId: 'b1' },
        node: makeParagraph('Trailing', 'n1') as any,
      },
    ];

    const result = applyOpsToSnapshot(base, ops);
    const children = (result.root as any).children;

    expect(children).toHaveLength(3);
    expect(children[0].children[0].text).toBe('Replaced');
    expect(children[1].children[0].text).toBe('Trailing');
    expect(children[0].$?.blockId).toBe('b1');
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

describe('detectConflicts', () => {
  const base = makeDoc([makeParagraph('Hello', 'b1'), makeParagraph('World', 'b2')]);

  it('marks sequential inserts on the same anchor as order dependent', () => {
    const first = createReviewBatch(
      [
        {
          op: 'insert',
          position: { type: 'after', blockId: 'b1' },
          node: makeParagraph('First insert', 'n1') as any,
        },
      ],
      base,
      0,
    );
    const second = createReviewBatch(
      [
        {
          op: 'insert',
          position: { type: 'after', blockId: 'b1' },
          node: makeParagraph('Second insert', 'n2') as any,
        },
      ],
      base,
      0,
    );

    const result = detectConflicts({
      documentRevision: 0,
      batches: [first, second],
    });

    expect(result.batches[0].status).toBe('order_dependent');
    expect(result.batches[1].status).toBe('order_dependent');
  });

  it('marks delete and anchored insert as conflicted', () => {
    const deleting = createReviewBatch([{ op: 'delete', blockId: 'b1' }], base, 0);
    const inserting = createReviewBatch(
      [
        {
          op: 'insert',
          position: { type: 'after', blockId: 'b1' },
          node: makeParagraph('Inserted after deleted block', 'n1') as any,
        },
      ],
      base,
      0,
    );

    const result = detectConflicts({
      documentRevision: 0,
      batches: [deleting, inserting],
    });

    expect(result.batches[0].status).toBe('conflicted');
    expect(result.batches[1].status).toBe('conflicted');
  });

  it('marks replace and replace on the same block as conflicted', () => {
    const first = createReviewBatch(
      [
        {
          op: 'replace',
          blockId: 'b1',
          node: makeParagraph('First rewrite', 'b1') as any,
        },
      ],
      base,
      0,
    );
    const second = createReviewBatch(
      [
        {
          op: 'replace',
          blockId: 'b1',
          node: makeParagraph('Second rewrite', 'b1') as any,
        },
      ],
      base,
      0,
    );

    const result = detectConflicts({
      documentRevision: 0,
      batches: [first, second],
    });

    expect(result.batches[0].status).toBe('conflicted');
    expect(result.batches[1].status).toBe('conflicted');
  });
});

describe('acceptAndRebaseBatch', () => {
  const base = makeDoc([makeParagraph('Hello', 'b1'), makeParagraph('World', 'b2')]);

  it('increments revision and rebases remaining inserts onto the accepted preview', () => {
    const first = createReviewBatch(
      [
        {
          op: 'insert',
          position: { type: 'after', blockId: 'b1' },
          node: makeParagraph('First insert', 'n1') as any,
        },
      ],
      base,
      0,
    );
    const second = createReviewBatch(
      [
        {
          op: 'insert',
          position: { type: 'after', blockId: 'b1' },
          node: makeParagraph('Second insert', 'n2') as any,
        },
      ],
      base,
      0,
    );

    const result = acceptAndRebaseBatch(
      detectConflicts({
        documentRevision: 0,
        batches: [first, second],
      }),
      first.id,
    );

    expect(result.documentRevision).toBe(1);
    const accepted = result.batches.find((batch) => batch.id === first.id)!;
    const rebased = result.batches.find((batch) => batch.id === second.id)!;

    expect(accepted.status).toBe('accepted');
    expect(rebased.baseRevision).toBe(1);
    expect(rebased.status).toBe('pending');
    expect((rebased.baseSnapshot.root as any).children ?? []).toHaveLength(3);
  });

  it('marks a batch as conflicted when rebase target no longer exists', () => {
    const deleting = createReviewBatch([{ op: 'delete', blockId: 'b1' }], base, 0);
    const inserting = createReviewBatch(
      [
        {
          op: 'insert',
          position: { type: 'after', blockId: 'b1' },
          node: makeParagraph('Inserted after deleted block', 'n1') as any,
        },
      ],
      base,
      0,
    );

    const result = acceptAndRebaseBatch(
      detectConflicts({
        documentRevision: 0,
        batches: [deleting, inserting],
      }),
      deleting.id,
    );

    const rebased = result.batches.find((batch) => batch.id === inserting.id)!;

    expect(result.documentRevision).toBe(1);
    expect(rebased.status).toBe('conflicted');
    expect(rebased.baseRevision).toBe(0);
  });
});
