import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getTableNodeFromLexicalNodeOrThrow,
  $isTableCellNode,
} from '@lexical/table'
import { $getNearestNodeFromDOMNode, type LexicalEditor } from 'lexical'
import type { PointerEvent as ReactPointerEvent, ReactElement } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import * as css from './styles.css'

type ResizeDirection = 'right' | 'bottom' | null
const RESIZER_HANDLE_ATTR = 'data-table-resizer-handle'

function TableCellResizerInner({
  editor,
}: {
  editor: LexicalEditor
}): ReactElement | null {
  const [activeCell, setActiveCell] = useState<HTMLTableCellElement | null>(
    null,
  )
  const [resizing, setResizing] = useState(false)
  const [direction, setDirection] = useState<ResizeDirection>(null)
  const [handlePos, setHandlePos] = useState<{
    right: { top: number; left: number; height: number } | null
    bottom: { top: number; left: number; width: number } | null
  }>({ right: null, bottom: null })
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const startWidthRef = useRef(0)
  const startHeightRef = useRef(0)
  const cleanupRef = useRef<(() => void) | null>(null)
  const activeCellRef = useRef<HTMLTableCellElement | null>(null)

  const updateHandlePos = useCallback((cell: HTMLTableCellElement | null) => {
    if (!cell) {
      setHandlePos({ right: null, bottom: null })
      return
    }

    const rect = cell.getBoundingClientRect()
    setHandlePos({
      right: {
        top: rect.top,
        left: rect.right - 4,
        height: rect.height,
      },
      bottom: {
        top: rect.bottom - 4,
        left: rect.left,
        width: rect.width,
      },
    })
  }, [])

  // Cleanup leaked pointer listeners on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.()
    }
  }, [])

  useEffect(() => {
    const rootElement = editor.getRootElement()
    if (!rootElement) return

    const handleMouseMove = (e: MouseEvent) => {
      if (resizing) return
      const target = e.target as HTMLElement
      const cell = target.closest('td, th') as HTMLTableCellElement | null
      if (cell && rootElement.contains(cell)) {
        activeCellRef.current = cell
        setActiveCell(cell)
        updateHandlePos(cell)
      } else {
        activeCellRef.current = null
        setActiveCell(null)
        updateHandlePos(null)
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null
      // Keep handles visible while moving from editor root to portalized handle.
      if (related?.closest?.(`[${RESIZER_HANDLE_ATTR}="true"]`)) {
        return
      }
      if (!resizing) {
        activeCellRef.current = null
        setActiveCell(null)
        updateHandlePos(null)
      }
    }

    rootElement.addEventListener('mousemove', handleMouseMove)
    rootElement.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      rootElement.removeEventListener('mousemove', handleMouseMove)
      rootElement.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [editor, resizing, updateHandlePos])

  useEffect(() => {
    if (!activeCell || resizing) return

    const onViewportChange = () => {
      updateHandlePos(activeCellRef.current)
    }

    window.addEventListener('scroll', onViewportChange, true)
    window.addEventListener('resize', onViewportChange)
    return () => {
      window.removeEventListener('scroll', onViewportChange, true)
      window.removeEventListener('resize', onViewportChange)
    }
  }, [activeCell, resizing, updateHandlePos])

  const onPointerDown = useCallback(
    (dir: 'right' | 'bottom', e: ReactPointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!activeCell) return

      setResizing(true)
      setDirection(dir)
      startXRef.current = e.clientX
      startYRef.current = e.clientY
      startWidthRef.current = activeCell.offsetWidth
      startHeightRef.current = activeCell.offsetHeight

      const capturedCell = activeCell

      const onPointerMove = (ev: PointerEvent) => {
        if (dir === 'right') {
          const diff = ev.clientX - startXRef.current
          const newWidth = Math.max(50, startWidthRef.current + diff)
          const colIndex = capturedCell.cellIndex
          const table = capturedCell.closest('table')
          if (table) {
            const allRows = table.querySelectorAll('tr')
            allRows.forEach((row) => {
              const cells = row.querySelectorAll('td, th')
              if (cells[colIndex]) {
                ;(cells[colIndex] as HTMLElement).style.width = `${newWidth}px`
              }
            })
            updateHandlePos(capturedCell)
          }
        } else {
          const diff = ev.clientY - startYRef.current
          const newHeight = Math.max(30, startHeightRef.current + diff)
          const row = capturedCell.parentElement as HTMLTableRowElement
          if (row) {
            row.style.height = `${newHeight}px`
            updateHandlePos(capturedCell)
          }
        }
      }

      const cleanup = () => {
        document.removeEventListener('pointermove', onPointerMove)
        document.removeEventListener('pointerup', onPointerUp)
        cleanupRef.current = null
      }

      const onPointerUp = (ev: PointerEvent) => {
        cleanup()
        setResizing(false)
        setDirection(null)

        if (dir === 'right') {
          const diff = ev.clientX - startXRef.current
          const newWidth = Math.max(50, startWidthRef.current + diff)
          editor.update(() => {
            const node = $getNearestNodeFromDOMNode(capturedCell)
            if (node && $isTableCellNode(node)) {
              node.setWidth(newWidth)
            }
          })
        } else {
          const diff = ev.clientY - startYRef.current
          const newHeight = Math.max(30, startHeightRef.current + diff)
          editor.update(() => {
            const node = $getNearestNodeFromDOMNode(capturedCell)
            if (node && $isTableCellNode(node)) {
              $getTableNodeFromLexicalNodeOrThrow(node)
              const row = node.getParent()
              if (row) {
                const rowDOM = editor.getElementByKey(row.getKey())
                if (rowDOM) {
                  ;(rowDOM as HTMLElement).style.height = `${newHeight}px`
                }
              }
            }
          })
        }
      }

      cleanupRef.current = cleanup
      document.addEventListener('pointermove', onPointerMove)
      document.addEventListener('pointerup', onPointerUp)
    },
    [activeCell, editor, updateHandlePos],
  )

  if (!activeCell) return null

  return (
    <>
      {handlePos.right && (
        <div
          data-testid="table-cell-resizer-right"
          data-table-resizer-handle="true"
          className={`${css.resizeHandle} ${direction === 'right' ? css.resizeHandleActive : ''}`}
          style={{
            top: handlePos.right.top,
            left: handlePos.right.left,
            height: handlePos.right.height,
            width: 8,
            cursor: 'col-resize',
            background:
              direction === 'right'
                ? 'linear-gradient(to right, transparent 3px, rgba(59,130,246,0.7) 3px, rgba(59,130,246,0.7) 5px, transparent 5px)'
                : 'linear-gradient(to right, transparent 3px, rgba(59,130,246,0.5) 3px, rgba(59,130,246,0.5) 5px, transparent 5px)',
          }}
          onPointerDown={(e) => onPointerDown('right', e)}
        />
      )}
      {handlePos.bottom && (
        <div
          data-testid="table-cell-resizer-bottom"
          data-table-resizer-handle="true"
          className={`${css.resizeHandle} ${direction === 'bottom' ? css.resizeHandleActive : ''}`}
          style={{
            top: handlePos.bottom.top,
            left: handlePos.bottom.left,
            width: handlePos.bottom.width,
            height: 8,
            cursor: 'row-resize',
            background:
              direction === 'bottom'
                ? 'linear-gradient(to bottom, transparent 3px, rgba(59,130,246,0.7) 3px, rgba(59,130,246,0.7) 5px, transparent 5px)'
                : 'linear-gradient(to bottom, transparent 3px, rgba(59,130,246,0.5) 3px, rgba(59,130,246,0.5) 5px, transparent 5px)',
          }}
          onPointerDown={(e) => onPointerDown('bottom', e)}
        />
      )}
    </>
  )
}

export function TableCellResizerPlugin(): ReactElement {
  const [editor] = useLexicalComposerContext()

  return createPortal(<TableCellResizerInner editor={editor} />, document.body)
}
