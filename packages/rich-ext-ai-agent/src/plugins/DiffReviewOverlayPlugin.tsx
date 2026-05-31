import type { AgentStore, ReviewBatch, ReviewEntry } from '@haklex/rich-agent-core';
import { ActionButton } from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getNodeByKey,
  $getRoot,
  $parseSerializedNode,
  type LexicalNode,
  type SerializedLexicalNode,
} from 'lexical';
import { CheckCheck, XCircle } from 'lucide-react';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { $createAgentDiffEditNode, AgentDiffEditNode } from '../nodes/AgentDiffEditNode';
import { $isAgentDiffNode } from '../nodes/AgentDiffNode';
import type { AgentDiffNodePayload } from '../nodes/diff-node-state';
import {
  diffGlobalActions,
  diffGlobalBar,
  diffGlobalCount,
  diffGlobalMeta,
  diffGlobalTitle,
} from '../styles.css';
import { setAgentDiffReviewController } from './diff-node-controller';
import { stripBlockIdFromSerializedNode } from './sanitize-operation-node';

function getBlockId(node: SerializedLexicalNode | undefined | null): string | undefined {
  return (node as any)?.$?.blockId as string | undefined;
}

function getSnapshotChildren(batch: ReviewBatch): SerializedLexicalNode[] {
  return ((batch.baseSnapshot.root as any).children ?? []) as SerializedLexicalNode[];
}

function getOriginalNode(batch: ReviewBatch, blockId: string | undefined) {
  if (!blockId) return null;
  return getSnapshotChildren(batch).find((child) => getBlockId(child) === blockId) ?? null;
}

function getNodeBlockId(node: LexicalNode): string | undefined {
  return getBlockId(node.exportJSON() as SerializedLexicalNode);
}

function $findBlockByBlockId(blockId: string): LexicalNode | null {
  const root = $getRoot();
  return root.getChildren().find((child) => getNodeBlockId(child) === blockId) ?? null;
}

function getPayload(batch: ReviewBatch, entry: ReviewEntry): AgentDiffNodePayload {
  if (entry.op.op === 'insert') {
    return {
      batchId: batch.id,
      diffEntryId: entry.id,
      opType: 'insert',
      originalNode: null,
      proposedNode: stripBlockIdFromSerializedNode(entry.op.node),
    };
  }

  if (entry.op.op === 'replace') {
    return {
      batchId: batch.id,
      diffEntryId: entry.id,
      opType: 'replace',
      originalNode: getOriginalNode(batch, entry.op.blockId),
      proposedNode: entry.op.node,
    };
  }

  return {
    batchId: batch.id,
    diffEntryId: entry.id,
    opType: 'delete',
    originalNode: getOriginalNode(batch, entry.op.blockId),
    proposedNode: null,
  };
}

function $parseMaterializedNode(
  payload: AgentDiffNodePayload,
  side: 'accepted' | 'rejected',
): LexicalNode | null {
  if (side === 'accepted') {
    if (payload.opType === 'delete') return null;
    if (!payload.proposedNode) return null;

    const nextNode =
      payload.opType === 'insert'
        ? stripBlockIdFromSerializedNode(payload.proposedNode)
        : payload.proposedNode;
    return $parseSerializedNode(nextNode);
  }

  if (payload.opType === 'insert') return null;
  return payload.originalNode ? $parseSerializedNode(payload.originalNode) : null;
}

function $resolveDiffNode(node: LexicalNode, side: 'accepted' | 'rejected') {
  if (!$isAgentDiffNode(node)) return;

  const materialized = $parseMaterializedNode(node.getPayload(), side);
  if (materialized) {
    node.replace(materialized);
    return;
  }

  node.remove();
}

function isVisibleBatch(batch: ReviewBatch): boolean {
  return batch.status === 'pending' || batch.status === 'order_dependent';
}

function getPendingReviewSummary(store: AgentStore) {
  const reviewState = store.getState().reviewState;
  const batches = reviewState?.batches.filter(isVisibleBatch) ?? [];

  return {
    batchIds: batches.map((batch) => batch.id),
    pendingCount: batches.reduce(
      (total, batch) => total + batch.entries.filter((entry) => entry.status === 'pending').length,
      0,
    ),
  };
}

