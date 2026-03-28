import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';
import { nanoid } from 'nanoid';

import { createSnapshot } from './snapshot';
import type { AgentOperation, DiffEntry, DiffState } from './types';

function makeDiffState(entries: DiffEntry[]): DiffState {
  return {
    entries,
    getByBlockId(blockId: string) {
      return entries.find((e) => {
        if (e.op.op === 'replace' || e.op.op === 'delete') return e.op.blockId === blockId;
        if (e.op.op === 'insert' && e.op.position.type !== 'root')
          return e.op.position.blockId === blockId;
        return false;
      });
    },
    getPending() {
      return entries.filter((e) => e.status === 'pending');
    },
  };
}

export function createDiffEngine(
  operations: AgentOperation[],
  editorState: SerializedEditorState,
): DiffState {
  const snap = createSnapshot(editorState);

  const entries: DiffEntry[] = operations.map((op) => {
    let originalNode: SerializedLexicalNode | undefined;
    if (op.op === 'replace' || op.op === 'delete') {
      originalNode = snap.getBlock(op.blockId);
    }
    return {
      id: nanoid(8),
      op,
      status: 'pending' as const,
      originalNode,
    };
  });

  return makeDiffState(entries);
}

function updateEntry(state: DiffState, entryId: string, status: DiffEntry['status']): DiffState {
  const entries = state.entries.map((e) => (e.id === entryId ? { ...e, status } : e));
  return makeDiffState(entries);
}

export function acceptDiff(state: DiffState, entryId: string): DiffState {
  return updateEntry(state, entryId, 'accepted');
}

export function rejectDiff(state: DiffState, entryId: string): DiffState {
  return updateEntry(state, entryId, 'rejected');
}

export function acceptAllDiffs(state: DiffState): DiffState {
  const entries = state.entries.map((e) =>
    e.status === 'pending' ? { ...e, status: 'accepted' as const } : e,
  );
  return makeDiffState(entries);
}

export function rejectAllDiffs(state: DiffState): DiffState {
  const entries = state.entries.map((e) =>
    e.status === 'pending' ? { ...e, status: 'rejected' as const } : e,
  );
  return makeDiffState(entries);
}
