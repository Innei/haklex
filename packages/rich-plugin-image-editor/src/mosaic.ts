import type { CropRect } from './crop';
import { canvasToObjectUrl, clampCropRect, sourceToCanvas } from './crop';

export type MosaicMode = 'pixelate' | 'blur';

// Weak blur on text is reversible; the floor keeps a blurred region unreadable.
export const MOSAIC_STRENGTH_RANGE: Record<MosaicMode, { max: number; min: number }> = {
  blur: { max: 48, min: 12 },
  pixelate: { max: 48, min: 8 },
};

export const MOSAIC_DEFAULT_STRENGTH: Record<MosaicMode, number> = {
  blur: 20,
  pixelate: 16,
};

export function clampMosaicStrength(mode: MosaicMode, value: number): number {
  const { max, min } = MOSAIC_STRENGTH_RANGE[mode];
  return Math.min(Math.max(Math.round(value), min), max);
}

export function mosaicSampleSize(rect: CropRect, block: number): { height: number; width: number } {
  return {
    height: Math.max(1, Math.round(rect.height / block)),
    width: Math.max(1, Math.round(rect.width / block)),
  };
}

// Both modes downsample the region and scale it back: nearest-neighbour yields
// pixel blocks, smoothed scaling yields blur. Neither keeps recoverable detail.
export async function applyMosaic(
  sourceUrl: string,
  area: CropRect,
  mode: MosaicMode,
  block: number,
): Promise<string> {
  const canvas = await sourceToCanvas(sourceUrl);
  const rect = clampCropRect(area, canvas.width, canvas.height);
  if (rect.width === 0 || rect.height === 0) throw new Error('Mosaic region is empty');

  const sample = mosaicSampleSize(rect, block);
  const small = document.createElement('canvas');
  small.width = sample.width;
  small.height = sample.height;
  const smallCtx = small.getContext('2d');
  const ctx = canvas.getContext('2d');
  if (!smallCtx || !ctx) throw new Error('Canvas 2d context unavailable');

  const smooth = mode === 'blur';
  smallCtx.imageSmoothingEnabled = smooth;
  smallCtx.imageSmoothingQuality = 'high';
  smallCtx.drawImage(
    canvas,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    0,
    0,
    sample.width,
    sample.height,
  );
  ctx.imageSmoothingEnabled = smooth;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(small, 0, 0, sample.width, sample.height, rect.x, rect.y, rect.width, rect.height);

  return canvasToObjectUrl(canvas);
}
