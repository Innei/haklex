import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import type { LexicalEditor } from 'lexical'
import {
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  COMMAND_PRIORITY_HIGH,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
} from 'lexical'
import { useEffect, useRef } from 'react'

const DRAG_DATA_KEY = 'application/x-rich-editor-drag'
const HANDLE_GAP = 28

function getBlockElement(
  editor: LexicalEditor,
  target: HTMLElement,
): HTMLElement | null {
  const rootElement = editor.getRootElement()
  if (!rootElement) return null

  let current: HTMLElement | null = target
  while (current && current !== rootElement) {
    if (current.parentElement === rootElement) {
      return current
    }
    current = current.parentElement
  }
  return null
}

function createDragHandle(): HTMLElement {
  const handle = document.createElement('div')
  handle.className = 'rich-drag-handle'
  handle.setAttribute('draggable', 'true')
  handle.setAttribute('role', 'button')
  handle.setAttribute('tabindex', '0')
  handle.setAttribute('aria-label', 'Drag to reorder')

  const ns = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(ns, 'svg')
  svg.setAttribute('width', '14')
  svg.setAttribute('height', '14')
  svg.setAttribute('viewBox', '0 0 16 16')
  svg.setAttribute('fill', 'currentColor')
  svg.setAttribute('aria-hidden', 'true')
  const positions = [
    [5, 3],
    [11, 3],
    [5, 8],
    [11, 8],
    [5, 13],
    [11, 13],
  ]
  for (const [cx, cy] of positions) {
    const circle = document.createElementNS(ns, 'circle')
    circle.setAttribute('cx', String(cx))
    circle.setAttribute('cy', String(cy))
    circle.setAttribute('r', '1.5')
    svg.append(circle)
  }
  handle.append(svg)
  return handle
}

function createDropIndicator(): HTMLElement {
  const indicator = document.createElement('div')
  indicator.className = 'rich-drop-indicator'
  return indicator
}

export function DragDropPlugin() {
  const [editor] = useLexicalComposerContext()
  const indicatorRef = useRef<HTMLElement | null>(null)
  const activeBlockRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const rootElement = editor.getRootElement()
    if (!rootElement) return

    const container = rootElement.parentElement
    if (!container) return

    const handle = createDragHandle()
    const indicator = createDropIndicator()
    indicatorRef.current = indicator
    container.append(handle)
    container.append(indicator)

    handle.style.display = 'none'
    indicator.style.display = 'none'

    let rafId: number | null = null

    const onMouseMove = (event: MouseEvent) => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        const target = event.target as HTMLElement
        const block = getBlockElement(editor, target)

        if (block && !block.hasAttribute('contenteditable')) {
          activeBlockRef.current = block
          const rect = block.getBoundingClientRect()
          const rootRect = rootElement.getBoundingClientRect()
          handle.style.display = 'flex'
          handle.style.top = `${rect.top - rootRect.top + rootElement.offsetTop}px`
          handle.style.left = `${rootRect.left - HANDLE_GAP}px`
        }
      })
    }

    const onMouseLeave = (event: MouseEvent) => {
      const relatedTarget = event.relatedTarget as HTMLElement | null
      if (relatedTarget === handle || handle.contains(relatedTarget)) return
      handle.style.display = 'none'
      activeBlockRef.current = null
    }

    const onHandleDragStart = (event: DragEvent) => {
      if (!event.dataTransfer) return

      const block = activeBlockRef.current
      if (!block) return

      editor.getEditorState().read(() => {
        const node = $getNearestNodeFromDOMNode(block)
        if (node) {
          event.dataTransfer!.setData(DRAG_DATA_KEY, node.getKey())
          event.dataTransfer!.effectAllowed = 'move'
        }
      })
    }

    rootElement.addEventListener('mousemove', onMouseMove)
    rootElement.addEventListener('mouseleave', onMouseLeave)
    handle.addEventListener('dragstart', onHandleDragStart)

    const unregisterDragOver = editor.registerCommand(
      DRAGOVER_COMMAND,
      (event: DragEvent) => {
        if (!event.dataTransfer?.types.includes(DRAG_DATA_KEY)) return false
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'

        const target = event.target as HTMLElement
        const block = getBlockElement(editor, target)
        if (block && indicatorRef.current) {
          const rect = block.getBoundingClientRect()
          const midY = rect.top + rect.height / 2
          const rootRect = rootElement.getBoundingClientRect()
          const y = event.clientY < midY ? rect.top : rect.bottom
          indicatorRef.current.style.display = 'block'
          indicatorRef.current.style.top = `${y - rootRect.top + rootElement.offsetTop}px`
          indicatorRef.current.style.left = `${rootRect.left}px`
          indicatorRef.current.style.width = `${rootRect.width}px`
        }
        return true
      },
      COMMAND_PRIORITY_HIGH,
    )

    const unregisterDrop = editor.registerCommand(
      DROP_COMMAND,
      (event: DragEvent) => {
        const draggedKey = event.dataTransfer?.getData(DRAG_DATA_KEY)
        if (!draggedKey) return false

        event.preventDefault()
        if (indicatorRef.current) {
          indicatorRef.current.style.display = 'none'
        }

        const target = event.target as HTMLElement
        const block = getBlockElement(editor, target)
        if (!block) return false

        editor.update(() => {
          const draggedNode = $getNodeByKey(draggedKey)
          const targetNode = $getNearestNodeFromDOMNode(block)
          if (!draggedNode || !targetNode) return
          if (draggedNode === targetNode) return

          const rect = block.getBoundingClientRect()
          const midY = rect.top + rect.height / 2
          const insertBefore = event.clientY < midY

          draggedNode.remove()
          if (insertBefore) {
            targetNode.insertBefore(draggedNode)
          } else {
            targetNode.insertAfter(draggedNode)
          }
        })

        return true
      },
      COMMAND_PRIORITY_HIGH,
    )

    const unregisterDragStart = editor.registerCommand(
      DRAGSTART_COMMAND,
      (event: DragEvent) => {
        if (!event.dataTransfer?.types.includes(DRAG_DATA_KEY)) {
          return false
        }
        return true
      },
      COMMAND_PRIORITY_HIGH,
    )

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      rootElement.removeEventListener('mousemove', onMouseMove)
      rootElement.removeEventListener('mouseleave', onMouseLeave)
      handle.removeEventListener('dragstart', onHandleDragStart)
      handle.remove()
      indicator.remove()
      unregisterDragOver()
      unregisterDrop()
      unregisterDragStart()
    }
  }, [editor])

  return null
}
