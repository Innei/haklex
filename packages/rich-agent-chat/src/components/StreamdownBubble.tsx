import { CodeBlock } from '@haklex/rich-editor-ui';
import { code } from '@streamdown/code';
import type { ComponentProps, ReactElement } from 'react';
import { Streamdown } from 'streamdown';

import { proseAssistant } from '../styles.css';

interface StreamdownBubbleProps {
  content: string;
  isStreaming: boolean;
}

// @streamdown/code types against its own shiki 3 while streamdown resolves the hoisted shiki 4
const plugins = { code } as unknown as ComponentProps<typeof Streamdown>['plugins'];

const components = {
  pre: ({ children, ...props }: any) => {
    const codeChild = children?.props;
    if (codeChild) {
      const lang = codeChild.className?.replace('language-', '') || '';
      const codeText = typeof codeChild.children === 'string' ? codeChild.children : '';
      return <CodeBlock code={codeText} language={lang} />;
    }
    return <pre {...props}>{children}</pre>;
  },
};

export function StreamdownBubble({ content, isStreaming }: StreamdownBubbleProps): ReactElement {
  return (
    <div className={proseAssistant}>
      <Streamdown components={components} isAnimating={isStreaming} plugins={plugins}>
        {content}
      </Streamdown>
    </div>
  );
}
