import type { ReactElement } from 'react';

import { diffDeleteBlock, diffInsertBlock, diffReplaceOriginal } from '../styles.css';

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
      <span style={{ position: 'absolute', left: '-20px', fontWeight: 'bold', color: '#737373' }}>
        {marker}
      </span>
    </div>
  );
}
