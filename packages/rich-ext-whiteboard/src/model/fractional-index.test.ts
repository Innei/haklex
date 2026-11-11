import { describe, expect, it } from 'vitest';

import { generateKeyBetween, generateNKeysBetween, syncIndices } from './fractional-index';

describe('generateKeyBetween', () => {
  it('starts at a0', () => {
    expect(generateKeyBetween(null, null)).toBe('a0');
  });

  it('appends after and prepends before', () => {
    expect(generateKeyBetween('a0', null)).toBe('a1');
    expect(generateKeyBetween(null, 'a0')).toBe('Zz');
  });

  it('finds a key strictly between two keys', () => {
    const pairs: Array<[string, string]> = [
      ['a0', 'a1'],
      ['a0', 'a0V'],
      ['a1', 'a2'],
      ['Zz', 'a0'],
      ['a0V', 'a1'],
    ];
    for (const [a, b] of pairs) {
      const k = generateKeyBetween(a, b);
      expect(k > a && k < b).toBe(true);
    }
  });

  it('keeps producing ordered keys when inserting repeatedly at the same spot', () => {
    let lo = 'a0';
    const hi = 'a1';
    for (let i = 0; i < 50; i++) {
      const k = generateKeyBetween(lo, hi);
      expect(k > lo && k < hi).toBe(true);
      lo = k;
    }
  });

  it('rejects inverted bounds', () => {
    expect(() => generateKeyBetween('a1', 'a0')).toThrow();
  });
});

describe('generateNKeysBetween', () => {
  it('returns n ascending keys inside the bounds', () => {
    const keys = generateNKeysBetween('a0', 'a1', 5);
    expect(keys).toHaveLength(5);
    expect(keys.every((k) => k > 'a0' && k < 'a1')).toBe(true);
    expect([...keys].sort()).toEqual(keys);
  });

  it('works with open bounds', () => {
    expect(generateNKeysBetween(null, null, 3)).toEqual(['a0', 'a1', 'a2']);
  });
});

describe('syncIndices', () => {
  const el = (id: string, index?: string | null) => ({ id, index }) as never;

  it('keeps valid ordered indices untouched by identity', () => {
    const input = [el('a', 'a0'), el('b', 'a1'), el('c', 'a2')];
    const out = syncIndices(input);
    expect(out).toEqual(input);
    out.forEach((e, i) => expect(e).toBe(input[i]));
  });

  it('fills missing and out-of-order indices between valid neighbours', () => {
    const input = [el('a', 'a0'), el('b', null), el('c', 'a0'), el('d', 'a2')];
    const out = syncIndices(input) as Array<{ id: string; index: string }>;
    expect(out[0]).toBe(input[0]);
    expect(out[3]).toBe(input[3]);
    const indices = out.map((e) => e.index);
    expect([...indices].sort()).toEqual(indices);
    expect(new Set(indices).size).toBe(4);
  });
});
