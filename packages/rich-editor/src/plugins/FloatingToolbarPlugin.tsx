import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import type { LexicalNode, RangeSelection, TextFormatType } from 'lexical'
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface ToolbarState {
  isBold: boolean
  isItalic: boolean
  isUnderline: boolean
  isStrikethrough: boolean
  isCode: boolean
  isLink: boolean
}

const INITIAL_STATE: ToolbarState = {
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrikethrough: false,
  isCode: false,
  isLink: false,
}

function getSelectionState(selection: RangeSelection): ToolbarState {
  const nodes = selection.getNodes()
  const hasLink = nodes.some((node: LexicalNode) => {
    const parent = node.getParent()
    return $isLinkNode(parent) || $isLinkNode(node)
  })

  return {
    isBold: selection.hasFormat('bold'),
    isItalic: selection.hasFormat('italic'),
    isUnderline: selection.hasFormat('underline'),
    isStrikethrough: selection.hasFormat('strikethrough'),
    isCode: selection.hasFormat('code'),
    isLink: hasLink,
  }
}

function computePosition(
  nativeSelection: Selection,
  toolbar: HTMLElement,
): { top: number; left: number } | null {
  const range = nativeSelection.getRangeAt(0)
  const rect = range.getBoundingClientRect()
  if (rect.width === 0 && rect.height === 0) return null

  const toolbarWidth = toolbar.offsetWidth
  const toolbarHeight = toolbar.offsetHeight

  const rawLeft = rect.left + rect.width / 2 - toolbarWidth / 2 + window.scrollX
  const clampedLeft = Math.max(
    8,
    Math.min(rawLeft, window.innerWidth - toolbarWidth - 8 + window.scrollX),
  )

  return {
    top: rect.top - toolbarHeight - 8 + window.scrollY,
    left: clampedLeft,
  }
}

interface FormatButtonProps {
  label: string
  format: TextFormatType
  active: boolean
  onClick: (format: TextFormatType) => void
  children: string
}

function FormatButton({
  label,
  format,
  active,
  onClick,
  children,
}: FormatButtonProps) {
  return (
    <button
      type="button"
      className={`rich-toolbar-btn${active ? ' rich-toolbar-btn-active' : ''}`}
      onClick={() => onClick(format)}
      aria-label={label}
      aria-pressed={active}
    >
      {children}
    </button>
  )
}

export function FloatingToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [state, setState] = useState<ToolbarState>(INITIAL_STATE)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection) || selection.isCollapsed()) {
      setVisible(false)
      return
    }

    setState(getSelectionState(selection))
    setVisible(true)
  }, [])

  useEffect(() => {
    const unregister = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar()
        return false
      },
      COMMAND_PRIORITY_LOW,
    )

    return unregister
  }, [editor, updateToolbar])

  useEffect(() => {
    if (!visible || !toolbarRef.current) return

    const positionToolbar = () => {
      const nativeSelection = window.getSelection()
      if (!nativeSelection || nativeSelection.rangeCount === 0) {
        setVisible(false)
        return
      }

      const pos = computePosition(nativeSelection, toolbarRef.current!)
      if (!pos) {
        setVisible(false)
        return
      }

      toolbarRef.current!.style.top = `${pos.top}px`
      toolbarRef.current!.style.left = `${pos.left}px`
    }

    requestAnimationFrame(positionToolbar)
  }, [visible, state])

  const handleFormat = useCallback(
    (format: TextFormatType) => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
    },
    [editor],
  )

  const handleLink = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      const nodes = selection.getNodes()
      const hasLink = nodes.some((node: LexicalNode) => {
        const parent = node.getParent()
        return $isLinkNode(parent) || $isLinkNode(node)
      })

      if (hasLink) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
      } else {
        const text = selection.getTextContent()
        const url = /^https?:\/\//.test(text) ? text : ''
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url || 'https://')
      }
    })
  }, [editor])

  if (!visible) return null

  return createPortal(
    <div
      ref={toolbarRef}
      className="rich-floating-toolbar"
      role="toolbar"
      aria-label="Text formatting"
      style={{ position: 'absolute', zIndex: 50 }}
    >
      <FormatButton
        label="Bold"
        format="bold"
        active={state.isBold}
        onClick={handleFormat}
      >
        B
      </FormatButton>
      <FormatButton
        label="Italic"
        format="italic"
        active={state.isItalic}
        onClick={handleFormat}
      >
        I
      </FormatButton>
      <FormatButton
        label="Underline"
        format="underline"
        active={state.isUnderline}
        onClick={handleFormat}
      >
        U
      </FormatButton>
      <FormatButton
        label="Strikethrough"
        format="strikethrough"
        active={state.isStrikethrough}
        onClick={handleFormat}
      >
        S
      </FormatButton>
      <FormatButton
        label="Code"
        format="code"
        active={state.isCode}
        onClick={handleFormat}
      >
        &lt;/&gt;
      </FormatButton>
      <button
        type="button"
        className={`rich-toolbar-btn${state.isLink ? ' rich-toolbar-btn-active' : ''}`}
        onClick={handleLink}
        aria-label="Link"
        aria-pressed={state.isLink}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9.874a2 2 0 0 1-1.874 3H5a2 2 0 1 1 0-4h1.354z" />
          <path d="M9.646 10.5H12a3 3 0 0 0 0-6H9a3 3 0 0 0-2.83 4H6.126a2 2 0 0 1 1.874-3H11a2 2 0 1 1 0 4H9.646z" />
        </svg>
      </button>
    </div>,
    document.body,
  )
}
