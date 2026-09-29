import { describe, expect, it } from 'vitest';

import { isAnnotationTool } from '../src/annotation';
import { clampMosaicStrength, MOSAIC_STRENGTH_RANGE, mosaicSampleSize } from '../src/mosaic';

describe('mosaicSampleSize', () => {
  it('shrinks the region by the block size', () => {
    expect(mosaicSampleSize({ height: 40, width: 160, x: 0, y: 0 }, 16)).toEqual({
      height: 3,
      width: 10,
    });
  });

  it('never collapses below one sample', () => {
    expect(mosaicSampleSize({ height: 4, width: 6, x: 0, y: 0 }, 32)).toEqual({
      height: 1,
      width: 1,
    });
  });
});

describe('clampMosaicStrength', () => {
  it('keeps blur at or above its floor so text stays unrecoverable', () => {
    expect(clampMosaicStrength('blur', 4)).toBe(MOSAIC_STRENGTH_RANGE.blur.min);
    expect(MOSAIC_STRENGTH_RANGE.blur.min).toBeGreaterThanOrEqual(12);
  });

  it('clamps pixelate into its range', () => {
    expect(clampMosaicStrength('pixelate', 2)).toBe(MOSAIC_STRENGTH_RANGE.pixelate.min);
    expect(clampMosaicStrength('pixelate', 999)).toBe(MOSAIC_STRENGTH_RANGE.pixelate.max);
    expect(clampMosaicStrength('pixelate', 20)).toBe(20);
  });
});

describe('isAnnotationTool', () => {
  it('treats mosaic as a bitmap tool, not a marker tool', () => {
    expect(isAnnotationTool('mosaic')).toBe(false);
    expect(isAnnotationTool('crop')).toBe(false);
    expect(isAnnotationTool('arrow')).toBe(true);
  });
});
