import {
  Badge,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  Spinner,
  StatusDot,
} from '@haklex/rich-editor-ui';
import type { ReactElement } from 'react';

import { toolCallDetail, toolCallJson, toolCallRow } from '../styles.css';

interface ToolCallBubbleProps {
  name: string;
  params: Record<string, unknown>;
  result?: { success: boolean; summary: string };
}

export function ToolCallBubble({ name, params, result }: ToolCallBubbleProps): ReactElement {
  const status = !result ? 'active' : result.success ? 'success' : 'error';
  const isRunning = !result;

  return (
    <Collapsible>
      <CollapsibleTrigger>
        <div className={toolCallRow}>
          {isRunning ? <Spinner size="sm" /> : <StatusDot size="sm" status={status} />}
          <Badge size="sm" variant="neutral">
            <code>{name}</code>
          </Badge>
          {result && (
            <span style={{ color: result.success ? '#22c55e' : '#ef4444' }}>
              {result.summary.length > 60 ? `${result.summary.slice(0, 60)}...` : result.summary}
            </span>
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <div className={toolCallDetail}>
          <div style={{ color: '#737373', marginBottom: '4px' }}>Parameters</div>
          <pre className={toolCallJson}>{JSON.stringify(params, null, 2)}</pre>
          {result && (
            <>
              <div style={{ color: '#737373', margin: '8px 0 4px' }}>Result</div>
              <pre className={toolCallJson}>{result.summary}</pre>
            </>
          )}
        </div>
      </CollapsiblePanel>
    </Collapsible>
  );
}
