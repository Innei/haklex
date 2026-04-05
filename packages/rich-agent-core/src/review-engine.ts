import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';
import { nanoid } from 'nanoid';

import type { ReviewBatch, ReviewEntry, ReviewState } from './review-types';
import type { AgentOperation } from './types';

function getBlockId(node: SerializedLexicalNode): string | undefined {
  return (node as any).$?.blockId as string | undefined;
}

function resolveRootInsertIndex(index: number | undefined, length: number): number {
  const resolved = index ?? length;
  return Math.min(Math.max(resolved, 0), length);
}

function getChildBlockId(children: SerializedLexicalNode[], index: number): string | undefined {
  const child = children[index];
  return child ? getBlockId(child) : undefined;
}

function getInsertAnchors(
  children: SerializedLexicalNode[],
  position: Extract<AgentOperation, { op: 'insert' }>['position'],
): Pick<ReviewEntry, 'anchorAfterId' | 'anchorBeforeId' | 'targetBlockId'> {
  if (position.type === 'root') {
    const index = resolveRootInsertIndex(position.index, children.length);
    const anchorBeforeId = getChildBlockId(children, index - 1);
    const anchorAfterId = getChildBlockId(children, index);
    return {
      targetBlockId: anchorAfterId ?? anchorBeforeId,
      anchorBeforeId,
      anchorAfterId,
    };
  }

  const index = children.findIndex((child) => getBlockId(child) === position.blockId);
  if (index === -1) {
    return {
      targetBlockId: position.blockId,
      anchorBeforeId: position.type === 'after' ? position.blockId : undefined,
      anchorAfterId: position.type === 'before' ? position.blockId : undefined,
    };
  }

  if (position.type === 'after') {
    return {
      targetBlockId: position.blockId,
      anchorBeforeId: getChildBlockId(children, index),
      anchorAfterId: getChildBlockId(children, index + 1),
    };
  }

  return {
    targetBlockId: position.blockId,
    anchorBeforeId: getChildBlockId(children, index - 1),
    anchorAfterId: getChildBlockId(children, index),
  };
}

function cloneChildren(root: SerializedLexicalNode): SerializedLexicalNode[] {
  return [...((root as any).children ?? [])].map((c: any) => ({ ...c }));
}

function snapshotChildren(snapshot: SerializedEditorState): SerializedLexicalNode[] {
  return ((snapshot.root as any).children ?? []) as SerializedLexicalNode[];
}

function snapshotHasBlock(snapshot: SerializedEditorState, blockId: string): boolean {
  return snapshotChildren(snapshot).some((child) => getBlockId(child) === blockId);
}

function canApplyOpToSnapshot(snapshot: SerializedEditorState, op: AgentOperation): boolean {
  if (op.op === 'insert') {
    return op.position.type === 'root' || snapshotHasBlock(snapshot, op.position.blockId);
  }

  return snapshotHasBlock(snapshot, op.blockId);
}

export function applyOpsToSnapshot(
  base: SerializedEditorState,
  ops: AgentOperation[],
): SerializedEditorState {
  let children = cloneChildren(base.root as unknown as SerializedLexicalNode);

  const insertOffset = new Map<string, number>();

  for (const op of ops) {
    if (op.op === 'insert') {
      if (!op.node?.type) continue;
      const pos = op.position;
      if (pos.type === 'root') {
        const idx = resolveRootInsertIndex(pos.index, children.length);
        children.splice(idx, 0, op.node);
      } else {
        const idx = children.findIndex((c) => getBlockId(c) === pos.blockId);
        if (idx === -1) continue;
        const baseIdx = pos.type === 'after' ? idx + 1 : idx;
        const key = `${pos.type}:${pos.blockId}`;
        const offset = insertOffset.get(key) ?? 0;
        children.splice(baseIdx + offset, 0, op.node);
        insertOffset.set(key, offset + 1);
      }
    } else if (op.op === 'replace') {
      if (!op.node?.type) continue;
      const idx = children.findIndex((c) => getBlockId(c) === op.blockId);
      if (idx === -1) continue;
      children[idx] = op.node;
    } else if (op.op === 'delete') {
      children = children.filter((c) => getBlockId(c) !== op.blockId);
    }
  }

  return {
    root: { ...base.root, children } as any,
  };
}

function fingerprint(node: SerializedLexicalNode): string {
  return JSON.stringify(node);
}

