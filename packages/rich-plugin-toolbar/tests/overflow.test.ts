import { describe, expect, it } from 'vitest';

import { fitCount } from '../src/overflow';

const entry = (width: number, separator = false) => ({ width, separator });

describe('fitCount', () => {
  it('keeps every entry when the row is wide enough', () => {
    expect(
      fitCount([entry(28), entry(28), entry(28)], { available: 200, gap: 2, reserve: 28 }),
    ).toBe(3);
  });

  it('reserves room for the overflow button once anything spills', () => {
    const entries = [entry(28), entry(28), entry(28), entry(28)];
    expect(fitCount(entries, { available: 100, gap: 2, reserve: 28 })).toBe(2);
  });

  it('never ends the visible run on a separator', () => {
    const entries = [entry(28), entry(28), entry(13, true), entry(28), entry(28)];
    expect(fitCount(entries, { available: 104, gap: 2, reserve: 28 })).toBe(2);
  });

  it('shows everything when the width is not measured yet', () => {
    expect(fitCount([entry(28), entry(28)], { available: null, gap: 2, reserve: 28 })).toBe(2);
  });
});
