import type { ImageDisplayMode, ImageDisplaySize } from '@haklex/rich-editor/nodes';
import {
  computeImageDisplayPixels,
  convertImageDisplaySize,
  resolveImageDisplaySize,
  sanitizeImageDisplayWidth,
  sanitizeImageFixedPx,
} from '@haklex/rich-editor/nodes';
import { Popover, PopoverPanel, PopoverTrigger } from '@haklex/rich-editor-ui';
import { useAtom, useAtomValue, useStore } from 'jotai';
import { Scaling } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  displayWidthAtom,
  fixedHeightAtom,
  fixedWidthAtom,
  heightAtom,
  layoutAtom,
  sizeOpenAtom,
  widthAtom,
  wrapperRefAtom,
} from './atoms';
import { applyImageSizePreview, readImageDisplayContext } from './image-metrics';
import * as styles from './styles.css';
import { useImageActions } from './useImageActions';

const SIZE_PRESETS = [25, 50, 75, 100] as const;
const SIZE_MIN = 10;
const SIZE_MAX = 100;
const SNAP_THRESHOLD = 3;
const MODE_BUTTONS = [
  ['percent', '%', 'Percent of content width'],
  ['fixed-width', 'W', 'Fixed width'],
  ['fixed-height', 'H', 'Fixed height'],
] as const;

function snapToPreset(value: number): number {
  for (const preset of SIZE_PRESETS) {
    if (Math.abs(value - preset) <= SNAP_THRESHOLD) return preset;
  }
  return value;
}

function tickLeft(preset: number): string {
  const ratio = (preset - SIZE_MIN) / (SIZE_MAX - SIZE_MIN);
  return `calc(6px + ${ratio} * (100% - 12px))`;
}

const toolbarButtonClass = `${styles.editToolbarButton} ${styles.semanticClassNames.editToolbarButton}`;

const stopMouseDown = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

