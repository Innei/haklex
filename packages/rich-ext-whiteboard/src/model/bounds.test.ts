import { describe, expect, it } from 'vitest';

import { elementsInBox, getCommonBounds, getElementBounds, hitTestElement } from './bounds';
import { newElement, newFrameElement, newLinearElement, newTextElement } from './create';
import { distanceToSegment, rotatePoint } from './geometry';

describe('geometry', () => {
  it('rotates a point around a center', () => {
    const [x, y] = rotatePoint([10, 0], [0, 0], Math.PI / 2);
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(10);
  });

  it('measures distance to a segment, clamped to its ends', () => {
    expect(distanceToSegment([5, 3], [0, 0], [10, 0])).toBeCloseTo(3);
    expect(distanceToSegment([13, 4], [0, 0], [10, 0])).toBeCloseTo(5);
  });
});

describe('getElementBounds', () => {
  it('returns the box for an unrotated shape', () => {
    const el = newElement('rectangle', { x: 10, y: 20, width: 100, height: 50 });
    expect(getElementBounds(el)).toEqual([10, 20, 110, 70]);
  });

  it('grows to contain a rotated shape', () => {
    const el = newElement('rectangle', { x: 0, y: 0, width: 100, height: 100, angle: Math.PI / 4 });
    const [minX, minY, maxX, maxY] = getElementBounds(el);
    const half = Math.SQRT2 * 50;
    expect(minX).toBeCloseTo(50 - half);
    expect(maxX).toBeCloseTo(50 + half);
    expect(minY).toBeCloseTo(50 - half);
    expect(maxY).toBeCloseTo(50 + half);
  });

  it('uses points for linear elements', () => {
    const arrow = newLinearElement('arrow', {
      x: 10,
      y: 10,
      width: 50,
      height: 30,
      points: [
        [0, 0],
        [50, -30],
      ],
    });
    expect(getElementBounds(arrow)).toEqual([10, -20, 60, 10]);
  });

  it('combines bounds across elements', () => {
    const a = newElement('rectangle', { x: 0, y: 0, width: 10, height: 10 });
    const b = newElement('ellipse', { x: 50, y: -5, width: 10, height: 10 });
    expect(getCommonBounds([a, b])).toEqual([0, -5, 60, 10]);
  });
});

describe('hitTestElement', () => {
  const tol = 4;

  it('misses the middle of a transparent rectangle but hits its edge', () => {
    const el = newElement('rectangle', { x: 0, y: 0, width: 100, height: 60 });
    expect(hitTestElement(el, [50, 30], tol)).toBe(false);
    expect(hitTestElement(el, [100, 30], tol)).toBe(true);
    expect(hitTestElement(el, [50, 2], tol)).toBe(true);
  });

  it('hits inside a filled ellipse', () => {
    const el = newElement('ellipse', {
      x: 0,
      y: 0,
      width: 100,
      height: 60,
      backgroundColor: '#ffc9c9',
    });
    expect(hitTestElement(el, [50, 30], tol)).toBe(true);
    expect(hitTestElement(el, [2, 2], tol)).toBe(false);
  });

  it('hits the edge of a diamond only when transparent', () => {
    const el = newElement('diamond', { x: 0, y: 0, width: 100, height: 100 });
    expect(hitTestElement(el, [50, 50], tol)).toBe(false);
    expect(hitTestElement(el, [25, 25], tol)).toBe(true);
  });

  it('hits near an arrow segment', () => {
    const arrow = newLinearElement('arrow', {
      x: 0,
      y: 0,
      width: 100,
      height: 0,
      points: [
        [0, 0],
        [100, 0],
      ],
    });
    expect(hitTestElement(arrow, [50, 3], tol)).toBe(true);
    expect(hitTestElement(arrow, [50, 20], tol)).toBe(false);
  });

  it('hits anywhere inside text', () => {
    const text = newTextElement({ text: 'hello', x: 0, y: 0, width: 60, height: 25 });
    expect(hitTestElement(text, [30, 12], tol)).toBe(true);
  });

  it('accounts for rotation', () => {
    const el = newElement('rectangle', {
      x: 0,
      y: 0,
      width: 100,
      height: 20,
      angle: Math.PI / 2,
      backgroundColor: '#000',
    });
    expect(hitTestElement(el, [50, 50], tol)).toBe(true);
    expect(hitTestElement(el, [5, 10], tol)).toBe(false);
  });

  it('hits a frame by its border or its name label', () => {
    const frame = newFrameElement({ x: 0, y: 0, width: 200, height: 100 });
    expect(hitTestElement(frame, [100, 50], tol)).toBe(false);
    expect(hitTestElement(frame, [0, 50], tol)).toBe(true);
    expect(hitTestElement(frame, [20, -8], tol)).toBe(true);
  });
});

describe('elementsInBox', () => {
  it('returns only fully contained elements', () => {
    const inside = newElement('rectangle', { x: 10, y: 10, width: 10, height: 10 });
    const partial = newElement('rectangle', { x: 90, y: 90, width: 20, height: 20 });
    expect(elementsInBox([inside, partial], [0, 0, 100, 100])).toEqual([inside]);
  });
});
