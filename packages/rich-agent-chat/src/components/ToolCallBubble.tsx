import {
  Badge,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  Spinner,
  StatusDot,
} from '@haklex/rich-editor-ui';
import type { ReactElement } from 'react';
import { useState } from 'react';

import {
  collapsedBar,
  collapsedBarArrow,
  collapsedBarDot,
  collapsedBarExpanded,
  collapsedBarPanel,
  toolCallJson,
  toolCallRow,
} from '../styles.css';

interface ToolCallItem {
  name: string;
  params: Record<string, unknown>;
  result?: { success: boolean; summary: string };
}

interface ToolCallBubbleProps {
  items: ToolCallItem[];
}

export function ToolCallBubble({ items }: ToolCallBubbleProps): ReactElement {
  const [open, setOpen] = useState(false);

  const total = items.length;
  const allDone = items.every((i) => i.result);
  const failedCount = items.filter((i) => i.result && !i.result.success).length;

  // Single in-progress tool call — no collapsible, just a spinner bar
  if (total === 1 && !items[0].result) {
    return (
      <div className={collapsedBar} style={{ cursor: 'default' }}>
        <Spinner size="sm" />
        <span>
          {items[0].name}
          {Object.keys(items[0].params).length > 0 && (
            <span style={{ opacity: 0.6 }}>
              {' '}
              {String(Object.values(items[0].params)[0] ?? '').slice(0, 40)}
            </span>
          )}
        </span>
      </div>
    );
  }

  // Determine label
  let label: string;
  let dotColor: string;
  if (!allDone) {
    label = `${total} tool calls running...`;
    dotColor = 'transparent';
  } else if (failedCount > 0) {
    label = `${total} tool calls — ${failedCount} failed`;
    dotColor = '#ef4444';
  } else {
    label = `${total} tool call${total > 1 ? 's' : ''} completed`;
    dotColor = '#22c55e';
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger hideChevron>
        <div className={`${collapsedBar}${open ? ` ${collapsedBarExpanded}` : ''}`}>
          {!allDone ? (
            <Spinner size="sm" />
          ) : (
            <span className={collapsedBarArrow}>{open ? '▼' : '▶'}</span>
          )}
          <span>{label}</span>
          {allDone && <span className={collapsedBarDot} style={{ background: dotColor }} />}
        </div>
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <div className={collapsedBarPanel}>
          {items.map((item, i) => {
            const status = !item.result ? 'active' : item.result.success ? 'success' : 'error';
            return (
              <div key={i}>
                <div className={toolCallRow}>
                  {!item.result ? <Spinner size="sm" /> : <StatusDot size="sm" status={status} />}
                  <Badge size="sm" variant="neutral">
                    <code>{item.name}</code>
                  </Badge>
                  {item.result && (
                    <span style={{ color: item.result.success ? '#22c55e' : '#ef4444' }}>
                      {item.result.summary.length > 60
                        ? `${item.result.summary.slice(0, 60)}...`
                        : item.result.summary}
                    </span>
                  )}
                </div>
                {open && (
                  <div style={{ marginLeft: 28, marginTop: 4 }}>
                    <div style={{ color: '#737373', marginBottom: 4, fontSize: 11 }}>
                      Parameters
                    </div>
                    <pre className={toolCallJson}>{JSON.stringify(item.params, null, 2)}</pre>
                    {item.result && (
                      <>
                        <div style={{ color: '#737373', margin: '8px 0 4px', fontSize: 11 }}>
                          Result
                        </div>
                        <pre className={toolCallJson}>{item.result.summary}</pre>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CollapsiblePanel>
    </Collapsible>
  );
}
