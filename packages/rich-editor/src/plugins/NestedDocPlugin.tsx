import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import type { SerializedEditorState } from 'lexical'
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'
import { useEffect } from 'react'

import { $createNestedDocEditNode } from '../nodes/NestedDocEditNode'

export const INSERT_NESTED_DOC_COMMAND =
  createCommand<SerializedEditorState | void>('INSERT_NESTED_DOC')

export function NestedDocPlugin() {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    return editor.registerCommand(
      INSERT_NESTED_DOC_COMMAND,
      (contentState) => {
        $insertNodes([$createNestedDocEditNode(contentState || undefined)])
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])
  return null
}
