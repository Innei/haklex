export interface MermaidRendererProps {
  content: string
  onContentChange?: (content: string) => void
}

export function MermaidRenderer({ content }: MermaidRendererProps) {
  return (
    <div className="rich-mermaid-block">
      <pre>
        <code>{content}</code>
      </pre>
    </div>
  )
}