function extractTouchedBlockIds(entries: ReviewEntry[]): string[] {
  const ids = new Set<string>();
  for (const entry of entries) {
    if (entry.targetBlockId) ids.add(entry.targetBlockId);
  }
  return [...ids];
}

function updateResolvedBatch(
  state: ReviewState,
  batchId: string,
  status: 'accepted' | 'rejected',
): ReviewState {
  return {
    ...state,
    batches: state.batches.map((batch) =>
      batch.id === batchId
        ? {
            ...batch,
            status,
            entries: batch.entries.map((entry) => ({ ...entry, status })),
          }
        : batch,
    ),
  };
}

function batchEntriesMatch(
  left: ReviewBatch,
  right: ReviewBatch,
  predicate: (left: ReviewEntry, right: ReviewEntry) => boolean,
): boolean {
  for (const leftEntry of left.entries) {
    for (const rightEntry of right.entries) {
      if (predicate(leftEntry, rightEntry)) {
        return true;
      }
    }
  }

  return false;
}

export function createReviewBatch(
  ops: AgentOperation[],
  baseSnapshot: SerializedEditorState,
  baseRevision: number,
): ReviewBatch {
  const previewSnapshot = applyOpsToSnapshot(baseSnapshot, ops);
  const root = baseSnapshot.root as unknown as SerializedLexicalNode & {
    children?: SerializedLexicalNode[];
  };
  const baseChildren = root.children ?? [];
  const blockMap = new Map<string, SerializedLexicalNode>();
  for (const child of baseChildren) {
    const id = getBlockId(child);
    if (id) blockMap.set(id, child);
  }

  const entries: ReviewEntry[] = ops
    .filter((op) => {
      if (op.op === 'insert' || op.op === 'replace') return !!op.node?.type;
      return true;
    })
    .map((op) => {
      let targetBlockId: string | undefined;
      let anchorBeforeId: string | undefined;
      let anchorAfterId: string | undefined;
      let fp = '';
      if (op.op === 'replace' || op.op === 'delete') {
        targetBlockId = op.blockId;
        const orig = blockMap.get(op.blockId);
        if (orig) fp = fingerprint(orig);
      } else if (op.op === 'insert') {
        ({ targetBlockId, anchorBeforeId, anchorAfterId } = getInsertAnchors(
          baseChildren,
          op.position,
        ));
      }
      return {
        id: nanoid(8),
        op,
        targetBlockId,
        anchorBeforeId,
        anchorAfterId,
        originalFingerprint: fp,
        status: 'pending' as const,
      };
    });

  return {
    id: nanoid(8),
    baseRevision,
    baseSnapshot,
    previewSnapshot,
    status: 'pending',
    entries,
    touchedBlockIds: extractTouchedBlockIds(entries),
  };
}

export function acceptBatch(state: ReviewState, batchId: string): ReviewState {
  return updateResolvedBatch(state, batchId, 'accepted');
}

export function rejectBatch(state: ReviewState, batchId: string): ReviewState {
  return updateResolvedBatch(state, batchId, 'rejected');
}

function batchesConflict(left: ReviewBatch, right: ReviewBatch): boolean {
  return batchEntriesMatch(left, right, entriesConflict);
}

function batchesAreOrderDependent(left: ReviewBatch, right: ReviewBatch): boolean {
  return batchEntriesMatch(left, right, entriesAreOrderDependent);
}

function entriesConflict(left: ReviewEntry, right: ReviewEntry): boolean {
  const leftOp = left.op;
  const rightOp = right.op;

  if (leftOp.op === 'insert' && rightOp.op === 'insert') {
    return false;
  }

  if (leftOp.op === 'delete') {
    return conflictsWithDeletedBlock(leftOp.blockId, right);
  }

  if (rightOp.op === 'delete') {
    return conflictsWithDeletedBlock(rightOp.blockId, left);
  }

  if (leftOp.op === 'replace' && rightOp.op === 'replace') {
    return leftOp.blockId === rightOp.blockId;
  }

  return false;
}

function entriesAreOrderDependent(left: ReviewEntry, right: ReviewEntry): boolean {
  if (left.op.op !== 'insert' || right.op.op !== 'insert') {
    return false;
  }

  return left.anchorBeforeId === right.anchorBeforeId && left.anchorAfterId === right.anchorAfterId;
}

