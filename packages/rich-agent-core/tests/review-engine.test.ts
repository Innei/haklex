import { describe, expect, it } from 'vitest';

import { applyOpsToSnapshot } from '../src/review-engine';
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
