import type { ImageDisplaySize } from '@haklex/rich-editor/nodes';
import {
  $isImageNode,
  computeImageDisplayPixels,
  convertImageDisplaySize,
  resolveImageDisplaySize,
  sanitizeImageDisplayWidth,
  sanitizeImageFixedPx,
} from '@haklex/rich-editor/nodes';
import type { LiveApply } from '@haklex/rich-editor-ui';
import { ActionButton, SegmentedControl, TextInput } from '@haklex/rich-editor-ui';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { atom, useAtom, useAtomValue, useStore } from 'jotai';
import { $getNearestNodeFromDOMNode, HISTORY_MERGE_TAG } from 'lexical';
import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';

import {
  altTextAtom,
  captionAtom,
  displayWidthAtom,
  fixedHeightAtom,
  fixedWidthAtom,
  focusCaptionOnOpenAtom,
  heightAtom,
  layoutAtom,
  metaOpenAtom,
  srcAtom,
  widthAtom,
  wrapperRefAtom,
} from './atoms';
import type { ImageInspectorFocus, ImageMetaValues } from './EditMetaPopover';
import { ImageInspector } from './EditMetaPopover';
import { applyImageSizePreview, readImageDisplayContext } from './image-metrics';
import { ImageActionsMenu } from './ImageActionsMenu';
import * as styles from './styles.css';
import { stopMouseDown } from './ToolbarButton';

export const inspectorFocusAtom = atom<ImageInspectorFocus | null>(null);

const SIZE_PRESETS = [25, 50, 75, 100] as const;
const SIZE_MIN = 10;
const SIZE_MAX = 100;
const SNAP_THRESHOLD = 3;

type WidthMode = 'auto' | 'percent' | 'px';

const WIDTH_MODES: { label: string; value: WidthMode }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'percent', label: '%' },
  { value: 'px', label: 'px' },
];

function snapToPreset(value: number): number {
  for (const preset of SIZE_PRESETS) {
    if (Math.abs(value - preset) <= SNAP_THRESHOLD) return preset;
  }
  return value;
}

export function formatImageSize(size: ImageDisplaySize): string {
  switch (size.mode) {
    case 'percent': {
      return `${size.value}%`;
    }
    case 'fixed-width':
    case 'fixed-height': {
      return `${size.px}px`;
    }
    default: {
      return 'Auto';
    }
  }
}

function useImageDisplaySize(): ImageDisplaySize {
  const displayWidth = useAtomValue(displayWidthAtom);
  const fixedWidth = useAtomValue(fixedWidthAtom);
  const fixedHeight = useAtomValue(fixedHeightAtom);
  return useMemo(
    () => resolveImageDisplaySize({ displayWidth, fixedWidth, fixedHeight }),
    [displayWidth, fixedWidth, fixedHeight],
  );
}

function useImageInspectorApply(): LiveApply<ImageMetaValues> {
  const [editor] = useLexicalComposerContext();
  const store = useStore();
  return useCallback(
    (patch, merge) => {
      const wrapper = store.get(wrapperRefAtom).current;
      if (!wrapper) return;
      editor.update(
        () => {
          const node = $getNearestNodeFromDOMNode(wrapper);
          if (!$isImageNode(node)) return;
          if (patch.src !== undefined) node.setSrc(patch.src);
          if (patch.altText !== undefined) node.setAltText(patch.altText);
          if (patch.caption !== undefined) node.setCaption(patch.caption || undefined);
          if (patch.size) node.applyDisplaySize(patch.size);
        },
        {
          tag: merge ? [HISTORY_MERGE_TAG, 'skip-scroll-into-view'] : 'skip-scroll-into-view',
        },
      );
    },
    [editor, store],
  );
}

interface ImageWidthControlProps {
  onChange: (size: ImageDisplaySize) => void;
  size: ImageDisplaySize;
}

