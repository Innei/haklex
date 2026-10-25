import { describe, expect, it } from 'vitest';

import { findGap, handleTop, parseLineHeight } from '../src/geometry';

const blocks = [
  { top: 100, bottom: 124 },
  { top: 140, bottom: 188 },
  { top: 204, bottom: 228 },
];

describe('findGap', () => {
  it('returns nothing while the pointer is over a block', () => {
    expect(findGap(blocks, 110)).toBeNull();
    expect(findGap(blocks, 160)).toBeNull();
  });

  it('finds the gap between two blocks and centres the line in it', () => {
    expect(findGap(blocks, 130)).toEqual({ index: 1, y: 132 });
    expect(findGap(blocks, 200)).toEqual({ index: 2, y: 196 });
  });

  it('offers a gap just above the first block and just below the last', () => {
    expect(findGap(blocks, 95)).toEqual({ index: 0, y: 94 });
    expect(findGap(blocks, 235)).toEqual({ index: 3, y: 234 });
  });

  it('ignores the pointer far above or below the content', () => {
    expect(findGap(blocks, 40)).toBeNull();
    expect(findGap(blocks, 300)).toBeNull();
  });

  it('returns nothing for an empty document', () => {
    expect(findGap([], 10)).toBeNull();
  });
});

describe('handleTop', () => {
  it('centres the handle on the first line of the block', () => {
    expect(handleTop({ top: 100, paddingTop: 0, lineHeight: 28 }, 24)).toBe(102);
    expect(handleTop({ top: 100, paddingTop: 8, lineHeight: 20 }, 24)).toBe(106);
  });
});

describe('parseLineHeight', () => {
  it('reads pixel values and falls back to 1.2 × font size for normal', () => {
    expect(parseLineHeight('28px', '16px')).toBe(28);
    expect(parseLineHeight('normal', '20px')).toBe(24);
  });
});
