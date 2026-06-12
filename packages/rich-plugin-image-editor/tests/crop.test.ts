import { describe, expect, it } from 'vitest';

import { clampCropRect, displayedToNatural, isFullImageCrop, pickExportMime } from '../src/crop';

describe('clampCropRect', () => {
  it('returns the rect unchanged when fully inside the image', () => {
    expect(clampCropRect({ height: 50, width: 80, x: 10, y: 20 }, 200, 100)).toEqual({
      height: 50,
      width: 80,
      x: 10,
      y: 20,
    });
  });

  it('clamps negative offsets by trimming the out-of-bounds portion', () => {
    expect(clampCropRect({ height: 120, width: 120, x: -10, y: -20 }, 100, 100)).toEqual({
      height: 100,
      width: 100,
      x: 0,
      y: 0,
    });
  });

  it('clamps overflow beyond image bounds', () => {
    expect(clampCropRect({ height: 90, width: 90, x: 50, y: 60 }, 100, 100)).toEqual({
      height: 40,
      width: 50,
      x: 50,
      y: 60,
    });
  });

  it('rounds fractional values to integers', () => {
    expect(clampCropRect({ height: 29.8, width: 50.4, x: 10.6, y: 20.2 }, 200, 100)).toEqual({
      height: 30,
      width: 50,
      x: 11,
      y: 20,
    });
  });

  it('collapses a rect entirely outside the image to zero size', () => {
    expect(clampCropRect({ height: 50, width: 50, x: 200, y: 200 }, 100, 100)).toEqual({
      height: 0,
      width: 0,
      x: 100,
      y: 100,
    });
  });

  it('never produces negative dimensions for negative-size input', () => {
    const rect = clampCropRect({ height: -10, width: -10, x: 50, y: 50 }, 100, 100);
    expect(rect.width).toBeGreaterThanOrEqual(0);
    expect(rect.height).toBeGreaterThanOrEqual(0);
  });
});

describe('displayedToNatural', () => {
  it('is identity at scale 1', () => {
    expect(displayedToNatural({ height: 50, width: 80, x: 10, y: 20 }, 1, 1)).toEqual({
      height: 50,
      width: 80,
      x: 10,
      y: 20,
    });
  });

  it('scales displayed coordinates up to natural pixels', () => {
    // 2000x1000 natural image displayed at 500x250 -> scale 4 on both axes.
    expect(displayedToNatural({ height: 100, width: 200, x: 50, y: 25 }, 4, 4)).toEqual({
      height: 400,
      width: 800,
      x: 200,
      y: 100,
    });
  });

  it('applies independent x and y scales', () => {
    expect(displayedToNatural({ height: 10, width: 10, x: 10, y: 10 }, 2, 3)).toEqual({
      height: 30,
      width: 20,
      x: 20,
      y: 30,
    });
  });

  it('preserves fractional results for downstream rounding by clampCropRect', () => {
    const natural = displayedToNatural({ height: 33, width: 33, x: 1, y: 1 }, 1.5, 1.5);
    expect(natural).toEqual({ height: 49.5, width: 49.5, x: 1.5, y: 1.5 });
    expect(clampCropRect(natural, 100, 100)).toEqual({ height: 49, width: 49, x: 2, y: 2 });
  });

  it('full displayed selection maps to a full-image crop', () => {
    const natural = displayedToNatural({ height: 250, width: 500, x: 0, y: 0 }, 4, 4);
    expect(isFullImageCrop(natural, 2000, 1000)).toBe(true);
  });
});

describe('isFullImageCrop', () => {
  it('detects an exact full-image crop', () => {
    expect(isFullImageCrop({ height: 100, width: 200, x: 0, y: 0 }, 200, 100)).toBe(true);
  });

  it('detects a full-image crop after clamping an oversized rect', () => {
    expect(isFullImageCrop({ height: 140, width: 240, x: -20, y: -20 }, 200, 100)).toBe(true);
  });

  it('treats sub-pixel deviations as full image after rounding', () => {
    expect(isFullImageCrop({ height: 99.8, width: 199.7, x: 0.2, y: 0.1 }, 200, 100)).toBe(true);
  });

  it('rejects a partial crop', () => {
    expect(isFullImageCrop({ height: 100, width: 100, x: 0, y: 0 }, 200, 100)).toBe(false);
    expect(isFullImageCrop({ height: 100, width: 200, x: 1, y: 0 }, 200, 100)).toBe(false);
  });
});

describe('pickExportMime', () => {
  it('keeps canvas-encodable types', () => {
    expect(pickExportMime('image/jpeg')).toBe('image/jpeg');
    expect(pickExportMime('image/png')).toBe('image/png');
    expect(pickExportMime('image/webp')).toBe('image/webp');
  });

  it('falls back to png for types canvas cannot encode', () => {
    expect(pickExportMime('image/gif')).toBe('image/png');
    expect(pickExportMime('image/svg+xml')).toBe('image/png');
    expect(pickExportMime('image/avif')).toBe('image/png');
  });

  it('falls back to png for unknown or empty types', () => {
    expect(pickExportMime('')).toBe('image/png');
    expect(pickExportMime('application/octet-stream')).toBe('image/png');
  });
});
