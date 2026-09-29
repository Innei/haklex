export interface ImageSize {
  height: number;
  width: number;
}

export const LONG_EDGE_PRESETS = [3840, 2560, 1920, 1280] as const;

export function canShrinkTo(size: ImageSize, longEdge: number): boolean {
  return longEdge < Math.max(size.width, size.height);
}

export function scaleToLongEdge(size: ImageSize, longEdge: number): ImageSize {
  if (!canShrinkTo(size, longEdge)) return size;
  const ratio = longEdge / Math.max(size.width, size.height);
  return {
    height: Math.max(1, Math.round(size.height * ratio)),
    width: Math.max(1, Math.round(size.width * ratio)),
  };
}

export function scaleCanvasToLongEdge(
  source: HTMLCanvasElement,
  longEdge: number,
): HTMLCanvasElement {
  const target = scaleToLongEdge({ height: source.height, width: source.width }, longEdge);
  if (target.width === source.width && target.height === source.height) return source;
  const canvas = document.createElement('canvas');
  canvas.width = target.width;
  canvas.height = target.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2d context unavailable');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, target.width, target.height);
  return canvas;
}
