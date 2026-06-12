import type { AnnotationState } from '@markerjs/markerjs3';
import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { Crop } from 'react-image-crop';

import type { CropRect } from './crop';
import { clampCropRect, isFullImageCrop } from './crop';
import { applyCropRebase } from './pipeline';

export type EditorTool =
  | 'crop'
  | 'arrow'
  | 'pen'
  | 'rect'
  | 'ellipse'
  | 'text'
  | 'counter'
  | 'cover';

export interface ImageNaturalSize {
  height: number;
  width: number;
}

// CleanShot-style default: the marquee starts as a full-image selection.
export const FULL_IMAGE_CROP: Crop = { height: 100, unit: '%', width: 100, x: 0, y: 0 };

export interface ImageEditorState {
  activeTool: EditorTool;
  // Applies the pending crop (re-basing bitmap + marker state), then switches tool.
  confirmCropAndSwitch: (tool: EditorTool) => Promise<void>;
  crop: Crop;
  // Always in natural-image pixels (see displayedToNatural in crop.ts).
  croppedAreaPixels: CropRect | null;
  hasPendingCrop: boolean;
  // Survives AnnotationSurface remounts (tool/bitmap switches).
  markerStateRef: RefObject<AnnotationState | null>;
  naturalSize: ImageNaturalSize | null;
  // Non-null after a crop has been applied (re-based bitmap).
  rebasedBitmapUrl: string | null;
  resetCrop: () => void;
  setActiveTool: (tool: EditorTool) => void;
  setCrop: (crop: Crop) => void;
  setCroppedAreaPixels: (area: CropRect | null) => void;
  setNaturalSize: (size: ImageNaturalSize | null) => void;
  sourceUrl: string;
}

export function useImageEditorState(objectUrl: string): ImageEditorState {
  const [activeTool, setActiveTool] = useState<EditorTool>('crop');
  const [rebasedBitmapUrl, setRebasedBitmapUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>(FULL_IMAGE_CROP);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropRect | null>(null);
  const [naturalSize, setNaturalSize] = useState<ImageNaturalSize | null>(null);
  const markerStateRef = useRef<AnnotationState | null>(null);

  const rebasedUrlRef = useRef<string | null>(null);
  rebasedUrlRef.current = rebasedBitmapUrl;
  useEffect(
    () => () => {
      if (rebasedUrlRef.current) URL.revokeObjectURL(rebasedUrlRef.current);
    },
    [],
  );

  const sourceUrl = rebasedBitmapUrl ?? objectUrl;

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
      setRebasedBitmapUrl(rebase.bitmapUrl);
      markerStateRef.current = rebase.markerState;
      resetCrop();
      setNaturalSize({ height: rect.height, width: rect.width });
      setActiveTool(tool);
    } catch {
      // Crop extraction failed; stay in crop mode so the selection isn't lost.
    }
  };

  return {
    activeTool,
    confirmCropAndSwitch,
    crop,
    croppedAreaPixels,
    hasPendingCrop,
    markerStateRef,
    naturalSize,
    rebasedBitmapUrl,
    resetCrop,
    setActiveTool,
    setCrop,
    setCroppedAreaPixels,
    setNaturalSize,
    sourceUrl,
  };
}
