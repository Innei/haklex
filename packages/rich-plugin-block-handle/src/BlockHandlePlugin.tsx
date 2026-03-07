import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@haklex/rich-editor-ui'
import { $createCodeNode } from '@lexical/code'
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import type { LexicalEditor } from 'lexical'
import {
  $createParagraphNode,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
} from 'lexical'
import {
  ArrowDown,
  ArrowUp,
  Code2,
  Copy,
  GripVertical,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Plus,
  TextQuote,
  Trash2,
  Type,
} from 'lucide-react'
import type {
  ComponentType,
  MouseEvent as ReactMouseEvent,
  ReactElement,
} from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import * as css from './styles.css'

// ─── Constants ──────────────────────────────────────────
const DRAG_DATA_KEY = 'application/x-rich-editor-drag'
const HIDE_DELAY = 300
const HANDLE_OFFSET = 52

interface HandlePosition {
  visible: boolean
  top: number
  left: number
  nodeKey: string | null
}

interface DropLineState {
  visible: boolean
  top: number
  left: number
  width: number
}

// ─── Turn Into items ────────────────────────────────────
interface TurnIntoItem {
  key: string
  label: string
  icon: ComponentType<{ size?: number }>
}

const TURN_INTO_ITEMS: TurnIntoItem[] = [
  { key: 'paragraph', label: 'Text', icon: Type },
  { key: 'h1', label: 'Heading 1', icon: Heading1 },
  { key: 'h2', label: 'Heading 2', icon: Heading2 },
  { key: 'h3', label: 'Heading 3', icon: Heading3 },
  { key: 'bullet', label: 'Bullet List', icon: List },
  { key: 'numbered', label: 'Numbered List', icon: ListOrdered },
  { key: 'todo', label: 'To-do', icon: ListChecks },
  { key: 'quote', label: 'Quote', icon: TextQuote },
  { key: 'divider', label: 'Divider', icon: Minus },
  { key: 'code', label: 'Code', icon: Code2 },
]

// ─── Helpers ────────────────────────────────────────────
function getBlockElement(
  editor: LexicalEditor,
  target: HTMLElement,
): HTMLElement | null {
  const rootElement = editor.getRootElement()
  if (!rootElement) return null
  let current: HTMLElement | null = target
  while (current && current !== rootElement) {
    if (current.parentElement === rootElement) return current
    current = current.parentElement
  }
  return null
}

function getNearestBlockByY(
  rootElement: HTMLElement,
  clientY: number,
): HTMLElement | null {
  const blocks = Array.from(rootElement.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  )
  if (!blocks.length) return null

  let nearestBlock: HTMLElement | null = null
  let nearestDistance = Number.POSITIVE_INFINITY

  for (const block of blocks) {
    const rect = block.getBoundingClientRect()
    if (rect.height <= 0) continue
    if (clientY >= rect.top && clientY <= rect.bottom) return block

    const distance =
      clientY < rect.top ? rect.top - clientY : clientY - rect.bottom
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestBlock = block
    }
  }

  return nearestBlock
}

function getDropTargetBlock(
  editor: LexicalEditor,
  rootElement: HTMLElement,
  event: DragEvent,
): HTMLElement | null {
  const rootRect = rootElement.getBoundingClientRect()
  if (rootRect.width <= 0 || rootRect.height <= 0) return null
  if (event.clientY < rootRect.top || event.clientY > rootRect.bottom) {
    return null
  }

  const points: Array<{ x: number; y: number }> = [
    { x: event.clientX, y: event.clientY },
  ]
  const clampedX = Math.min(
    rootRect.right - 1,
    Math.max(rootRect.left + 1, event.clientX),
  )
  if (clampedX !== event.clientX) {
    points.unshift({ x: clampedX, y: event.clientY })
  }

  for (const point of points) {
    const element = document.elementFromPoint(point.x, point.y)
    if (!(element instanceof HTMLElement)) continue
    const block = getBlockElement(editor, element)
    if (block) return block
  }

  const { target } = event
  if (target instanceof HTMLElement) {
    const block = getBlockElement(editor, target)
    if (block) return block
  }

  return getNearestBlockByY(rootElement, event.clientY)
}

