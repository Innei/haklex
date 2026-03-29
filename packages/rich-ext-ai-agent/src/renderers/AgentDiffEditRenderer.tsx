import { ActionButton } from '@haklex/rich-editor-ui';
import { Check, X } from 'lucide-react';
import type { ReactElement } from 'react';

import {
  diffActions,
  diffDeleteBlock,
  diffInsertBlock,
  diffMarker,
  diffReplaceOriginal,
} from '../styles.css';

interface AgentDiffEditRendererProps {
  diffEntryId: string;
  nodeKey: string;
  onAccept?: (entryId: string) => void;
  onReject?: (entryId: string) => void;
  opType: 'insert' | 'replace' | 'delete';
}

export function AgentDiffEditRenderer({
  diffEntryId,
  opType,
  onAccept,
  onReject,
}: AgentDiffEditRendererProps): ReactElement {
  const className =
    opType === 'insert'
      ? diffInsertBlock
      : opType === 'delete'
        ? diffDeleteBlock
        : diffReplaceOriginal;

  const marker = opType === 'insert' ? '+' : opType === 'delete' ? '-' : '~';

  return (
    <div className={className} style={{ position: 'relative' }}>
      <span className={diffMarker}>{marker}</span>
      <div className={diffActions}>
        <ActionButton title="Accept" onClick={() => onAccept?.(diffEntryId)}>
          <Check size={14} />
        </ActionButton>
        <ActionButton title="Reject" onClick={() => onReject?.(diffEntryId)}>
          <X size={14} />
        </ActionButton>
      </div>
    </div>
  );
}
