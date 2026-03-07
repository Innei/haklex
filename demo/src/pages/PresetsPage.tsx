import type { RichEditorVariant } from '@haklex/rich-editor';
import { MentionPlatformProvider, ShiroEditor, ShiroRenderer } from '@haklex/rich-kit-shiro';
import type { SerializedEditorState } from 'lexical';
import { useCallback, useEffect, useState } from 'react';

import { JsonViewer } from '../components/JsonViewer';
import { Panel } from '../components/Panel';
import { useTheme } from '../context/ThemeContext';
import { presets } from '../fixtures';
import { allExtraPlatformMeta } from '../fixtures/extra-mention-platforms';

const validPresetKeys = new Set(presets.map((p) => p.key));
const validVariants = new Set<RichEditorVariant>(['article', 'comment', 'note']);
const validModes = new Set(['edit', 'readonly'] as const);

function getInitialState() {
  const params = new URLSearchParams(window.location.search);
  const preset = params.get('preset');
  const variant = params.get('variant') as RichEditorVariant | null;
  const mode = params.get('mode') as 'edit' | 'readonly' | null;
  return {
    selectedKey: preset && validPresetKeys.has(preset) ? preset : presets[0].key,
    variant: variant && validVariants.has(variant) ? variant : ('article' as RichEditorVariant),
    mode: mode && validModes.has(mode) ? mode : ('edit' as 'edit' | 'readonly'),
  };
}

function updateSearchParams(key: string, value: string) {
  const params = new URLSearchParams(window.location.search);
  params.set(key, value);
  const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
  window.history.replaceState(null, '', newUrl);
}

export function PresetsPage() {
  const theme = useTheme();
  const [initial] = useState(getInitialState);
  const [selectedKey, _setSelectedKey] = useState(initial.selectedKey);
  const [variant, _setVariant] = useState<RichEditorVariant>(initial.variant);
  const [mode, _setMode] = useState<'edit' | 'readonly'>(initial.mode);
  const [liveState, setLiveState] = useState<SerializedEditorState | null>(null);

  const setSelectedKey = useCallback((key: string) => {
    _setSelectedKey(key);
    updateSearchParams('preset', key);
  }, []);

  const setVariant = useCallback((v: RichEditorVariant) => {
    _setVariant(v);
    updateSearchParams('variant', v);
  }, []);

  const setMode = useCallback((m: 'edit' | 'readonly') => {
    _setMode(m);
    updateSearchParams('mode', m);
  }, []);

  const selected = presets.find((p) => p.key === selectedKey) || presets[0];
  const jsonData = mode === 'edit' ? (liveState ?? selected.data) : selected.data;

  useEffect(() => {
    setLiveState(null);
  }, [selectedKey]);

  return (
    <MentionPlatformProvider platforms={allExtraPlatformMeta}>
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
                    selectedKey === preset.key ? 'preset-item preset-item-active' : 'preset-item'
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
                <span className="toolbar-label">Mode</span>
                <button
                  className={mode === 'edit' ? 'btn btn-active' : 'btn'}
                  onClick={() => setMode('edit')}
                >
                  Edit
                </button>
                <button
                  className={mode === 'readonly' ? 'btn btn-active' : 'btn'}
                  onClick={() => setMode('readonly')}
                >
                  Readonly
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

            {/* Renderer */}
            <Panel badge={`${variant} · ${mode}`} title={selected.label}>
              {mode === 'edit' ? (
                <ShiroEditor
                  initialValue={selected.data}
                  key={`${selected.key}-edit`}
                  theme={theme}
                  variant={variant}
                  onChange={setLiveState}
                />
              ) : (
                <ShiroRenderer
                  key={`${selected.key}-readonly`}
                  theme={theme}
                  value={selected.data}
                  variant={variant}
                />
              )}
            </Panel>

            {/* JSON */}
            <Panel title="Serialized JSON">
              <JsonViewer data={jsonData} defaultExpanded={false} />
            </Panel>
          </div>
        </div>
      </div>
    </MentionPlatformProvider>
  );
}
