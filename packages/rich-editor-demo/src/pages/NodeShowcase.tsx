import type { RichEditorVariant } from '@haklex/rich-editor'
import { ShiroEditor, ShiroRenderer } from '@haklex/rich-kit-shiro'
import type { SerializedEditorState } from 'lexical'
import { useCallback, useState } from 'react'

import { JsonViewer } from '../components/JsonViewer'
import { Panel } from '../components/Panel'
import { useTheme } from '../context/ThemeContext'
import { nodeSamples } from '../fixtures'

export function NodeShowcase() {
  const theme = useTheme()
  const [variant, setVariant] = useState<RichEditorVariant>('article')
  const [mode, setMode] = useState<'edit' | 'readonly'>('readonly')
  const [liveStateByKey, setLiveStateByKey] = useState<
    Record<string, SerializedEditorState>
  >({})

  const handleEditorChange = useCallback(
    (key: string, state: SerializedEditorState) => {
      setLiveStateByKey((prev) => ({ ...prev, [key]: state }))
    },
    [],
  )

  const inlineNodes = nodeSamples.filter((n) => n.category === 'inline')
  const blockNodes = nodeSamples.filter((n) => n.category === 'block')
  const containerNodes = nodeSamples.filter((n) => n.category === 'container')

  return (
    <div className="page">
      <div className="showcase-intro">
        <h2>Node Showcase</h2>
        <p>
          All custom node types rendered individually with their DSL
          definitions, including Ruby annotations for Japanese furigana.
        </p>
      </div>

      <div className="toolbar">
        <div className="toolbar-group">
          <span className="toolbar-label">Mode</span>
          <button
            className={mode === 'readonly' ? 'btn btn-active' : 'btn'}
            onClick={() => setMode('readonly')}
          >
            Readonly
          </button>
          <button
            className={mode === 'edit' ? 'btn btn-active' : 'btn'}
            onClick={() => setMode('edit')}
          >
            Edit
          </button>
        </div>
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
          <button
            className={variant === 'note' ? 'btn btn-active' : 'btn'}
            onClick={() => setVariant('note')}
          >
            Note
          </button>
        </div>
      </div>

      {/* Inline Nodes */}
      <section className="showcase-section">
        <h3 className="showcase-section-title">Inline Nodes</h3>
        <div className="showcase-grid">
          {inlineNodes.map((sample) => (
            <Panel
              key={sample.key}
              title={sample.label}
              badge={sample.category}
            >
              <p className="node-description">{sample.description}</p>
              <div className="node-render">
                {mode === 'edit' ? (
                  <ShiroEditor
                    key={`${sample.key}-edit`}
                    initialValue={sample.data}
                    variant={variant}
                    theme={theme}
                    onChange={(state) => handleEditorChange(sample.key, state)}
                  />
                ) : (
                  <ShiroRenderer
                    value={sample.data}
                    variant={variant}
                    theme={theme}
                  />
                )}
              </div>
              <JsonViewer
                data={
                  mode === 'edit'
                    ? (liveStateByKey[sample.key] ?? sample.data)
                    : sample.data
                }
              />
            </Panel>
          ))}
        </div>
      </section>

      {/* Block Nodes */}
      <section className="showcase-section">
        <h3 className="showcase-section-title">Block Nodes</h3>
        <div className="showcase-grid">
          {blockNodes.map((sample) => (
            <Panel
              key={sample.key}
              title={sample.label}
              badge={sample.category}
            >
              <p className="node-description">{sample.description}</p>
              <div className="node-render">
                {mode === 'edit' ? (
                  <ShiroEditor
                    key={`${sample.key}-edit`}
                    initialValue={sample.data}
                    variant={variant}
                    theme={theme}
                    onChange={(state) => handleEditorChange(sample.key, state)}
                  />
                ) : (
                  <ShiroRenderer
                    value={sample.data}
                    variant={variant}
                    theme={theme}
                  />
                )}
              </div>
              <JsonViewer
                data={
                  mode === 'edit'
                    ? (liveStateByKey[sample.key] ?? sample.data)
                    : sample.data
                }
              />
            </Panel>
          ))}
        </div>
      </section>

      {/* Container Nodes */}
      <section className="showcase-section">
        <h3 className="showcase-section-title">Container Nodes</h3>
        <div className="showcase-grid">
          {containerNodes.map((sample) => (
            <Panel
              key={sample.key}
              title={sample.label}
              badge={sample.category}
            >
              <p className="node-description">{sample.description}</p>
              <div className="node-render">
                {mode === 'edit' ? (
                  <ShiroEditor
                    key={`${sample.key}-edit`}
                    initialValue={sample.data}
                    variant={variant}
                    theme={theme}
                    onChange={(state) => handleEditorChange(sample.key, state)}
                  />
                ) : (
                  <ShiroRenderer
                    value={sample.data}
                    variant={variant}
                    theme={theme}
                  />
                )}
              </div>
              <JsonViewer
                data={
                  mode === 'edit'
                    ? (liveStateByKey[sample.key] ?? sample.data)
                    : sample.data
                }
              />
            </Panel>
          ))}
        </div>
      </section>
    </div>
  )
}
