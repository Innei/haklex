import { Undo2 } from 'lucide-react';
import type { FC } from 'react';

import type { MosaicMode } from './mosaic';
import { MOSAIC_STRENGTH_RANGE } from './mosaic';
import * as css from './styles.css';

const MODES: { id: MosaicMode; label: string }[] = [
  { id: 'pixelate', label: 'Pixelate' },
  { id: 'blur', label: 'Blur' },
];

export interface MosaicOptionsBarProps {
  canUndo: boolean;
  mode: MosaicMode;
  onModeChange: (mode: MosaicMode) => void;
  onStrengthChange: (strength: number) => void;
  onUndo: () => void;
  strength: number;
}

export const MosaicOptionsBar: FC<MosaicOptionsBarProps> = ({
  canUndo,
  mode,
  onModeChange,
  onStrengthChange,
  onUndo,
  strength,
}) => {
  const range = MOSAIC_STRENGTH_RANGE[mode];
  return (
    <div className={css.optionsBar}>
      {MODES.map((item) => (
        <button
          aria-pressed={mode === item.id}
          key={item.id}
          type="button"
          className={
            mode === item.id ? `${css.segmentButton} ${css.optionButtonActive}` : css.segmentButton
          }
          onClick={() => onModeChange(item.id)}
        >
          {item.label}
        </button>
      ))}
      <div className={css.optionDivider} />
      <label className={css.rangeField}>
        {mode === 'blur' ? 'Radius' : 'Block size'}
        <input
          className={css.rangeInput}
          max={range.max}
          min={range.min}
          type="range"
          value={strength}
          onChange={(event) => onStrengthChange(Number(event.currentTarget.value))}
        />
        <span className={css.rangeValue}>{strength} px</span>
      </label>
      <div className={css.optionDivider} />
      <button
        aria-label="Undo"
        className={css.optionButton}
        disabled={!canUndo}
        title="Undo"
        type="button"
        onClick={onUndo}
      >
        <Undo2 size={16} />
      </button>
    </div>
  );
};
