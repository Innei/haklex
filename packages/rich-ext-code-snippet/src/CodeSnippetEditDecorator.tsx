import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import type { CodeFile } from '@shiro/rich-editor'
import type { NodeKey } from 'lexical'
import { $getNodeByKey } from 'lexical'
import type { FC } from 'react'
import { useCallback } from 'react'

import { CodeSnippetEditRenderer } from './CodeSnippetEditRenderer'
import { $isCodeSnippetNode } from './nodes/CodeSnippetNode'

export interface CodeSnippetEditDecoratorProps {
  nodeKey: NodeKey
  files: CodeFile[]
}

export const CodeSnippetEditDecorator: FC<CodeSnippetEditDecoratorProps> = ({
  nodeKey,
  files,
}) => {
  const [editor] = useLexicalComposerContext()

  const onFilesChange = useCallback(
    (newFiles: CodeFile[]) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isCodeSnippetNode(node)) {
          node.setFiles(newFiles)
        }
      })
    },
    [editor, nodeKey],
  )

  return <CodeSnippetEditRenderer files={files} onFilesChange={onFilesChange} />
}
