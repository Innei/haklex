import { $isLinkNode } from '@lexical/link'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createNodeSelection, $getNodeByKey, $setSelection } from 'lexical'
import { CreditCard } from 'lucide-react'
import { useMemo } from 'react'

import { matchUrl } from './hooks/useUrlMatcher'
import { $createLinkCardEditNode } from './LinkCardEditNode'
import type { PluginRegistry } from './types'

export interface ConvertToLinkCardActionProps {
  url: string
  linkKey: string
  pluginRegistry?: PluginRegistry
  className?: string
}

export function ConvertToLinkCardAction({
  url,
  linkKey,
  pluginRegistry,
  className,
}: ConvertToLinkCardActionProps) {
  const [editor] = useLexicalComposerContext()

  const info = useMemo(
    () => matchUrl(url, pluginRegistry),
    [url, pluginRegistry],
  )

  if (!info) return null

  const handleConvert = () => {
    editor.update(() => {
      const linkNode = $getNodeByKey(linkKey)
      if (!linkNode || !$isLinkNode(linkNode)) return
      const topElement = linkNode.getTopLevelElement()
      if (!topElement) return

      const linkCardNode = $createLinkCardEditNode({ url })
      topElement.replace(linkCardNode)
      const nodeSelection = $createNodeSelection()
      nodeSelection.add(linkCardNode.getKey())
      $setSelection(nodeSelection)
    })
  }

  return (
    <button className={className} type="button" onClick={handleConvert}>
      <CreditCard size={14} />
      To Card
    </button>
  )
}
