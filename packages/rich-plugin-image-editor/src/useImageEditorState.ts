import type { AnnotationState } from '@markerjs/markerjs3';
import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { Crop } from 'react-image-crop';

import type { CropRect } from './crop';
import { clampCropRect, isFullImageCrop } from './crop';
import type { MosaicMode } from './mosaic';
import { applyMosaic } from './mosaic';
import { applyCropRebase } from './pipeline';

export type EditorTool =
  | 'crop'
  | 'arrow'
  | 'pen'
  | 'rect'
  | 'ellipse'
  | 'text'
  | 'counter'
  | 'cover'
  | 'mosaic';

export interface ImageNaturalSize {
  height: number;
  width: number;
}

// CleanShot-style default: the marquee starts as a full-image selection.
export const FULL_IMAGE_CROP: Crop = { height: 100, unit: '%', width: 100, x: 0, y: 0 };

export interface ImageEditorState {
  activeTool: EditorTool;
  applyMosaicArea: (area: CropRect, mode: MosaicMode, block: number) => Promise<void>;
  // Applies the pending crop (re-basing bitmap + marker state), then switches tool.
  confirmCropAndSwitch: (tool: EditorTool) => Promise<void>;
  crop: Crop;
  // Always in natural-image pixels (see displayedToNatural in crop.ts).
  croppedAreaPixels: CropRect | null;
  hasPendingCrop: boolean;
  // Survives AnnotationSurface remounts (tool/bitmap switches).
  markerStateRef: RefObject<AnnotationState | null>;
  mosaicBusy: boolean;
  mosaicCount: number;
  naturalSize: ImageNaturalSize | null;
  // Non-null after a crop has been applied (re-based bitmap).
  rebasedBitmapUrl: string | null;
  resetCrop: () => void;
  setActiveTool: (tool: EditorTool) => void;
  setCrop: (crop: Crop) => void;
  setCroppedAreaPixels: (area: CropRect | null) => void;
  setNaturalSize: (size: ImageNaturalSize | null) => void;
  sourceUrl: string;
  undoMosaic: () => void;
}

export function useImageEditorState(objectUrl: string): ImageEditorState {
  const [activeTool, setActiveTool] = useState<EditorTool>('crop');
  const [rebasedBitmapUrl, setRebasedBitmapUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>(FULL_IMAGE_CROP);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropRect | null>(null);
  const [naturalSize, setNaturalSize] = useState<ImageNaturalSize | null>(null);
  const markerStateRef = useRef<AnnotationState | null>(null);

  // Bitmaps to restore on mosaic undo; null stands for the original object URL.
  const [mosaicHistory, setMosaicHistory] = useState<(string | null)[]>([]);

  const rebasedUrlRef = useRef<string | null>(null);
  rebasedUrlRef.current = rebasedBitmapUrl;
  const mosaicHistoryRef = useRef(mosaicHistory);
  mosaicHistoryRef.current = mosaicHistory;
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (rebasedUrlRef.current) URL.revokeObjectURL(rebasedUrlRef.current);
      for (const url of mosaicHistoryRef.current) if (url) URL.revokeObjectURL(url);
    };
  }, []);

  const sourceUrl = rebasedBitmapUrl ?? objectUrl;
  const sourceUrlRef = useRef(sourceUrl);
  sourceUrlRef.current = sourceUrl;
  // Mosaics must apply one at a time on the latest bitmap, or a later result overwrites an earlier redaction.
  const [mosaicBusy, setMosaicBusy] = useState(false);
  const mosaicBusyRef = useRef(false);

  // Full-image or empty selections upload the original image untouched.
  const hasPendingCrop =
    croppedAreaPixels !== null &&
    naturalSize !== null &&
    croppedAreaPixels.width >= 1 &&
    croppedAreaPixels.height >= 1 &&
    !isFullImageCrop(croppedAreaPixels, naturalSize.width, naturalSize.height);

  const resetCrop = () => {
    setCrop(FULL_IMAGE_CROP);
    setCroppedAreaPixels(null);
  };

  const confirmCropAndSwitch = async (tool: EditorTool) => {
    if (!croppedAreaPixels || !naturalSize) return;
    const rect = clampCropRect(croppedAreaPixels, naturalSize.width, naturalSize.height);
    try {
      const rebase = await applyCropRebase(sourceUrl, rect, markerStateRef.current);
      if (rebasedBitmapUrl) URL.revokeObjectURL(rebasedBitmapUrl);
      // Pre-crop bitmaps no longer match the rebased geometry, so mosaic undo stops here.
      for (const url of mosaicHistory) if (url) URL.revokeObjectURL(url);
      setMosaicHistory([]);
      setRebasedBitmapUrl(rebase.bitmapUrl);
      markerStateRef.current = rebase.markerState;
      resetCrop();
      setNaturalSize({ height: rect.height, width: rect.width });
      setActiveTool(tool);
    } catch {
      // Crop extraction failed; stay in crop mode so the selection isn't lost.
    }
  };

  const applyMosaicArea = async (area: CropRect, mode: MosaicMode, block: number) => {
    if (!naturalSize || mosaicBusyRef.current) return;
    const rect = clampCropRect(area, naturalSize.width, naturalSize.height);
    if (rect.width < 1 || rect.height < 1) return;
    mosaicBusyRef.current = true;
    setMosaicBusy(true);
    try {
      const bitmapUrl = await applyMosaic(sourceUrlRef.current, rect, mode, block);
      if (!mountedRef.current) {
        URL.revokeObjectURL(bitmapUrl);
        return;
      }
      const previous = rebasedUrlRef.current;
      rebasedUrlRef.current = bitmapUrl;
      setMosaicHistory((history) => [...history, previous]);
      setRebasedBitmapUrl(bitmapUrl);
    } finally {
      mosaicBusyRef.current = false;
      if (mountedRef.current) setMosaicBusy(false);
    }
  };

  const undoMosaic = () => {
    if (mosaicHistory.length === 0 || mosaicBusyRef.current) return;
    const previous = mosaicHistory.at(-1) ?? null;
    if (rebasedBitmapUrl) URL.revokeObjectURL(rebasedBitmapUrl);
    setMosaicHistory(mosaicHistory.slice(0, -1));
    setRebasedBitmapUrl(previous);
  };

  return {
    activeTool,
    applyMosaicArea,
    confirmCropAndSwitch,
    crop,
    croppedAreaPixels,
    hasPendingCrop,
    markerStateRef,
    mosaicBusy,
    mosaicCount: mosaicHistory.length,
    naturalSize,
    rebasedBitmapUrl,
    resetCrop,
    setActiveTool,
    setCrop,
    setCroppedAreaPixels,
    setNaturalSize,
    sourceUrl,
    undoMosaic,
  };
}
