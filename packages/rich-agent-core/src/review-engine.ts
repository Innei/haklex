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

export function applyOpsToSnapshot(
  base: SerializedEditorState,
  ops: AgentOperation[],
): SerializedEditorState {
  let children = cloneChildren(base.root as unknown as SerializedLexicalNode);

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
        const insertIdx = pos.type === 'after' ? idx + 1 : idx;
        children.splice(insertIdx, 0, op.node);
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
  return {
    ...state,
    batches: state.batches.map((b) =>
      b.id === batchId
        ? {
            ...b,
            status: 'accepted' as const,
            entries: b.entries.map((e) => ({ ...e, status: 'accepted' as const })),
          }
        : b,
    ),
  };
}

export function rejectBatch(state: ReviewState, batchId: string): ReviewState {
  return {
    ...state,
    batches: state.batches.map((b) =>
      b.id === batchId
        ? {
            ...b,
            status: 'rejected' as const,
            entries: b.entries.map((e) => ({ ...e, status: 'rejected' as const })),
          }
        : b,
    ),
  };
}

export function detectConflicts(state: ReviewState): ReviewState {
  const pendingBatches = state.batches.filter((b) => b.status === 'pending');
  if (pendingBatches.length < 2) return state;

  const seen = new Map<string, string>();
  const conflictedBatchIds = new Set<string>();

  for (const batch of pendingBatches) {
    for (const blockId of batch.touchedBlockIds) {
      const existing = seen.get(blockId);
      if (existing && existing !== batch.id) {
        conflictedBatchIds.add(existing);
        conflictedBatchIds.add(batch.id);
      } else {
        seen.set(blockId, batch.id);
      }
    }
  }

  if (conflictedBatchIds.size === 0) return state;

  return {
    ...state,
    batches: state.batches.map((b) =>
      conflictedBatchIds.has(b.id) && b.status === 'pending'
        ? { ...b, status: 'conflicted' as const }
        : b,
    ),
  };
}
