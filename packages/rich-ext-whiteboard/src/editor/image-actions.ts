import { newImageElement } from '../model/create';
import type { Point } from '../model/geometry';
import { bumpVersion } from '../model/mutate';
import { randomId } from '../model/random';
import type { BinaryFileData } from '../scene/types';
import type { WhiteboardStore } from './store';
import type { Doc } from './types';

export const MAX_IMAGE_SIDE = 600;
const FALLBACK_SIDE = 200;

export interface ImageSize {
  height: number;
  width: number;
}

type SizeReader = (dataURL: string) => Promise<ImageSize>;

const domSizeReader: SizeReader = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight }),
    );
    img.addEventListener('error', reject);
    img.src = url;
  });

let readSize: SizeReader = domSizeReader;

export function setImageSizeReader(reader: SizeReader | null): void {
  readSize = reader ?? domSizeReader;
}

export function fitImageSize(width: number, height: number, max = MAX_IMAGE_SIDE): ImageSize {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result)));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

export interface ImageInsertOptions {
  onUploadError?: (error: unknown) => void;
  uploadFile?: (file: File) => Promise<string>;
}

export async function insertImageFile(
  store: WhiteboardStore,
  file: File,
  at: Point,
  options: ImageInsertOptions = {},
): Promise<string> {
  const dataURL = await readAsDataURL(file);
  const natural = await readSize(dataURL).catch(() => null);
  const { width, height } = fitImageSize(
    natural?.width || FALLBACK_SIDE,
    natural?.height || FALLBACK_SIDE,
  );
  const fileId = randomId();
  const el = newImageElement(
    { x: at[0] - width / 2, y: at[1] - height / 2, width, height, fileId, status: 'pending' },
    store.getState().currentStyle,
  );
  const record: BinaryFileData = {
    id: fileId,
    mimeType: file.type || 'image/png',
    created: Date.now(),
    dataURL,
  };
  store.commit(({ elements, files }) => ({
    elements: [...elements, el],
    files: { ...files, [fileId]: record },
  }));
  const { toolLocked, tool } = store.getState();
  store.setState({ selectedIds: new Set([el.id]), tool: toolLocked ? tool : 'selection' });

  let url = dataURL;
  if (options.uploadFile) {
    try {
      url = await options.uploadFile(file);
    } catch (error) {
      options.onUploadError?.(error);
    }
  }

  store.amend((doc: Doc) => {
    if (!doc.elements.some((item) => item.id === el.id)) return doc;
    const saved = doc.files[fileId];
    return {
      elements: doc.elements.map((item) =>
        item.id === el.id ? bumpVersion(item, { status: 'saved' }) : item,
      ),
      files: saved ? { ...doc.files, [fileId]: { ...saved, dataURL: url } } : doc.files,
    };
  });
  return el.id;
}
