import { describe, expect, it } from 'vitest';

import { computeToolbarPosition } from '../src/position';

const viewport = { top: 0, left: 0, right: 1000, bottom: 800 };
const size = { width: 300, height: 36 };

describe('computeToolbarPosition', () => {
  it('sits above the selection when there is room', () => {
    const pos = computeToolbarPosition({
      anchor: { top: 400, bottom: 420, left: 450, right: 550 },
      size,
      bounds: viewport,
    });
    expect(pos).toEqual({ top: 400 - 8 - 36, left: 350, placement: 'top' });
  });

  it('flips below the selection when there is no room above', () => {
    const pos = computeToolbarPosition({
      anchor: { top: 20, bottom: 40, left: 450, right: 550 },
      size,
      bounds: viewport,
    });
    expect(pos.placement).toBe('bottom');
    expect(pos.top).toBe(48);
  });

  it('treats a sticky top toolbar as the upper edge', () => {
    const pos = computeToolbarPosition({
      anchor: { top: 90, bottom: 110, left: 450, right: 550 },
      size,
      bounds: { ...viewport, top: 60 },
    });
    expect(pos.placement).toBe('bottom');
    expect(pos.top).toBe(118);
  });

  it('shifts horizontally to stay inside the viewport', () => {
    const left = computeToolbarPosition({
      anchor: { top: 400, bottom: 420, left: 0, right: 40 },
      size,
      bounds: viewport,
    });
    expect(left.left).toBe(8);
    const right = computeToolbarPosition({
      anchor: { top: 400, bottom: 420, left: 960, right: 1000 },
      size,
      bounds: viewport,
    });
    expect(right.left).toBe(1000 - 300 - 8);
  });
});
