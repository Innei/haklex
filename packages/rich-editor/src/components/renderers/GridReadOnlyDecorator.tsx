import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import type { LexicalEditor } from 'lexical'

interface GridReadOnlyDecoratorProps {
  cols: number
  gap: string
  cellEditors: LexicalEditor[]
}

export function GridReadOnlyDecorator({
  cols,
  gap,
  cellEditors,
}: GridReadOnlyDecoratorProps) {
  return (
    <div
      className="rich-grid-inner"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap,
      }}
    >
      {cellEditors.map((editor, i) => (
        <div key={i} className="rich-grid-cell">
          <LexicalNestedComposer initialEditor={editor}>
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="rich-grid-cell-editable"
                  style={{ outline: 'none' }}
                  aria-placeholder=""
                  placeholder={<span style={{ display: 'none' }} />}
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </LexicalNestedComposer>
        </div>
      ))}
    </div>
  )
}
