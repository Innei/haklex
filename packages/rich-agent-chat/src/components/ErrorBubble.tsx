import { ActionButton, Alert } from '@haklex/rich-editor-ui';
import type { ReactElement } from 'react';

interface ErrorBubbleProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBubble({ message, onRetry }: ErrorBubbleProps): ReactElement {
  return (
    <Alert
      variant="error"
      action={
        onRetry ? (
          <ActionButton size="sm" variant="outline" onClick={onRetry}>
            Retry
          </ActionButton>
        ) : undefined
      }
    >
      {message}
    </Alert>
  );
}
