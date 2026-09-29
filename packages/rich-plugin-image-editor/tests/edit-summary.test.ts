import { describe, expect, it } from 'vitest';

import { buildEditSummary } from '../src/edit-summary';

describe('buildEditSummary', () => {
  it('lists every applied edit in a fixed order', () => {
    expect(
      buildEditSummary({
        cropped: true,
        marks: 2,
        mosaics: 1,
        resizedTo: { height: 1080, width: 1920 },
      }),
    ).toBe('Cropped · 2 marks · 1 mosaic · 1920 × 1080');
  });

  it('uses the singular for one mark', () => {
    expect(buildEditSummary({ cropped: false, marks: 1, mosaics: 0, resizedTo: null })).toBe(
      '1 mark',
    );
  });

  it('is empty when nothing changed', () => {
    expect(buildEditSummary({ cropped: false, marks: 0, mosaics: 0, resizedTo: null })).toBe('');
  });
});
