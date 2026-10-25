import { articleLayout, darkColors, lightArticleColors } from '@haklex/rich-style-token';
import { describe, expect, it } from 'vitest';

import { colorGroups, concentricRadius, cssVarName, frameVarsFor, hostVarsFor } from './tokens';

const rows = colorGroups.flatMap((g) => g.rows);

describe('colorGroups', () => {
  it('shows the exported light and dark value for every row', () => {
    for (const row of rows) {
      expect(row.light, row.key).toBe(lightArticleColors[row.key]);
      expect(row.dark, row.key).toBe(darkColors[row.key]);
    }
  });

  it('covers every color token except the content aliases', () => {
    const aliases = ['codeText', 'codeBg', 'codeHeaderBg', 'hrBorder', 'quoteBorder', 'quoteBg'];
    const shown = rows.map((r) => r.key).sort();
    const expected = Object.keys(lightArticleColors)
      .filter((k) => !aliases.includes(k))
      .sort();
    expect(shown).toEqual(expected);
  });

  it('gives each row a use line', () => {
    for (const row of rows) expect(row.use, row.key).not.toBe('');
  });
});

describe('cssVarName', () => {
  it('maps a color key to its --rc-* custom property', () => {
    expect(cssVarName('textSecondary')).toBe('--rc-text-secondary');
    expect(cssVarName('alertTip')).toBe('--rc-alert-tip');
  });
});

describe('hostVarsFor', () => {
  it('maps every exported color to its --rc-host-* property', () => {
    const light = hostVarsFor('light');
    expect(light['--rc-host-text']).toBe(lightArticleColors.text);
    expect(hostVarsFor('dark')['--rc-host-bg']).toBe(darkColors.bg);
    expect(Object.keys(light)).toHaveLength(Object.keys(lightArticleColors).length);
  });
});

describe('frameVarsFor', () => {
  it('pins light shadows on a light frame so a dark ancestor cannot leak in', () => {
    const vars = frameVarsFor('light');
    expect(vars['--rc-shadow-menu']).toBe(articleLayout.boxShadow.menu);
    expect(vars['--rc-shadow-xs']).toBe(articleLayout.boxShadow.xs);
    expect(vars['--rc-host-text']).toBe(lightArticleColors.text);
  });

  it('leaves shadows to the dark theme class on a dark frame', () => {
    const vars = frameVarsFor('dark');
    expect(Object.keys(vars).some((k) => k.startsWith('--rc-shadow'))).toBe(false);
    expect(vars['--rc-host-bg']).toBe(darkColors.bg);
  });
});

describe('concentricRadius', () => {
  it('derives the inner radius from the large radius and the xs padding', () => {
    expect(concentricRadius(articleLayout)).toEqual({ outer: 12, padding: 4, inner: 8 });
  });
});
