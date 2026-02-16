import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $deleteTableColumn__EXPERIMENTAL,
  $deleteTableRow__EXPERIMENTAL,
  $getTableCellNodeFromLexicalNode,
  $insertTableColumn__EXPERIMENTAL,
  $insertTableRow__EXPERIMENTAL,
  $isTableCellNode,
} from '@lexical/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shiro/rich-editor-ui'
import {
  $createRangeSelection,
  $getNearestNodeFromDOMNode,
  $setSelection,
} from 'lexical'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  GripVertical,
  Plus,
  Trash2,
} from 'lucide-react'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import * as css from './styles.css'

interface HandleState {
  visible: boolean
  top: number
  left: number
  rowIndex: number
  colIndex: number
}

const HIDE_DELAY = 300
const ICON_SIZE = 12

function selectCellAtIndex(
  table: HTMLTableElement,
  rowIdx: number,
  colIdx: number,
  editor: ReturnType<typeof useLexicalComposerContext>[0],
) {
  const rows = table.querySelectorAll('tr')
  const targetRow = rows[rowIdx]
  if (!targetRow) return
  const cells = targetRow.querySelectorAll('td, th')
  const targetCell = cells[colIdx] ?? cells[0]
  if (!targetCell) return

  editor.update(() => {
    const node = $getNearestNodeFromDOMNode(targetCell)
    if (!node) return
    const cellNode = $getTableCellNodeFromLexicalNode(node)
    if (!cellNode || !$isTableCellNode(cellNode)) return
    const firstChild = cellNode.getFirstChild()
    if (firstChild) {
      const sel = $createRangeSelection()
      sel.anchor.set(firstChild.getKey(), 0, 'element')
      sel.focus.set(firstChild.getKey(), 0, 'element')
      $setSelection(sel)
    }
  })
}

