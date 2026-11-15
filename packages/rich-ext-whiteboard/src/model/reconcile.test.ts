import { describe, expect, it } from 'vitest';

import { newElement } from './create';
import { orderByIndex, reconcileElements } from './reconcile';

const el = (id: string, extra: Record<string, unknown> = {}) => ({
  ...newElement('rectangle', { x: 0, y: 0, width: 10, height: 10 }),
  id,
  ...extra,
});

describe('reconcileElements', () => {
  it('takes the remote element when its version is higher', () => {
    const local = [el('a', { version: 2, x: 1, index: 'a1' })];
    const remote = [el('a', { version: 3, x: 9, index: 'a1' })];
    const { elements, accepted } = reconcileElements(local, remote);
    expect(elements[0].x).toBe(9);
    expect(accepted.map((e) => e.id)).toEqual(['a']);
  });

  it('keeps the local element when its version is higher', () => {
    const local = [el('a', { version: 4, x: 1, index: 'a1' })];
    const { elements, accepted } = reconcileElements(local, [el('a', { version: 3, x: 9 })]);
    expect(elements[0]).toBe(local[0]);
    expect(accepted).toHaveLength(0);
  });

  it('breaks a version tie with the lower versionNonce', () => {
    const local = [el('a', { version: 3, versionNonce: 50, x: 1, index: 'a1' })];
    const lower = reconcileElements(local, [el('a', { version: 3, versionNonce: 10, x: 9 })]);
    expect(lower.elements[0].x).toBe(9);
    const higher = reconcileElements(local, [el('a', { version: 3, versionNonce: 90, x: 9 })]);
    expect(higher.elements[0].x).toBe(1);
  });

  it('keeps protected local elements and reports the remote ones as deferred', () => {
    const local = [el('a', { version: 1, x: 1, index: 'a1' })];
    const remote = [el('a', { version: 9, x: 9, index: 'a1' })];
    const { elements, accepted, deferred } = reconcileElements(local, remote, new Set(['a']));
    expect(elements[0]).toBe(local[0]);
    expect(accepted).toHaveLength(0);
    expect(deferred).toEqual(remote);
  });

  it('places a new remote element by its index and keeps deleted ones', () => {
    const local = [el('a', { index: 'a1' }), el('c', { index: 'a3' })];
    const remote = [el('b', { index: 'a2', isDeleted: true })];
    const { elements } = reconcileElements(local, remote);
    expect(elements.map((e) => e.id)).toEqual(['a', 'b', 'c']);
    expect(elements[1].isDeleted).toBe(true);
  });
});

describe('orderByIndex', () => {
  it('sorts by index and keeps unindexed elements after the element they followed', () => {
    const ordered = orderByIndex([
      el('c', { index: 'a3' }),
      el('c-label', { index: null }),
      el('a', { index: 'a1' }),
      el('b', { index: 'a2' }),
    ]);
    expect(ordered.map((e) => e.id)).toEqual(['a', 'b', 'c', 'c-label']);
  });

  it('leaves an unindexed array in place', () => {
    const input = [el('x', { index: null }), el('y', { index: null })];
    expect(orderByIndex(input).map((e) => e.id)).toEqual(['x', 'y']);
  });
});
