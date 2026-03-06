import type { SerializedEditorState } from 'lexical'

import { useNestedContentRenderer } from '../../context/NestedContentRendererContext'

interface GridStaticDecoratorProps {
  cols: number
  gap: string
  cellStates: SerializedEditorState[]
}

export function GridStaticDecorator({
  cols,
  gap,
  cellStates,
}: GridStaticDecoratorProps) {
  const renderContent = useNestedContentRenderer()

  return (
    <div
      className="rich-grid-inner"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap,
      }}
    >
      {cellStates.map((state, i) => (
        <div key={i} className="rich-grid-cell">
          {renderContent(state)}
        </div>
      ))}
    </div>
  )
}
