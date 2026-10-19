import type { CodeBlockRendererProps } from '@haklex/rich-editor/renderers';
import { useVariant } from '@haklex/rich-editor/static';
import { CodeBlock } from '@haklex/rich-editor-ui';
import type { ComponentType } from 'react';

export const CodeBlockRenderer: ComponentType<CodeBlockRendererProps> = ({
  code,
  language,
  showLineNumbers,
}) => {
  const variant = useVariant();
  const chrome = variant === 'comment' || variant === 'chat' ? 'compact' : 'bar';
  return (
    <CodeBlock chrome={chrome} code={code} language={language} showLineNumbers={showLineNumbers} />
  );
};
