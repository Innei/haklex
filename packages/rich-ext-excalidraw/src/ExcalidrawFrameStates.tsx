import { PenLine, TriangleAlert } from 'lucide-react';
import type { FC } from 'react';

import * as css from './styles.css';

export const ExcalidrawPlaceholderState: FC<{ elementCount?: number }> = ({ elementCount }) => {
  const label = elementCount ? `Whiteboard · ${elementCount} elements` : 'Whiteboard';
  return (
    <div aria-label={label} className={css.excalidrawStateLayer}>
      <PenLine aria-hidden className={css.excalidrawStateIcon} />
      <span>{label}</span>
    </div>
  );
};

export const ExcalidrawLoadingState: FC = () => (
  <div aria-busy className={css.excalidrawLoading}>
    <span>Loading whiteboard…</span>
  </div>
);

export const ExcalidrawEmptyState: FC = () => (
  <div className={css.excalidrawEmpty}>
    <span>Empty whiteboard</span>
  </div>
);

export const ExcalidrawErrorState: FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className={css.excalidrawError} role="alert">
    <TriangleAlert aria-hidden className={css.excalidrawErrorIcon} />
    <span>{message}</span>
    {onRetry && (
      <button className={css.excalidrawRetry} type="button" onClick={onRetry}>
        Retry
      </button>
    )}
  </div>
);
