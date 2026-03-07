import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@haklex/rich-editor-ui'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $deleteTableColumn__EXPERIMENTAL,
  $deleteTableRow__EXPERIMENTAL,
  $getTableCellNodeFromLexicalNode,
  $insertTableRowAtSelection,
  $isTableCellNode,
} from '@lexical/table'
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

interface ActiveAnchor {
  table: HTMLTableElement
  rowIndex: number
  colIndex: number
}

const HIDE_DELAY = 300
const ICON_SIZE = 12
const ROW_HANDLE_HEIGHT = 16
const COL_HANDLE_WIDTH = 34

function toPagePosition(rect: DOMRect) {
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
  }
}

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
  const activeAnchorRef = useRef<ActiveAnchor | null>(null)

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
        activeAnchorRef.current = null
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

  const updateHandlesFromAnchor = useCallback(
    (anchor?: ActiveAnchor | null) => {
      if (anchor !== undefined) {
        activeAnchorRef.current = anchor
      }
      const activeAnchor = activeAnchorRef.current
      if (!activeAnchor) return

      const { table, rowIndex, colIndex } = activeAnchor
      if (!table.isConnected) {
        activeAnchorRef.current = null
        setRowHandle((s) => ({ ...s, visible: false }))
        setColHandle((s) => ({ ...s, visible: false }))
        return
      }

      const rows = table.querySelectorAll('tr')
      const row = rows[rowIndex]
      if (!row) {
        activeAnchorRef.current = null
        setRowHandle((s) => ({ ...s, visible: false }))
        setColHandle((s) => ({ ...s, visible: false }))
        return
      }

      const cells = row.querySelectorAll('td, th')
      const cell = (cells[colIndex] ?? cells[0]) as
        | HTMLTableCellElement
        | undefined
      if (!cell) {
        activeAnchorRef.current = null
        setRowHandle((s) => ({ ...s, visible: false }))
        setColHandle((s) => ({ ...s, visible: false }))
        return
      }

      tableRef.current = table
      const resolvedColIndex = cell.cellIndex
      activeAnchorRef.current = { table, rowIndex, colIndex: resolvedColIndex }

      const cellRect = cell.getBoundingClientRect()
      const tableRect = table.getBoundingClientRect()
      const cellPage = toPagePosition(cellRect)
      const tablePage = toPagePosition(tableRect)
      setRowHandle({
        visible: true,
        top: cellPage.top + cellRect.height / 2 - ROW_HANDLE_HEIGHT / 2,
        left: tablePage.left - 38,
        rowIndex,
        colIndex: resolvedColIndex,
      })
      setColHandle({
        visible: true,
        top: tablePage.top - 22,
        left: cellPage.left + cellRect.width / 2 - COL_HANDLE_WIDTH / 2,
        rowIndex,
        colIndex: resolvedColIndex,
      })
    },
    [],
  )

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
      const rowEl = cell.parentElement as HTMLTableRowElement | null
      const rowIdx = rowEl ? rowEl.rowIndex : 0
      const colIdx = cell.cellIndex
      updateHandlesFromAnchor({
        table,
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
  }, [editor, scheduleHide, clearHideTimer, updateHandlesFromAnchor])

  useEffect(() => {
    const onViewportChange = () => {
      updateHandlesFromAnchor()
    }

    window.addEventListener('scroll', onViewportChange, true)
    window.addEventListener('resize', onViewportChange)
    return () => {
      window.removeEventListener('scroll', onViewportChange, true)
      window.removeEventListener('resize', onViewportChange)
    }
  }, [updateHandlesFromAnchor])

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      updateHandlesFromAnchor()
    })
  }, [editor, updateHandlesFromAnchor])

  // Row actions
  const insertRowAbove = useCallback(() => {
    const table = tableRef.current
    if (!table) return
    selectCellAtIndex(table, rowHandle.rowIndex, 0, editor)
    editor.update(() => {
      $insertTableRowAtSelection(false)
    })
  }, [editor, rowHandle.rowIndex])

  const insertRowBelow = useCallback(() => {
    const table = tableRef.current
    if (!table) return
    selectCellAtIndex(table, rowHandle.rowIndex, 0, editor)
    editor.update(() => {
      $insertTableRowAtSelection(true)
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
      $insertTableRowAtSelection(false)
    })
  }, [editor, colHandle.colIndex])

  const insertColumnRight = useCallback(() => {
    const table = tableRef.current
    if (!table) return
    selectCellAtIndex(table, 0, colHandle.colIndex, editor)
    editor.update(() => {
      $insertTableRowAtSelection(true)
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
      $insertTableRowAtSelection(true)
    })
  }, [editor, rowHandle.rowIndex])

  // + button for column: insert left of current
  const addColumnLeft = useCallback(() => {
    const table = tableRef.current
    if (!table) return
    selectCellAtIndex(table, 0, colHandle.colIndex, editor)
    editor.update(() => {
      $insertTableRowAtSelection(false)
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
