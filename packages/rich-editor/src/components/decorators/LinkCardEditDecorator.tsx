import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { Popover, PopoverPanel, PopoverTrigger } from '@shiro/rich-editor-ui'
import { $getNodeByKey } from 'lexical'
import { ExternalLink, Link, Unlink } from 'lucide-react'
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

  const [open, setOpen] = useState(false)

  const [url, setUrl] = useState(payload.url)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setUrl(payload.url)
  }, [payload.url])

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const commitUrl = useCallback(() => {
    const trimmed = url.trim()
    if (!trimmed) return
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isLinkCardNode(node) && node.getUrl() !== trimmed) {
        node.setUrl(trimmed)
      }
    })
  }, [editor, nodeKey, url])

  const handleDelete = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (node) node.remove()
    })
    setOpen(false)
  }, [editor, nodeKey])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        commitUrl()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setUrl(payload.url)
      }
    },
    [commitUrl, payload.url],
  )

  const handleOpen = useCallback(() => {
    window.open(payload.url, '_blank', 'noopener,noreferrer')
  }, [payload.url])

  if (!editable) {
    return children
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen: boolean) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setUrl(payload.url)
        }
      }}
    >
      <PopoverTrigger
        delay={200}
        closeDelay={300}
        openOnHover
        render={<span className="rich-link-card-edit-wrapper" />}
      >
        {children}
      </PopoverTrigger>
      <PopoverPanel
        side="bottom"
        sideOffset={8}
        className="rich-link-card-edit-panel"
      >
        <div className="rich-link-card-edit-url-row">
          <Link className="rich-link-card-edit-link-icon" size={16} />

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
        </div>
        <div className="rich-link-card-edit-actions">
          <button
            className="rich-link-card-edit-action-btn"
            type="button"
            onClick={handleOpen}
          >
            <ExternalLink size={14} />
            Open
          </button>
          <button
            className="rich-link-card-edit-action-btn rich-link-card-edit-action-btn--end"
            type="button"
            onClick={handleDelete}
          >
            <Unlink size={14} />
            Remove
          </button>
        </div>
      </PopoverPanel>
    </Popover>
  )
}
