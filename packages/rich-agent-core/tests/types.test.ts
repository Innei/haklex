import { describe, expect, it } from 'vitest';

import type {
  AgentOperation,
  DiffEntry,
  NodePosition,
  SelectionSnapshot,
} from '../src/types';

describe('types', () => {
  it('NodePosition discriminated union covers all cases', () => {
    const after: NodePosition = { type: 'after', blockId: 'abc' };
    const before: NodePosition = { type: 'before', blockId: 'def' };
    const root: NodePosition = { type: 'root', index: 0 };

    expect(after.type).toBe('after');
    expect(before.type).toBe('before');
    expect(root.type).toBe('root');
  });

  it('AgentOperation discriminated union covers all cases', () => {
    const insert: AgentOperation = {
      op: 'insert',
      position: { type: 'after', blockId: 'abc' },
      node: {
        type: 'paragraph',
        children: [],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
      },
    };
    const replace: AgentOperation = {
      op: 'replace',
      blockId: 'abc',
      node: {
        type: 'paragraph',
        children: [],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
      },
    };
    const del: AgentOperation = { op: 'delete', blockId: 'abc' };

    expect(insert.op).toBe('insert');
    expect(replace.op).toBe('replace');
    expect(del.op).toBe('delete');
  });

  it('SelectionSnapshot uses blockId addressing', () => {
    const snap: SelectionSnapshot = {
      text: 'hello',
      anchorBlockId: 'blk1',
      anchorOffset: 0,
      focusBlockId: 'blk2',
      focusOffset: 5,
    };
    expect(snap.anchorBlockId).toBe('blk1');
  });

  it('DiffEntry tracks status per operation', () => {
    const entry: DiffEntry = {
      id: 'e1',
      op: { op: 'delete', blockId: 'abc' },
      status: 'pending',
      originalNode: {
        type: 'paragraph',
        children: [],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
      },
    };
    expect(entry.status).toBe('pending');
  });
});
