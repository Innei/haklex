import type { ColorScheme } from '@haklex/rich-editor';

import { VariantPicker } from '../../components/VariantPicker';
import {
  Chip,
  InspectorSection,
  OptionButton,
  SwitchRow,
} from '../../components/workbench/Inspector';
import { extraMentionPlatforms } from '../../fixtures/extra-mention-platforms';

export interface ColorSet {
  accent: string;
  bg: string;
  text: string;
}

export interface ColorPreset {
  dark: ColorSet;
  label: string;
  light: ColorSet;
}

interface EditorInspectorProps {
  customAccent: string;
  enabledPlatforms: Set<string>;
  onCustomAccent: (value: string) => void;
  onSelectPreset: (label: string) => void;
  onShowRendererChange: (show: boolean) => void;
  onTogglePlatform: (key: string) => void;
  onVirtualizationChange: (enabled: boolean) => void;
  presets: ColorPreset[];
  selectedPreset: string;
  showRenderer: boolean;
  theme: ColorScheme;
  virtualization: boolean;
}

export function EditorInspector({
  customAccent,
  enabledPlatforms,
  onCustomAccent,
  onShowRendererChange,
  onSelectPreset,
  onTogglePlatform,
  presets,
  selectedPreset,
  showRenderer,
  theme,
  virtualization,
  onVirtualizationChange,
}: EditorInspectorProps) {
  return (
    <>
      <InspectorSection title="Variant">
        <VariantPicker block />
      </InspectorSection>
      <InspectorSection title="Performance">
        <SwitchRow
          checked={virtualization}
          label="Virtual scrolling"
          onChange={onVirtualizationChange}
        />
        <p className="wb-section-text">Cross-window text selection is not yet supported.</p>
      </InspectorSection>

      <InspectorSection title="Colors">
        <div className="opt-list">
          {presets.map((preset) => {
            const colors = theme === 'dark' ? preset.dark : preset.light;
            return (
              <OptionButton
                key={preset.label}
                selected={!customAccent && selectedPreset === preset.label}
                onClick={() => onSelectPreset(preset.label)}
              >
                <span
                  className="swatch"
                  style={{
                    background: `linear-gradient(135deg, ${colors.bg || 'var(--rc-bg)'} 50%, ${colors.accent || 'var(--rc-accent)'} 50%)`,
                  }}
                />
                {preset.label}
              </OptionButton>
            );
          })}
        </div>
        <label className="color-row">
          Custom accent
          <input
            type="color"
            value={customAccent || '#171717'}
            onChange={(e) => onCustomAccent(e.target.value)}
          />
        </label>
      </InspectorSection>

      <InspectorSection title="Mention+">
        <div className="chip-row">
          {extraMentionPlatforms.map((p) => (
            <Chip
              key={p.key}
              selected={enabledPlatforms.has(p.key)}
              onClick={() => onTogglePlatform(p.key)}
            >
              {p.label}
            </Chip>
          ))}
        </div>
      </InspectorSection>

      <InspectorSection title="Preview">
        <SwitchRow
          checked={showRenderer}
          label="Readonly renderer below the editor"
          onChange={onShowRendererChange}
        />
      </InspectorSection>
    </>
  );
}
