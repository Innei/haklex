import { describe, expect, it } from 'vitest';

import { collapsedMargin, occupiedHeight } from '../src/virtualization/layout';

describe('virtual document spacing', () => {
  it('collapses adjacent block margins instead of adding both', () => {
    expect(occupiedHeight({ height: 57, top: 0, bottom: 20 }, { top: 35.2 })).toBe(92.2);
    expect(occupiedHeight({ height: 38, top: 0, bottom: 18 }, { top: 0 })).toBe(56);
  });

  it('keeps negative margins and native grouped-block gaps', () => {
    expect(collapsedMargin(20, -8)).toBe(12);
    expect(collapsedMargin(-20, -8)).toBe(-20);
    expect(occupiedHeight({ height: 96, top: 0, bottom: 6 }, { top: 20 })).toBe(116);
    expect(occupiedHeight({ height: 96, top: 0, bottom: 6, gap: 28 }, { top: 20 })).toBe(124);
  });
});
