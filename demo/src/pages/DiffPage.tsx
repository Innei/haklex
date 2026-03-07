import '@haklex/rich-diff/style.css'

import { RichDiff } from '@haklex/rich-diff'
import type { RichEditorVariant } from '@haklex/rich-editor'
import { RichRenderer } from '@haklex/rich-static-renderer'
import { useState } from 'react'

import { Panel } from '../components/Panel'
import { useTheme } from '../context/ThemeContext'
import { diffSamples } from '../fixtures/diff-samples'

export function DiffPage() {
  const theme = useTheme()
  const [variant, setVariant] = useState<RichEditorVariant>('comment')
  const [selectedKey, setSelectedKey] = useState(diffSamples[0].key)

  const selected =
    diffSamples.find((s) => s.key === selectedKey) || diffSamples[0]

  return (
    <div className="page">
      <div className="toolbar">
        <div className="toolbar-group">
          <span className="toolbar-label">Sample</span>
          {diffSamples.map((sample) => (
            <button
              key={sample.key}
              className={selectedKey === sample.key ? 'btn btn-active' : 'btn'}
              onClick={() => setSelectedKey(sample.key)}
              title={sample.description}
            >
              {sample.label}
            </button>
          ))}
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
        </div>
      </div>

      <Panel
        title="Side-by-Side Diff"
        badge={`${selected.label} · ${variant} · ${theme}`}
      >
        <RichDiff
          key={selected.key}
          oldValue={selected.oldValue}
          newValue={selected.newValue}
          variant={variant}
          theme={theme}
          className={theme === 'dark' ? 'rich-diff-dark' : ''}
        />
      </Panel>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginTop: 16,
        }}
      >
        <Panel title="Old">
          <RichRenderer
            key={`${selected.key}-old`}
            value={selected.oldValue}
            variant={variant}
            theme={theme}
          />
        </Panel>
        <Panel title="New">
          <RichRenderer
            key={`${selected.key}-new`}
            value={selected.newValue}
            variant={variant}
            theme={theme}
          />
        </Panel>
      </div>
    </div>
  )
}
