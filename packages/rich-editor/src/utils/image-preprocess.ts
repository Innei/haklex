import type { ImagePreprocessFn } from '../context/ImagePreprocessContext';

export async function resolvePreprocessTargets(
  files: File[],
  source: 'drop' | 'paste' | 'dialog',
  preprocess: ImagePreprocessFn | null,
): Promise<File[]> {
  // Multi-file gestures intentionally bypass preprocessing — the edit modal is single-image UX.
  if (!preprocess || files.length !== 1) return files;

  try {
    const result = await preprocess(files[0], { source });
    if (result === null) return [];
    if (result === 'skip') return files;
    return [result];
  } catch (err: unknown) {
    // A failing preprocessor must not lose the user's file; fall back to the original.
    console.error('[ImageUploadPlugin] preprocess failed, uploading original', err);
    return files;
  }
}
