import { PenLine, TriangleAlert } from 'lucide-react';
import type { FC } from 'react';

import * as css from './styles.css';

export const WhiteboardPlaceholderState: FC<{ elementCount?: number }> = ({ elementCount }) => {
  const label = elementCount ? `Whiteboard · ${elementCount} elements` : 'Whiteboard';
  return (
    <div aria-label={label} className={css.whiteboardStateLayer}>
      <PenLine aria-hidden className={css.whiteboardStateIcon} />
      <span>{label}</span>
    </div>
  );
};

export const WhiteboardLoadingState: FC = () => (
  <div aria-busy className={css.whiteboardLoading}>
    <span>Loading whiteboard…</span>
  </div>
);

export const WhiteboardEmptyState: FC = () => (
  <div className={css.whiteboardEmpty}>
    <span>Empty whiteboard</span>
  </div>
);

export const WhiteboardErrorState: FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className={css.whiteboardError} role="alert">
    <TriangleAlert aria-hidden className={css.whiteboardErrorIcon} />
    <span>{message}</span>
    {onRetry && (
      <button className={css.whiteboardRetry} type="button" onClick={onRetry}>
        Retry
      </button>
    )}
  </div>
);