export function ImageSizeControl() {
  const store = useStore();
  const [sizeOpen, setSizeOpen] = useAtom(sizeOpenAtom);
  const displayWidth = useAtomValue(displayWidthAtom);
  const fixedWidth = useAtomValue(fixedWidthAtom);
  const fixedHeight = useAtomValue(fixedHeightAtom);
  const intrinsicWidth = useAtomValue(widthAtom);
  const intrinsicHeight = useAtomValue(heightAtom);
  const { handleSetDisplaySize } = useImageActions();
  const [dragValue, setDragValue] = useState<number | null>(null);
  const [fixedDraft, setFixedDraft] = useState<string | null>(null);

  const size = resolveImageDisplaySize({ displayWidth, fixedWidth, fixedHeight });

  useEffect(() => {
    setDragValue(null);
    setFixedDraft(null);
  }, [displayWidth, fixedWidth, fixedHeight]);

  const ctx = readImageDisplayContext(
    store.get(wrapperRefAtom).current,
    intrinsicWidth,
    intrinsicHeight,
  );
  const committedPixels = ctx ? computeImageDisplayPixels(size, ctx) : {};
  const committedPercent =
    size.mode === 'percent'
      ? size.value
      : ctx && committedPixels.widthPx
        ? sanitizeImageDisplayWidth((committedPixels.widthPx / ctx.containerWidth) * 100)
        : undefined;

  const previewSize: ImageDisplaySize =
    dragValue === null
      ? size
      : size.mode === 'fixed-width' || size.mode === 'fixed-height'
        ? ctx
          ? convertImageDisplaySize({ mode: 'percent', value: dragValue }, size.mode, ctx)
          : size
        : { mode: 'percent', value: dragValue };
  const previewPixels = ctx
    ? computeImageDisplayPixels(previewSize, {
        ...ctx,
        renderedWidth: dragValue !== null ? undefined : ctx.renderedWidth,
        renderedHeight: dragValue !== null ? undefined : ctx.renderedHeight,
      })
    : {};
  const previewPercent =
    dragValue ??
    (ctx && previewPixels.widthPx
      ? sanitizeImageDisplayWidth((previewPixels.widthPx / ctx.containerWidth) * 100)
      : committedPercent);

  const applyPreview = (next: ImageDisplaySize) => {
    const trigger = store.get(wrapperRefAtom).current;
    if (trigger) applyImageSizePreview(trigger, store.get(layoutAtom), next);
  };

  const switchMode = (to: ImageDisplayMode) => {
    if (to === size.mode) return;
    if (to === 'auto') {
      handleSetDisplaySize({ mode: 'auto' });
      return;
    }
    if (!ctx) return;
    handleSetDisplaySize(convertImageDisplaySize(size, to, ctx));
  };

  const commitSlider = () => {
    if (dragValue === null) return;
    if (size.mode === 'fixed-width' || size.mode === 'fixed-height') {
      if (dragValue === committedPercent || !ctx) return;
      handleSetDisplaySize(
        convertImageDisplaySize({ mode: 'percent', value: dragValue }, size.mode, ctx),
      );
      return;
    }
    if (dragValue === (displayWidth ?? SIZE_MAX)) return;
    handleSetDisplaySize({ mode: 'percent', value: dragValue });
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = snapToPreset(Number(event.target.value));
    setDragValue(next);
    if (size.mode === 'fixed-width' || size.mode === 'fixed-height') {
      if (!ctx) return;
      applyPreview(convertImageDisplaySize({ mode: 'percent', value: next }, size.mode, ctx));
      return;
    }
    applyPreview({ mode: 'percent', value: next });
  };

  const value = dragValue ?? committedPercent ?? SIZE_MAX;
  const fill = `${((value - SIZE_MIN) / (SIZE_MAX - SIZE_MIN)) * 100}%`;
  const fixedPx = size.mode === 'fixed-width' || size.mode === 'fixed-height' ? size.px : undefined;

  return (
    <Popover open={sizeOpen} onOpenChange={setSizeOpen}>
      <PopoverTrigger className={toolbarButtonClass} title="Image size" onMouseDown={stopMouseDown}>
        <Scaling size={14} />
      </PopoverTrigger>
      <PopoverPanel className={styles.sizePanel} side="bottom" sideOffset={8}>
        <div className={styles.sizePanelRow}>
          <button
            className={`${styles.sizeOption} ${size.mode === 'auto' ? styles.editToolbarButtonActive : ''}`.trim()}
            title="Natural size"
            type="button"
            onMouseDown={stopMouseDown}
            onClick={() => {
              handleSetDisplaySize({ mode: 'auto' });
              setSizeOpen(false);
            }}
          >
            Auto
          </button>
          {MODE_BUTTONS.map(([mode, label, title]) => (
            <button
              className={`${styles.sizeOption} ${size.mode === mode ? styles.editToolbarButtonActive : ''}`.trim()}
              key={mode}
              title={title}
              type="button"
              onClick={() => switchMode(mode)}
              onMouseDown={stopMouseDown}
            >
              {label}
            </button>
          ))}
          <span className={styles.sizeReadout}>
            {size.mode === 'fixed-width' || size.mode === 'fixed-height' ? (
              <input
                autoComplete="off"
                className={`${styles.sizeValueField} ${styles.sizePxInput}`}
                inputMode="numeric"
                spellCheck={false}
                aria-label={
                  size.mode === 'fixed-width' ? 'Image width in pixels' : 'Image height in pixels'
                }
                value={
                  fixedDraft ??
                  (previewSize.mode === 'fixed-width' || previewSize.mode === 'fixed-height'
                    ? String(previewSize.px)
                    : String(fixedPx ?? ''))
                }
                onMouseDown={(e) => e.stopPropagation()}
                onBlur={() => {
                  const px = sanitizeImageFixedPx(Number(fixedDraft ?? fixedPx));
                  if (px && (size.mode === 'fixed-width' || size.mode === 'fixed-height')) {
                    handleSetDisplaySize({ mode: size.mode, px });
                  }
                  setFixedDraft(null);
                }}
                onChange={(event) => {
                  setFixedDraft(event.target.value);
                  const px = sanitizeImageFixedPx(Number(event.target.value));
                  if (px && (size.mode === 'fixed-width' || size.mode === 'fixed-height')) {
                    applyPreview({ mode: size.mode, px });
                  }
                }}
              />
            ) : (
              <span className={styles.sizeValueField}>
                {previewSize.mode === 'percent' ? `${previewSize.value}%` : 'Auto'}
              </span>
            )}
            <span className={styles.sizeEquiv}>
              {previewSize.mode === 'percent'
                ? previewPixels.widthPx
                  ? `${previewPixels.widthPx}px`
                  : '\u00A0'
                : previewSize.mode === 'auto'
                  ? '\u00A0'
                  : previewPercent
                    ? `${previewPercent}%`
                    : '\u00A0'}
            </span>
          </span>
        </div>
        <div className={styles.sizePanelRow}>
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
              onBlur={commitSlider}
              onChange={handleSliderChange}
              onKeyUp={commitSlider}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerUp={commitSlider}
            />
            {SIZE_PRESETS.map((preset) => (
              <span
                className={styles.sizeSliderTick}
                key={preset}
                style={{ left: tickLeft(preset) }}
              />
            ))}
          </span>
        </div>
      </PopoverPanel>
    </Popover>
  );
}
