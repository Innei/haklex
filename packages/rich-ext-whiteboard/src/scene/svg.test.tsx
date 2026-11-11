import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { newSvgElement } from '../model/create';
import { SceneContent } from './Scene';
import type { ExcalidrawElement } from './types';

const render = (el: ExcalidrawElement, dark = false) =>
  renderToStaticMarkup(
    <svg>
      <SceneContent dark={dark} scene={{ elements: [el] }} />
    </svg>,
  );

const sticker = (svg: string) => newSvgElement({ x: 0, y: 0, width: 48, height: 96, svg });

describe('svg element rendering', () => {
  it('draws the source as a data-URL image fitted to the box', () => {
    const html = render(sticker('<svg viewBox="0 0 48 96"><circle r="4"/></svg>'));
    expect(html).toMatch(/<image[^>]*href="data:image\/svg\+xml;charset=utf-8,/);
    expect(html).toContain('preserveAspectRatio="xMidYMid meet"');
  });

  it('never puts the source into the page as markup', () => {
    const html = render(sticker('<svg><script>alert(1)</script><circle r="4"/></svg>'));
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<circle');
  });

  it('shows a dashed placeholder when the source is not an svg', () => {
    const html = render(sticker(''));
    expect(html).not.toContain('<image');
    expect(html).toContain('stroke-dasharray');
  });

  it('keeps its colours in the dark scene', () => {
    const html = render(sticker('<svg viewBox="0 0 1 1"/>'), true);
    expect(html).toMatch(/<image[^>]*filter="url\(#[^"]*counter-invert/);
  });

  it('casts the shadow when asked', () => {
    const html = render({ ...sticker('<svg viewBox="0 0 1 1"/>'), shadow: true });
    expect(html).toContain('feDropShadow');
  });
});
