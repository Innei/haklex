import type { ToolCallGroupItem, ToolCallItemStatus } from '@haklex/rich-agent-core';
import { Check, ChevronRight, Loader2, X } from 'lucide-react';
import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';

import {
  toolCallChevron,
  toolCallGroupCounter,
  toolCallGroupItems,
  toolCallName,
  toolCallPendingDot,
  toolCallRow,
  toolCallStatusIcon,
} from '../styles.css';
import { ToolCall } from './ToolCall';

interface ToolCallGroupProps {
  defaultExpanded?: boolean;
  id: string;
  items: ToolCallGroupItem[];
}

function deriveGroupStatus(items: ToolCallGroupItem[]): ToolCallItemStatus {
  if (items.some((i) => i.status === 'error')) return 'error';
  if (items.some((i) => i.status === 'running')) return 'running';
  if (items.every((i) => i.status === 'completed')) return 'completed';
  if (items.some((i) => i.status === 'completed' || i.status === 'running')) return 'running';
  return 'pending';
}

function GroupStatusIcon({ status }: { status: ToolCallItemStatus }): ReactElement {
  return (
    <span className={toolCallStatusIcon}>
      {status === 'pending' && <span className={toolCallPendingDot} />}
      {status === 'running' && (
        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
      )}
      {status === 'completed' && <Check size={14} />}
      {status === 'error' && (
        <X size={14} style={{ color: 'var(--hk-color-text-error, #dc2626)' }} />
      )}
    </span>
  );
}

export function ToolCallGroup({
  id: _id,
  items,
  defaultExpanded = true,
}: ToolCallGroupProps): ReactElement {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const groupStatus = useMemo(() => deriveGroupStatus(items), [items]);
  const completedCount = items.filter((i) => i.status === 'completed').length;

  if (items.length === 1) {
    return <ToolCall item={items[0]} />;
  }

  const title =
    groupStatus === 'completed' ? `Executed ${items.length} tasks` : 'Executing parallel tasks';

  return (
    <div>
      <button
        className={toolCallRow}
        data-expandable="true"
        type="button"
        onClick={() => setExpanded(!expanded)}
      >
        <GroupStatusIcon status={groupStatus} />
        <span
          className={toolCallName}
          style={groupStatus === 'running' ? { color: 'var(--hk-color-text)' } : undefined}
        >
          {title}
        </span>
        <span className={toolCallGroupCounter}>
          {completedCount}/{items.length}
        </span>
        <span style={{ flex: 1 }} />
        <ChevronRight className={toolCallChevron} data-expanded={expanded} size={12} />
      </button>

      {expanded && (
        <div className={toolCallGroupItems}>
          {items.map((item) => (
            <ToolCall item={item} key={item.id} />
          ))}
        </div>
      )}
    </div>
  );
}
