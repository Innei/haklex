import '@haklex/rich-diff/style.css';

import { RichDiff } from '@haklex/rich-diff';
import type { RichEditorVariant } from '@haklex/rich-editor';
import { RichRenderer } from '@haklex/rich-static-renderer';
import { useState } from 'react';

import { Panel } from '../components/Panel';
import { useTheme } from '../context/ThemeContext';
import { diffSamples } from '../fixtures/diff-samples';

export function DiffPage() {
  const theme = useTheme();
  const [variant, setVariant] = useState<RichEditorVariant>('comment');
  const [selectedKey, setSelectedKey] = useState(diffSamples[0].key);

  const selected = diffSamples.find((s) => s.key === selectedKey) || diffSamples[0];

  return (
    <div className="page">
      <div className="toolbar">
        <div className="toolbar-group">
          <span className="toolbar-label">Sample</span>
          {diffSamples.map((sample) => (
            <button
              className={selectedKey === sample.key ? 'btn btn-active' : 'btn'}
              key={sample.key}
              title={sample.description}
              onClick={() => setSelectedKey(sample.key)}
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

      <Panel badge={`${selected.label} · ${variant} · ${theme}`} title="Side-by-Side Diff">
        <RichDiff
          className={theme === 'dark' ? 'rich-diff-dark' : ''}
          key={selected.key}
          newValue={selected.newValue}
          oldValue={selected.oldValue}
          theme={theme}
          variant={variant}
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
            theme={theme}
            value={selected.oldValue}
            variant={variant}
          />
        </Panel>
        <Panel title="New">
          <RichRenderer
            key={`${selected.key}-new`}
            theme={theme}
            value={selected.newValue}
            variant={variant}
          />
        </Panel>
      </div>
    </div>
  );
}
