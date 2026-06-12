// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';

import type { ImagePreprocessFn } from '../src/context/ImagePreprocessContext';
import { resolvePreprocessTargets } from '../src/utils/image-preprocess';

function createImageFile(name: string): File {
  return new File(['x'], name, { type: 'image/png' });
}

describe('resolvePreprocessTargets', () => {
  it('returns files unchanged when no preprocessor is registered', async () => {
    const file = createImageFile('a.png');
    await expect(resolvePreprocessTargets([file], 'drop', null)).resolves.toEqual([file]);
  });

  it('replaces the file when the preprocessor resolves a File', async () => {
    const original = createImageFile('a.png');
    const edited = createImageFile('a-edited.png');
    const preprocess = vi.fn<ImagePreprocessFn>().mockResolvedValue(edited);

    await expect(resolvePreprocessTargets([original], 'paste', preprocess)).resolves.toEqual([
      edited,
    ]);
    expect(preprocess).toHaveBeenCalledWith(original, { source: 'paste' });
  });

  it("keeps the original file when the preprocessor resolves 'skip'", async () => {
    const file = createImageFile('a.png');
    const preprocess = vi.fn<ImagePreprocessFn>().mockResolvedValue('skip');

    await expect(resolvePreprocessTargets([file], 'dialog', preprocess)).resolves.toEqual([file]);
    expect(preprocess).toHaveBeenCalledWith(file, { source: 'dialog' });
  });

  it('returns no files when the preprocessor resolves null', async () => {
    const file = createImageFile('a.png');
    const preprocess = vi.fn<ImagePreprocessFn>().mockResolvedValue(null);

    await expect(resolvePreprocessTargets([file], 'drop', preprocess)).resolves.toEqual([]);
  });

  it('falls back to the original file when the preprocessor rejects', async () => {
    const file = createImageFile('a.png');
    const preprocess = vi.fn<ImagePreprocessFn>().mockRejectedValue(new Error('boom'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(resolvePreprocessTargets([file], 'drop', preprocess)).resolves.toEqual([file]);
    errorSpy.mockRestore();
  });

  it('bypasses the preprocessor for multi-file batches', async () => {
    const files = [createImageFile('a.png'), createImageFile('b.png')];
    const preprocess = vi.fn<ImagePreprocessFn>().mockResolvedValue(null);

    await expect(resolvePreprocessTargets(files, 'drop', preprocess)).resolves.toEqual(files);
    expect(preprocess).not.toHaveBeenCalled();
  });
});
