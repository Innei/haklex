import type { ImagePreprocessContextValue } from '../context/ImagePreprocessContext';

export interface GpsInfo {
  latitude: number;
  longitude: number;
}

export interface ImageEditPrivacy {
  detectGps: (file: File) => Promise<GpsInfo | null>;
  stripGps: (file: File) => Promise<File>;
}

export interface ImageEditorCapability {
  edit: (file: File) => Promise<{ file: File; summary?: string } | null>;
  privacy?: ImageEditPrivacy;
}

export type ImageDialogMode = 'insert' | 'replace';

export type ImageDialogEntry =
  { file: File; kind: 'file' } | { height: number; kind: 'url'; src: string; width: number };

export interface FileRow {
  current: File;
  gps: GpsInfo | null;
  id: string;
  kind: 'file';
  original: File;
  removeGps: boolean;
  summary: string;
}

export interface UrlRow {
  height: number;
  id: string;
  kind: 'url';
  src: string;
  width: number;
}

export type ReviewRow = FileRow | UrlRow;

export const IMAGE_DIALOG_WIDTH = 520;
export const IMAGE_FORMATS_HINT = 'PNG, JPG, GIF, WebP, AVIF';

const UNSAFE_URL_RE = /^(?:javascript\s*:|vbscript\s*:|data\s*:(?!image\/))/i;
const FLATTENED_BY_CANVAS = new Set(['image/gif', 'image/svg+xml']);

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export function isSafeImageUrl(url: string): boolean {
  return !UNSAFE_URL_RE.test(url);
}

export function isEditableImage(file: File): boolean {
  return !FLATTENED_BY_CANVAS.has(file.type);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function loadImageByUrl(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve({
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
      });
    };
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = src;
  });
}

export function urlFileName(src: string): string {
  try {
    const { pathname } = new URL(src);
    return decodeURIComponent(pathname.split('/').pop() || '') || src;
  } catch {
    return src;
  }
}

export function imageDialogCopy(
  mode: ImageDialogMode,
  count: number,
): { action: string; title: string } {
  if (mode === 'replace') return { action: 'Replace', title: 'Replace image' };
  const label = count > 1 ? `Insert ${count} images` : 'Insert image';
  return { action: label, title: label };
}

export async function finalizeRows(
  rows: ReviewRow[],
  stripGps: ImageEditPrivacy['stripGps'] | undefined,
): Promise<{ entries: ImageDialogEntry[]; failedIds: string[] }> {
  const failedIds: string[] = [];
  const entries = await Promise.all(
    rows.map(async (row): Promise<ImageDialogEntry | null> => {
      if (row.kind === 'url') {
        return { height: row.height, kind: 'url', src: row.src, width: row.width };
      }
      const edited = row.current !== row.original;
      if (edited || !row.removeGps || !row.gps) return { file: row.current, kind: 'file' };
      try {
        if (!stripGps) throw new Error('No GPS stripper configured');
        return { file: await stripGps(row.original), kind: 'file' };
      } catch {
        failedIds.push(row.id);
        return null;
      }
    }),
  );
  return {
    entries: entries.filter((entry): entry is ImageDialogEntry => entry !== null),
    failedIds,
  };
}

const editors = new WeakMap<ImagePreprocessContextValue, ImageEditorCapability>();

export function registerImageEditor(
  scope: ImagePreprocessContextValue,
  capability: ImageEditorCapability,
): () => void {
  editors.set(scope, capability);
  return () => {
    if (editors.get(scope) === capability) editors.delete(scope);
  };
}

export function getImageEditor(
  scope: ImagePreprocessContextValue | null | undefined,
): ImageEditorCapability | null {
  return (scope && editors.get(scope)) ?? null;
}
