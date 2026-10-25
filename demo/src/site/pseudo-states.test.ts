import { describe, expect, it } from 'vitest';

import { forcedPseudoSelector, splitSelectorList } from './pseudo-states';

describe('splitSelectorList', () => {
  it('splits on top-level commas only', () => {
    expect(splitSelectorList('.a:hover, :is(.b, .c):hover')).toEqual([
      '.a:hover',
      ':is(.b, .c):hover',
    ]);
  });
});

describe('forcedPseudoSelector', () => {
  it('rewrites :hover to a data-pseudo attribute on the same element', () => {
    expect(forcedPseudoSelector('.btn:hover:not(:disabled)')).toBe(
      '.btn[data-pseudo~="hover"]:not(:disabled)',
    );
  });

  it('rewrites :focus-visible and keeps descendant parts', () => {
    expect(forcedPseudoSelector('.item:focus-visible svg')).toBe(
      '.item[data-pseudo~="focus-visible"] svg',
    );
  });

  it('rewrites :focus without touching :focus-within', () => {
    expect(forcedPseudoSelector('.field:focus, .wrap:focus-within')).toBe(
      '.field[data-pseudo~="focus"]',
    );
  });

  it('drops list members without a forced pseudo-class', () => {
    expect(forcedPseudoSelector('.a, .b:hover')).toBe('.b[data-pseudo~="hover"]');
  });

  it('returns null when nothing can be forced', () => {
    expect(forcedPseudoSelector('.a[data-highlighted]')).toBeNull();
  });

  it('leaves selectors that negate a forced pseudo-class alone', () => {
    expect(forcedPseudoSelector('.a:not(:hover)')).toBeNull();
  });
});
