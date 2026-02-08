import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'
import { useEffect } from 'react'

import type { ImageNodePayload } from '../nodes/ImageNode'
import { $createImageNode } from '../nodes/ImageNode'

export type InsertImagePayload = ImageNodePayload

export const INSERT_IMAGE_COMMAND = createCommand<InsertImagePayload>(
  'INSERT_IMAGE_COMMAND',
)

export function ImagePlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        const imageNode = $createImageNode(payload)
        $insertNodes([imageNode])
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return null
}
