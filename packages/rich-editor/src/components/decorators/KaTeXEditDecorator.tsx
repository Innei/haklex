import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { $isKaTeXBlockNode } from '../../nodes/KaTeXBlockNode'
import { $isKaTeXInlineNode } from '../../nodes/KaTeXInlineNode'

interface KaTeXEditDecoratorProps {
  nodeKey: string
  equation: string
  displayMode: boolean
  children: ReactElement
}

export function KaTeXEditDecorator({
  nodeKey,
  equation,
  displayMode,
  children,
}: KaTeXEditDecoratorProps) {
  const [editor] = useLexicalComposerContext()
  const editable = editor.isEditable()

  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(equation)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setValue(equation)
  }, [equation])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const commit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed) return
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isKaTeXInlineNode(node) && node.getEquation() !== trimmed) {
        node.setEquation(trimmed)
      } else if ($isKaTeXBlockNode(node) && node.getEquation() !== trimmed) {
        node.setEquation(trimmed)
      }
    })
    setEditing(false)
  }, [editor, nodeKey, value])

  const cancel = useCallback(() => {
    setValue(equation)
    setEditing(false)
  }, [equation])

  const handleDelete = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (node) node.remove()
    })
  }, [editor, nodeKey])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        cancel()
      } else if (displayMode && e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        commit()
      } else if (!displayMode && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        commit()
      }
    },
    [commit, cancel, displayMode],
  )

  if (!editable) {
    return children
  }

  if (editing) {
    const wrapperClass = displayMode
      ? 'rich-katex-edit-block'
      : 'rich-katex-edit-inline'

    return (
      <span className={wrapperClass}>
        <span className="rich-katex-edit-header">
          <span className="rich-katex-edit-label">
            {displayMode ? 'Block KaTeX' : 'Inline KaTeX'}
          </span>
          <span className="rich-katex-edit-hint">
            {displayMode ? '⌘+Enter to save' : 'Enter to save'}
          </span>
          <button
            className="rich-link-card-edit-delete"
            type="button"
            onClick={handleDelete}
            title="Delete"
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
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
          </button>
        </span>
        <textarea
          ref={inputRef}
          className="rich-katex-edit-textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          rows={displayMode ? 4 : 1}
          spellCheck={false}
        />
      </span>
    )
  }

  return (
    <span
      className="rich-katex-edit-wrapper"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setEditing(true)
      }}
      title="Click to edit"
    >
      {children}
    </span>
  )
}
