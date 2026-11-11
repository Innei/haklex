import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { newElement, newLinearElement } from '../model/create';
import { SceneContent } from './Scene';
import type { ExcalidrawElement } from './types';

const render = (elements: ExcalidrawElement[], dark = false) =>
  renderToStaticMarkup(
    <svg>
      <SceneContent dark={dark} scene={{ elements }} />
    </svg>,
  );

const shadowed = (el: ExcalidrawElement) => ({ ...el, shadow: true }) as ExcalidrawElement;

describe('shadow', () => {
  it('wraps a shadowed rectangle in a drop-shadow filter', () => {
    const rect = shadowed(newElement('rectangle', { x: 0, y: 0, width: 100, height: 60 }));
    const html = render([rect]);
    const filterId = /<filter[^>]*id="([^"]*shadow[^"]*)"[^>]*>.*?feDropShadow/.exec(html)?.[1];
    expect(filterId).toBeTruthy();
    expect(html).toContain(`filter="url(#${filterId})"`);
  });

  it('ignores shadow on a line', () => {
    const line = shadowed(newLinearElement('line', { x: 0, y: 0 }));
    expect(render([line])).not.toContain('feDropShadow');
  });

  it('adds nothing for elements without shadow', () => {
    const rect = newElement('rectangle', { x: 0, y: 0, width: 100, height: 60 });
    expect(render([rect])).not.toContain('filter');
  });

  it('keeps the shadow dark under the inverted dark scene', () => {
    const rect = shadowed(newElement('rectangle', { x: 0, y: 0, width: 100, height: 60 }));
    const light = /<feDropShadow[^>]*>/.exec(render([rect]))![0];
    const dark = /<feDropShadow[^>]*>/.exec(render([rect], true))![0];
    expect(light).toContain('flood-color="#000"');
    expect(dark).toContain('flood-color="#fff"');
  });
});
