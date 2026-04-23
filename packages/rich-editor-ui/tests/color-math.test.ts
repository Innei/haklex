import { describe, expect, it } from 'vitest';

import {
  hexToHsva,
  hsvaToHex,
  hsvToRgb,
  parseHex,
  rgbToHsv,
} from '../src/components/color-picker/color-math';

describe('hsvToRgb / rgbToHsv', () => {
  it('converts pure red', () => {
    const { r, g, b } = hsvToRgb(0, 1, 1);
    expect(r).toBeCloseTo(1);
    expect(g).toBeCloseTo(0);
    expect(b).toBeCloseTo(0);
  });

  it('converts pure blue', () => {
    const { r, g, b } = hsvToRgb(240, 1, 1);
    expect(r).toBeCloseTo(0);
    expect(g).toBeCloseTo(0);
    expect(b).toBeCloseTo(1);
  });

  it('roundtrips through rgbToHsv', () => {
    const { h, s, v } = rgbToHsv(0.14902, 0.388235, 0.921569);
    const { r, g, b } = hsvToRgb(h, s, v);
    expect(r).toBeCloseTo(0.14902, 4);
    expect(g).toBeCloseTo(0.388235, 4);
    expect(b).toBeCloseTo(0.921569, 4);
  });

  it('handles black (v=0)', () => {
    const hsv = rgbToHsv(0, 0, 0);
    expect(hsv.v).toBe(0);
    expect(hsv.s).toBe(0);
  });

  it('handles white (s=0)', () => {
    const hsv = rgbToHsv(1, 1, 1);
    expect(hsv.v).toBe(1);
    expect(hsv.s).toBe(0);
  });
});

describe('parseHex', () => {
  it('parses #RGB shorthand', () => {
    expect(parseHex('#f00')).toEqual({ r: 1, g: 0, b: 0, a: 1 });
  });

  it('parses #RRGGBB', () => {
    const rgba = parseHex('#2563eb');
    expect(rgba?.r).toBeCloseTo(0x25 / 255);
    expect(rgba?.g).toBeCloseTo(0x63 / 255);
    expect(rgba?.b).toBeCloseTo(0xEB / 255);
    expect(rgba?.a).toBe(1);
  });

  it('parses #RRGGBBAA', () => {
    const rgba = parseHex('#2563eb80');
    expect(rgba?.a).toBeCloseTo(0x80 / 255);
  });

  it('parses #RGBA shorthand', () => {
    expect(parseHex('#f008')).toEqual({
      r: 1,
      g: 0,
      b: 0,
      a: 0x88 / 255,
    });
  });

  it('accepts uppercase and missing hash', () => {
    const rgba = parseHex('FF00AA')!;
    expect(rgba.r).toBeCloseTo(1);
    expect(rgba.g).toBeCloseTo(0);
    expect(rgba.b).toBeCloseTo(0xAA / 0xFF);
    expect(rgba.a).toBe(1);
  });

  it('rejects invalid input', () => {
    expect(parseHex('')).toBeNull();
    expect(parseHex('#xyz')).toBeNull();
    expect(parseHex('#12345')).toBeNull();
    expect(parseHex('12')).toBeNull();
  });
});

describe('hsvaToHex', () => {
  it('emits 6-digit hex when fully opaque', () => {
    expect(hsvaToHex({ h: 0, s: 1, v: 1, a: 1 })).toBe('#ff0000');
  });

  it('emits 8-digit hex with alpha', () => {
    expect(hsvaToHex({ h: 0, s: 1, v: 1, a: 0.5 })).toBe('#ff000080');
  });
});

describe('hexToHsva roundtrip', () => {
  it('roundtrips #2563eb', () => {
    const hsva = hexToHsva('#2563eb')!;
    const back = hsvaToHex(hsva);
    expect(back).toBe('#2563eb');
  });

  it('roundtrips with alpha', () => {
    const hsva = hexToHsva('#2563eb80')!;
    const back = hsvaToHex(hsva);
    expect(back).toBe('#2563eb80');
  });
});