function getDocumentDiffSummary() {
  const batchIds = new Set<string>();
  let pendingCount = 0;

  for (const child of $getRoot().getChildren()) {
    if (!$isAgentDiffNode(child)) continue;
    batchIds.add(child.getBatchId());
    pendingCount += 1;
  }

  return {
    batchIds: [...batchIds],
    pendingCount,
  };
}

function getBatchResolution(batch: ReviewBatch): 'accepted' | 'rejected' | null {
  if (batch.status === 'accepted') return 'accepted';
  if (batch.status === 'rejected') return 'rejected';
  return null;
}

function getEntryResolution(entry: ReviewEntry): 'accepted' | 'rejected' | null {
  if (entry.status === 'accepted') return 'accepted';
  if (entry.status === 'rejected') return 'rejected';
  return null;
}

function insertAfterAnchor(
  insertedByAnchor: Map<string, LexicalNode>,
  anchorKey: string,
  anchor: LexicalNode,
  node: LexicalNode,
) {
  const previous = insertedByAnchor.get(anchorKey);
  if (previous?.isAttached()) {
    previous.insertAfter(node);
  } else {
    anchor.insertAfter(node);
  }
  insertedByAnchor.set(anchorKey, node);
}

function insertBeforeAnchor(
  insertedByAnchor: Map<string, LexicalNode>,
  anchorKey: string,
  anchor: LexicalNode,
  node: LexicalNode,
) {
  const previous = insertedByAnchor.get(anchorKey);
  if (previous?.isAttached()) {
    previous.insertAfter(node);
  } else {
    anchor.insertBefore(node);
  }
  insertedByAnchor.set(anchorKey, node);
}

