import type { ImageLayout } from '@haklex/rich-editor/nodes';
import { Popover, PopoverPanel, PopoverTrigger } from '@haklex/rich-editor-ui';
import { useAtom, useAtomValue } from 'jotai';
import type { LucideIcon } from 'lucide-react';
import {
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartVertical,
  ArrowLeftToLine,
  ArrowRightToLine,
  Scaling,
} from 'lucide-react';

import { displayWidthAtom, layoutAtom, layoutOpenAtom, sizeOpenAtom } from './atoms';
import * as styles from './styles.css';
import { useImageActions } from './useImageActions';

const SIZE_PRESETS = [25, 50, 75, 100] as const;

const LAYOUT_OPTIONS: { value: ImageLayout | undefined; label: string; Icon: LucideIcon }[] = [
  { value: undefined, label: 'Center', Icon: AlignCenterVertical },
  { value: 'align-left', label: 'Align left', Icon: AlignStartVertical },
  { value: 'align-right', label: 'Align right', Icon: AlignEndVertical },
  { value: 'float-left', label: 'Float left, text wraps right', Icon: ArrowLeftToLine },
  { value: 'float-right', label: 'Float right, text wraps left', Icon: ArrowRightToLine },
];

const toolbarButtonClass = `${styles.editToolbarButton} ${styles.semanticClassNames.editToolbarButton}`;

const stopMouseDown = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

export function ImageSizeControl() {
  const [sizeOpen, setSizeOpen] = useAtom(sizeOpenAtom);
  const displayWidth = useAtomValue(displayWidthAtom);
  const { handleSetDisplayWidth } = useImageActions();

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
        {SIZE_PRESETS.map((preset) => (
          <button
            className={`${styles.sizeOption} ${displayWidth === preset ? styles.editToolbarButtonActive : ''}`.trim()}
            key={preset}
            title={`${preset}% of content width`}
            type="button"
            onMouseDown={stopMouseDown}
            onClick={() => {
              handleSetDisplayWidth(preset);
              setSizeOpen(false);
            }}
          >
            {preset}%
          </button>
        ))}
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
