import { describe, expect, it } from 'vitest';

import { newSvgElement } from './create';
import { normalizeElement } from './restore';
import { normalizeSvgSource, parseSvgSize, svgDataUrl } from './svg';

const BOTTLE = '<svg viewBox="0 0 48 96"><rect width="48" height="96" fill="#e8590c"/></svg>';

describe('svg source', () => {
  it('adds the SVG namespace when the root lacks it', () => {
    expect(normalizeSvgSource(BOTTLE)).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  });

  it('leaves a namespaced root alone', () => {
    const src = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"></svg>';
    expect(normalizeSvgSource(src)).toBe(src);
  });

  it('encodes the source into a data URL', () => {
    const url = svgDataUrl(BOTTLE);
    expect(url.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
    expect(decodeURIComponent(url.slice(url.indexOf(',') + 1))).toBe(normalizeSvgSource(BOTTLE));
  });

  it('reads the size from width and height, then from the viewBox', () => {
    expect(parseSvgSize('<svg width="120px" height="40" viewBox="0 0 12 4"></svg>')).toEqual({
      width: 120,
      height: 40,
    });
    expect(parseSvgSize(BOTTLE)).toEqual({ width: 48, height: 96 });
    expect(parseSvgSize('<svg></svg>')).toBeNull();
  });
});

describe('svg element', () => {
  it('survives normalization with its source and namespace', () => {
    const el = normalizeElement({ ...newSvgElement({ svg: BOTTLE }), angle: 0.2 });
    expect(el.type).toBe('svg');
    expect(el.svg).toBe(normalizeSvgSource(BOTTLE));
    expect(el.angle).toBe(0.2);
  });

  it('fills defaults for a bare element written by hand', () => {
    const el = normalizeElement({ type: 'svg', id: 's', x: 1, y: 2, width: 3, height: 4 } as never);
    expect(el).toMatchObject({ type: 'svg', id: 's', opacity: 100, svg: '' });
  });
});
