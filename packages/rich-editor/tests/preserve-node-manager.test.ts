import { describe, expect, it } from 'vitest';

import { TypePool } from '../src/virtualization/layout';
import { PreserveNodeManager } from '../src/virtualization/preserve';

describe('preserved editor nodes and LRU fallback', () => {
  it('evicts the least recently used parked node and snapshots its latest state', () => {
    const values = new Map([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);
    const saved = new Map<string, number>();
    const manager = new PreserveNodeManager(2, (_slot, owner) =>
      saved.set(owner, values.get(owner)!),
    );
    manager.park(1, 'a');
    manager.park(2, 'b');
    expect(manager.activate(1)).toBe(true);
    manager.park(1, 'a');
    values.set('b', 9);
    manager.park(3, 'c');
    expect(manager.has(1)).toBe(true);
    expect(manager.has(2)).toBe(false);
    expect(manager.has(3)).toBe(true);
    expect(saved.get('b')).toBe(9);
    expect(manager.size).toBe(2);
  });

  it('allows a zero budget to use state restoration for every departure', () => {
    const saved: string[] = [];
    const manager = new PreserveNodeManager(0, (_slot, owner) => saved.push(owner));
    manager.park(1, 'a');
    expect(manager.size).toBe(0);
    expect(saved).toEqual(['a']);
  });

  it('reactivates the same preserved physical slot before recycling another compatible instance', () => {
    const pool = new TypePool();
    pool.update([0, 1], () => 'paragraph');
    const original = pool.slots[0];
    const generation = original.generation;
    const preserved = new Set([original.id]);
    pool.update([10, 11], () => 'paragraph', new Set(), preserved);
    expect(original.active).toBe(false);
    expect(original.index).toBe(0);
    pool.update([0, 10], () => 'paragraph', new Set(), preserved);
    expect(original.active).toBe(true);
    expect(original.generation).toBe(generation);
    expect(pool.slots.find((slot) => slot.active && slot.index === 0)).toBe(original);
  });

  it('bounds preserved nodes and the free pool through a long scrolling history', () => {
    const pool = new TypePool();
    const manager = new PreserveNodeManager(3, () => {});
    for (let index = 0; index < 2000; index++) {
      for (const slot of pool.slots) if (slot.active) manager.park(slot.id, `block-${slot.index}`);
      pool.update([index], (i) => `type-${i % 5}`, new Set(), manager.ids());
      expect(manager.size).toBeLessThanOrEqual(3);
      expect(pool.slots.length).toBeLessThanOrEqual(19);
      for (const id of manager.ids()) expect(pool.slots.some((slot) => slot.id === id)).toBe(true);
    }
  });
});
