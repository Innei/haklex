import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  PASTE_COMMAND,
} from 'lexical'
import { useEffect } from 'react'

import { matchUrl } from './hooks/useUrlMatcher'
import { $createLinkCardEditNode } from './LinkCardEditNode'
import type { PluginRegistry } from './types'

export interface PasteLinkCardPluginProps {
  pluginRegistry?: PluginRegistry
}

export function PasteLinkCardPlugin({
  pluginRegistry,
}: PasteLinkCardPluginProps) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const text = event.clipboardData?.getData('text/plain')?.trim()
        if (!text) return false

        const info = matchUrl(text, pluginRegistry)
        if (!info) return false

        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return false

        const anchorNode = selection.anchor.getNode()
        const topElement = anchorNode.getTopLevelElement()
        if (!topElement || !$isParagraphNode(topElement)) return false

        const textContent = topElement.getTextContent()
        if (textContent.trim().length > 0) return false

        event.preventDefault()
        const linkCardNode = $createLinkCardEditNode({
          url: text,
        })
        topElement.replace(linkCardNode)
        return true
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor, pluginRegistry])

  return null
}
