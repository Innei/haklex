import type { ReactElement } from 'react';

import { errorInline, errorRetryLink } from '../styles.css';

interface ErrorBubbleProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBubble({ message, onRetry }: ErrorBubbleProps): ReactElement {
  return (
    <div className={errorInline}>
      <span>{message}</span>
      {onRetry && (
        <button className={errorRetryLink} type="button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
