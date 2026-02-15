import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { Popover, PopoverPanel, PopoverTrigger } from '@shiro/rich-editor-ui'
import { $getNodeByKey } from 'lexical'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { $isKaTeXBlockNode } from '../../nodes/KaTeXBlockNode'
import { $isKaTeXInlineNode } from '../../nodes/KaTeXInlineNode'
import { KaTeXRenderer } from '../renderers/KaTeXRenderer'

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

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(equation)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'snippets'>('editor')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setValue(equation)
  }, [equation])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [open])

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
    setOpen(false)
  }, [editor, nodeKey, value])

  const cancel = useCallback(() => {
    setValue(equation)
    setOpen(false)
  }, [equation])

  const handleDelete = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (node) node.remove()
    })
  }, [editor, nodeKey])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [value])

  const handleReset = useCallback(() => {
    setValue(equation)
    inputRef.current?.focus()
  }, [equation])

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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <span className="rich-katex-edit-wrapper" title="Click to edit" />
        }
      >
        {children}
      </PopoverTrigger>
      <PopoverPanel
        side="bottom"
        sideOffset={8}
        className="rich-katex-editor-panel"
      >
        {/* Header */}
        <div className="rich-katex-editor-header">
          <div className="rich-katex-editor-header-left">
            <div className="rich-katex-editor-icon-wrap">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                width="12"
                height="12"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  d="M4 4l6 8-6 8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M14 12h6" strokeLinecap="round" />
              </svg>
            </div>
            <span className="rich-katex-editor-title">Math Editor</span>
          </div>
          <div className="rich-katex-editor-header-right">
            <span className="rich-katex-editor-mode">
              {displayMode ? 'Block' : 'Inline'}
            </span>
            <button
              className="rich-katex-editor-delete"
              type="button"
              onClick={handleDelete}
              title="Delete node"
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
        </div>

        {/* Tabs */}
        <div className="rich-katex-editor-tabs">
          <button
            type="button"
            className={`rich-katex-editor-tab ${activeTab === 'editor' ? 'rich-katex-editor-tab-active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            Editor
          </button>
          <button
            type="button"
            className={`rich-katex-editor-tab ${activeTab === 'snippets' ? 'rich-katex-editor-tab-active' : ''}`}
            onClick={() => setActiveTab('snippets')}
          >
            Snippets
          </button>
        </div>

        {/* Editor Tab */}
        {activeTab === 'editor' && (
          <div className="rich-katex-editor-body">
            <div className="rich-katex-editor-field">
              <label className="rich-katex-editor-label">LaTeX Input</label>
              <div className="rich-katex-editor-input-wrap">
                <textarea
                  ref={inputRef}
                  className="rich-katex-editor-textarea"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={displayMode ? 4 : 3}
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  placeholder="e.g. \frac{-b \pm \sqrt{b^2-4ac}}{2a}"
                />
                <div className="rich-katex-editor-input-actions">
                  <button
                    className="rich-katex-editor-action-btn"
                    type="button"
                    onClick={handleCopy}
                    title="Copy LaTeX"
                    disabled={!value.trim()}
                  >
                    {copied ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: '#22c55e' }}
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                  <button
                    className="rich-katex-editor-action-btn"
                    type="button"
                    onClick={handleReset}
                    title="Reset"
                    disabled={value === equation}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="rich-katex-editor-field">
              <label className="rich-katex-editor-label">Preview</label>
              <div className="rich-katex-editor-preview">
                {value.trim() ? (
                  <KaTeXRenderer equation={value} displayMode={displayMode} />
                ) : (
                  <span className="rich-katex-editor-preview-empty">
                    Enter a formula
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Snippets Tab (placeholder) */}
        {activeTab === 'snippets' && (
          <div className="rich-katex-editor-body">
            <div className="rich-katex-editor-snippets-placeholder">
              Snippets coming soon
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="rich-katex-editor-footer">
          <span className="rich-katex-editor-charcount">
            {value.trim() ? `${value.length} chars` : 'Enter a formula'}
          </span>
          <div className="rich-katex-editor-footer-actions">
            <button
              className="rich-katex-editor-btn"
              type="button"
              onClick={cancel}
            >
              Cancel
            </button>
            <button
              className="rich-katex-editor-btn rich-katex-editor-btn-primary"
              type="button"
              onClick={commit}
              disabled={!value.trim()}
            >
              Save
            </button>
          </div>
        </div>
      </PopoverPanel>
    </Popover>
  )
}
