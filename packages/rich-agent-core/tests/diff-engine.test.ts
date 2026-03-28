import { describe, expect, it } from 'vitest';

import {
  acceptAllDiffs,
  acceptDiff,
  createDiffEngine,
  rejectAllDiffs,
  rejectDiff,
} from '../src/diff-engine';
import type { AgentOperation } from '../src/types';

const paragraph = (text: string, blockId?: string) => ({
  type: 'paragraph',
  children: [{ type: 'text', text, detail: 0, format: 0, mode: 'normal', style: '', version: 1 }],
  direction: null,
  format: '',
  indent: 0,
  version: 1,
  textFormat: 0,
  textStyle: '',
  ...(blockId ? { $: { blockId } } : {}),
});

const editorState = {
  root: {
    type: 'root',
    children: [paragraph('Hello', 'a1'), paragraph('World', 'b2')],
    direction: null,
    format: '',
    indent: 0,
    version: 1,
  },
};

describe('createDiffEngine', () => {
  it('creates DiffState from operations', () => {
    const ops: AgentOperation[] = [
      { op: 'insert', position: { type: 'after', blockId: 'a1' }, node: paragraph('New') as any },
      { op: 'replace', blockId: 'b2', node: paragraph('Updated') as any },
      { op: 'delete', blockId: 'a1' },
    ];
    const diff = createDiffEngine(ops, editorState as any);

    expect(diff.entries).toHaveLength(3);
    expect(diff.entries[0].status).toBe('pending');
    expect(diff.entries[1].op.op).toBe('replace');
    expect(diff.entries[1].originalNode).toBeDefined();
    expect(diff.entries[2].originalNode).toBeDefined();
  });

  it('getByBlockId finds entries', () => {
    const ops: AgentOperation[] = [
      { op: 'replace', blockId: 'b2', node: paragraph('Updated') as any },
    ];
    const diff = createDiffEngine(ops, editorState as any);
    expect(diff.getByBlockId('b2')).toBeDefined();
    expect(diff.getByBlockId('nonexistent')).toBeUndefined();
  });

  it('getPending returns only pending entries', () => {
    const ops: AgentOperation[] = [
      { op: 'delete', blockId: 'a1' },
      { op: 'delete', blockId: 'b2' },
    ];
    const diff = createDiffEngine(ops, editorState as any);
    expect(diff.getPending()).toHaveLength(2);
  });
});

describe('acceptDiff / rejectDiff', () => {
  it('acceptDiff marks entry as accepted', () => {
    const ops: AgentOperation[] = [{ op: 'delete', blockId: 'a1' }];
    const diff = createDiffEngine(ops, editorState as any);
    const entryId = diff.entries[0].id;

    const updated = acceptDiff(diff, entryId);
    expect(updated.entries[0].status).toBe('accepted');
    expect(updated.getPending()).toHaveLength(0);
  });

  it('rejectDiff marks entry as rejected', () => {
    const ops: AgentOperation[] = [{ op: 'delete', blockId: 'a1' }];
    const diff = createDiffEngine(ops, editorState as any);
    const entryId = diff.entries[0].id;

    const updated = rejectDiff(diff, entryId);
    expect(updated.entries[0].status).toBe('rejected');
  });

  it('acceptAllDiffs marks all as accepted', () => {
    const ops: AgentOperation[] = [
      { op: 'delete', blockId: 'a1' },
      { op: 'delete', blockId: 'b2' },
    ];
    const diff = createDiffEngine(ops, editorState as any);
    const updated = acceptAllDiffs(diff);
    expect(updated.getPending()).toHaveLength(0);
    expect(updated.entries.every((e) => e.status === 'accepted')).toBe(true);
  });

  it('rejectAllDiffs marks all as rejected', () => {
    const ops: AgentOperation[] = [
      { op: 'delete', blockId: 'a1' },
      { op: 'delete', blockId: 'b2' },
    ];
    const diff = createDiffEngine(ops, editorState as any);
    const updated = rejectAllDiffs(diff);
    expect(updated.entries.every((e) => e.status === 'rejected')).toBe(true);
  });
});
