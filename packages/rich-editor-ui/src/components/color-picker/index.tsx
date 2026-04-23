import { Check, ChevronDown, Plus } from 'lucide-react';
import { useState } from 'react';

import { Popover, PopoverPanel, PopoverTrigger } from '../popover';
import { PickerView } from './picker-view';
import * as css from './styles.css';

const TEXT_COLORS = [
  { name: 'Default', value: 'inherit' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
];

export interface ColorPickerProps {
  className?: string;
  currentColor: string;
  onSelect: (color: string) => void;
}

export function ColorPicker({ currentColor, onSelect, className }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'preset' | 'picker'>('preset');

  const displayColor = currentColor === 'inherit' || !currentColor ? 'currentColor' : currentColor;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setView('preset');
  };

  const handlePreset = (value: string) => {
    onSelect(value);
    handleOpenChange(false);
  };

  const handleApply = (hex: string) => {
    onSelect(hex);
    handleOpenChange(false);
  };

  const handleCancel = () => handleOpenChange(false);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        className={`${css.trigger}${className ? ` ${className}` : ''}`}
        render={<button type="button" onMouseDown={(e) => e.preventDefault()} />}
      >
        <span className={css.triggerLabel}>
          <span className={css.triggerLetter} style={{ color: displayColor }}>
            A
          </span>
          <span className={css.triggerBar} style={{ backgroundColor: displayColor }} />
        </span>
        <ChevronDown className={css.triggerChevron} />
      </PopoverTrigger>

      <PopoverPanel className={css.panel} side="bottom" sideOffset={6}>
        {view === 'preset' ? (
          <div className={css.grid}>
            {TEXT_COLORS.map((color) => (
              <button
                aria-label={color.name}
                className={css.swatch}
                key={color.value}
                type="button"
                onClick={() => handlePreset(color.value)}
                onMouseDown={(e) => e.preventDefault()}
              >
                <span
                  className={css.swatchDot}
                  style={{
                    backgroundColor: color.value === 'inherit' ? 'currentColor' : color.value,
                  }}
                />
                {currentColor === color.value && <Check className={css.swatchCheck} />}
              </button>
            ))}
            <button
              aria-label="Custom color"
              className={css.swatch}
              type="button"
              onClick={() => setView('picker')}
              onMouseDown={(e) => e.preventDefault()}
            >
              <span className={css.addSwatchDot}>
                <Plus className={css.addSwatchIcon} />
              </span>
            </button>
          </div>
        ) : (
          <PickerView
            initialColor={currentColor}
            onApply={handleApply}
            onBack={() => setView('preset')}
            onCancel={handleCancel}
          />
        )}
      </PopoverPanel>
    </Popover>
  );
}
