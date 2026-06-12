export interface CropRect {
  height: number;
  width: number;
  x: number;
  y: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function clampCropRect(rect: CropRect, imageWidth: number, imageHeight: number): CropRect {
  const left = clamp(Math.round(rect.x), 0, imageWidth);
  const top = clamp(Math.round(rect.y), 0, imageHeight);
  const right = clamp(Math.round(rect.x + rect.width), left, imageWidth);
  const bottom = clamp(Math.round(rect.y + rect.height), top, imageHeight);
  return { height: bottom - top, width: right - left, x: left, y: top };
}

export function isFullImageCrop(rect: CropRect, imageWidth: number, imageHeight: number): boolean {
  const clamped = clampCropRect(rect, imageWidth, imageHeight);
  return (
    clamped.x === 0 &&
    clamped.y === 0 &&
    clamped.width === imageWidth &&
    clamped.height === imageHeight
  );
}

export function displayedToNatural(rect: CropRect, scaleX: number, scaleY: number): CropRect {
  return {
    height: rect.height * scaleY,
    width: rect.width * scaleX,
    x: rect.x * scaleX,
    y: rect.y * scaleY,
  };
}

const CANVAS_ENCODABLE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function pickExportMime(originalType: string): string {
  return CANVAS_ENCODABLE_TYPES.has(originalType) ? originalType : 'image/png';
}

export async function loadImage(imageSrc: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.src = imageSrc;
  await image.decode();
  return image;
}

function drawCrop(source: CanvasImageSource, rect: CropRect): HTMLCanvasElement {
  if (rect.width === 0 || rect.height === 0) {
    throw new Error('Crop region is empty');
  }

  const canvas = document.createElement('canvas');
  canvas.width = rect.width;
  canvas.height = rect.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2d context unavailable');
  }
  ctx.drawImage(source, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
  return canvas;
}

export async function extractCrop(
  imageSrc: string,
  areaPixels: CropRect,
): Promise<HTMLCanvasElement> {
  const image = await loadImage(imageSrc);
  return drawCrop(image, clampCropRect(areaPixels, image.naturalWidth, image.naturalHeight));
}

export function cropCanvas(source: HTMLCanvasElement, areaPixels: CropRect): HTMLCanvasElement {
  return drawCrop(source, clampCropRect(areaPixels, source.width, source.height));
}

export async function sourceToCanvas(imageSrc: string): Promise<HTMLCanvasElement> {
  const image = await loadImage(imageSrc);
  return drawCrop(image, {
    height: image.naturalHeight,
    width: image.naturalWidth,
    x: 0,
    y: 0,
  });
}

// Intermediate re-base bitmaps stay PNG to avoid lossy round trips.
export async function canvasToObjectUrl(canvas: HTMLCanvasElement): Promise<string> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('canvas.toBlob returned null'))),
      'image/png',
    );
  });
  return URL.createObjectURL(blob);
}