export function ImageWidthControl({ size, onChange }: ImageWidthControlProps) {
  const id = useId();
  const store = useStore();
  const intrinsicWidth = useAtomValue(widthAtom);
  const intrinsicHeight = useAtomValue(heightAtom);
  const [dragValue, setDragValue] = useState<number | null>(null);
  const [pxDraft, setPxDraft] = useState<string | null>(null);

  useEffect(() => {
    setDragValue(null);
    setPxDraft(null);
  }, [size]);

  const readContext = () =>
    readImageDisplayContext(store.get(wrapperRefAtom).current, intrinsicWidth, intrinsicHeight);

  const mode: WidthMode =
    size.mode === 'auto' ? 'auto' : size.mode === 'percent' ? 'percent' : 'px';

  const switchMode = (to: WidthMode) => {
    if (to === mode) return;
    if (to === 'auto') {
      onChange({ mode: 'auto' });
      return;
    }
    const ctx = readContext();
    if (to === 'percent') {
      onChange(
        ctx ? convertImageDisplaySize(size, 'percent', ctx) : { mode: 'percent', value: 100 },
      );
      return;
    }
    if (ctx) {
      onChange(convertImageDisplaySize(size, 'fixed-width', ctx));
      return;
    }
    const px = sanitizeImageFixedPx(intrinsicWidth);
    if (px) onChange({ mode: 'fixed-width', px });
  };

  const preview = (next: ImageDisplaySize) => {
    const wrapper = store.get(wrapperRefAtom).current;
    if (wrapper) applyImageSizePreview(wrapper, store.get(layoutAtom), next);
  };

  const committedPercent = (() => {
    if (size.mode === 'percent') return size.value;
    const ctx = readContext();
    if (!ctx) return undefined;
    const { widthPx } = computeImageDisplayPixels(size, ctx);
    return widthPx ? sanitizeImageDisplayWidth((widthPx / ctx.containerWidth) * 100) : undefined;
  })();

  const percent = dragValue ?? committedPercent ?? SIZE_MAX;
  const fill = `${((percent - SIZE_MIN) / (SIZE_MAX - SIZE_MIN)) * 100}%`;

  const commitSlider = () => {
    if (dragValue === null || dragValue === committedPercent) return;
    onChange({ mode: 'percent', value: dragValue });
  };

  const fixedPx = size.mode === 'fixed-width' || size.mode === 'fixed-height' ? size.px : undefined;
  const pxLabel = size.mode === 'fixed-height' ? 'Height in pixels' : 'Width in pixels';

  return (
    <div className={styles.inspectorField}>
      <span className={styles.inspectorLabel} id={`${id}-label`}>
        Width
      </span>
      <div aria-labelledby={`${id}-label`} className={styles.widthRow} role="group">
        <SegmentedControl items={WIDTH_MODES} value={mode} onChange={switchMode} />
        {mode === 'percent' && (
          <>
            <input
              aria-label="Width, percent of content width"
              className={styles.sizeSlider}
              max={SIZE_MAX}
              min={SIZE_MIN}
              step={1}
              style={{ '--fill': fill } as React.CSSProperties}
              type="range"
              value={percent}
              onBlur={commitSlider}
              onKeyUp={commitSlider}
              onPointerUp={commitSlider}
              onChange={(event) => {
                const next = snapToPreset(Number(event.target.value));
                setDragValue(next);
                preview({ mode: 'percent', value: next });
              }}
            />
            <span className={styles.widthReadout}>{`${percent}%`}</span>
          </>
        )}
        {mode === 'px' && (
          <span className={styles.pxField}>
            <TextInput
              aria-label={pxLabel}
              autoComplete="off"
              inputMode="numeric"
              invalid={pxDraft !== null && sanitizeImageFixedPx(Number(pxDraft)) === undefined}
              spellCheck={false}
              value={pxDraft ?? String(fixedPx ?? '')}
              onChange={(event) => {
                setPxDraft(event.target.value);
                const px = sanitizeImageFixedPx(Number(event.target.value));
                if (px && (size.mode === 'fixed-width' || size.mode === 'fixed-height')) {
                  onChange({ mode: size.mode, px });
                }
              }}
            />
            <span className={styles.pxSuffix}>px</span>
          </span>
        )}
        {mode === 'auto' && <span className={styles.widthHint}>Natural size</span>}
      </div>
    </div>
  );
}

export function ImageSizeControl() {
  const [open, setOpen] = useAtom(metaOpenAtom);
  const [focus, setFocus] = useAtom(inspectorFocusAtom);
  const [focusCaption, setFocusCaption] = useAtom(focusCaptionOnOpenAtom);
  const src = useAtomValue(srcAtom);
  const altText = useAtomValue(altTextAtom);
  const caption = useAtomValue(captionAtom);
  const size = useImageDisplaySize();
  const onApply = useImageInspectorApply();

  const values = useMemo<ImageMetaValues>(
    () => ({ src, altText, caption: caption ?? '', size }),
    [src, altText, caption, size],
  );

  return (
    <ImageInspector
      focus={focusCaption ? 'caption' : focus}
      menu={<ImageActionsMenu />}
      open={open}
      renderWidth={(apply) => <ImageWidthControl size={size} onChange={apply} />}
      values={values}
      trigger={
        <ActionButton
          aria-label={`Image size, ${formatImageSize(size)}`}
          className={styles.sizeButton}
          size="md"
          onClick={() => setFocus(null)}
          onMouseDown={stopMouseDown}
        >
          <span>{formatImageSize(size)}</span>
          <ChevronDown className={styles.sizeChevron} />
        </ActionButton>
      }
      onApply={onApply}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setFocus(null);
          setFocusCaption(false);
        }
      }}
    />
  );
}
