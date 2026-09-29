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

  it('passes the whole batch and returns what the preprocessor resolves', async () => {
    const files = [createImageFile('a.png'), createImageFile('b.png')];
    const edited = createImageFile('a-edited.png');
    const preprocess = vi.fn<ImagePreprocessFn>().mockResolvedValue([edited, files[1]]);

    await expect(resolvePreprocessTargets(files, 'paste', preprocess)).resolves.toEqual([
      edited,
      files[1],
    ]);
    expect(preprocess).toHaveBeenCalledWith(files, { source: 'paste' });
  });

  it('keeps the order and subset the preprocessor returns', async () => {
    const files = [createImageFile('a.png'), createImageFile('b.png'), createImageFile('c.png')];
    const preprocess = vi.fn<ImagePreprocessFn>().mockResolvedValue([files[2], files[0]]);

    await expect(resolvePreprocessTargets(files, 'drop', preprocess)).resolves.toEqual([
      files[2],
      files[0],
    ]);
  });

  it('returns no files when the preprocessor resolves null', async () => {
    const file = createImageFile('a.png');
    const preprocess = vi.fn<ImagePreprocessFn>().mockResolvedValue(null);

    await expect(resolvePreprocessTargets([file], 'dialog', preprocess)).resolves.toEqual([]);
  });

  it('falls back to the original files when the preprocessor rejects', async () => {
    const files = [createImageFile('a.png'), createImageFile('b.png')];
    const preprocess = vi.fn<ImagePreprocessFn>().mockRejectedValue(new Error('boom'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(resolvePreprocessTargets(files, 'drop', preprocess)).resolves.toEqual(files);
    errorSpy.mockRestore();
  });

  it('skips the preprocessor for an empty batch', async () => {
    const preprocess = vi.fn<ImagePreprocessFn>().mockResolvedValue([]);

    await expect(resolvePreprocessTargets([], 'drop', preprocess)).resolves.toEqual([]);
    expect(preprocess).not.toHaveBeenCalled();
  });
});
