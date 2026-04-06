import { ShiroEditor, ShiroRenderer } from '@haklex/rich-kit-shiro';
import type { SerializedEditorState } from 'lexical';
import { useCallback, useState } from 'react';

import { JsonViewer } from '../components/JsonViewer';
import { useTheme } from '../context/ThemeContext';
import { nodeSamples } from '../fixtures';

type Filter = 'all' | 'inline' | 'block' | 'container';

const variant = 'article' as const;

export function NodeShowcase() {
  const theme = useTheme();
  const [filter, setFilter] = useState<Filter>('all');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [editModeKeys, setEditModeKeys] = useState<Set<string>>(new Set());
  const [liveStateByKey, setLiveStateByKey] = useState<Record<string, SerializedEditorState>>({});

  const filtered =
    filter === 'all' ? nodeSamples : nodeSamples.filter((n) => n.category === filter);

  const counts = {
    all: nodeSamples.length,
    inline: nodeSamples.filter((n) => n.category === 'inline').length,
    block: nodeSamples.filter((n) => n.category === 'block').length,
    container: nodeSamples.filter((n) => n.category === 'container').length,
  };

  const handleEditorChange = useCallback((key: string, state: SerializedEditorState) => {
    setLiveStateByKey((prev) => ({ ...prev, [key]: state }));
  }, []);

  const toggleEditMode = useCallback((key: string) => {
    setEditModeKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'inline', label: 'Inline' },
    { key: 'block', label: 'Block' },
    { key: 'container', label: 'Container' },
  ];

  return (
    <div className="page">
      <div className="nodes-page-header">
        <h1 className="nodes-page-title">Nodes</h1>
        <p className="nodes-page-desc">
          Every custom node type in the editor — live preview, serialization, and editable toggle.
        </p>
      </div>

      <div className="nodes-filter-bar">
        {filters.map((f) => (
          <button
            key={f.key}
            className={
              filter === f.key ? 'nodes-filter-pill nodes-filter-pill-active' : 'nodes-filter-pill'
            }
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className="nodes-filter-count">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      <div className="nodes-grid">
        {filtered.map((sample) => {
          const isExpanded = expandedKey === sample.key;
          const isEdit = editModeKeys.has(sample.key);
          const jsonData = isEdit ? (liveStateByKey[sample.key] ?? sample.data) : sample.data;

          return (
            <div
              className={`node-card${isExpanded ? ' node-card-expanded' : ''}`}
              key={sample.key}
              onClick={() => setExpandedKey(isExpanded ? null : sample.key)}
            >
              <div className="node-card-body">
                <div className="node-card-top">
                  <div className="node-card-name">{sample.label}</div>
                  <span className="node-card-type">{sample.category}</span>
                </div>
                <div className="node-card-desc">{sample.description}</div>
                <div className="node-card-preview">
                  {isEdit ? (
                    <ShiroEditor
                      initialValue={sample.data}
                      key={`${sample.key}-edit`}
                      theme={theme}
                      variant={variant}
                      onChange={(state) => handleEditorChange(sample.key, state)}
                    />
                  ) : (
                    <ShiroRenderer theme={theme} value={sample.data} variant={variant} />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="node-card-detail" onClick={(e) => e.stopPropagation()}>
                  <JsonViewer data={jsonData} defaultExpanded={false} />
                  <div className="node-detail-actions">
                    <button
                      className={!isEdit ? 'btn btn-active' : 'btn'}
                      onClick={() => {
                        if (isEdit) toggleEditMode(sample.key);
                      }}
                    >
                      Readonly
                    </button>
                    <button
                      className={isEdit ? 'btn btn-active' : 'btn'}
                      onClick={() => {
                        if (!isEdit) toggleEditMode(sample.key);
                      }}
                    >
                      Editable
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
