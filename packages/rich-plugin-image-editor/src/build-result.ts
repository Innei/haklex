import { pickExportMime } from './crop';

// `canvas` is the seam for edited bitmaps (cropped and/or rasterized
// annotations); absent canvas means the original file passes through.
export async function buildResult(
  original: File,
  canvas?: HTMLCanvasElement | null,
): Promise<File> {
  if (!canvas) return original;

  const type = pickExportMime(original.type);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('canvas.toBlob returned null'))),
      type,
    );
  });
  return new File([blob], original.name, { type: blob.type || type });
}
