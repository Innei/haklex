import { useState } from 'react'

import { RichRenderer } from '../../src/components/RichRenderer'
import type { RichEditorVariant } from '../../src/types'
import { JsonViewer } from '../components/JsonViewer'
import { Panel } from '../components/Panel'
import { presets } from '../fixtures'

export function PresetsPage() {
  const [selectedKey, setSelectedKey] = useState(presets[0].key)
  const [variant, setVariant] = useState<RichEditorVariant>('article')

  const selected = presets.find((p) => p.key === selectedKey) || presets[0]

  return (
    <div className="page">
      <div className="presets-layout">
        {/* Sidebar */}
        <aside className="presets-sidebar">
          <h3>Presets</h3>
          <div className="presets-list">
            {presets.map((preset) => (
              <button
                key={preset.key}
                className={
                  selectedKey === preset.key
                    ? 'preset-item preset-item-active'
                    : 'preset-item'
                }
                onClick={() => setSelectedKey(preset.key)}
              >
                <div className="preset-item-label">{preset.label}</div>
                <div className="preset-item-desc">{preset.description}</div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div className="presets-main">
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
          </div>

          {/* Renderer */}
          <Panel title={selected.label} badge={variant}>
            <RichRenderer value={selected.data} variant={variant} />
          </Panel>

          {/* JSON */}
          <Panel title="Serialized JSON">
            <JsonViewer data={selected.data} defaultExpanded={false} />
          </Panel>
        </div>
      </div>
    </div>
  )
}
