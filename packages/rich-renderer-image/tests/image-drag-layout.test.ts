import { describe, expect, it } from 'vitest';

import { getImageDropLayout, getImageDropSide } from '../src/image-drag-layout';

describe('image drag layout helpers', () => {
  const rect = { left: 100, width: 600 };

  it('maps the left half of the editor to left wrapping', () => {
    expect(getImageDropSide(rect, 399)).toBe('left');
    expect(getImageDropLayout('left')).toBe('float-left');
  });

  it('maps the midpoint and right half of the editor to right wrapping', () => {
    expect(getImageDropSide(rect, 400)).toBe('right');
    expect(getImageDropSide(rect, 650)).toBe('right');
    expect(getImageDropLayout('right')).toBe('float-right');
  });
});
