import { describe, expect, it } from 'vitest';

import {
  convertImageDisplaySize,
  imageDisplayCssVars,
  imageDisplayFieldsFromSize,
  imageDisplaySizeAfterResize,
  resolveImageDisplaySize,
  sanitizeImageFixedPx,
} from '../src/utils/image-display-size';

describe('sanitizeImageFixedPx', () => {
  it('rounds positive finite values and rejects the rest', () => {
    expect(sanitizeImageFixedPx(360.4)).toBe(360);
    expect(sanitizeImageFixedPx(1)).toBe(1);
    expect(sanitizeImageFixedPx(0)).toBeUndefined();
    expect(sanitizeImageFixedPx(-12)).toBeUndefined();
    expect(sanitizeImageFixedPx(Number.NaN)).toBeUndefined();
    expect(sanitizeImageFixedPx(Number.POSITIVE_INFINITY)).toBeUndefined();
    expect(sanitizeImageFixedPx(undefined)).toBeUndefined();
  });
});

describe('resolveImageDisplaySize', () => {
  it('returns auto when no display constraint is set', () => {
    expect(resolveImageDisplaySize({})).toEqual({ mode: 'auto' });
  });

  it('prefers percent over fixed axes', () => {
    expect(
      resolveImageDisplaySize({ displayWidth: 50, fixedWidth: 360, fixedHeight: 240 }),
    ).toEqual({ mode: 'percent', value: 50 });
  });

  it('prefers fixed width over fixed height', () => {
    expect(resolveImageDisplaySize({ fixedWidth: 360, fixedHeight: 240 })).toEqual({
      mode: 'fixed-width',
      px: 360,
    });
  });

  it('uses fixed height when it is the only valid constraint', () => {
    expect(resolveImageDisplaySize({ displayWidth: Number.NaN, fixedHeight: 240 })).toEqual({
      mode: 'fixed-height',
      px: 240,
    });
  });
});

describe('imageDisplayFieldsFromSize', () => {
  it('emits only the active field', () => {
    expect(imageDisplayFieldsFromSize({ mode: 'auto' })).toEqual({});
    expect(imageDisplayFieldsFromSize({ mode: 'percent', value: 50 })).toEqual({
      displayWidth: 50,
    });
    expect(imageDisplayFieldsFromSize({ mode: 'fixed-width', px: 360 })).toEqual({
      fixedWidth: 360,
    });
    expect(imageDisplayFieldsFromSize({ mode: 'fixed-height', px: 240 })).toEqual({
      fixedHeight: 240,
    });
  });
});

describe('convertImageDisplaySize', () => {
  const ctx = {
    containerWidth: 720,
    intrinsicWidth: 800,
    intrinsicHeight: 400,
  };

  it('converts percent to the current editor pixel size', () => {
    expect(convertImageDisplaySize({ mode: 'percent', value: 50 }, 'fixed-width', ctx)).toEqual({
      mode: 'fixed-width',
      px: 360,
    });
    expect(convertImageDisplaySize({ mode: 'percent', value: 50 }, 'fixed-height', ctx)).toEqual({
      mode: 'fixed-height',
      px: 180,
    });
  });

  it('converts a fixed axis back to percent of the current editor', () => {
    expect(convertImageDisplaySize({ mode: 'fixed-width', px: 360 }, 'percent', ctx)).toEqual({
      mode: 'percent',
      value: 50,
    });
    expect(convertImageDisplaySize({ mode: 'fixed-height', px: 180 }, 'percent', ctx)).toEqual({
      mode: 'percent',
      value: 50,
    });
  });

  it('converts between fixed width and fixed height via aspect ratio', () => {
    expect(convertImageDisplaySize({ mode: 'fixed-width', px: 360 }, 'fixed-height', ctx)).toEqual({
      mode: 'fixed-height',
      px: 180,
    });
    expect(convertImageDisplaySize({ mode: 'fixed-height', px: 180 }, 'fixed-width', ctx)).toEqual({
      mode: 'fixed-width',
      px: 360,
    });
  });

  it('uses the rendered box when converting from auto', () => {
    expect(
      convertImageDisplaySize({ mode: 'auto' }, 'percent', {
        ...ctx,
        renderedWidth: 360,
        renderedHeight: 180,
      }),
    ).toEqual({ mode: 'percent', value: 50 });
    expect(
      convertImageDisplaySize({ mode: 'auto' }, 'fixed-width', {
        ...ctx,
        renderedWidth: 360,
        renderedHeight: 180,
      }),
    ).toEqual({ mode: 'fixed-width', px: 360 });
  });

  it('clamps a converted percent into the display-width range', () => {
    expect(convertImageDisplaySize({ mode: 'fixed-width', px: 20 }, 'percent', ctx)).toEqual({
      mode: 'percent',
      value: 10,
    });
    expect(convertImageDisplaySize({ mode: 'fixed-width', px: 2000 }, 'percent', ctx)).toEqual({
      mode: 'percent',
      value: 100,
    });
  });

  it('returns auto when converting to auto', () => {
    expect(convertImageDisplaySize({ mode: 'percent', value: 50 }, 'auto', ctx)).toEqual({
      mode: 'auto',
    });
  });
});

describe('imageDisplaySizeAfterResize', () => {
  it('commits in the current display mode', () => {
    expect(imageDisplaySizeAfterResize('percent', 360, 180, 720)).toEqual({
      mode: 'percent',
      value: 50,
    });
    expect(imageDisplaySizeAfterResize('auto', 360, 180, 720)).toEqual({
      mode: 'percent',
      value: 50,
    });
    expect(imageDisplaySizeAfterResize('fixed-width', 360, 180, 720)).toEqual({
      mode: 'fixed-width',
      px: 360,
    });
    expect(imageDisplaySizeAfterResize('fixed-height', 360, 180, 720)).toEqual({
      mode: 'fixed-height',
      px: 180,
    });
  });
});

describe('imageDisplayCssVars', () => {
  it('writes percent and fixed CSS variables', () => {
    expect(imageDisplayCssVars({ mode: 'auto' })).toBeUndefined();
    expect(imageDisplayCssVars({ mode: 'percent', value: 50 })).toEqual({
      '--rich-image-display-width': '50%',
    });
    expect(imageDisplayCssVars({ mode: 'fixed-width', px: 360 })).toEqual({
      '--rich-image-display-width': '360px',
    });
    expect(imageDisplayCssVars({ mode: 'fixed-height', px: 240 })).toEqual({
      '--rich-image-display-height': '240px',
    });
  });
});
