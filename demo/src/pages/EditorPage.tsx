import {
  type NestedDocDialogEditorProps,
  NestedDocDialogEditorProvider,
  NestedDocPlugin,
} from '@haklex/rich-ext-nested-doc';
import { ToolbarPlugin } from '@haklex/rich-plugin-toolbar';
import { MentionPlatformProvider } from '@haklex/rich-renderer-mention/static';
import { createThemeStyle } from '@haklex/rich-style-token';
import type { SerializedEditorState } from 'lexical';
import { use, useCallback, useMemo, useState } from 'react';

import { Panel } from '../components/Panel';
import { VariantPicker } from '../components/VariantPicker';
import { useTheme } from '../context/ThemeContext';
import { VariantContext } from '../context/VariantContext';
import { extraMentionPlatforms } from '../fixtures/extra-mention-platforms';
import { initialContent } from '../fixtures/initial-content';
import { LexicalEditor, LexicalRenderer } from '../lexical';

interface ColorSet {
  accent: string;
  bg: string;
  text: string;
}

interface ColorPreset {
  dark: ColorSet;
  label: string;
  light: ColorSet;
}

const insertItemOrder = [
  'Image',
  'Code Block',
  'Table',
  'Link Card',
  'Callout',
  'Banner',
  'Gallery',
  'Video',
  'Mermaid Diagram',
  'Code Snippet',
  'Embed',
  'Whiteboard',
  'Nested Document',
];

const emptyColors: ColorSet = { accent: '', text: '', bg: '' };

const colorOverridePresets: ColorPreset[] = [
  { label: 'Default', light: emptyColors, dark: emptyColors },
  {
    label: 'Ink',
    light: { accent: '#171717', text: '#0a0a0a', bg: '#fafafa' },
    dark: { accent: '#e5e5e5', text: '#fafafa', bg: '#171717' },
  },
  {
    label: 'Ash',
    light: { accent: '#525252', text: '#262626', bg: '#f5f5f5' },
    dark: { accent: '#a3a3a3', text: '#d4d4d4', bg: '#1a1a1a' },
  },
  {
    label: 'Silver',
    light: { accent: '#737373', text: '#404040', bg: '#ffffff' },
    dark: { accent: '#a3a3a3', text: '#d4d4d4', bg: '#0a0a0a' },
  },
  {
    label: 'Chalk',
    light: { accent: '#a3a3a3', text: '#525252', bg: '#fafafa' },
    dark: { accent: '#737373', text: '#a3a3a3', bg: '#0a0a0a' },
  },
];

function NestedDocDialogEditor({ initialValue, onEditorReady }: NestedDocDialogEditorProps) {
  return (
    <LexicalEditor
      header={<ToolbarPlugin insertItemOrder={insertItemOrder} maxVisibleInsertItems={5} />}
      initialValue={initialValue}
      onEditorReady={onEditorReady}
    />
  );
}

