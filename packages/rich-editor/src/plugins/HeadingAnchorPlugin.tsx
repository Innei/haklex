import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { HeadingNode } from '@lexical/rich-text'
import { useEffect } from 'react'

function textToSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // eslint-disable-next-line regexp/no-dupe-characters-character-class
      .replaceAll(/[^\w\s\u3000-\u9fff\uac00-\ud7af\uff00-\uffef-]/g, '')
      .replaceAll(/[\s_]+/g, '-')
      .replaceAll(/^-+|-+$/g, '')
  )
}

function deduplicateSlug(slug: string, usedSlugs: Map<string, number>): string {
  const count = usedSlugs.get(slug)
  if (count === undefined) {
    usedSlugs.set(slug, 1)
    return slug
  }
  usedSlugs.set(slug, count + 1)
  return `${slug}-${count}`
}

export function HeadingAnchorPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const usedSlugs = new Map<string, number>()

    return editor.registerMutationListener(HeadingNode, (mutations) => {
      usedSlugs.clear()

      for (const [nodeKey, mutation] of mutations) {
        if (mutation === 'destroyed') continue

        const dom = editor.getElementByKey(nodeKey)
        if (!dom) continue

        const text = dom.textContent || ''
        const baseSlug = textToSlug(text)
        if (!baseSlug) continue

        const slug = deduplicateSlug(baseSlug, usedSlugs)
        dom.id = slug

        let anchor = dom.querySelector<HTMLAnchorElement>(
          '.rich-heading-anchor',
        )
        if (!anchor) {
          anchor = document.createElement('a')
          anchor.className = 'rich-heading-anchor'
          anchor.setAttribute('aria-hidden', 'true')
          anchor.setAttribute('tabindex', '-1')
          dom.prepend(anchor)
        }
        anchor.href = `#${slug}`
      }
    })
  }, [editor])

  return null
}
