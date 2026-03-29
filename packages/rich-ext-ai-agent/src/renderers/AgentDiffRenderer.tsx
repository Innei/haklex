import type { ReactElement } from 'react';

import { diffDeleteBlock, diffInsertBlock, diffMarker, diffReplaceOriginal } from '../styles.css';

interface AgentDiffRendererProps {
  diffEntryId: string;
  opType: 'insert' | 'replace' | 'delete';
}

export function AgentDiffRenderer({ opType }: AgentDiffRendererProps): ReactElement {
  const className =
    opType === 'insert'
      ? diffInsertBlock
      : opType === 'delete'
        ? diffDeleteBlock
        : diffReplaceOriginal;

  const marker = opType === 'insert' ? '+' : opType === 'delete' ? '-' : '~';

  return (
    <div className={className}>
      <span className={diffMarker}>{marker}</span>
    </div>
  );
}
