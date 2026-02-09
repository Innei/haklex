import type { RichEditorVariant } from '@shiro/rich-editor'
import { RichEditor, RichRenderer } from '@shiro/rich-editor'
import type { LexicalEditor, SerializedEditorState } from 'lexical'
import { useCallback, useRef, useState } from 'react'

import { Panel } from '../components/Panel'
import { enhancedRendererConfig } from '../fixtures/enhanced-renderers'

// Note: Alert/Image/KaTeX commands are internal to rich-editor
// We'll need to export them or use alternative methods
export function EditorPage() {
  const [variant, setVariant] = useState<RichEditorVariant>('article')
  const [editorState, setEditorState] = useState<SerializedEditorState | null>(
    null,
  )
  const [showJson, setShowJson] = useState(false)
  const [showRenderer, setShowRenderer] = useState(true)
  const editorRef = useRef<LexicalEditor | null>(null)

  const handleChange = useCallback((state: SerializedEditorState) => {
    setEditorState(state)
  }, [])

  const handleEditorReady = useCallback((editor: LexicalEditor | null) => {
    editorRef.current = editor
  }, [])

  // TODO: Export commands from @shiro/rich-editor for insert functionality

  return (
    <div className="page">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-group">
          <span className="toolbar-label">Variant</span>
          <button
            className={variant === 'article' ? 'btn btn-active' : 'btn'}
            onClick={() => setVariant('article')}
          >
            Article
          </button>
          <button
            className={variant === 'comment' ? 'btn btn-active' : 'btn'}
            onClick={() => setVariant('comment')}
          >
            Comment
          </button>
        </div>

        <div className="toolbar-group">
          <span className="toolbar-label">View</span>
          <button
            className={showRenderer ? 'btn btn-active' : 'btn'}
            onClick={() => setShowRenderer((v) => !v)}
          >
            Renderer
          </button>
          <button
            className={showJson ? 'btn btn-active' : 'btn'}
            onClick={() => setShowJson((v) => !v)}
          >
            JSON
          </button>
        </div>
      </div>

      {/* Editor panel */}
      <Panel title="Editor" badge={variant}>
        <RichEditor
          onChange={handleChange}
          variant={variant}
          placeholder="Start typing... Try markdown shortcuts like # heading, **bold**, *italic*, > quote, ||spoiler||"
          onSubmit={() => console.info('[Submit] Cmd/Ctrl+Enter pressed')}
          autoFocus
          onEditorReady={handleEditorReady}
          rendererConfig={enhancedRendererConfig}
        />
      </Panel>

      {/* Renderer panel */}
      {showRenderer && editorState && (
        <Panel title="Renderer (readonly)" badge={variant}>
          <RichRenderer
            value={editorState}
            variant={variant}
            rendererConfig={enhancedRendererConfig}
          />
        </Panel>
      )}

      {/* JSON panel */}
      {showJson && editorState && (
        <Panel
          title="Serialized JSON (EditorState)"
          headerExtra={
            <button
              className="btn btn-sm"
              onClick={() => {
                navigator.clipboard.writeText(
                  JSON.stringify(editorState, null, 2),
                )
              }}
            >
              Copy
            </button>
          }
        >
          <pre className="json-pre">{JSON.stringify(editorState, null, 2)}</pre>
        </Panel>
      )}

      {/* Tips */}
      <div className="tips">
        <h3 className="tips-title">Markdown Shortcuts</h3>
        <div className="tips-grid">
          <code># Heading 1</code>
          <code>## Heading 2</code>
          <code>**bold**</code>
          <code>*italic*</code>
          <code>~~strikethrough~~</code>
          <code>`inline code`</code>
          <code>&gt; blockquote</code>
          <code>- list item</code>
          <code>1. ordered list</code>
          <code>---</code>
          <code>||spoiler||</code>
          <code>{'$E=mc^2$'}</code>
          <code>{'$$\\int f(x)dx$$'}</code>
          <code>{'{GH@username}'}</code>
        </div>
      </div>
    </div>
  )
}
