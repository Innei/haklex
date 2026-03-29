import { CodeBlock } from '@haklex/rich-editor-ui'
import type { CodeBlockRendererProps } from '@haklex/rich-editor/renderers'
import type { ComponentType } from 'react'

export const CodeBlockRenderer: ComponentType<CodeBlockRendererProps> = ({
  code,
  language,
  showLineNumbers,
}) => {
  return (
    <CodeBlock
      code={code}
      language={language}
      showLineNumbers={showLineNumbers}
    />
  )
}

export default CodeBlockRenderer
