import type { CodeBlockRendererProps } from '@haklex/rich-editor/renderers';
import { CodeBlock } from '@haklex/rich-editor-ui';
import type { ComponentType } from 'react';

export const CodeBlockRenderer: ComponentType<CodeBlockRendererProps> = ({
  code,
  language,
  showLineNumbers,
}) => {
  return <CodeBlock code={code} language={language} showLineNumbers={showLineNumbers} />;
};
