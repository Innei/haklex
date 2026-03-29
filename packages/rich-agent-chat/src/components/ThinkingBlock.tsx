import { Collapsible, CollapsiblePanel, CollapsibleTrigger, Spinner } from '@haklex/rich-editor-ui';
import type { ReactElement } from 'react';
import { useState } from 'react';

import {
  collapsedBar,
  collapsedBarArrow,
  collapsedBarExpanded,
  collapsedBarPanel,
  thinkingContent,
} from '../styles.css';

interface ThinkingBlockProps {
  content: string;
  isStreaming: boolean;
}

function summarize(content: string): string {
  const firstClause = content.split(/[\n!.?]/)[0] ?? '';
  const trimmed = firstClause.trim();
  if (trimmed.length <= 60) return trimmed;
  return `${trimmed.slice(0, 57)}...`;
}

export function ThinkingBlock({ content, isStreaming }: ThinkingBlockProps): ReactElement {
  const [open, setOpen] = useState(false);
  const summary = summarize(content);

  if (isStreaming) {
    return (
      <div className={collapsedBar} style={{ cursor: 'default' }}>
        <Spinner size="sm" />
        <span>Thinking about {summary || '...'}</span>
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger hideChevron>
        <div className={`${collapsedBar}${open ? ` ${collapsedBarExpanded}` : ''}`}>
          <span className={collapsedBarArrow}>{open ? '▼' : '▶'}</span>
          <span>Thought about {summary || 'the problem'}</span>
        </div>
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <div className={`${collapsedBarPanel} ${thinkingContent}`}>{content}</div>
      </CollapsiblePanel>
    </Collapsible>
  );
}
