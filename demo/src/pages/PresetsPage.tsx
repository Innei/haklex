import { MentionPlatformProvider } from '@haklex/rich-renderer-mention/static';
import type { SerializedEditorState } from 'lexical';
import { use, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Segmented } from '../components/ui/Segmented';
import { VariantPicker } from '../components/VariantPicker';
import { InspectorSection, SwitchRow } from '../components/workbench/Inspector';
import { JsonPanel } from '../components/workbench/JsonPanel';
import { PanelTabs } from '../components/workbench/PanelTabs';
import { Workbench } from '../components/workbench/Workbench';
import { useTheme } from '../context/ThemeContext';
import { VariantContext } from '../context/VariantContext';
import { presets } from '../fixtures';
import { allExtraPlatformMeta } from '../fixtures/extra-mention-platforms';
import { LexicalEditor, LexicalRenderer } from '../lexical';
import { readingContent } from '../lexical/reading-content.css';

type Mode = 'edit' | 'readonly';

const modeOptions = [
  { value: 'edit' as const, label: 'Edit' },
  { value: 'readonly' as const, label: 'Render' },
];

export function PresetsPage() {
  const variant = use(VariantContext);
  const theme = useTheme();
  const [params, setParams] = useSearchParams();
  const [sideTab, setSideTab] = useState<'inspector' | 'json'>('inspector');
  const [liveState, setLiveState] = useState<{ key: string; state: SerializedEditorState }>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizationOptions = useMemo(() => ({ scrollContainer: scrollRef }), []);

  const selected = presets.find((p) => p.key === params.get('preset')) ?? presets[0];
  const mode: Mode = params.get('mode') === 'readonly' ? 'readonly' : 'edit';
  const virtualization = params.has('virtualization')
    ? params.get('virtualization') === 'true'
    : (selected.virtualization ?? false);
  const live = liveState?.key === selected.key ? liveState.state : undefined;
  const jsonData = mode === 'edit' ? (live ?? selected.data) : selected.data;

  const setOption = (name: string, value: string) => {
    setParams(
      (prev) => {
        const nextParams = new URLSearchParams(prev);
        nextParams.set(name, value);
        return nextParams;
      },
      { replace: true },
    );
  };

  return (
    <MentionPlatformProvider platforms={allExtraPlatformMeta}>
      <Workbench
        panelLabel="Preset tools"
        panelWidth={sideTab === 'inspector' ? 300 : 440}
        scrollRef={scrollRef}
        title={selected.label}
        meta={
          <span className="badge">{`${variant} · ${mode === 'edit' ? 'edit' : 'render'}`}</span>
        }
        panel={
          <>
            <PanelTabs
              label="Preset tools"
              value={sideTab}
              tabs={[
                { label: 'Inspector', value: 'inspector' },
                { label: 'JSON', value: 'json' },
              ]}
              onChange={setSideTab}
            />
            {sideTab === 'json' && (
              <JsonPanel
                data={jsonData}
                note={
                  mode === 'edit' ? 'Live EditorState. Updates as you type.' : 'Preset EditorState.'
                }
              />
            )}
            {sideTab === 'inspector' && (
              <>
                <InspectorSection title="Preset">
                  <p className="wb-section-text">{selected.description}</p>
                </InspectorSection>
                <InspectorSection title="Variant">
                  <VariantPicker block />
                </InspectorSection>
                <InspectorSection title="Mode">
                  <Segmented
                    block
                    label="Mode"
                    options={modeOptions}
                    value={mode}
                    onChange={(next) => setOption('mode', next)}
                  />
                </InspectorSection>
                <InspectorSection title="Performance">
                  <SwitchRow
                    checked={virtualization}
                    label="Virtual scrolling"
                    onChange={(enabled) => setOption('virtualization', String(enabled))}
                  />
                </InspectorSection>
              </>
            )}
          </>
        }
      >
        {mode === 'edit' ? (
          <LexicalEditor
            initialValue={selected.data}
            key={`${selected.key}-edit`}
            theme={theme}
            variant={variant}
            virtualization={virtualization ? virtualizationOptions : false}
            onChange={(state) => setLiveState({ key: selected.key, state })}
          />
        ) : (
          <LexicalRenderer
            className={readingContent}
            key={`${selected.key}-readonly`}
            theme={theme}
            value={selected.data}
            variant={variant}
            virtualization={virtualization ? virtualizationOptions : false}
          />
        )}
      </Workbench>
    </MentionPlatformProvider>
  );
}
