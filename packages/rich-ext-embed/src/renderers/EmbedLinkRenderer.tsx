import '../styles.css'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey } from 'lexical'
import { ExternalLink, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { EmbedType } from '../url-matchers'
import { matchEmbedUrl } from '../url-matchers'

interface EmbedNodeMethods {
  getUrl?: () => string
  setUrl: (url: string) => void
  setSource?: (source: EmbedType | null) => void
}

export interface EmbedLinkRendererProps {
  type: EmbedType | null
  url: string
  nodeKey: string
}

const typeLabels: Record<EmbedType, string> = {
  tweet: 'X / Twitter',
  youtube: 'YouTube',
  codesandbox: 'CodeSandbox',
  bilibili: 'Bilibili',
  'github-file': 'GitHub File',
  'github-gist': 'GitHub Gist',
  thinking: 'Thinking',
}

export function EmbedLinkRenderer({
  type,
  url,
  nodeKey,
}: EmbedLinkRendererProps) {
  const [editor] = useLexicalComposerContext()
  const [editUrl, setEditUrl] = useState(url)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditUrl(url)
  }, [url])

  useEffect(() => {
    if (!url) {
      inputRef.current?.focus()
    }
  }, [url])

  const commitUrl = useCallback(() => {
    const trimmed = editUrl.trim()
    if (!trimmed) return
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (!node || !('setUrl' in node)) return
      const n = node as unknown as EmbedNodeMethods
      const currentUrl = n.getUrl?.()
      if (currentUrl !== trimmed) {
        n.setUrl(trimmed)
      }
      if (n.setSource) {
        try {
          n.setSource(matchEmbedUrl(new URL(trimmed)))
        } catch {
          // invalid URL
        }
      }
    })
  }, [editor, nodeKey, editUrl])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        commitUrl()
        inputRef.current?.blur()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setEditUrl(url)
        inputRef.current?.blur()
      }
    },
    [commitUrl, url],
  )

  const handleDelete = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (node) node.remove()
    })
  }, [editor, nodeKey])

  const handleOpen = useCallback(() => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }, [url])

  const label = type ? typeLabels[type] : 'Embed'
  const cssModifier = type || 'generic'

  return (
    <div className={`rich-embed rich-embed--${cssModifier}`}>
      <span className="rich-embed__badge">
        <span className={`rich-embed__dot rich-embed__dot--${cssModifier}`} />
        {label}
      </span>
      <span className="rich-embed__divider" />
      <input
        ref={inputRef}
        className="rich-embed__input"
        type="url"
        value={editUrl}
        onChange={(e) => setEditUrl(e.target.value)}
        onBlur={commitUrl}
        onKeyDown={handleKeyDown}
        placeholder="https://..."
      />
      <span className="rich-embed__actions">
        <button
          type="button"
          className="rich-embed__action-btn"
          onClick={handleOpen}
          title="Open in new tab"
          disabled={!url}
        >
          <ExternalLink />
        </button>
        <button
          type="button"
          className="rich-embed__action-btn rich-embed__action-btn--danger"
          onClick={handleDelete}
          title="Delete"
        >
          <Trash2 />
        </button>
      </span>
    </div>
  )
}
