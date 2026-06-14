import type { ImageLayout } from '@haklex/rich-editor/nodes';
import { Popover, PopoverPanel, PopoverTrigger } from '@haklex/rich-editor-ui';
import { useAtom, useAtomValue, useStore } from 'jotai';
import type { LucideIcon } from 'lucide-react';
import {
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartVertical,
  ArrowLeftToLine,
  ArrowRightToLine,
  Scaling,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  displayWidthAtom,
  layoutAtom,
  layoutOpenAtom,
  sizeOpenAtom,
  wrapperRefAtom,
} from './atoms';
import * as styles from './styles.css';
import { useImageActions } from './useImageActions';

const SIZE_PRESETS = [25, 50, 75, 100] as const;
const SIZE_MIN = 10;
const SIZE_MAX = 100;
const SNAP_THRESHOLD = 3;

function snapToPreset(value: number): number {
  for (const preset of SIZE_PRESETS) {
    if (Math.abs(value - preset) <= SNAP_THRESHOLD) return preset;
  }
  return value;
}

// Thumb is 12px wide, so its center travels within [6px, 100% - 6px].
function tickLeft(preset: number): string {
  const ratio = (preset - SIZE_MIN) / (SIZE_MAX - SIZE_MIN);
  return `calc(6px + ${ratio} * (100% - 12px))`;
}

const LAYOUT_OPTIONS: { value: ImageLayout | undefined; label: string; Icon: LucideIcon }[] = [
  { value: undefined, label: 'Center', Icon: AlignCenterVertical },
  { value: 'align-left', label: 'Align left', Icon: AlignStartVertical },
  { value: 'align-right', label: 'Align right', Icon: AlignEndVertical },
  { value: 'float-left', label: 'Wrap left', Icon: ArrowLeftToLine },
  { value: 'float-right', label: 'Wrap right', Icon: ArrowRightToLine },
];

const toolbarButtonClass = `${styles.editToolbarButton} ${styles.semanticClassNames.editToolbarButton}`;

const stopMouseDown = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

export function ImageSizeControl() {
  const store = useStore();
  const [sizeOpen, setSizeOpen] = useAtom(sizeOpenAtom);
  const displayWidth = useAtomValue(displayWidthAtom);
  const { handleSetDisplayWidth } = useImageActions();
  const [dragValue, setDragValue] = useState<number | null>(null);

  // The committed node value catches up after the editor update re-renders
  // the decorator; clear the local drag value only then to avoid a one-frame
  // snap back to the stale width.
  useEffect(() => {
    setDragValue(null);
  }, [displayWidth]);

  const value = dragValue ?? displayWidth ?? SIZE_MAX;

  // Same live-preview path as the drag-resize handles: write to the DOM while
  // dragging, commit a single editor update on release.
  const applyPreview = (percent: number) => {
    const trigger = store.get(wrapperRefAtom).current;
    if (!trigger) return;
    const layout = store.get(layoutAtom);
    if (layout === 'float-left' || layout === 'float-right') {
      const blockWrapper = trigger.closest<HTMLElement>('.rich-image-wrapper');
      if (blockWrapper) blockWrapper.style.width = `${percent}%`;
    } else {
      trigger
        .querySelector('figure')
        ?.style.setProperty('--rich-image-display-width', `${percent}%`);
    }
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = snapToPreset(Number(event.target.value));
    setDragValue(next);
    applyPreview(next);
  };

  const commit = () => {
    if (dragValue === null || dragValue === (displayWidth ?? SIZE_MAX)) return;
    handleSetDisplayWidth(dragValue);
  };

  const fill = `${((value - SIZE_MIN) / (SIZE_MAX - SIZE_MIN)) * 100}%`;

  return (
    <Popover open={sizeOpen} onOpenChange={setSizeOpen}>
      <PopoverTrigger className={toolbarButtonClass} title="Image size" onMouseDown={stopMouseDown}>
        <Scaling size={14} />
      </PopoverTrigger>
      <PopoverPanel className={styles.controlPanel} side="bottom" sideOffset={8}>
        <button
          className={`${styles.sizeOption} ${displayWidth === undefined ? styles.editToolbarButtonActive : ''}`.trim()}
          title="Natural size"
          type="button"
          onMouseDown={stopMouseDown}
          onClick={() => {
            handleSetDisplayWidth(undefined);
            setSizeOpen(false);
          }}
        >
          Auto
        </button>
        <span className={styles.sizeSliderWrap}>
          <input
            aria-label="Image width, percent of content width"
            className={styles.sizeSlider}
            max={SIZE_MAX}
            min={SIZE_MIN}
            step={1}
            style={{ '--fill': fill } as React.CSSProperties}
            type="range"
            value={value}
            onBlur={commit}
            onChange={handleSliderChange}
            onKeyUp={commit}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerUp={commit}
          />
          {SIZE_PRESETS.map((preset) => (
            <span
              className={styles.sizeSliderTick}
              key={preset}
              style={{ left: tickLeft(preset) }}
            />
          ))}
        </span>
        <span className={styles.sizeValue}>
          {displayWidth === undefined && dragValue === null ? 'Auto' : `${value}%`}
        </span>
      </PopoverPanel>
    </Popover>
  );
}

export function ImageLayoutControl() {
  const [layoutOpen, setLayoutOpen] = useAtom(layoutOpenAtom);
  const layout = useAtomValue(layoutAtom);
  const { handleSetLayout } = useImageActions();

  const current = LAYOUT_OPTIONS.find((option) => option.value === layout) ?? LAYOUT_OPTIONS[0];

  return (
    <Popover open={layoutOpen} onOpenChange={setLayoutOpen}>
      <PopoverTrigger
        className={toolbarButtonClass}
        title="Image layout"
        onMouseDown={stopMouseDown}
      >
        <current.Icon size={14} />
      </PopoverTrigger>
      <PopoverPanel className={styles.controlPanel} side="bottom" sideOffset={8}>
        {LAYOUT_OPTIONS.map(({ value, label, Icon }) => (
          <button
            className={`${toolbarButtonClass} ${layout === value ? styles.editToolbarButtonActive : ''}`.trim()}
            key={value ?? 'center'}
            title={label}
            type="button"
            onMouseDown={stopMouseDown}
            onClick={() => {
              handleSetLayout(value);
              setLayoutOpen(false);
            }}
          >
            <Icon size={14} />
          </button>
        ))}
      </PopoverPanel>
    </Popover>
  );
}