export function DiffReviewOverlayPlugin({ store }: { store: AgentStore }): ReactElement | null {
  const [editor] = useLexicalComposerContext();
  const [pendingSummary, setPendingSummary] = useState(() => getPendingReviewSummary(store));

  const refreshPendingSummary = useCallback(() => {
    editor.getEditorState().read(() => {
      const documentSummary = getDocumentDiffSummary();
      setPendingSummary(
        documentSummary.pendingCount > 0 ? documentSummary : getPendingReviewSummary(store),
      );
    });
  }, [editor, store]);

  const reconcileDiffNodes = useCallback(() => {
    const reviewState = store.getState().reviewState;
    if (!reviewState || !editor.hasNodes([AgentDiffEditNode])) return;

    editor.update(() => {
      const root = $getRoot();
      const batchesById = new Map(reviewState.batches.map((batch) => [batch.id, batch]));
      const entriesById = new Map<string, { batch: ReviewBatch; entry: ReviewEntry }>();
      const activeNodeIds = new Set<string>();

      for (const batch of reviewState.batches) {
        for (const entry of batch.entries) {
          entriesById.set(`${batch.id}:${entry.id}`, { batch, entry });
        }
      }

      for (const child of root.getChildren()) {
        if (!$isAgentDiffNode(child)) continue;

        const nodeBatchId = child.getBatchId();
        const nodeEntryId = child.getDiffEntryId();
        const batch = batchesById.get(nodeBatchId);
        const matched = entriesById.get(`${nodeBatchId}:${nodeEntryId}`);

        if (!batch || !matched) {
          $resolveDiffNode(child, 'rejected');
          continue;
        }

        const resolution = getEntryResolution(matched.entry) ?? getBatchResolution(batch);
        if (resolution) {
          $resolveDiffNode(child, resolution);
          continue;
        }

        activeNodeIds.add(`${nodeBatchId}:${nodeEntryId}`);
      }

      // blockId → live LexicalNode. Initialized AFTER resolving stale diff
      // nodes so we don't index orphans. Updated as we mutate so a diff node
      // that replaced an original block stays addressable by the old blockId,
      // letting chained inserts (e.g. replace `X` then N×insert after `X`)
      // still anchor instead of silently dropping.
      const blockIndex = new Map<string, LexicalNode>();
      for (const child of root.getChildren()) {
        const id = getNodeBlockId(child);
        if (id) blockIndex.set(id, child);
      }

      const resolveAnchor = (blockId: string): LexicalNode | null => {
        const cached = blockIndex.get(blockId);
        if (cached?.isAttached()) return cached;
        const found = $findBlockByBlockId(blockId);
        if (found) blockIndex.set(blockId, found);
        return found;
      };

      const insertedByAnchor = new Map<string, LexicalNode>();

      for (const batch of reviewState.batches) {
        if (!isVisibleBatch(batch)) continue;

        for (const entry of batch.entries) {
          if (entry.status !== 'pending') continue;
          const entryKey = `${batch.id}:${entry.id}`;
          if (activeNodeIds.has(entryKey)) continue;

          const diffNode = $createAgentDiffEditNode(getPayload(batch, entry));

          if (entry.op.op === 'replace' || entry.op.op === 'delete') {
            const target = resolveAnchor(entry.op.blockId);
            if (!target) continue;
            target.replace(diffNode);
            blockIndex.set(entry.op.blockId, diffNode);
            continue;
          }

          if (entry.anchorBeforeId) {
            const anchor = resolveAnchor(entry.anchorBeforeId);
            if (anchor) {
              insertAfterAnchor(
                insertedByAnchor,
                `after:${entry.anchorBeforeId}`,
                anchor,
                diffNode,
              );
              continue;
            }
          }

          if (entry.anchorAfterId) {
            const anchor = resolveAnchor(entry.anchorAfterId);
            if (anchor) {
              insertBeforeAnchor(
                insertedByAnchor,
                `before:${entry.anchorAfterId}`,
                anchor,
                diffNode,
              );
              continue;
            }
          }

          if (entry.op.position.type === 'root') {
            const idx = entry.op.position.index ?? root.getChildrenSize();
            const children = root.getChildren();
            if (idx >= children.length) root.append(diffNode);
            else children[idx].insertBefore(diffNode);
          }
        }
      }
    });
  }, [editor, store]);

  useEffect(() => {
    reconcileDiffNodes();
    refreshPendingSummary();

    return store.subscribe(() => {
      reconcileDiffNodes();
      refreshPendingSummary();
    });
  }, [reconcileDiffNodes, refreshPendingSummary, store]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const documentSummary = getDocumentDiffSummary();
        setPendingSummary(
          documentSummary.pendingCount > 0 ? documentSummary : getPendingReviewSummary(store),
        );
      });
    });
  }, [editor, store]);

  const resolveAllDiffNodes = useCallback(
    (side: 'accepted' | 'rejected') => {
      const batchIds = new Set<string>();

      editor.update(() => {
        for (const child of $getRoot().getChildren()) {
          if (!$isAgentDiffNode(child)) continue;
          batchIds.add(child.getBatchId());
          $resolveDiffNode(child, side);
        }
      });

      const targetBatchIds = batchIds.size > 0 ? [...batchIds] : pendingSummary.batchIds;
      for (const batchId of targetBatchIds) {
        if (side === 'accepted') {
          store.getState().acceptReviewBatch(batchId);
        } else {
          store.getState().rejectReviewBatch(batchId);
        }
      }
    },
    [editor, pendingSummary.batchIds, store],
  );

  const actions = useMemo(
    () => ({
      acceptNode: (nodeKey: string, batchId: string, entryId: string) => {
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if (node) $resolveDiffNode(node, 'accepted');
        });
        store.getState().acceptReviewEntry(batchId, entryId);
      },
      rejectNode: (nodeKey: string, batchId: string, entryId: string) => {
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if (node) $resolveDiffNode(node, 'rejected');
        });
        store.getState().rejectReviewEntry(batchId, entryId);
      },
    }),
    [editor, store],
  );

  useEffect(() => {
    setAgentDiffReviewController(editor, actions);
    return () => setAgentDiffReviewController(editor, null);
  }, [actions, editor]);

  if (pendingSummary.pendingCount === 0) return null;

  return (
    <div className={diffGlobalBar}>
      <div className={diffGlobalMeta}>
        <span className={diffGlobalTitle}>AI review</span>
        <span className={diffGlobalCount}>
          {pendingSummary.pendingCount} pending change
          {pendingSummary.pendingCount === 1 ? '' : 's'}
        </span>
      </div>
      <div className={diffGlobalActions}>
        <ActionButton
          danger
          title="Reject all changes"
          variant="outline"
          onClick={() => resolveAllDiffNodes('rejected')}
        >
          <XCircle size={14} />
          Reject all
        </ActionButton>
        <ActionButton
          title="Accept all changes"
          variant="solid"
          onClick={() => resolveAllDiffNodes('accepted')}
        >
          <CheckCheck size={14} />
          Accept all
        </ActionButton>
      </div>
    </div>
  );
}
