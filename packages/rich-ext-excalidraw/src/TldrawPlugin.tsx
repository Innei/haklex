import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'
import { useEffect } from 'react'

import { $createTldrawNode } from './TldrawNode'

export const INSERT_TLDRAW_COMMAND = createCommand<string>('INSERT_TLDRAW')

export function TldrawPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      INSERT_TLDRAW_COMMAND,
      (snapshot) => {
        const node = $createTldrawNode(snapshot)
        $insertNodes([node])
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