export function EditorPage() {
  const variant = use(VariantContext);
  const theme = useTheme();
  const [editorState, setEditorState] = useState<SerializedEditorState | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [showRenderer, setShowRenderer] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('Default');
  const [customAccent, setCustomAccent] = useState('');
  const [enabledPlatforms, setEnabledPlatforms] = useState<Set<string>>(new Set());

  const activePlatforms = useMemo(
    () => extraMentionPlatforms.filter((p) => enabledPlatforms.has(p.key)),
    [enabledPlatforms],
  );

  const togglePlatform = useCallback((key: string) => {
    setEnabledPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const extraPlatformMeta = useMemo(() => {
    const map: Record<
      string,
      { label: string; icon: React.ReactNode; getUrl: (h: string) => string }
    > = {};
    for (const p of activePlatforms) {
      map[p.key] = { label: p.label, icon: p.icon, getUrl: p.getUrl };
    }
    return map;
  }, [activePlatforms]);

  const themeOverrideStyle = useMemo(() => {
    if (customAccent) {
      return createThemeStyle({
        color: {
          accent: customAccent,
          link: customAccent,
          accentLight: `${customAccent}33`,
          quoteBorder: customAccent,
        },
      });
    }
    const preset = colorOverridePresets.find((p) => p.label === selectedPreset);
    if (!preset) return;
    const colors = theme === 'dark' ? preset.dark : preset.light;
    if (!colors.accent) return;
    const overrides: Record<string, string> = {
      accent: colors.accent,
      link: colors.accent,
      accentLight: `${colors.accent}33`,
      quoteBorder: colors.accent,
    };
    if (colors.text) overrides.text = colors.text;
    if (colors.bg) overrides.bg = colors.bg;
    return createThemeStyle({ color: overrides });
  }, [selectedPreset, customAccent, theme]);

  const handleChange = useCallback((state: SerializedEditorState) => {
    setEditorState(state);
  }, []);

  const handleImport = useCallback(() => {
    try {
      const parsed = JSON.parse(importJson) as SerializedEditorState;
      if (parsed.root) {
        setEditorState(parsed);
        setShowImport(false);
        setImportJson('');
      }
    } catch {
      // invalid JSON
    }
  }, [importJson]);

  return (
    <NestedDocDialogEditorProvider value={NestedDocDialogEditor}>
      <MentionPlatformProvider platforms={extraPlatformMeta}>
        <div className="page">
          {/* Toolbar */}
          <div className="toolbar">
            <VariantPicker />
            <div className="toolbar-group">
              <span className="toolbar-label">Colors</span>
              {colorOverridePresets.map((preset) => {
                const colors = theme === 'dark' ? preset.dark : preset.light;
                return (
                  <button
                    key={preset.label}
                    className={
                      !customAccent && selectedPreset === preset.label ? 'btn btn-active' : 'btn'
                    }
                    onClick={() => {
                      setSelectedPreset(preset.label);
                      setCustomAccent('');
                    }}
                  >
                    {colors.accent && (
                      <span
                        style={{
                          display: 'inline-block',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: colors.accent,
                          marginRight: 4,
                          verticalAlign: 'middle',
                        }}
                      />
                    )}
                    {preset.label}
                  </button>
                );
              })}
              <label
                className={customAccent ? 'btn btn-active' : 'btn'}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                Custom
                <input
                  style={{ width: 20, height: 20, border: 'none', padding: 0 }}
                  type="color"
                  value={customAccent || '#171717'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCustomAccent(e.target.value)
                  }
                />
              </label>
            </div>

            <div className="toolbar-group">
              <span className="toolbar-label">Mention+</span>
              {extraMentionPlatforms.map((p) => (
                <button
                  className={enabledPlatforms.has(p.key) ? 'btn btn-active' : 'btn'}
                  key={p.key}
                  onClick={() => togglePlatform(p.key)}
                >
                  {p.label}
                </button>
              ))}
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
              <button
                className={showImport ? 'btn btn-active' : 'btn'}
                onClick={() => setShowImport((v) => !v)}
              >
                Import
              </button>
            </div>
          </div>

          {/* Editor panel */}
          <Panel badge={variant} bodyStyle={{ padding: 0 }} title="Editor">
            <LexicalEditor
              autoFocus
              extraMentionPlatforms={activePlatforms.length > 0 ? activePlatforms : undefined}
              header={<ToolbarPlugin insertItemOrder={insertItemOrder} maxVisibleInsertItems={5} />}
              initialValue={initialContent}
              placeholder="Start typing... Try markdown shortcuts like # heading, **bold**, *italic*, > quote, ||spoiler||"
              style={themeOverrideStyle}
              theme={theme}
              variant={variant}
              onChange={handleChange}
              onSubmit={() => console.info('[Submit] Cmd/Ctrl+Enter pressed')}
            >
              <NestedDocPlugin />
            </LexicalEditor>
          </Panel>

          {/* Renderer panel */}
          {showRenderer && (
            <Panel badge={variant} title="Renderer (readonly)">
              <LexicalRenderer
                style={themeOverrideStyle}
                theme={theme}
                value={editorState ?? initialContent}
                variant={variant}
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
                    navigator.clipboard.writeText(JSON.stringify(editorState, null, 2));
                  }}
                >
                  Copy
                </button>
              }
            >
              <pre className="json-pre">{JSON.stringify(editorState, null, 2)}</pre>
            </Panel>
          )}

          {/* Import panel */}
          {showImport && (
            <Panel title="Import JSON">
              <textarea
                className="import-textarea"
                placeholder="Paste serialized EditorState JSON here..."
                rows={8}
                value={importJson}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setImportJson(e.target.value)
                }
              />
              <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                <button className="btn btn-active" onClick={handleImport}>
                  Load
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setShowImport(false);
                    setImportJson('');
                  }}
                >
                  Cancel
                </button>
              </div>
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
              <code>++underline++</code>
              <code>~~strikethrough~~</code>
              <code>`inline code`</code>
              <code>&gt; blockquote</code>
              <code>&gt; [!NOTE]</code>
              <code>- list item</code>
              <code>- [ ] task</code>
              <code>- [x] done</code>
              <code>1. ordered list</code>
              <code>---</code>
              <code>||spoiler||</code>
              <code>[^1] footnote</code>
              <code>{'$E=mc^2$'}</code>
              <code>{'$$\\int f(x)dx$$'}</code>
              <code>{'{GH@username}'}</code>
              <code>::: warning</code>
              <code>/ slash commands</code>
            </div>
          </div>
        </div>
      </MentionPlatformProvider>
    </NestedDocDialogEditorProvider>
  );
}
