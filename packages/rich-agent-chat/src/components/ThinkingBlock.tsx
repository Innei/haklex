import type { ReactElement } from 'react';

import { thinkingBlock } from '../styles.css';

interface ThinkingBlockProps {
  content: string;
  isStreaming: boolean;
}

export function ThinkingBlock({ content, isStreaming }: ThinkingBlockProps): ReactElement {
  return (
    <div className={thinkingBlock}>
      {content}
      {isStreaming && <span style={{ opacity: 0.5 }}> ...</span>}
    </div>
  );
}
