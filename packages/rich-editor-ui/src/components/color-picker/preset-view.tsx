import { Plus } from 'lucide-react';
import type { KeyboardEvent } from 'react';

import { SegmentedControl } from '../segmented-control';
import type { ColorPreset } from './presets';
import { DEFAULT_COLOR, isDefaultColor, presetName, PRESETS } from './presets';
import type { ColorTarget } from './recent';
import * as css from './styles.css';

const GRID_COLUMNS = 8;

const TARGET_ITEMS: { label: string; value: ColorTarget }[] = [
  { label: 'Text', value: 'text' },
  { label: 'Background', value: 'background' },
];

interface PresetViewProps {
  current: string;
  onCustom: () => void;
  onPick: (value: string) => void;
  onTargetChange?: (target: ColorTarget) => void;
  recent: string[];
  target: ColorTarget;
}

function moveFocus(e: KeyboardEvent<HTMLDivElement>) {
  const step =
    e.key === 'ArrowRight'
      ? 1
      : e.key === 'ArrowLeft'
        ? -1
        : e.key === 'ArrowDown'
          ? GRID_COLUMNS
          : e.key === 'ArrowUp'
            ? -GRID_COLUMNS
            : 0;
  if (!step) return;
  const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button'));
  const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
  if (index === -1) return;
  const next = buttons[Math.max(0, Math.min(buttons.length - 1, index + step))];
  e.preventDefault();
  next?.focus();
}

function Swatch({
  current,
  onPick,
  preset,
  target,
}: {
  current: string;
  onPick: (value: string) => void;
  preset: ColorPreset;
  target: ColorTarget;
}) {
  const isDefault = preset.value === DEFAULT_COLOR;
  const pressed = isDefault ? isDefaultColor(current) : current === preset.value;
  return (
    <button
      aria-label={preset.name}
      aria-pressed={pressed}
      className={css.swatch}
      title={preset.name}
      type="button"
      onClick={() => onPick(preset.value)}
      onMouseDown={(e) => e.preventDefault()}
    >
      {isDefault ? (
        <span data-default-swatch className={`${css.swatchDot} ${css.defaultDot}`} />
      ) : target === 'background' ? (
        <span className={css.backgroundChip} style={{ backgroundColor: preset.value }}>
          A
        </span>
      ) : (
        <span className={css.swatchDot} style={{ backgroundColor: preset.value }} />
      )}
    </button>
  );
}

export function PresetView({
  current,
  onCustom,
  onPick,
  onTargetChange,
  recent,
  target,
}: PresetViewProps) {
  const presets: ColorPreset[] = [{ name: 'Default', value: DEFAULT_COLOR }, ...PRESETS[target]];

  return (
    <div className={css.presetView}>
      {onTargetChange && (
        <SegmentedControl fullWidth items={TARGET_ITEMS} value={target} onChange={onTargetChange} />
      )}

      <div className={css.section}>
        <div className={css.sectionLabel}>Theme colors</div>
        <div aria-label="Theme colors" className={css.grid} role="group" onKeyDown={moveFocus}>
          {presets.map((preset) => (
            <Swatch
              current={current}
              key={preset.value}
              preset={preset}
              target={target}
              onPick={onPick}
            />
          ))}
        </div>
      </div>

      {recent.length > 0 && (
        <div className={css.section}>
          <div className={css.sectionLabel}>Recent</div>
          <div aria-label="Recent colors" className={css.grid} role="group" onKeyDown={moveFocus}>
            {recent.map((value) => (
              <Swatch
                current={current}
                key={value}
                preset={{ name: presetName(target, value), value }}
                target={target}
                onPick={onPick}
              />
            ))}
          </div>
        </div>
      )}

      <div className={css.footer}>
        <button
          aria-label="Custom color"
          className={css.footerButton}
          type="button"
          onClick={onCustom}
          onMouseDown={(e) => e.preventDefault()}
        >
          <Plus className={css.footerIcon} />
          Custom…
        </button>
      </div>
    </div>
  );
}
