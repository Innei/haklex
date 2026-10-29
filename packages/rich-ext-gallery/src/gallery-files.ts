import type { ImageUploadFn } from '@haklex/rich-editor/plugins';

import type { GalleryImage } from './types';

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

export async function fileToGalleryImage(
  file: File,
  uploader: ImageUploadFn | null,
): Promise<GalleryImage> {
  if (uploader) {
    const result = await uploader(file);
    return { src: result.src, alt: result.altText ?? file.name };
  }
  return { src: await readAsDataUrl(file), alt: file.name };
}

export function extractImageFiles(list: FileList | File[] | null | undefined): File[] {
  if (!list) return [];
  return Array.from(list).filter((file) => file?.type.startsWith('image/'));
}

export function imageCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'image' : 'images'}`;
}

export interface ImageEntry {
  id: string;
  image: GalleryImage;
}

let nextId = 0;
export function genId() {
  return `img-${++nextId}`;
}
