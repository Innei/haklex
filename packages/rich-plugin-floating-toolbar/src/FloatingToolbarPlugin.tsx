import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
} from '@lexical/selection'
import { ColorPicker } from '@shiro/rich-editor-ui'
import type { LexicalNode, RangeSelection } from 'lexical'
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'
import {
  Bold,
  Code,
  Highlighter,
  Italic,
  Link as LinkIcon,
  Strikethrough,
  Underline,
} from 'lucide-react'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import * as css from './styles.css'

interface ToolbarState {
  isBold: boolean
  isItalic: boolean
  isUnderline: boolean
  isStrikethrough: boolean
  isCode: boolean
  isHighlight: boolean
  isLink: boolean
  fontColor: string
}

const INITIAL_STATE: ToolbarState = {
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrikethrough: false,
  isCode: false,
  isHighlight: false,
  isLink: false,
  fontColor: '',
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
    isHighlight: selection.hasFormat('highlight'),
    isLink: hasLink,
    fontColor: $getSelectionStyleValueForProperty(selection, 'color', ''),
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
    top: rect.top - toolbarHeight - 10 + window.scrollY,
    left: clampedLeft,
  }
}

interface ToolbarButtonProps {
  active: boolean
  onClick: () => void
  ariaLabel: string
  children: ReactElement
}

function ToolbarButton({
  active,
  onClick,
  ariaLabel,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={`${css.btn}${active ? ` ${css.btnActive}` : ''}`}
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      aria-label={ariaLabel}
      aria-pressed={active}
    >
      {children}
      {active && <span className={css.btnIndicator} />}
    </button>
  )
}

const ICON_SIZE = 15
const ICON_STROKE = 2

export function FloatingToolbarPlugin(): ReactElement | null {
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
    const unregisterCommand = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar()
        return false
      },
      COMMAND_PRIORITY_LOW,
    )
    const unregisterUpdate = editor.registerUpdateListener(
      ({ editorState }) => {
        editorState.read(() => {
          updateToolbar()
        })
      },
    )
    return () => {
      unregisterCommand()
      unregisterUpdate()
    }
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
    (
      format:
        | 'bold'
        | 'italic'
        | 'underline'
        | 'strikethrough'
        | 'code'
        | 'highlight',
    ) => {
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

  const handleColor = useCallback(
    (value: string) => {
      editor.update(() => {
        const sel = $getSelection()
        if ($isRangeSelection(sel)) {
          $patchStyleText(sel, { color: value === 'inherit' ? null : value })
        }
      })
    },
    [editor],
  )

  if (!visible) return null

  return createPortal(
    <div
      ref={toolbarRef}
      className={css.toolbar}
      role="toolbar"
      aria-label="Text formatting"
      style={{ position: 'absolute', zIndex: 50 }}
    >
      {/* Group 1: Basic formatting */}
      <ToolbarButton
        active={state.isBold}
        onClick={() => handleFormat('bold')}
        ariaLabel="Bold"
      >
        <Bold size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      </ToolbarButton>
      <ToolbarButton
        active={state.isItalic}
        onClick={() => handleFormat('italic')}
        ariaLabel="Italic"
      >
        <Italic size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      </ToolbarButton>
      <ToolbarButton
        active={state.isUnderline}
        onClick={() => handleFormat('underline')}
        ariaLabel="Underline"
      >
        <Underline size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      </ToolbarButton>
      <ToolbarButton
        active={state.isStrikethrough}
        onClick={() => handleFormat('strikethrough')}
        ariaLabel="Strikethrough"
      >
        <Strikethrough size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      </ToolbarButton>

      <span className={css.separator} />

      {/* Group 2: Code, Highlight, Link */}
      <ToolbarButton
        active={state.isCode}
        onClick={() => handleFormat('code')}
        ariaLabel="Code"
      >
        <Code size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      </ToolbarButton>
      <ToolbarButton
        active={state.isHighlight}
        onClick={() => handleFormat('highlight')}
        ariaLabel="Highlight"
      >
        <Highlighter size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      </ToolbarButton>
      <ToolbarButton
        active={state.isLink}
        onClick={handleLink}
        ariaLabel="Link"
      >
        <LinkIcon size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      </ToolbarButton>

      <span className={css.separator} />

      {/* Group 3: Color picker */}
      <ColorPicker
        currentColor={state.fontColor || 'inherit'}
        onSelect={handleColor}
      />
    </div>,
    document.body,
  )
}
