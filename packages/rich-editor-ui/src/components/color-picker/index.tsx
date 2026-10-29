import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { Popover, PopoverPanel, PopoverTrigger } from '../popover';
import { TooltipContent, TooltipRoot, TooltipTrigger } from '../tooltip';
import { PickerView } from './picker-view';
import { PresetView } from './preset-view';
import { DEFAULT_COLOR, isDefaultColor } from './presets';
import type { ColorTarget } from './recent';
import { pushRecentColor, useRecentColors } from './recent';
import * as css from './styles.css';

export { BACKGROUND_PRESETS, DEFAULT_COLOR, TEXT_PRESETS } from './presets';

export interface ColorPickerProps {
  className?: string;
  currentBackground?: string;
  currentColor: string;
  onSelect: (color: string) => void;
  onSelectBackground?: (color: string) => void;
  tooltip?: string;
}

export function ColorPicker({
  currentColor,
  currentBackground,
  onSelect,
  onSelectBackground,
  className,
  tooltip,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'preset' | 'picker'>('preset');
  const [target, setTarget] = useState<ColorTarget>('text');
  const recent = useRecentColors(target);

  const activeTarget: ColorTarget = onSelectBackground ? target : 'text';
  const current = activeTarget === 'text' ? currentColor : (currentBackground ?? '');
  const textColor = isDefaultColor(currentColor) ? 'currentColor' : currentColor;
  const background = isDefaultColor(currentBackground) ? undefined : currentBackground;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setView('preset');
  };

  const pick = (value: string) => {
    if (value !== DEFAULT_COLOR) pushRecentColor(activeTarget, value);
    if (activeTarget === 'background') onSelectBackground?.(value);
    else onSelect(value);
    handleOpenChange(false);
  };

  const triggerButton = (
    <button
      aria-label="Text color"
      data-tooltip={tooltip}
      type="button"
      onMouseDown={(e) => e.preventDefault()}
    />
  );

  const trigger = (
    <PopoverTrigger
      className={`${css.trigger}${className ? ` ${className}` : ''}`}
      render={triggerButton}
    >
      <span className={css.triggerLabel}>
        <span
          className={css.triggerLetter}
          style={{ color: textColor, backgroundColor: background }}
        >
          A
        </span>
        <span className={css.triggerBar} style={{ backgroundColor: textColor }} />
      </span>
      <ChevronDown className={css.triggerChevron} />
    </PopoverTrigger>
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      {tooltip ? (
        <TooltipRoot>
          <TooltipTrigger render={trigger} />
          <TooltipContent side="bottom">{tooltip}</TooltipContent>
        </TooltipRoot>
      ) : (
        trigger
      )}

      <PopoverPanel className={css.panel} side="bottom" size="md">
        {view === 'preset' ? (
          <PresetView
            current={current}
            recent={recent}
            target={activeTarget}
            onCustom={() => setView('picker')}
            onPick={pick}
            onTargetChange={onSelectBackground ? setTarget : undefined}
          />
        ) : (
          <PickerView
            initialColor={current}
            onApply={pick}
            onBack={() => setView('preset')}
            onCancel={() => handleOpenChange(false)}
          />
        )}
      </PopoverPanel>
    </Popover>
  );
}
