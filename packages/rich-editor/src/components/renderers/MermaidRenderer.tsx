export interface MermaidRendererProps {
  content: string
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
