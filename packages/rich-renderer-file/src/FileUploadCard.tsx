import type { useFileUploadEntry } from '@haklex/rich-editor/plugins';
import { ActionBar, ActionButton } from '@haklex/rich-editor-ui';
import { AlertCircle, Paperclip, RefreshCw } from 'lucide-react';

import * as styles from './styles.css';

type FileUploadEntry = NonNullable<ReturnType<typeof useFileUploadEntry>>;

export function FileUploadCard({ entry, name }: { entry: FileUploadEntry; name: string }) {
  const failed = entry.status === 'error';
  return (
    <span
      className={`${styles.card} ${failed ? styles.cardError : ''} ${styles.semanticClassNames.card}`}
    >
      {failed ? (
        <AlertCircle className={`${styles.cardIcon} ${styles.cardErrorText}`} size={20} />
      ) : (
        <Paperclip className={styles.cardIcon} />
      )}
      <span className={`${styles.cardMeta} ${styles.semanticClassNames.cardMeta}`}>
        <span className={`${styles.cardName} ${styles.semanticClassNames.cardName}`}>{name}</span>
        {failed ? (
          <span className={`${styles.cardSub} ${styles.cardErrorText}`}>
            {entry.error ?? 'Upload failed'}
          </span>
        ) : (
          <>
            <span className={`${styles.cardSub} ${styles.semanticClassNames.cardSub}`}>
              <span>Uploading...</span>
              <span>{entry.percent}%</span>
            </span>
            <span className={`${styles.cardProgress} ${styles.semanticClassNames.cardProgress}`}>
              <span
                className={`${styles.cardProgressFill} ${styles.semanticClassNames.cardProgressFill}`}
                style={{ width: `${entry.percent}%` }}
              />
            </span>
          </>
        )}
      </span>
      {failed && (
        <ActionBar>
          <ActionButton onClick={entry.retry}>
            <RefreshCw />
            Retry
          </ActionButton>
          <ActionButton danger onClick={entry.remove}>
            Remove
          </ActionButton>
        </ActionBar>
      )}
    </span>
  );
}