function TableRowColumnHandlesInner({
  editor,
}: {
  editor: ReturnType<typeof useLexicalComposerContext>[0]
}): ReactElement | null {
  const [rowHandle, setRowHandle] = useState<HandleState>({
    visible: false,
    top: 0,
    left: 0,
    rowIndex: 0,
    colIndex: 0,
  })
  const [colHandle, setColHandle] = useState<HandleState>({
    visible: false,
    top: 0,
    left: 0,
    rowIndex: 0,
    colIndex: 0,
  })

  const tableRef = useRef<HTMLTableElement | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hoveringHandleRef = useRef(false)

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const scheduleHide = useCallback(() => {
    clearHideTimer()
    hideTimerRef.current = setTimeout(() => {
      if (!hoveringHandleRef.current) {
        setRowHandle((s) => ({ ...s, visible: false }))
        setColHandle((s) => ({ ...s, visible: false }))
      }
    }, HIDE_DELAY)
  }, [clearHideTimer])

  const handleEnter = useCallback(() => {
    hoveringHandleRef.current = true
    clearHideTimer()
  }, [clearHideTimer])

  const handleLeave = useCallback(() => {
    hoveringHandleRef.current = false
    scheduleHide()
  }, [scheduleHide])

  useEffect(() => {
    const rootElement = editor.getRootElement()
    if (!rootElement) return

    const onMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const cell = target.closest('td, th') as HTMLTableCellElement | null
      const table = target.closest('table') as HTMLTableElement | null

      if (!cell || !table || !rootElement.contains(table)) {
        if (!hoveringHandleRef.current) {
          scheduleHide()
        }
        return
      }

      clearHideTimer()
      tableRef.current = table

      const cellRect = cell.getBoundingClientRect()
      const tableRect = table.getBoundingClientRect()
      const rowEl = cell.parentElement as HTMLTableRowElement | null
      const rowIdx = rowEl ? rowEl.rowIndex : 0
      const colIdx = cell.cellIndex

      // Row handle: left of table, vertically centered on cell
      setRowHandle({
        visible: true,
        top: cellRect.top + cellRect.height / 2 - 8,
        left: tableRect.left - 38,
        rowIndex: rowIdx,
        colIndex: colIdx,
      })

      // Column handle: above table, horizontally centered on cell
      setColHandle({
        visible: true,
        top: tableRect.top - 22,
        left: cellRect.left + cellRect.width / 2 - 17,
        rowIndex: rowIdx,
        colIndex: colIdx,
      })
    }

    const onMouseLeave = () => {
      if (!hoveringHandleRef.current) {
        scheduleHide()
      }
    }

    rootElement.addEventListener('mousemove', onMouseMove)
    rootElement.addEventListener('mouseleave', onMouseLeave)
    return () => {
      rootElement.removeEventListener('mousemove', onMouseMove)
      rootElement.removeEventListener('mouseleave', onMouseLeave)
      clearHideTimer()
    }
  }, [editor, scheduleHide, clearHideTimer])

  // Row actions
  const insertRowAbove = useCallback(() => {
    const table = tableRef.current
    if (!table) return
    selectCellAtIndex(table, rowHandle.rowIndex, 0, editor)
    editor.update(() => {
      $insertTableRow__EXPERIMENTAL(false)
    })
  }, [editor, rowHandle.rowIndex])

  const insertRowBelow = useCallback(() => {
    const table = tableRef.current
    if (!table) return
    selectCellAtIndex(table, rowHandle.rowIndex, 0, editor)
    editor.update(() => {
      $insertTableRow__EXPERIMENTAL(true)
    })
  }, [editor, rowHandle.rowIndex])

  const deleteRow = useCallback(() => {
    const table = tableRef.current
    if (!table) return
    selectCellAtIndex(table, rowHandle.rowIndex, 0, editor)
    editor.update(() => {
      $deleteTableRow__EXPERIMENTAL()
    })
  }, [editor, rowHandle.rowIndex])

  // Column actions
  const insertColumnLeft = useCallback(() => {
    const table = tableRef.current
    if (!table) return
    selectCellAtIndex(table, 0, colHandle.colIndex, editor)
    editor.update(() => {
      $insertTableColumn__EXPERIMENTAL(false)
    })
  }, [editor, colHandle.colIndex])

  const insertColumnRight = useCallback(() => {
    const table = tableRef.current
    if (!table) return
    selectCellAtIndex(table, 0, colHandle.colIndex, editor)
    editor.update(() => {
      $insertTableColumn__EXPERIMENTAL(true)
    })
  }, [editor, colHandle.colIndex])

  const deleteColumn = useCallback(() => {
    const table = tableRef.current
    if (!table) return
    selectCellAtIndex(table, 0, colHandle.colIndex, editor)
    editor.update(() => {
      $deleteTableColumn__EXPERIMENTAL()
    })
  }, [editor, colHandle.colIndex])

  // + button for row: insert below current
  const addRowBelow = useCallback(() => {
    const table = tableRef.current
    if (!table) return
    selectCellAtIndex(table, rowHandle.rowIndex, 0, editor)
    editor.update(() => {
      $insertTableRow__EXPERIMENTAL(true)
    })
  }, [editor, rowHandle.rowIndex])

  // + button for column: insert left of current
  const addColumnLeft = useCallback(() => {
    const table = tableRef.current
    if (!table) return
    selectCellAtIndex(table, 0, colHandle.colIndex, editor)
    editor.update(() => {
      $insertTableColumn__EXPERIMENTAL(false)
    })
  }, [editor, colHandle.colIndex])

  return (
    <>
      {/* Row handle */}
      <div
        className={`${css.rowColHandle} ${rowHandle.visible ? css.rowColHandleVisible : ''}`}
        style={{ top: rowHandle.top, left: rowHandle.left }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <button
          type="button"
          className={css.handleBtn}
          onClick={addRowBelow}
          aria-label="Add row"
        >
          <Plus size={ICON_SIZE} />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className={css.handleBtn}>
            <GripVertical size={ICON_SIZE} />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" sideOffset={4}>
            <DropdownMenuItem onClick={insertRowAbove}>
              <ArrowUp size={14} />
              Insert row above
            </DropdownMenuItem>
            <DropdownMenuItem onClick={insertRowBelow}>
              <ArrowDown size={14} />
              Insert row below
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className={css.menuItemDestructive}
              onClick={deleteRow}
            >
              <Trash2 size={14} />
              Delete row
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Column handle */}
      <div
        className={`${css.rowColHandle} ${colHandle.visible ? css.rowColHandleVisible : ''}`}
        style={{ top: colHandle.top, left: colHandle.left }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <button
          type="button"
          className={css.handleBtn}
          onClick={addColumnLeft}
          aria-label="Add column"
        >
          <Plus size={ICON_SIZE} />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className={css.handleBtn}>
            <GripVertical size={ICON_SIZE} />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start" sideOffset={4}>
            <DropdownMenuItem onClick={insertColumnLeft}>
              <ArrowLeft size={14} />
              Insert column left
            </DropdownMenuItem>
            <DropdownMenuItem onClick={insertColumnRight}>
              <ArrowRight size={14} />
              Insert column right
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className={css.menuItemDestructive}
              onClick={deleteColumn}
            >
              <Trash2 size={14} />
              Delete column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}

export function TableRowColumnHandlesPlugin(): ReactElement {
  const [editor] = useLexicalComposerContext()

  return createPortal(
    <TableRowColumnHandlesInner editor={editor} />,
    document.body,
  )
}
