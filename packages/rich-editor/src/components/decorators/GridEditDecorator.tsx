import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import type { LexicalEditor } from 'lexical'
import { $getNodeByKey, $getRoot } from 'lexical'
import { useCallback, useEffect, useState } from 'react'

import { $isGridContainerNode } from '../../nodes/GridContainerNode'

interface GridEditDecoratorProps {
  nodeKey: string
  cols: number
  gap: string
  cellEditors: LexicalEditor[]
}

const COL_OPTIONS = [1, 2, 3, 4] as const

export function GridEditDecorator({
  nodeKey,
  cols: initialCols,
  gap,
  cellEditors,
}: GridEditDecoratorProps) {
  const [editor] = useLexicalComposerContext()
  const [currentCols, setCurrentCols] = useState(initialCols)

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isGridContainerNode(node)) {
          setCurrentCols(node.getCols())
        }
      })
    })
  }, [editor, nodeKey])

  const handleSetCols = useCallback(
    (cols: number) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isGridContainerNode(node)) {
          node.setCols(cols)
        }
      })
    },
    [editor, nodeKey],
  )

  const handleAddRow = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isGridContainerNode(node)) {
        node.addCells(node.getCols())
      }
    })
  }, [editor, nodeKey])

  const handleRemoveRow = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (!$isGridContainerNode(node)) return
      const cols = node.getCols()
      const editors = node.getCellEditors()
      if (editors.length <= cols) return

      const lastRow = editors.slice(-cols)
      const allEmpty = lastRow.every((cellEditor) =>
        cellEditor
          .getEditorState()
          .read(() => $getRoot().getTextContentSize() === 0),
      )
      if (!allEmpty) return
      node.removeCells(cols)
    })
  }, [editor, nodeKey])

  return (
    <div style={{ position: 'relative' }}>
      <div
        className="rich-grid-toolbar"
        style={{
          position: 'absolute',
          top: -36,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '4px 6px',
          borderRadius: 6,
          pointerEvents: 'auto',
          background: 'var(--rich-grid-toolbar-bg, rgba(255, 255, 255, 0.95))',
          border: '1px solid var(--rich-grid-toolbar-border, #e0e0e0)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          zIndex: 10,
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            color: '#737373',
            flexShrink: 0,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <line x1="3" x2="21" y1="9" y2="9" />
            <line x1="3" x2="21" y1="15" y2="15" />
            <line x1="9" x2="9" y1="3" y2="21" />
            <line x1="15" x2="15" y1="3" y2="21" />
          </svg>
        </span>
        {COL_OPTIONS.map((n) => (
          <button
            key={n}
            type="button"
            className={`rich-grid-col-btn${n === currentCols ? ' rich-grid-col-btn-active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 24,
              height: 24,
              padding: '0 6px',
              borderRadius: 4,
              border: 'none',
              background:
                n === currentCols
                  ? 'var(--rich-grid-btn-active-bg, rgba(0, 0, 0, 0.1))'
                  : 'transparent',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: n === currentCols ? 600 : 500,
              color:
                n === currentCols
                  ? 'var(--rich-grid-btn-active-color, #171717)'
                  : 'var(--rich-grid-btn-color, #525252)',
              lineHeight: 1,
            }}
            onClick={() => handleSetCols(n)}
            aria-label={`${n} columns`}
          >
            {n}
          </button>
        ))}
        <div
          style={{
            width: 1,
            height: 16,
            background: 'var(--rich-grid-toolbar-border, #e0e0e0)',
            margin: '0 2px',
            flexShrink: 0,
          }}
        />
        <button
          type="button"
          className="rich-grid-action-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 24,
            height: 24,
            padding: '0 6px',
            borderRadius: 4,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--rich-grid-btn-color, #525252)',
          }}
          onClick={handleAddRow}
          aria-label="Add row"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" x2="12" y1="5" y2="19" />
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
        </button>
        <button
          type="button"
          className="rich-grid-action-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 24,
            height: 24,
            padding: '0 6px',
            borderRadius: 4,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--rich-grid-btn-color, #525252)',
          }}
          onClick={handleRemoveRow}
          aria-label="Remove row"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
        </button>
      </div>
      <div
        className="rich-grid-inner"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${currentCols}, 1fr)`,
          gap,
        }}
      >
        {cellEditors.map((cellEditor, i) => (
          <div key={i} className="rich-grid-cell">
            <LexicalNestedComposer initialEditor={cellEditor}>
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
              <ListPlugin />
              <LinkPlugin />
            </LexicalNestedComposer>
          </div>
        ))}
      </div>
    </div>
  )
}
