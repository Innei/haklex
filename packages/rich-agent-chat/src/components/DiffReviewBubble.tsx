import type { ReviewBatch, ReviewBatchStatus } from '@haklex/rich-agent-core';
import { computeDiff } from '@haklex/rich-diff-core';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import * as css from './diff-review-bubble.css';

const REVIEW_BATCH_STATUS_LABEL: Record<ReviewBatchStatus, string | undefined> = {
  pending: undefined,
  accepted: 'Accepted',
  rejected: 'Rejected',
  order_dependent: 'Order dependent',
  conflicted: 'Conflicted',
};

function extractText(node: any): string {
  if (node.text) return node.text;
  if (node.children) return node.children.map(extractText).join('');
  return '';
}

interface DiffReviewBubbleProps {
  batch: ReviewBatch;
  onAccept?: (batchId: string) => void;
  onReject?: (batchId: string) => void;
}

export function DiffReviewBubble({
  batch,
  onAccept,
  onReject,
}: DiffReviewBubbleProps): ReactElement {
  const hunks = useMemo(
    () => computeDiff(batch.baseSnapshot, batch.previewSnapshot),
    [batch.baseSnapshot, batch.previewSnapshot],
  );

  const isActionable = batch.status !== 'accepted' && batch.status !== 'rejected';
  const n = batch.entries.length;
  const statusLabel = REVIEW_BATCH_STATUS_LABEL[batch.status] ?? `${n} change${n > 1 ? 's' : ''}`;

  return (
    <div className={css.diffReviewRoot}>
      <div className={css.diffReviewHeader}>
        <span className={css.diffStatusBadge}>{statusLabel}</span>
        {isActionable && (
          <div className={css.diffReviewActions}>
            <button
              className={css.diffReviewAcceptBtn}
              type="button"
              onClick={() => onAccept?.(batch.id)}
            >
              Accept
            </button>
            <button
              className={css.diffReviewRejectBtn}
              type="button"
              onClick={() => onReject?.(batch.id)}
            >
              Reject
            </button>
          </div>
        )}
      </div>
      {hunks.map((hunk, i) => {
        if (hunk.type === 'equal') return null;
        const text = hunk.nodes.map(extractText).join('\n');
        if (!text.trim()) return null;
        const rowClass =
          hunk.type === 'insert'
            ? `${css.diffHunkRow} ${css.diffHunkInsert}`
            : `${css.diffHunkRow} ${css.diffHunkDelete}`;
        const prefix = hunk.type === 'insert' ? '+ ' : '- ';
        return (
          <div className={rowClass} key={i}>
            {prefix}
            {text}
          </div>
        );
      })}
    </div>
  );
}
