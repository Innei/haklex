import type { ImageLayout } from '@haklex/rich-editor/nodes';
import { decodeThumbHash } from '@haklex/rich-editor/renderers';
import { atom } from 'jotai';
import type { CSSProperties, RefObject } from 'react';

export type ImageLoadState = 'loading' | 'loaded' | 'error';
export type ReplaceMode = 'upload' | 'url';

function getCaptionText(altText: string, caption?: string): string | undefined {
  if (caption) return caption;
  if (!altText) return undefined;
  if (altText.startsWith('!') || altText.startsWith('¡')) {
    return altText.slice(1);
  }
  return undefined;
}

// --- Props atoms (synced from Lexical node props) ---
export const srcAtom = atom('');
export const altTextAtom = atom('');
export const widthAtom = atom<number | undefined>();
export const heightAtom = atom<number | undefined>();
export const captionAtom = atom<string | undefined>();
export const thumbhashAtom = atom<string | undefined>();
export const accentAtom = atom<string | undefined>();
export const displayWidthAtom = atom<number | undefined>();
export const fixedWidthAtom = atom<number | undefined>();
export const fixedHeightAtom = atom<number | undefined>();
export const layoutAtom = atom<ImageLayout | undefined>();

// --- UI state ---
export const loadStateAtom = atom<ImageLoadState>('loading');
export const hoveringAtom = atom(false);
export const metaOpenAtom = atom(false);
export const replaceOpenAtom = atom(false);
export const sizeOpenAtom = atom(false);
export const layoutOpenAtom = atom(false);
export const resizingAtom = atom(false);
export const toolbarVisibleAtom = atom(
  (get) =>
    get(hoveringAtom) ||
    get(metaOpenAtom) ||
    get(replaceOpenAtom) ||
    get(sizeOpenAtom) ||
    get(layoutOpenAtom) ||
    get(resizingAtom),
);

export const focusCaptionOnOpenAtom = atom(false);

// --- Edit form ---
export const editSrcAtom = atom('');
export const editAltTextAtom = atom('');
export const editCaptionAtom = atom('');

// --- Replace panel ---
export const replaceModeAtom = atom<ReplaceMode>('upload');
export const replaceUrlAtom = atom('');
export const replacePreviewAtom = atom<string | null>(null);
export const replaceMetaAtom = atom<{
  width: number;
  height: number;
} | null>(null);
export const replaceLoadingAtom = atom(false);
export const replaceErrorAtom = atom<string | null>(null);

// --- Refs ---
export const wrapperRefAtom = atom<RefObject<HTMLDivElement | null>>({
  current: null,
});
export const fileInputRefAtom = atom<RefObject<HTMLInputElement | null>>({
  current: null,
});

// --- Derived ---
export const placeholderUrlAtom = atom((get) => {
  const thumbhash = get(thumbhashAtom);
  return thumbhash ? decodeThumbHash(thumbhash) : undefined;
});

export const captionTextAtom = atom((get) => getCaptionText(get(altTextAtom), get(captionAtom)));

export const frameStyleAtom = atom<CSSProperties>((get) => {
  const placeholderUrl = get(placeholderUrlAtom);
  const accent = get(accentAtom);
  const loadState = get(loadStateAtom);
  const width = get(widthAtom);
  const height = get(heightAtom);
  const displayWidth = get(displayWidthAtom);
  const fixedWidth = get(fixedWidthAtom);
  const fixedHeight = get(fixedHeightAtom);
  const fillsFigure = displayWidth !== undefined || fixedWidth !== undefined;
  return {
    backgroundColor:
      loadState !== 'loaded' && !placeholderUrl ? accent || '#f5f5f5' : 'transparent',
    backgroundImage:
      placeholderUrl && loadState !== 'loaded' ? `url(${placeholderUrl})` : undefined,
    backgroundSize: 'cover',
    width: fillsFigure ? '100%' : width ? Math.min(width, 1200) : undefined,
    maxWidth: '100%',
    maxHeight: fixedHeight !== undefined ? `${fixedHeight}px` : undefined,
    ...(width && height ? { aspectRatio: `${width} / ${height}` } : {}),
  };
});