function conflictsWithDeletedBlock(deletedBlockId: string, entry: ReviewEntry): boolean {
  const op = entry.op;

  if (op.op === 'delete' || op.op === 'replace') {
    return op.blockId === deletedBlockId;
  }

  return (
    entry.targetBlockId === deletedBlockId ||
    entry.anchorBeforeId === deletedBlockId ||
    entry.anchorAfterId === deletedBlockId
  );
}

function isFinalBatchStatus(status: ReviewBatch['status']): boolean {
  return status === 'accepted' || status === 'rejected';
}

function getInitialBatchStatus(
  batch: ReviewBatch,
  documentRevision: number,
): ReviewBatch['status'] {
  return batch.baseRevision < documentRevision ? 'conflicted' : 'pending';
}

function updateStatusUnlessConflicted(
  statuses: Map<string, ReviewBatch['status']>,
  batchId: string,
  status: ReviewBatch['status'],
): void {
  if (statuses.get(batchId) === 'conflicted') {
    return;
  }

  statuses.set(batchId, status);
}

function rebaseBatch(
  batch: ReviewBatch,
  baseSnapshot: SerializedEditorState,
  baseRevision: number,
): ReviewBatch {
  const ops = batch.entries.map((entry) => entry.op);
  if (!ops.every((op) => canApplyOpToSnapshot(baseSnapshot, op))) {
    return batch;
  }

  const rebased = createReviewBatch(ops, baseSnapshot, baseRevision);
  return {
    ...rebased,
    id: batch.id,
  };
}

export function reconcileReviewBatches(state: ReviewState): ReviewState {
  const nextStatuses = new Map<string, ReviewBatch['status']>();
  const activeBatches = state.batches.filter((batch) => !isFinalBatchStatus(batch.status));
  const currentRevisionBatches = activeBatches.filter(
    (batch) => batch.baseRevision === state.documentRevision,
  );

  for (const batch of activeBatches) {
    nextStatuses.set(batch.id, getInitialBatchStatus(batch, state.documentRevision));
  }

  for (let i = 0; i < currentRevisionBatches.length; i++) {
    for (let j = i + 1; j < currentRevisionBatches.length; j++) {
      const left = currentRevisionBatches[i];
      const right = currentRevisionBatches[j];

      if (batchesConflict(left, right)) {
        nextStatuses.set(left.id, 'conflicted');
        nextStatuses.set(right.id, 'conflicted');
        continue;
      }

      if (batchesAreOrderDependent(left, right)) {
        updateStatusUnlessConflicted(nextStatuses, left.id, 'order_dependent');
        updateStatusUnlessConflicted(nextStatuses, right.id, 'order_dependent');
      }
    }
  }

  return {
    ...state,
    batches: state.batches.map((batch) =>
      isFinalBatchStatus(batch.status)
        ? batch
        : { ...batch, status: nextStatuses.get(batch.id) ?? batch.status },
    ),
  };
}

export function acceptAndRebaseBatch(state: ReviewState, batchId: string): ReviewState {
  const acceptedState = acceptBatch(state, batchId);
  const acceptedBatch = acceptedState.batches.find((batch) => batch.id === batchId);
  if (!acceptedBatch) {
    return state;
  }

  const nextRevision = state.documentRevision + 1;
  const nextState: ReviewState = {
    ...acceptedState,
    documentRevision: nextRevision,
    batches: acceptedState.batches.map((batch) => {
      if (batch.id === batchId || isFinalBatchStatus(batch.status)) {
        return batch;
      }

      return rebaseBatch(batch, acceptedBatch.previewSnapshot, nextRevision);
    }),
  };

  return reconcileReviewBatches(nextState);
}

export function resolveReviewEntry(
  state: ReviewState,
  batchId: string,
  entryId: string,
  resolution: 'accepted' | 'rejected',
): ReviewState {
  return {
    ...state,
    batches: state.batches.map((batch) => {
      if (batch.id !== batchId) return batch;

      const entries = batch.entries.map((entry) =>
        entry.id === entryId ? { ...entry, status: resolution } : entry,
      );

      const allResolved = entries.every((e) => e.status === 'accepted' || e.status === 'rejected');

      let batchStatus = batch.status;
      if (allResolved) {
        const allRejected = entries.every((e) => e.status === 'rejected');
        batchStatus = allRejected ? 'rejected' : 'accepted';
      }

      return { ...batch, entries, status: batchStatus };
    }),
  };
}

export function detectConflicts(state: ReviewState): ReviewState {
  return reconcileReviewBatches(state);
}
