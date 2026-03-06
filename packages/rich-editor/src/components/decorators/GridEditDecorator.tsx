import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import type { LexicalEditor } from 'lexical'
import { $getNodeByKey, $getRoot } from 'lexical'
import { LayoutGrid, Minus, Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { $isGridContainerNode } from '../../nodes/GridContainerNode'
import { $isGridEditNode } from '../../nodes/GridEditNode'

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
      if (!$isGridEditNode(node)) return
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
    <>
      <div
        className="rich-grid-toolbar"
        onMouseDown={(e) => e.preventDefault()}
      >
        <span className="rich-grid-toolbar-icon">
          <LayoutGrid size={14} />
        </span>
        {COL_OPTIONS.map((n) => (
          <button
            key={n}
            type="button"
            className={`rich-grid-col-btn${n === currentCols ? ' rich-grid-col-btn-active' : ''}`}
            onClick={() => handleSetCols(n)}
            aria-label={`${n} columns`}
          >
            {n}
          </button>
        ))}
        <div className="rich-grid-toolbar-divider" />
        <button
          type="button"
          className="rich-grid-action-btn"
          onClick={handleAddRow}
          aria-label="Add row"
        >
          <Plus size={14} />
        </button>
        <button
          type="button"
          className="rich-grid-action-btn"
          onClick={handleRemoveRow}
          aria-label="Remove row"
        >
          <Minus size={14} />
        </button>
      </div>
      <div
        className="rich-grid-inner"
        style={{
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
    </>
  )
}
