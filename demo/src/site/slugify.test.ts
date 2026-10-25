import { describe, expect, it } from 'vitest';

import { slugify } from './slugify';

describe('slugify', () => {
  it('lowercases and joins words with single dashes', () => {
    expect(slugify('Grouped bar · highlight')).toBe('grouped-bar-highlight');
  });

  it('trims leading and trailing separators', () => {
    expect(slugify('  Narrow · 360px ')).toBe('narrow-360px');
  });

  it('keeps non-latin letters', () => {
    expect(slugify('编辑器 渲染')).toBe('编辑器-渲染');
  });
});
