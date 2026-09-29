import type { ImagePreprocessSource } from '@haklex/rich-editor/plugins';

export interface GpsInfo {
  latitude: number;
  longitude: number;
}

export interface ImageEditPrivacy {
  detectGps: (file: File) => Promise<GpsInfo | null>;
  stripGps: (file: File) => Promise<File>;
}

export interface SheetRow {
  current: File;
  gps: GpsInfo | null;
  id: string;
  original: File;
  summary: string;
}

const FLATTENED_BY_CANVAS = new Set(['image/gif', 'image/svg+xml']);

export function isEditableImage(file: File): boolean {
  return !FLATTENED_BY_CANVAS.has(file.type);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export async function finalizeRows(
  rows: SheetRow[],
  removeGps: boolean,
  stripGps: ImageEditPrivacy['stripGps'] | undefined,
): Promise<{ failedIds: string[]; files: File[] }> {
  const failedIds: string[] = [];
  const results = await Promise.all(
    rows.map(async (row) => {
      const edited = row.current !== row.original;
      if (edited || !removeGps || !row.gps) return row.current;
      try {
        if (!stripGps) throw new Error('No GPS stripper configured');
        return await stripGps(row.original);
      } catch {
        failedIds.push(row.id);
        return null;
      }
    }),
  );
  return { failedIds, files: results.filter((file): file is File => file !== null) };
}

export function sheetCopy(
  source: ImagePreprocessSource,
  count: number,
): { action: string; title: string } {
  if (source === 'replace') return { action: 'Replace', title: 'Replace image' };
  return {
    action: count > 1 ? `Insert ${count} images` : 'Insert',
    title: count > 1 ? 'Insert images' : 'Insert image',
  };
}
