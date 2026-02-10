import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  $isLinkCardNode,
  type LinkCardNodePayload,
} from '../../nodes/LinkCardNode'

interface LinkCardEditDecoratorProps {
  nodeKey: string
  payload: LinkCardNodePayload
  children: ReactElement
}

export function LinkCardEditDecorator({
  nodeKey,
  payload,
  children,
}: LinkCardEditDecoratorProps) {
  const [editor] = useLexicalComposerContext()
  const editable = editor.isEditable()

  const [editing, setEditing] = useState(false)
  const [url, setUrl] = useState(payload.url)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setUrl(payload.url)
  }, [payload.url])

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const commitUrl = useCallback(() => {
    const trimmed = url.trim()
    if (!trimmed) return
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isLinkCardNode(node) && node.getUrl() !== trimmed) {
        node.setUrl(trimmed)
      }
    })
    setEditing(false)
  }, [editor, nodeKey, url])

  const handleDelete = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (node) node.remove()
    })
  }, [editor, nodeKey])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        commitUrl()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setUrl(payload.url)
        setEditing(false)
      }
    },
    [commitUrl, payload.url],
  )

  if (!editable) {
    return children
  }

  return (
    <div className="rich-link-card-edit-wrapper">
      <div className="rich-link-card-edit-toolbar">
        {editing ? (
          <input
            ref={inputRef}
            className="rich-link-card-edit-input"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={commitUrl}
            onKeyDown={handleKeyDown}
            placeholder="https://..."
          />
        ) : (
          <button
            className="rich-link-card-edit-url"
            type="button"
            onClick={() => setEditing(true)}
            title={payload.url}
          >
            {payload.url}
          </button>
        )}
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
      </div>
      <div
        onClick={(e) => {
          if (!editing) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
      >
        {children}
      </div>
    </div>
  )
}
