import { ActionButton } from '@haklex/rich-editor-ui';
import { Check, X } from 'lucide-react';
import type { ReactElement } from 'react';

import { actionBar } from '../styles.css';

interface AgentActionBarProps {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  pendingCount: number;
}

export function AgentActionBar({
  pendingCount,
  onAcceptAll,
  onRejectAll,
}: AgentActionBarProps): ReactElement {
  if (pendingCount === 0) return <></>;

  return (
    <div className={actionBar}>
      <span>
        {pendingCount} pending change{pendingCount !== 1 ? 's' : ''}
      </span>
      <ActionButton onClick={onAcceptAll}>
        <Check size={14} /> Accept All
      </ActionButton>
      <ActionButton onClick={onRejectAll}>
        <X size={14} /> Reject All
      </ActionButton>
    </div>
  );
}
