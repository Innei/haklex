import type { SerializedEditorState } from 'lexical'
import { useState } from 'react'

interface JsonViewerProps {
  data: SerializedEditorState
  defaultExpanded?: boolean
}

export function JsonViewer({ data, defaultExpanded = false }: JsonViewerProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
  }

  return (
    <div className="json-viewer">
      <div className="json-viewer-header">
        <button
          className="btn btn-sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '▼' : '▶'} JSON
        </button>
        <button className="btn btn-sm" onClick={handleCopy}>
          Copy
        </button>
      </div>
      {isExpanded && (
        <pre className="json-viewer-content">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}
