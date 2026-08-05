import { describe, expect, it } from 'vitest';

import { parseMaxItemHeightInput } from '../src/maxItemHeight';

describe('parseMaxItemHeightInput', () => {
  it('maps empty string to undefined', () => {
    expect(parseMaxItemHeightInput('')).toBeUndefined();
  });

  it('maps zero to undefined', () => {
    expect(parseMaxItemHeightInput('0')).toBeUndefined();
  });

  it('maps negative numbers to undefined', () => {
    expect(parseMaxItemHeightInput('-5')).toBeUndefined();
  });

  it('maps non-numeric input to undefined', () => {
    expect(parseMaxItemHeightInput('abc')).toBeUndefined();
  });

  it('parses a positive number', () => {
    expect(parseMaxItemHeightInput('320')).toBe(320);
  });
});
