import type { ReviewBatch } from '@haklex/rich-agent-core';
import { computeDiff } from '@haklex/rich-diff-core';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import * as css from './diff-review-bubble.css';

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

  const isPending = batch.status === 'pending';
  const statusLabel =
    batch.status === 'accepted'
      ? 'Accepted'
      : batch.status === 'rejected'
        ? 'Rejected'
        : batch.status === 'conflicted'
          ? 'Conflicted'
          : `${batch.entries.length} change${batch.entries.length > 1 ? 's' : ''}`;

  return (
    <div className={css.diffReviewRoot}>
      <div className={css.diffReviewHeader}>
        <span className={css.diffStatusBadge}>{statusLabel}</span>
        {isPending && (
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
