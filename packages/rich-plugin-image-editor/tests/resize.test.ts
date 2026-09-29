import { describe, expect, it } from 'vitest';

import { canShrinkTo, scaleToLongEdge } from '../src/resize';

describe('scaleToLongEdge', () => {
  it('scales a landscape image by its width', () => {
    expect(scaleToLongEdge({ height: 2000, width: 3200 }, 1920)).toEqual({
      height: 1200,
      width: 1920,
    });
  });

  it('scales a portrait image by its height', () => {
    expect(scaleToLongEdge({ height: 4032, width: 3024 }, 1280)).toEqual({
      height: 1280,
      width: 960,
    });
  });

  it('never enlarges', () => {
    expect(scaleToLongEdge({ height: 600, width: 800 }, 1920)).toEqual({ height: 600, width: 800 });
  });

  it('keeps at least one pixel on the short edge', () => {
    expect(scaleToLongEdge({ height: 3, width: 4000 }, 1000)).toEqual({ height: 1, width: 1000 });
  });
});

describe('canShrinkTo', () => {
  it('allows only edges smaller than the current long edge', () => {
    expect(canShrinkTo({ height: 2000, width: 3200 }, 3840)).toBe(false);
    expect(canShrinkTo({ height: 2000, width: 3200 }, 3200)).toBe(false);
    expect(canShrinkTo({ height: 2000, width: 3200 }, 2560)).toBe(true);
  });
});
