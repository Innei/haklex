import { describe, expect, it } from 'vitest';

import { HeightIndex, TypePool } from './recycler-model';

describe('recycler layout and reuse', () => {
  it('keeps offset lookup consistent after variable height changes', () => {
    const heights = Array.from({ length: 200 }, (_, index) => 10 + (index % 31));
    const layout = new HeightIndex(heights);
    for (const index of [0, 42, 100, 199]) {
      heights[index] += 37.5;
      layout.update(index, heights[index]);
    }
    let offset = 0;
    heights.forEach((height, index) => {
      expect(layout.offset(index)).toBe(offset);
      expect(layout.find(offset)).toBe(index);
      expect(layout.find(offset + height - 0.01)).toBe(index);
      offset += height;
    });
    expect(layout.total).toBe(offset);
  });

  it('rebinds the same physical slots and releases the previous item first', () => {
    const pool = new TypePool();
    pool.update([0, 1], () => 'paragraph');
    const originals = [...pool.slots];
    const released: number[] = [];
    originals.forEach((slot) => {
      slot.beforeRelease = () => released.push(slot.index);
    });
    pool.update([20, 21], () => 'paragraph');
    expect(released).toEqual([0, 1]);
    expect(pool.created).toBe(2);
    expect(pool.reused).toBe(2);
    expect(pool.slots.every((slot) => originals.includes(slot))).toBe(true);
    expect(pool.slots.map((slot) => slot.index).sort()).toEqual([20, 21]);
  });

  it('separates incompatible types and bounds idle slots across long histories', () => {
    const pool = new TypePool();
    for (let index = 0; index < 2000; index += 3) {
      pool.update([index, index + 1, index + 2], (item) => `renderer-${item}`);
      expect(pool.slots.length).toBeLessThanOrEqual(16);
      expect(pool.slots.filter((slot) => slot.active).map((slot) => slot.pool)).toEqual([
        `renderer-${index}`,
        `renderer-${index + 1}`,
        `renderer-${index + 2}`,
      ]);
    }
    expect(pool.disposed).toBeGreaterThan(1000);
  });
});
