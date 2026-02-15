import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'
import { useEffect } from 'react'

import { $createComponentNode } from '../nodes/ComponentNode'

export interface InsertComponentPayload {
  dls: string
  shadow?: boolean
  injectHostStyles?: boolean
}

export const INSERT_COMPONENT_COMMAND =
  createCommand<InsertComponentPayload>('INSERT_COMPONENT')

export function ComponentPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      INSERT_COMPONENT_COMMAND,
      (payload) => {
        const node = $createComponentNode(
          payload.dls,
          payload.shadow,
          payload.injectHostStyles,
        )
        $insertNodes([node])
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
