import type { MouseEvent } from 'react'
import { useCallback, useState } from 'react'

import {
  useFootnoteContent,
  useFootnoteDisplayNumber,
} from '../../context/FootnoteDefinitionsContext'

export interface FootnoteRendererProps {
  identifier: string
}

export function FootnoteRenderer({ identifier }: FootnoteRendererProps) {
  const content = useFootnoteContent(identifier)
  const displayNumber = useFootnoteDisplayNumber(identifier)
  const [showTooltip, setShowTooltip] = useState(false)

  const referenceId = `footnote-ref-${identifier}`
  const targetId = `footnote-${identifier}`

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      const target =
        document.getElementById(targetId) ||
        document.getElementById(`fn-${identifier}`)
      if (!target) return

      e.preventDefault()
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      target.classList.add('rich-footnote-highlight')

      window.setTimeout(() => {
        target.classList.remove('rich-footnote-highlight')
      }, 1200)
    },
    [identifier, targetId],
  )

  const label = displayNumber ?? identifier

  return (
    <span
      className="rich-footnote-ref-wrapper"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <a
        className="rich-footnote-ref"
        href={`#${targetId}`}
        id={referenceId}
        role="doc-noteref"
        onClick={handleClick}
        data-footnote-ref={identifier}
      >
        {label}
      </a>
      {showTooltip && content && (
        <span className="rich-footnote-tooltip" role="tooltip">
          {content}
        </span>
      )}
    </span>
  )
}
