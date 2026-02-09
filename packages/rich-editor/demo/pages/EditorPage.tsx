import type { LexicalEditor,SerializedEditorState } from 'lexical'
import { useCallback, useRef, useState } from 'react'

import { RichEditor } from '../../src/components/RichEditor'
import { RichRenderer } from '../../src/components/RichRenderer'
import type { AlertType } from '../../src/nodes/AlertQuoteNode'
import { INSERT_ALERT_COMMAND } from '../../src/plugins/AlertPlugin'
import { INSERT_IMAGE_COMMAND } from '../../src/plugins/ImagePlugin'
import {
  INSERT_KATEX_BLOCK_COMMAND,
  INSERT_KATEX_INLINE_COMMAND,
} from '../../src/plugins/KaTeXPlugin'
import type { RichEditorVariant } from '../../src/types'
import { Panel } from '../components/Panel'

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

  const insertImage = () => {
    editorRef.current?.dispatchCommand(INSERT_IMAGE_COMMAND, {
      src: 'https://picsum.photos/800/400',
      altText: 'Random image from picsum',
      caption: 'A beautiful random image',
    })
  }

  const insertInlineMath = () => {
    editorRef.current?.dispatchCommand(INSERT_KATEX_INLINE_COMMAND, 'E = mc^2')
  }

  const insertBlockMath = () => {
    editorRef.current?.dispatchCommand(
      INSERT_KATEX_BLOCK_COMMAND,
      '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
    )
  }

  const insertAlert = (type: AlertType) => {
    editorRef.current?.dispatchCommand(INSERT_ALERT_COMMAND, type)
  }

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
          <span className="toolbar-label">Insert</span>
          <button className="btn" onClick={insertImage}>
            Image
          </button>
          <button className="btn" onClick={insertInlineMath}>
            Inline Math
          </button>
          <button className="btn" onClick={insertBlockMath}>
            Block Math
          </button>
          <div className="dropdown">
            <button className="btn">Alert ...</button>
            <div className="dropdown-menu">
              {(
                [
                  'note',
                  'tip',
                  'important',
                  'warning',
                  'caution',
                ] as AlertType[]
              ).map((type) => (
                <button
                  key={type}
                  className="dropdown-item"
                  onClick={() => insertAlert(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
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
        />
      </Panel>

      {/* Renderer panel */}
      {showRenderer && editorState && (
        <Panel title="Renderer (readonly)" badge={variant}>
          <RichRenderer value={editorState} variant={variant} />
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
