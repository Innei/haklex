import { AutoLinkNode, LinkNode } from '@lexical/link'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect } from 'react'

import { getHostname, probeFavicon } from '../utils/favicon'

function applyFavicon(dom: HTMLElement, href: string) {
  if (dom.dataset.faviconHref === href) return
  dom.dataset.faviconHref = href

  const hostname = getHostname(href)
  if (!hostname) return

  probeFavicon(hostname).then((faviconUrl) => {
    if (faviconUrl) {
      dom.style.setProperty('--rc-link-favicon', `url(${faviconUrl})`)
      dom.dataset.favicon = 'loaded'
    }
  })
}

export function LinkFaviconPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const handleMutations = (
      mutations: Map<string, 'created' | 'updated' | 'destroyed'>,
    ) => {
      for (const [nodeKey, mutation] of mutations) {
        if (mutation === 'destroyed') continue
        const dom = editor.getElementByKey(nodeKey)
        if (!dom) continue
        const href = dom.getAttribute('href')
        if (href) applyFavicon(dom, href)
      }
    }

    const unregisterLink = editor.registerMutationListener(
      LinkNode,
      handleMutations,
    )
    const unregisterAutoLink = editor.registerMutationListener(
      AutoLinkNode,
      handleMutations,
    )

    return () => {
      unregisterLink()
      unregisterAutoLink()
    }
  }, [editor])

  return null
}
