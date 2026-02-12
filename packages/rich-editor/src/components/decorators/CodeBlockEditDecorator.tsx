import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import { useCallback } from 'react'

import { $isCodeBlockNode } from '../../nodes/CodeBlockNode'
import { CodeBlockRenderer } from '../renderers/CodeBlockRenderer'
import { RendererWrapper } from '../RendererWrapper'

interface CodeBlockEditDecoratorProps {
  nodeKey: string
  code: string
  language: string
}

export function CodeBlockEditDecorator({
  nodeKey,
  code,
  language,
}: CodeBlockEditDecoratorProps) {
  const [editor] = useLexicalComposerContext()
  const editable = editor.isEditable()

  const handleCodeChange = useCallback(
    (newCode: string) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isCodeBlockNode(node)) {
          node.setCode(newCode)
        }
      })
    },
    [editor, nodeKey],
  )

  return (
    <RendererWrapper
      rendererKey="CodeBlock"
      defaultRenderer={CodeBlockRenderer}
      props={{
        code,
        language,
        editable,
        onCodeChange: editable ? handleCodeChange : undefined,
      }}
    />
  )
}
