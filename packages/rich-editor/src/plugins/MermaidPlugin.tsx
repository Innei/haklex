import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'
import { useEffect } from 'react'

import { $createMermaidNode } from '../nodes/MermaidNode'

export const INSERT_MERMAID_COMMAND = createCommand<string>('INSERT_MERMAID')

export function MermaidPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      INSERT_MERMAID_COMMAND,
      (diagram) => {
        const node = $createMermaidNode(diagram)
        $insertNodes([node])
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
