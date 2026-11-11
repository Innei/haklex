import type { BinaryFiles, ExcalidrawElement } from '../scene/types';

export const CLIPBOARD_TYPE = 'excalidraw/clipboard';

export type ClipboardContent =
  { elements: ExcalidrawElement[]; files: BinaryFiles } | { text: string };

export function serializeClipboard(
  elements: readonly ExcalidrawElement[],
  files: BinaryFiles,
): string {
  const used: BinaryFiles = {};
  for (const el of elements) {
    if (el.type === 'image' && el.fileId && files[el.fileId]) used[el.fileId] = files[el.fileId];
  }
  return JSON.stringify({ type: CLIPBOARD_TYPE, elements, files: used });
}

export function parseClipboard(raw: string): ClipboardContent | null {
  const text = raw.trim();
  if (!text) return null;
  if (text.startsWith('{')) {
    try {
      const json = JSON.parse(text) as { elements?: unknown; files?: unknown; type?: unknown };
      if (
        (json.type === CLIPBOARD_TYPE || json.type === 'excalidraw') &&
        Array.isArray(json.elements)
      ) {
        return {
          elements: (json.elements as ExcalidrawElement[]).filter((el) => !el.isDeleted),
          files: (json.files as BinaryFiles | undefined) ?? {},
        };
      }
      return null;
    } catch {
      return { text: raw };
    }
  }
  return { text: raw };
}
