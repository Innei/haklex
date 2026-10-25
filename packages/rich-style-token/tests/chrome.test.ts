import { describe, expect, it } from 'vitest';

import { chromeHeight, chromeMotion, chromeRadius, chromeText, focusRing } from '../src/chrome';
import { vars } from '../src/vars.css';

describe('chrome rules', () => {
  it('sets chrome type in px on a 4px grid', () => {
    expect(chromeText.label).toMatchObject({
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 500,
    });
    expect(chromeText.control).toMatchObject({ fontSize: '13px', lineHeight: '20px' });
    expect(chromeText.item).toMatchObject({ fontSize: '14px', lineHeight: '20px' });
    expect(chromeText.title).toMatchObject({
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: 600,
    });
    expect(chromeText.mono.fontFamily).toBe(vars.typography.fontMono);
  });

  it('keeps radius and heights fixed and concentric', () => {
    expect(chromeRadius).toEqual({ sm: '4px', md: '8px', lg: '12px' });
    expect(chromeHeight).toEqual({ sm: '24px', md: '28px', lg: '32px' });
  });

  it('draws focus as a 1px accent ring with a 3px halo', () => {
    expect(focusRing).toBe(`0 0 0 1px ${vars.color.accent}, 0 0 0 3px ${vars.color.accentLight}`);
  });

  it('times popups at 120 in and 80 out', () => {
    expect(chromeMotion.popupIn).toBe('120ms ease-out');
    expect(chromeMotion.popupOut).toBe('80ms ease-in');
    expect(chromeMotion.state).toBe('120ms');
  });
});
