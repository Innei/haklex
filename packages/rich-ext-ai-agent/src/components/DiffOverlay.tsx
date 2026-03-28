import type { ReactElement } from 'react';

import { diffReplaceNew, diffReplaceOriginal } from '../styles.css';

interface DiffOverlayProps {
  newText?: string;
  opType: 'insert' | 'replace' | 'delete';
  originalText?: string;
}

export function DiffOverlay({ opType, originalText, newText }: DiffOverlayProps): ReactElement {
  if (opType === 'replace') {
    return (
      <div>
        {originalText && <div className={diffReplaceOriginal}>{originalText}</div>}
        {newText && <div className={diffReplaceNew}>{newText}</div>}
      </div>
    );
  }
  return <></>;
}
