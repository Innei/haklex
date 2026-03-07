import type { LinkCardNodePayload } from '@haklex/rich-editor'
import { $isLinkCardNode } from '@haklex/rich-editor'
import { Popover, PopoverPanel, PopoverTrigger } from '@haklex/rich-editor-ui'
import { $createLinkNode } from '@lexical/link'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createParagraphNode, $createTextNode, $getNodeByKey } from 'lexical'
import { ExternalLink, Link, RemoveFormatting, Unlink } from 'lucide-react'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import * as styles from './styles.css'

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

  const [open, setOpen] = useState(() => !payload.url)

  const [url, setUrl] = useState(payload.url)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setUrl(payload.url)
  }, [payload.url])

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      })
    }
  }, [open])

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

  const handleConvertToLink = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (!$isLinkCardNode(node)) return
      const nodeUrl = node.getUrl()
      const { title } = payload
      const linkNode = $createLinkNode(nodeUrl)
      linkNode.append($createTextNode(title || nodeUrl))
      const paragraph = $createParagraphNode()
      paragraph.append(linkNode)
      node.replace(paragraph)
      paragraph.selectEnd()
    })
    setOpen(false)
  }, [editor, nodeKey, payload])

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
        nativeButton={false}
        render={
          <span
            className={`${styles.editWrapper} ${styles.semanticClassNames.editWrapper}`}
          />
        }
      >
        {children}
      </PopoverTrigger>
      <PopoverPanel
        side="bottom"
        sideOffset={8}
        className={`${styles.editPanel} ${styles.semanticClassNames.editPanel}`}
      >
        <div
          className={`${styles.editUrlRow} ${styles.semanticClassNames.editUrlRow}`}
        >
          <Link
            className={`${styles.editLinkIcon} ${styles.semanticClassNames.editLinkIcon}`}
            size={16}
          />

          <input
            ref={inputRef}
            className={`${styles.editInput} ${styles.semanticClassNames.editInput}`}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={commitUrl}
            onKeyDown={handleKeyDown}
            placeholder="https://..."
          />
        </div>
        <div
          className={`${styles.editActions} ${styles.semanticClassNames.editActions}`}
        >
          <button
            className={`${styles.editActionButton} ${styles.semanticClassNames.editActionButton}`}
            type="button"
            onClick={handleOpen}
          >
            <ExternalLink size={14} />
            Open
          </button>
          <button
            className={`${styles.editActionButton} ${styles.semanticClassNames.editActionButton}`}
            type="button"
            onClick={handleConvertToLink}
          >
            <RemoveFormatting size={14} />
            To Link
          </button>
          <button
            className={`${styles.editActionButton} ${styles.semanticClassNames.editActionButton} ${styles.editActionButtonEnd} ${styles.semanticClassNames.editActionButtonEnd}`}
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
