// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../tests/harness';
import { click, drag, key, mountEditor } from '../../tests/harness';
import { getElementBounds } from '../model/bounds';
import { newElement, newLinearElement, newTextElement } from '../model/create';
import { createWhiteboardStore } from './store';
import { getTransformHandles, nudge, resizeElements, rotateElements } from './transform';

const rect = (x = 0, y = 0, w = 100, h = 50) =>
  newElement('rectangle', { x, y, width: w, height: h, backgroundColor: '#ffc9c9' });

describe('resizeElements', () => {
  it('grows width and height from the se handle', () => {
    const [r] = resizeElements([rect()], 'se', [100, 50], [140, 80], {});
    expect([r.x, r.y, r.width, r.height]).toEqual([0, 0, 140, 80]);
    expect(r.version).toBe(2);
  });

  it('moves the left edge from the w handle', () => {
    const [r] = resizeElements([rect()], 'w', [0, 25], [20, 40], {});
    expect([r.x, r.y, r.width, r.height]).toEqual([20, 0, 80, 50]);
  });

  it('keeps the aspect ratio with shift', () => {
    const [r] = resizeElements([rect()], 'se', [100, 50], [200, 60], { keepRatio: true });
    expect(r.width / r.height).toBeCloseTo(2);
    expect(r.width).toBe(200);
  });

  it('resizes symmetrically from the center with alt', () => {
    const [r] = resizeElements([rect()], 'e', [100, 25], [120, 25], { fromCenter: true });
    expect([r.x, r.width]).toEqual([-20, 140]);
  });

  it('keeps the opposite corner fixed for rotated shapes', () => {
    const el = { ...rect(0, 0, 100, 100), angle: Math.PI / 2 };
    const before = getElementBounds(el);
    const [r] = resizeElements([el], 'se', [0, 100], [0, 150], {});
    const after = getElementBounds(r);
    expect(after[2]).toBeCloseTo(before[2]);
    expect(after[1]).toBeCloseTo(before[1]);
    expect(r.width).toBeCloseTo(150);
  });

  it('scales positions and sizes of a multi-selection', () => {
    const a = rect(0, 0, 50, 50);
    const b = rect(100, 0, 100, 50);
    const [ra, rb] = resizeElements([a, b], 'e', [200, 25], [400, 25], {});
    expect([ra.x, ra.width]).toEqual([0, 100]);
    expect([rb.x, rb.width]).toEqual([200, 200]);
  });

  it('scales arrow points', () => {
    const arrow = newLinearElement('arrow', {
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      points: [
        [0, 0],
        [50, 50],
        [100, 0],
      ],
    });
    const [r] = resizeElements([arrow], 'se', [100, 50], [200, 100], {});
    expect((r as typeof arrow).points).toEqual([
      [0, 0],
      [100, 100],
      [200, 0],
    ]);
  });

  it('scales text font size proportionally', () => {
    const text = newTextElement({ text: 'hi', x: 0, y: 0, width: 40, height: 25, fontSize: 20 });
    const [r] = resizeElements([text], 'se', [40, 25], [80, 30], {});
    expect((r as typeof text).fontSize).toBe(40);
    expect(r.width).toBe(80);
    expect(r.height).toBe(50);
  });
});

describe('rotateElements', () => {
  it('snaps to 15 degree steps', () => {
    const [r] = rotateElements([rect()], [50, 25], (20 * Math.PI) / 180, { snap: true });
    expect(r.angle).toBeCloseTo(Math.PI / 12);
  });

  it('rotates a multi-selection around the common center', () => {
    const a = rect(0, 0, 10, 10);
    const b = rect(100, 0, 10, 10);
    const [ra] = rotateElements([a, b], [55, 5], Math.PI, {});
    expect(ra.x).toBeCloseTo(100);
    expect(ra.y).toBeCloseTo(0);
    expect(ra.angle).toBeCloseTo(Math.PI);
  });
});

describe('nudge', () => {
  it('moves only the given elements', () => {
    const a = rect();
    const b = rect(200);
    const out = nudge([a, b], new Set([a.id]), 1, -10);
    expect([out[0].x, out[0].y]).toEqual([1, -10]);
    expect(out[1]).toBe(b);
  });
});

describe('transform handles in the editor', () => {
  let mounted: Mounted | undefined;
  afterEach(() => mounted?.unmount());

  it('places handles around the selection with a rotation handle on top', () => {
    const handles = getTransformHandles([0, 0, 100, 50], 1);
    expect(handles.se[0]).toBeGreaterThan(100);
    expect(handles.rotation[1]).toBeLessThan(handles.n[1]);
  });

  it('resizes by dragging the se handle', () => {
    const el = rect(100, 100);
    const store = createWhiteboardStore({ elements: [el] });
    mounted = mountEditor(store);
    click(mounted.canvas, 150, 125);
    const { se } = getTransformHandles(getElementBounds(el), 1);
    drag(mounted.canvas, se, [se[0] + 50, se[1] + 30]);
    const r = store.getState().elements[0];
    expect(r.width).toBeCloseTo(150);
    expect(r.height).toBeCloseTo(80);
    store.undo();
    expect(store.getState().elements[0].width).toBe(100);
  });

  it('nudges with arrow keys, ten pixels with shift', () => {
    const store = createWhiteboardStore({ elements: [rect()] });
    mounted = mountEditor(store);
    click(mounted.canvas, 50, 25);
    key(mounted.canvas, 'ArrowRight');
    key(mounted.canvas, 'ArrowDown', { shiftKey: true });
    const r = store.getState().elements[0];
    expect([r.x, r.y]).toEqual([1, 10]);
  });
});
