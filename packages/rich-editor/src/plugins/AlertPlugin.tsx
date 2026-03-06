import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'
import { useEffect } from 'react'

import { $createAlertQuoteEditNode } from '../nodes/AlertQuoteEditNode'
import type { AlertType } from '../nodes/AlertQuoteNode'

export const INSERT_ALERT_COMMAND = createCommand<AlertType>('INSERT_ALERT')

export function AlertPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      INSERT_ALERT_COMMAND,
      (alertType) => {
        $insertNodes([$createAlertQuoteEditNode(alertType)])
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
