import type { ImagePreprocessFn, ImagePreprocessSource } from '../context/ImagePreprocessContext';

export async function resolvePreprocessTargets(
  files: File[],
  source: ImagePreprocessSource,
  preprocess: ImagePreprocessFn | null,
): Promise<File[]> {
  if (!preprocess || files.length === 0) return files;

  try {
    return (await preprocess(files, { source })) ?? [];
  } catch (err: unknown) {
    // A failing preprocessor must not lose the user's files; fall back to the originals.
    console.error('[ImageUploadPlugin] preprocess failed, uploading originals', err);
    return files;
  }
}
