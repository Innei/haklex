import type { MouseEvent } from 'react'
import { useCallback } from 'react'

export interface FootnoteRendererProps {
  identifier: string
}

export function FootnoteRenderer({ identifier }: FootnoteRendererProps) {
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

  return (
    <a
      className="rich-footnote-ref"
      href={`#${targetId}`}
      id={referenceId}
      role="doc-noteref"
      onClick={handleClick}
      data-footnote-ref={identifier}
    >
      [{identifier}]
    </a>
  )
}
