import { Check, ChevronDown } from 'lucide-react'

import { Popover, PopoverPanel, PopoverTrigger } from '../popover'
import * as css from './styles.css'

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
  { name: 'Pink', value: '#ec4899' },
]

export interface ColorPickerProps {
  currentColor: string
  onSelect: (color: string) => void
  className?: string
}

export function ColorPicker({
  currentColor,
  onSelect,
  className,
}: ColorPickerProps) {
  const displayColor =
    currentColor === 'inherit' || !currentColor ? 'currentColor' : currentColor

  return (
    <Popover>
      <PopoverTrigger
        className={`${css.trigger}${className ? ` ${className}` : ''}`}
        render={
          <button type="button" onMouseDown={(e) => e.preventDefault()} />
        }
      >
        <span className={css.triggerLabel}>
          <span className={css.triggerLetter} style={{ color: displayColor }}>
            A
          </span>
          <span
            className={css.triggerBar}
            style={{ backgroundColor: displayColor }}
          />
        </span>
        <ChevronDown className={css.triggerChevron} />
      </PopoverTrigger>

      <PopoverPanel side="bottom" sideOffset={6} className={css.panel}>
        <div className={css.grid}>
          {TEXT_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              className={css.swatch}
              aria-label={color.name}
              onMouseDown={(e) => {
                e.preventDefault()
                onSelect(color.value)
              }}
            >
              <span
                className={css.swatchDot}
                style={{
                  backgroundColor:
                    color.value === 'inherit' ? 'currentColor' : color.value,
                }}
              />
              {currentColor === color.value && (
                <Check className={css.swatchCheck} />
              )}
            </button>
          ))}
        </div>
      </PopoverPanel>
    </Popover>
  )
}
