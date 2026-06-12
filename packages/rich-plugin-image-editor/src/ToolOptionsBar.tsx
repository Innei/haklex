import { Redo2, Undo2 } from 'lucide-react';
import type { FC } from 'react';

import { STROKE_WIDTHS, SWATCH_COLORS } from './annotation';
import * as css from './styles.css';

export interface ToolOptionsBarProps {
  canRedo: boolean;
  canUndo: boolean;
  onRedo: () => void;
  onStrokeColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onUndo: () => void;
  showStrokeWidth: boolean;
  strokeColor: string;
  strokeWidth: number;
}

export const ToolOptionsBar: FC<ToolOptionsBarProps> = ({
  canRedo,
  canUndo,
  onRedo,
  onStrokeColorChange,
  onStrokeWidthChange,
  onUndo,
  showStrokeWidth,
  strokeColor,
  strokeWidth,
}) => (
  <div className={css.optionsBar}>
    {SWATCH_COLORS.map((color) => (
      <button
        aria-label={`Color ${color}`}
        aria-pressed={strokeColor === color}
        className={strokeColor === color ? `${css.swatch} ${css.swatchActive}` : css.swatch}
        key={color}
        style={{ backgroundColor: color }}
        title={color}
        type="button"
        onClick={() => onStrokeColorChange(color)}
      />
    ))}
    {showStrokeWidth && (
      <>
        <div className={css.optionDivider} />
        {STROKE_WIDTHS.map((width) => (
          <button
            aria-label={`Stroke width ${width}`}
            aria-pressed={strokeWidth === width}
            key={width}
            title={`Stroke width ${width}px`}
            type="button"
            className={
              strokeWidth === width
                ? `${css.optionButton} ${css.optionButtonActive}`
                : css.optionButton
            }
            onClick={() => onStrokeWidthChange(width)}
          >
            <span className={css.strokeDot} style={{ height: width + 4, width: width + 4 }} />
          </button>
        ))}
      </>
    )}
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
    <button
      aria-label="Redo"
      className={css.optionButton}
      disabled={!canRedo}
      title="Redo"
      type="button"
      onClick={onRedo}
    >
      <Redo2 size={16} />
    </button>
  </div>
);