function toPagePosition(rect: DOMRect) {
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
  }
}

function $cloneNode(
  node: import('lexical').LexicalNode,
): import('lexical').LexicalNode {
  const Klass = node.constructor as any
  const serialized = node.exportJSON()
  const clone = Klass.importJSON(serialized)
  if ($isElementNode(node) && $isElementNode(clone)) {
    for (const child of node.getChildren()) {
      clone.append($cloneNode(child))
    }
  }
  return clone
}

// ─── Inner Component ────────────────────────────────────
function BlockHandleInner({
  editor,
}: {
  editor: LexicalEditor
}): ReactElement | null {
  const [handle, setHandle] = useState<HandlePosition>({
    visible: false,
    top: 0,
    left: 0,
    nodeKey: null,
  })
  const [dropLine, setDropLine] = useState<DropLineState>({
    visible: false,
    top: 0,
    left: 0,
    width: 0,
  })

  const activeBlockRef = useRef<HTMLElement | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hoveringHandleRef = useRef(false)
  const menuOpenCountRef = useRef(0)
  const dragPreviewRef = useRef<HTMLElement | null>(null)
  const draggingBlockRef = useRef<HTMLElement | null>(null)

  // ── Hover visibility ──
  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const scheduleHide = useCallback(() => {
    clearHideTimer()
    hideTimerRef.current = setTimeout(() => {
      if (!hoveringHandleRef.current && menuOpenCountRef.current === 0) {
        activeBlockRef.current = null
        setHandle((s) => ({ ...s, visible: false, nodeKey: null }))
      }
    }, HIDE_DELAY)
  }, [clearHideTimer])

  const onHandleEnter = useCallback(() => {
    hoveringHandleRef.current = true
    clearHideTimer()
  }, [clearHideTimer])

  const onHandleLeave = useCallback(() => {
    hoveringHandleRef.current = false
    scheduleHide()
  }, [scheduleHide])

  const onMenuOpenChange = useCallback(
    (open: boolean) => {
      menuOpenCountRef.current += open ? 1 : -1
      if (!open) scheduleHide()
      else clearHideTimer()
    },
    [scheduleHide, clearHideTimer],
  )

  // ── Position update from anchor ──
  const updatePositionFromBlock = useCallback(
    (block?: HTMLElement | null) => {
      if (block !== undefined) activeBlockRef.current = block
      const el = activeBlockRef.current
      if (!el || !el.isConnected) {
        activeBlockRef.current = null
        setHandle((s) =>
          s.visible ? { ...s, visible: false, nodeKey: null } : s,
        )
        return
      }

      const rootElement = editor.getRootElement()
      if (!rootElement) return

      const blockRect = el.getBoundingClientRect()
      const rootRect = rootElement.getBoundingClientRect()
      const page = toPagePosition(blockRect)

      let nodeKey: string | null = null
      editor.read(() => {
        const node = $getNearestNodeFromDOMNode(el)
        if (node) nodeKey = node.getKey()
      })

      setHandle({
        visible: true,
        top: page.top,
        left: toPagePosition(rootRect).left - HANDLE_OFFSET,
        nodeKey,
      })
    },
    [editor],
  )

  // ── Mousemove tracking ──
  useEffect(() => {
    const rootElement = editor.getRootElement()
    if (!rootElement) return

    let rafId: number | null = null

    const onMouseMove = (e: MouseEvent) => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        const target = e.target as HTMLElement
        const block = getBlockElement(editor, target)
        if (block) {
          clearHideTimer()
          updatePositionFromBlock(block)
        }
      })
    }

    const onMouseLeave = () => {
      if (!hoveringHandleRef.current && menuOpenCountRef.current === 0) {
        scheduleHide()
      }
    }

    rootElement.addEventListener('mousemove', onMouseMove)
    rootElement.addEventListener('mouseleave', onMouseLeave)
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      rootElement.removeEventListener('mousemove', onMouseMove)
      rootElement.removeEventListener('mouseleave', onMouseLeave)
      clearHideTimer()
    }
  }, [editor, clearHideTimer, scheduleHide, updatePositionFromBlock])

  // ── Scroll / resize ──
  useEffect(() => {
    const update = () => updatePositionFromBlock()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [updatePositionFromBlock])

  // ── Editor update listener ──
  useEffect(
    () => editor.registerUpdateListener(() => updatePositionFromBlock()),
    [editor, updatePositionFromBlock],
  )

  // ── Add block handler (insert empty paragraph) ──
  const handleAddBlock = useCallback(() => {
    if (!handle.nodeKey) return
    editor.update(() => {
      const node = $getNodeByKey(handle.nodeKey!)
      if (!node) return
      const p = $createParagraphNode()
      node.insertAfter(p)
      p.selectStart()
    })
  }, [editor, handle.nodeKey])

  // ── Turn into handler ──
  const handleTurnInto = useCallback(
    (type: string) => {
      const { nodeKey } = handle
      if (!nodeKey) return

      if (['bullet', 'numbered', 'todo', 'divider'].includes(type)) {
        editor.update(() => {
          const node = $getNodeByKey(nodeKey)
          if (!node) return
          if ($isElementNode(node)) node.selectStart()
        })
        const commands: Record<string, any> = {
          bullet: INSERT_UNORDERED_LIST_COMMAND,
          numbered: INSERT_ORDERED_LIST_COMMAND,
          todo: INSERT_CHECK_LIST_COMMAND,
          divider: INSERT_HORIZONTAL_RULE_COMMAND,
        }
        editor.dispatchCommand(commands[type], void 0)
        return
      }

      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if (!node || !$isElementNode(node)) return
        node.selectStart()
        const sel = $getSelection()
        if (!$isRangeSelection(sel)) return
        const creators: Record<string, () => import('lexical').ElementNode> = {
          paragraph: () => $createParagraphNode(),
          h1: () => $createHeadingNode('h1'),
          h2: () => $createHeadingNode('h2'),
          h3: () => $createHeadingNode('h3'),
          quote: () => $createQuoteNode(),
          code: () => $createCodeNode(),
        }
        const create = creators[type]
        if (create) $setBlocksType(sel, create)
      })
    },
    [editor, handle.nodeKey],
  )

  // ── Block actions ──
  const handleDelete = useCallback(() => {
    if (!handle.nodeKey) return
    editor.update(() => {
      const node = $getNodeByKey(handle.nodeKey!)
      node?.remove()
    })
    setHandle((s) => ({ ...s, visible: false, nodeKey: null }))
  }, [editor, handle.nodeKey])

  const handleDuplicate = useCallback(() => {
    if (!handle.nodeKey) return
    editor.update(() => {
      const node = $getNodeByKey(handle.nodeKey!)
      if (!node) return
      const clone = $cloneNode(node)
      node.insertAfter(clone)
    })
  }, [editor, handle.nodeKey])

  const handleMoveUp = useCallback(() => {
    if (!handle.nodeKey) return
    editor.update(() => {
      const node = $getNodeByKey(handle.nodeKey!)
      if (!node) return
      const prev = node.getPreviousSibling()
      if (prev) {
        node.remove()
        prev.insertBefore(node)
      }
    })
  }, [editor, handle.nodeKey])

  const handleMoveDown = useCallback(() => {
    if (!handle.nodeKey) return
    editor.update(() => {
      const node = $getNodeByKey(handle.nodeKey!)
      if (!node) return
      const next = node.getNextSibling()
      if (next) {
        node.remove()
        next.insertAfter(node)
      }
    })
  }, [editor, handle.nodeKey])

  // ── Grip handle: controlled menu + drag ──
  const [gripMenuOpen, setGripMenuOpen] = useState(false)
  const dragStartedRef = useRef(false)

  const clearDragVisualState = useCallback(() => {
    const preview = dragPreviewRef.current
    if (preview) {
      preview.remove()
      dragPreviewRef.current = null
    }

    const draggingBlock = draggingBlockRef.current
    if (draggingBlock) {
      draggingBlock.classList.remove(css.draggingBlock)
      draggingBlockRef.current = null
    }
  }, [])

  const onGripDragStart = useCallback(
    (e: React.DragEvent) => {
      dragStartedRef.current = true
      if (!e.dataTransfer || !handle.nodeKey) return
      e.dataTransfer.setData(DRAG_DATA_KEY, handle.nodeKey)
      e.dataTransfer.effectAllowed = 'move'

      const block = activeBlockRef.current
      if (!block) return

      clearDragVisualState()

      const rect = block.getBoundingClientRect()
      const preview = block.cloneNode(true) as HTMLElement
      preview.classList.add(css.dragPreview)
      preview.style.width = `${rect.width}px`
      document.body.append(preview)

      draggingBlockRef.current = block
      dragPreviewRef.current = preview
      block.classList.add(css.draggingBlock)

      const offsetX = Math.max(
        12,
        Math.min(rect.width - 12, e.clientX - rect.left),
      )
      const offsetY = Math.max(
        8,
        Math.min(rect.height - 8, e.clientY - rect.top),
      )
      e.dataTransfer.setDragImage(preview, offsetX, offsetY)
    },
    [clearDragVisualState, handle.nodeKey],
  )

  const onGripOpenChange = useCallback(
    (open: boolean) => {
      setGripMenuOpen((prev) => {
        if (prev === open) return prev
        onMenuOpenChange(open)
        return open
      })
    },
    [onMenuOpenChange],
  )

  const onGripMouseDownCapture = useCallback((e: ReactMouseEvent) => {
    dragStartedRef.current = false
    // Base UI opens Menu.Trigger on mousedown; block this so drag can start first.
    if (e.button === 0) e.stopPropagation()
  }, [])

  const onGripClick = useCallback(
    (e: ReactMouseEvent) => {
      // Keyboard activation is handled by Menu.Trigger itself.
      if (e.detail === 0) return
      e.preventDefault()
      e.stopPropagation()
      if (dragStartedRef.current) {
        dragStartedRef.current = false
        return
      }
      onGripOpenChange(!gripMenuOpen)
    },
    [gripMenuOpen, onGripOpenChange],
  )

  // ── Drag commands ──
  useEffect(() => {
    const rootElement = editor.getRootElement()
    if (!rootElement) return

    const unregDragOver = editor.registerCommand(
      DRAGOVER_COMMAND,
      (event: DragEvent) => {
        if (!event.dataTransfer?.types.includes(DRAG_DATA_KEY)) return false
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'

        const block = getDropTargetBlock(editor, rootElement, event)
        if (!block) {
          setDropLine((s) => (s.visible ? { ...s, visible: false } : s))
          return true
        }

        const rect = block.getBoundingClientRect()
        const rootRect = rootElement.getBoundingClientRect()
        const midY = rect.top + rect.height / 2
        const y = event.clientY < midY ? rect.top : rect.bottom
        setDropLine({
          visible: true,
          top: y + window.scrollY,
          left: rootRect.left + window.scrollX,
          width: rootRect.width,
        })
        return true
      },
      COMMAND_PRIORITY_HIGH,
    )

    const unregDrop = editor.registerCommand(
      DROP_COMMAND,
      (event: DragEvent) => {
        const draggedKey = event.dataTransfer?.getData(DRAG_DATA_KEY)
        if (!draggedKey) return false
        event.preventDefault()
        setDropLine((s) => ({ ...s, visible: false }))
        clearDragVisualState()

        const block = getDropTargetBlock(editor, rootElement, event)
        if (!block) return false

        editor.update(() => {
          const draggedNode = $getNodeByKey(draggedKey)
          const targetNode = $getNearestNodeFromDOMNode(block)
          if (!draggedNode || !targetNode || draggedNode === targetNode) return

          const rect = block.getBoundingClientRect()
          const midY = rect.top + rect.height / 2
          draggedNode.remove()
          if (event.clientY < midY) {
            targetNode.insertBefore(draggedNode)
          } else {
            targetNode.insertAfter(draggedNode)
          }
        })
        return true
      },
      COMMAND_PRIORITY_HIGH,
    )

    const unregDragStart = editor.registerCommand(
      DRAGSTART_COMMAND,
      (event: DragEvent) => {
        if (!event.dataTransfer?.types.includes(DRAG_DATA_KEY)) return false
        return true
      },
      COMMAND_PRIORITY_HIGH,
    )

    const clearDropLine = () => {
      setDropLine((s) => (s.visible ? { ...s, visible: false } : s))
    }
    const clearDragState = () => {
      clearDropLine()
      clearDragVisualState()
    }
    const onDragLeave = (e: DragEvent) => {
      if (
        e.relatedTarget === null ||
        !rootElement.contains(e.relatedTarget as Node)
      ) {
        clearDropLine()
      }
    }
    window.addEventListener('dragend', clearDragState)
    window.addEventListener('drop', clearDragState)
    rootElement.addEventListener('dragleave', onDragLeave)

    return () => {
      unregDragOver()
      unregDrop()
      unregDragStart()
      window.removeEventListener('dragend', clearDragState)
      window.removeEventListener('drop', clearDragState)
      rootElement.removeEventListener('dragleave', onDragLeave)
      clearDragState()
    }
  }, [clearDragVisualState, editor])

  // ── Render ──
  return (
    <>
      <div
        className={`${css.handleContainer} ${handle.visible ? css.handleContainerVisible : ''}`}
        style={{ top: handle.top, left: handle.left }}
        onMouseEnter={onHandleEnter}
        onMouseLeave={onHandleLeave}
      >
        {/* + Add button */}
        <button
          className={css.handleBtn}
          aria-label="Add block"
          onClick={handleAddBlock}
        >
          <Plus size={14} />
        </button>

        {/* Grip handle */}
        <DropdownMenu open={gripMenuOpen} onOpenChange={onGripOpenChange}>
          <DropdownMenuTrigger
            className={css.handleBtn}
            aria-label="Block actions"
            draggable
            onDragStart={onGripDragStart as any}
            onMouseDownCapture={onGripMouseDownCapture}
            onClick={onGripClick}
          >
            <GripVertical size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start" sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>TURN INTO</DropdownMenuLabel>
              {TURN_INTO_ITEMS.map((item) => (
                <DropdownMenuItem
                  key={item.key}
                  onClick={() => handleTurnInto(item.key)}
                >
                  <item.icon />
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>ACTIONS</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleMoveUp}>
                <ArrowUp />
                Move Up
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleMoveDown}>
                <ArrowDown />
                Move Down
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className={css.menuItemDestructive}
              onClick={handleDelete}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Drop indicator */}
      {dropLine.visible && (
        <div
          className={css.dropIndicator}
          style={{
            top: dropLine.top,
            left: dropLine.left,
            width: dropLine.width,
          }}
        />
      )}
    </>
  )
}

// ─── Export ──────────────────────────────────────────────
export function BlockHandlePlugin(): ReactElement {
  const [editor] = useLexicalComposerContext()
  return createPortal(<BlockHandleInner editor={editor} />, document.body)
}
