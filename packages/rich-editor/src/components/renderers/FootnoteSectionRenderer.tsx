import type { MouseEvent } from 'react'
import { useCallback } from 'react'

import { useFootnoteDefinitions } from '../../context/FootnoteDefinitionsContext'

export interface FootnoteSectionRendererProps {
  definitions: Record<string, string>
  nodeKey: string
}

export function FootnoteSectionRenderer({
  definitions,
}: FootnoteSectionRendererProps) {
  const { displayNumberMap } = useFootnoteDefinitions()

  const sortedEntries = Object.entries(definitions).sort(
    ([a], [b]) => (displayNumberMap[a] ?? 0) - (displayNumberMap[b] ?? 0),
  )

  if (sortedEntries.length === 0) return null

  return (
    <div className="rich-footnote-section-content" role="doc-endnotes">
      <hr className="rich-footnote-section-divider" />
      <ol className="rich-footnote-section-list">
        {sortedEntries.map(([identifier, content]) => {
          const displayNum = displayNumberMap[identifier] ?? identifier
          return (
            <FootnoteSectionItem
              key={identifier}
              identifier={identifier}
              content={content}
              displayNum={displayNum}
            />
          )
        })}
      </ol>
    </div>
  )
}

function FootnoteSectionItem({
  identifier,
  content,
  displayNum,
}: {
  identifier: string
  content: string
  displayNum: number | string
}) {
  const targetId = `footnote-${identifier}`
  const refId = `footnote-ref-${identifier}`

  const handleBackClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault()
      const refElement = document.getElementById(refId)
      if (!refElement) return
      refElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      refElement.classList.add('rich-footnote-highlight')
      window.setTimeout(() => {
        refElement.classList.remove('rich-footnote-highlight')
      }, 1200)
    },
    [refId],
  )

  return (
    <li
      id={targetId}
      className="rich-footnote-section-item"
      value={typeof displayNum === 'number' ? displayNum : undefined}
    >
      <span className="rich-footnote-section-item-content">{content}</span>
      <a
        href={`#${refId}`}
        onClick={handleBackClick}
        className="rich-footnote-back-ref"
        role="doc-backlink"
        aria-label={`Back to reference ${displayNum}`}
      >
        ↩
      </a>
    </li>
  )
}
