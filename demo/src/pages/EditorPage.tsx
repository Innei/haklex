import { EditorSurfacePlugins } from '@haklex/rich-editor';
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
import { JsonPanel } from '../components/workbench/JsonPanel';
import { PanelTabs } from '../components/workbench/PanelTabs';
import { Workbench } from '../components/workbench/Workbench';
import { useTheme } from '../context/ThemeContext';
import { VariantContext } from '../context/VariantContext';
import { extraMentionPlatforms } from '../fixtures/extra-mention-platforms';
import { initialContent } from '../fixtures/initial-content';
import { LexicalEditor, LexicalRenderer } from '../lexical';
import type { ColorPreset, ColorSet } from './editor/EditorInspector';
import { EditorInspector } from './editor/EditorInspector';
import { ImportPanel } from './editor/ImportPanel';

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

type SideTab = 'inspector' | 'json' | 'import';

const sideTabs: { label: string; value: SideTab }[] = [
  { label: 'Inspector', value: 'inspector' },
  { label: 'JSON', value: 'json' },
  { label: 'Import', value: 'import' },
];

export function EditorPage() {
  const [virtualization, setVirtualization] = useState(false);
  const variant = use(VariantContext);
  const theme = useTheme();
  const [editorState, setEditorState] = useState<SerializedEditorState | null>(null);
  const [showRenderer, setShowRenderer] = useState(true);
  const [sideTab, setSideTab] = useState<SideTab>('inspector');
  const [source, setSource] = useState({ value: initialContent, version: 0 });
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
  const handleVirtualizationChange = useCallback((enabled: boolean) => {
    setVirtualization(enabled);
    if (enabled) setShowRenderer(false);
  }, []);

  const handleLoad = useCallback((state: SerializedEditorState) => {
    setSource((prev) => ({ value: state, version: prev.version + 1 }));
    setEditorState(state);
  }, []);

  return (
    <NestedDocDialogEditorProvider value={NestedDocDialogEditor}>
      <MentionPlatformProvider platforms={extraPlatformMeta}>
        <Workbench
          meta={<span className="badge">{variant}</span>}
          panelLabel="Editor tools"
          panelWidth={sideTab === 'inspector' ? 300 : 440}
          title="Editor"
          panel={
            <>
              <PanelTabs
                label="Editor tools"
                tabs={sideTabs}
                value={sideTab}
                onChange={setSideTab}
              />
              {sideTab === 'inspector' && (
                <EditorInspector
                  customAccent={customAccent}
                  enabledPlatforms={enabledPlatforms}
                  presets={colorOverridePresets}
                  selectedPreset={selectedPreset}
                  showRenderer={showRenderer}
                  theme={theme}
                  virtualization={virtualization}
                  onCustomAccent={setCustomAccent}
                  onShowRendererChange={setShowRenderer}
                  onTogglePlatform={togglePlatform}
                  onVirtualizationChange={handleVirtualizationChange}
                  onSelectPreset={(label) => {
                    setSelectedPreset(label);
                    setCustomAccent('');
                  }}
                />
              )}
              {sideTab === 'json' && (
                <JsonPanel
                  data={editorState ?? source.value}
                  note="Live EditorState. Updates as you type."
                />
              )}
              {sideTab === 'import' && <ImportPanel onLoad={handleLoad} />}
            </>
          }
        >
          <LexicalEditor
            autoFocus
            extraMentionPlatforms={activePlatforms.length > 0 ? activePlatforms : undefined}
            initialValue={source.value}
            key={`editor-${source.version}`}
            placeholder="Start typing... Try markdown shortcuts like # heading, **bold**, *italic*, > quote, ||spoiler||"
            style={themeOverrideStyle}
            theme={theme}
            variant={variant}
            virtualization={virtualization}
            header={
              <ToolbarPlugin
                className="wb-toolbar"
                insertItemOrder={insertItemOrder}
                maxVisibleInsertItems={5}
              />
            }
            onChange={handleChange}
            onSubmit={() => console.info('[Submit] Cmd/Ctrl+Enter pressed')}
          >
            <EditorSurfacePlugins>
              <NestedDocPlugin />
            </EditorSurfacePlugins>
          </LexicalEditor>

          <div className="wb-extra">
            {showRenderer && (
              <Panel badge={variant} title="Renderer (readonly)">
                <LexicalRenderer
                  style={themeOverrideStyle}
                  theme={theme}
                  value={editorState ?? source.value}
                  variant={variant}
                />
              </Panel>
            )}

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
        </Workbench>
      </MentionPlatformProvider>
    </NestedDocDialogEditorProvider>
  );
}
