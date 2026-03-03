import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'
import { useEffect } from 'react'

import { $createExcalidrawEditNode } from './ExcalidrawEditNode'

export const INSERT_EXCALIDRAW_COMMAND =
  createCommand<string>('INSERT_EXCALIDRAW')

export function ExcalidrawPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      INSERT_EXCALIDRAW_COMMAND,
      (snapshot) => {
        const node = $createExcalidrawEditNode(snapshot)
        $insertNodes([node])
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
