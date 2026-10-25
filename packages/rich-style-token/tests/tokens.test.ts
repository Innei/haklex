import { describe, expect, it } from 'vitest';

import { withHostFallback } from '../src/host';
import { darkColors, fonts, lightArticleColors } from '../src/themes';
import { vars } from '../src/vars.css';

const legacyColorKeys = [
  'text',
  'textSecondary',
  'textTertiary',
  'textQuaternary',
  'bg',
  'bgSecondary',
  'bgTertiary',
  'fill',
  'fillSecondary',
  'fillTertiary',
  'fillQuaternary',
  'border',
  'borderSubtle',
  'accent',
  'accentLight',
  'link',
  'codeText',
  'codeBg',
  'codeHeaderBg',
  'hrBorder',
  'quoteBorder',
  'quoteBg',
  'alertInfo',
  'alertWarning',
  'alertTip',
  'alertCaution',
  'alertImportant',
] as const;

describe('token contract', () => {
  it('keeps every legacy color variable name', () => {
    for (const key of legacyColorKeys) {
      expect(vars.color[key]).toMatch(/^var\(--rc-[a-z-]+\)$/);
    }
    expect(vars.color.text).toBe('var(--rc-text)');
    expect(vars.color.accent).toBe('var(--rc-accent)');
    expect(vars.typography.fontFamily).toBe('var(--rc-font-family)');
    expect(vars.spacing.lg).toBe('var(--rc-space-lg)');
    expect(vars.layout.maxWidth).toBe('var(--rc-max-width)');
  });

  it('adds the ring token', () => {
    expect(vars.color.ring).toBe('var(--rc-ring)');
  });
});

describe('Quiet Ink values', () => {
  it('uses the D0 light palette', () => {
    expect(lightArticleColors.text).toBe('#171717');
    expect(lightArticleColors.border).toBe('#e5e5e5');
    expect(lightArticleColors.alertTip).toBe('#15803d');
    expect(lightArticleColors.fillSecondary).toMatch(/^rgb\(0 0 0 \/ /);
  });

  it('uses the D0 dark palette', () => {
    expect(darkColors.bg).toBe('#0a0a0a');
    expect(darkColors.textSecondary).toBe('#c4c4c4');
    expect(darkColors.border).toBe('#262626');
    expect(darkColors.fillSecondary).toMatch(/^rgb\(255 255 255 \/ /);
  });
});

describe('withHostFallback', () => {
  it('routes each value through a --rc-host-* variable named after its contract var', () => {
    expect(withHostFallback(vars.color, { text: '#171717', textSecondary: '#404040' })).toEqual({
      text: 'var(--rc-host-text, #171717)',
      textSecondary: 'var(--rc-host-text-secondary, #404040)',
    });
  });

  it('covers font family tokens', () => {
    const result = withHostFallback(vars.typography, { fontFamilySans: fonts.fontFamilySans });
    expect(result.fontFamilySans).toBe(`var(--rc-host-font-family-sans, ${fonts.fontFamilySans})`);
  });
});

describe('typography baseline', () => {
  it('resets every inheritable text property a host body can leak', async () => {
    const { chromeTypography, contentTypography } = await import('../src/baseline');
    for (const rule of [chromeTypography, contentTypography]) {
      expect(rule).toMatchObject({
        letterSpacing: 'normal',
        wordSpacing: 'normal',
        fontFeatureSettings: 'normal',
        fontVariant: 'normal',
        fontStyle: 'normal',
        fontWeight: 400,
        textTransform: 'none',
        color: vars.color.text,
      });
    }
    expect(chromeTypography.fontFamily).toBe(vars.typography.fontFamilySans);
    expect(contentTypography.fontFamily).toBe(vars.typography.fontFamily);
  });
});

describe('code surface tokens', () => {
  it('keeps the code header on the same surface as the code body', () => {
    expect(lightArticleColors.codeHeaderBg).toBe(lightArticleColors.codeBg);
    expect(darkColors.codeHeaderBg).toBe(darkColors.codeBg);
  });
});

describe('chrome baseline size', () => {
  it('pins font size and line height so portals never inherit host body metrics', async () => {
    const { chromeTypography } = await import('../src/baseline');
    expect(chromeTypography).toMatchObject({
      fontSize: vars.typography.fontSizeSmall,
      lineHeight: vars.typography.lineHeightCompact,
    });
  });
});
