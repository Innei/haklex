export interface FootnoteRendererProps {
  identifier: string
}

export function FootnoteRenderer({ identifier }: FootnoteRendererProps) {
  return (
    <a
      className="rich-footnote-ref"
      href={`#fn-${identifier}`}
      id={`fnref-${identifier}`}
      role="doc-noteref"
    >
      [{identifier}]
    </a>
  )
}
