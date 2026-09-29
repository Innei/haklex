import type { FC } from 'react';
import { useState } from 'react';

import type { ImageSize } from './resize';
import { canShrinkTo, LONG_EDGE_PRESETS, scaleToLongEdge } from './resize';
import * as css from './styles.css';

const CUSTOM = 'custom';

type SizeMode = 'original' | 'preset' | 'custom';

export function useOutputSize(size: ImageSize | null) {
  const [mode, setMode] = useState<SizeMode>('original');
  const [presetEdge, setPresetEdge] = useState<number | null>(null);
  const [customEdge, setCustomEdge] = useState('');
  const requested = mode === 'custom' ? Number(customEdge) : presetEdge;
  const maxLongEdge = requested && size && canShrinkTo(size, requested) ? requested : null;
  const controlProps: OutputSizeControlProps = {
    customEdge,
    maxLongEdge,
    mode,
    size,
    onCustomEdgeChange: setCustomEdge,
    onModeChange: (nextMode, edge) => {
      setMode(nextMode);
      setPresetEdge(edge);
    },
  };
  return { controlProps, maxLongEdge };
}

export interface OutputSizeControlProps {
  customEdge: string;
  maxLongEdge: number | null;
  mode: SizeMode;
  onCustomEdgeChange: (value: string) => void;
  onModeChange: (mode: SizeMode, edge: number | null) => void;
  size: ImageSize | null;
}

export const OutputSizeControl: FC<OutputSizeControlProps> = ({
  customEdge,
  maxLongEdge,
  mode,
  onCustomEdgeChange,
  onModeChange,
  size,
}) => {
  const output = size && maxLongEdge !== null ? scaleToLongEdge(size, maxLongEdge) : size;
  const selectValue = mode === 'preset' ? String(maxLongEdge) : mode;

  return (
    <div className={css.sizeControl}>
      <label className={css.rangeField}>
        Long edge
        <select
          className={css.sizeSelect}
          disabled={!size}
          value={selectValue}
          onChange={(event) => {
            const { value } = event.currentTarget;
            if (value === 'original') onModeChange('original', null);
            else if (value === CUSTOM) onModeChange('custom', null);
            else onModeChange('preset', Number(value));
          }}
        >
          <option value="original">Original</option>
          {LONG_EDGE_PRESETS.map((edge) => (
            <option disabled={!size || !canShrinkTo(size, edge)} key={edge} value={edge}>
              {edge} px
            </option>
          ))}
          <option value={CUSTOM}>Custom…</option>
        </select>
      </label>
      {mode === 'custom' && (
        <input
          aria-label="Custom long edge in pixels"
          className={css.sizeInput}
          inputMode="numeric"
          placeholder="1600"
          value={customEdge}
          onChange={(event) => onCustomEdgeChange(event.currentTarget.value.replaceAll(/\D/g, ''))}
        />
      )}
      {output && (
        <span className={css.sizeOutput}>
          → {output.width} × {output.height}
        </span>
      )}
    </div>
  );
};
