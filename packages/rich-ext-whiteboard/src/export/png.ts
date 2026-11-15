import type { ExportScene, ExportSvgOptions } from './svg';
import { renderSvg } from './svg';

export interface ExportBlobOptions extends ExportSvgOptions {
  maxSize?: number;
  mimeType?: string;
  quality?: number;
  scale?: number;
}

const DEFAULT_MAX_SIZE = 8192;

export function rasterScale(width: number, height: number, scale: number, maxSize: number): number {
  const longest = Math.max(width, height) * scale;
  return longest > maxSize ? (scale * maxSize) / longest : scale;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('whiteboard export: the svg could not be rasterized'));
    image.src = src;
  });
}

export async function exportToBlob(
  scene: ExportScene,
  options: ExportBlobOptions = {},
): Promise<Blob> {
  const {
    maxSize = DEFAULT_MAX_SIZE,
    mimeType = 'image/png',
    quality,
    scale = 1,
    ...rest
  } = options;
  const { height, svg, width } = await renderSvg(scene, rest);
  const ratio = rasterScale(width, height, scale, maxSize);
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('whiteboard export: no 2d canvas context');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('whiteboard export: empty image'))),
        mimeType,
        quality,
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
