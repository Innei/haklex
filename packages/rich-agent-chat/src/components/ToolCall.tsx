import type { ToolCallGroupItem } from '@haklex/rich-agent-core';
import { Check, ChevronRight, Loader2, X } from 'lucide-react';
import type { ReactElement } from 'react';
import { useState } from 'react';

import {
  toolCallChevron,
  toolCallDesc,
  toolCallDetail,
  toolCallDetailContent,
  toolCallDetailInner,
  toolCallDuration,
  toolCallErrorPre,
  toolCallJson,
  toolCallName,
  toolCallPendingDot,
  toolCallResultPre,
  toolCallRow,
  toolCallStatusIcon,
} from '../styles.css';

interface ToolCallProps {
  defaultExpanded?: boolean;
  item: ToolCallGroupItem;
}

function StatusIcon({ status }: { status: ToolCallGroupItem['status'] }): ReactElement {
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

function formatDuration(item: ToolCallGroupItem): string | null {
  if (!item.startedAt || !item.finishedAt) return null;
  const ms = item.finishedAt - item.startedAt;
  return `${ms}ms`;
}

export function ToolCall({ item, defaultExpanded = false }: ToolCallProps): ReactElement {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasContent = Object.keys(item.params).length > 0 || item.result || item.error;
  const duration = formatDuration(item);

  return (
    <div>
      <button
        className={toolCallRow}
        data-expandable={hasContent ? 'true' : 'false'}
        type="button"
        onClick={() => hasContent && setExpanded(!expanded)}
      >
        <StatusIcon status={item.status} />
        <span
          className={toolCallName}
          style={item.status === 'running' ? { color: 'var(--hk-color-text)' } : undefined}
        >
          {item.toolName}
        </span>
        {item.description && <span className={toolCallDesc}>{item.description}</span>}
        <span style={{ flex: 1, minWidth: 0 }} />
        {duration && <span className={toolCallDuration}>{duration}</span>}
        {hasContent && (
          <ChevronRight className={toolCallChevron} data-expanded={expanded} size={12} />
        )}
      </button>

      {hasContent && (
        <div className={toolCallDetail} data-open={expanded}>
          <div className={toolCallDetailInner}>
            <div className={toolCallDetailContent}>
              {Object.keys(item.params).length > 0 && (
                <pre className={toolCallJson}>{JSON.stringify(item.params, null, 2)}</pre>
              )}
              {item.result && <pre className={toolCallResultPre}>{item.result}</pre>}
              {item.error && <pre className={toolCallErrorPre}>{item.error}</pre>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
