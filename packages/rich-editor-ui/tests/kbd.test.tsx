import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Kbd } from '../src/components/kbd';

describe('Kbd', () => {
  it('carries the spoken key names as visually hidden text, not an aria-label', () => {
    const html = renderToStaticMarkup(<Kbd keys="Mod+Shift+K" platform="mac" />);
    expect(html).not.toContain('aria-label');
    expect(html).toMatch(/data-slot="kbd-label"[^>]*>Command Shift K</);
  });

  it('keeps the drawn caps out of the accessibility tree', () => {
    const html = renderToStaticMarkup(<Kbd keys="Enter" platform="other" />);
    expect(html).toMatch(/<kbd aria-hidden="true"/);
  });
});
