import type { SerializedEditorState } from 'lexical';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { composeRenderer } from '../src/core/compose';
import { RichRenderer } from '../src/static-renderer';
import type { RendererSurfaceProps } from '../src/static-renderer/surface';
import { rendererVirtualizationModule } from '../src/virtualization/plugin';

const value = {
  root: {
    type: 'root',
    version: 1,
    direction: null,
    format: '',
    indent: 0,
    children: Array.from({ length: 100 }, (_, i) => ({
      type: 'heading',
      version: 1,
      tag: 'h2',
      direction: null,
      format: '',
      indent: 0,
      children: [
        {
          type: 'text',
          version: 1,
          text: 'Repeated heading',
          format: 0,
          detail: 0,
          mode: 'normal',
          style: '',
        },
      ],
      $: { blockId: `block-${i}` },
    })),
  },
} as unknown as SerializedEditorState;

function Window({ document }: RendererSurfaceProps) {
  return (
    <>
      {document.render(99)}
      {document.render(0)}
    </>
  );
}

describe('renderer surface injection', () => {
  it('renders only requested blocks and keeps global heading anchors in arbitrary order', () => {
    let rendered = 0;
    const Renderer = composeRenderer({
      modules: [{ name: 'window', surface: Window }],
      builtinNodeOverrides: {
        heading: (_node, _key, _children, render) => {
          rendered++;
          return render();
        },
      },
    });
    const html = renderToStaticMarkup(<Renderer value={value} />);
    expect(rendered).toBe(2);
    expect(html).toContain('id="repeated-heading-99"');
    expect(html).toContain('id="repeated-heading"');
    expect(html).not.toContain('id="repeated-heading-1"');
  });

  it('lets explicit false select the full renderer over an injected surface', () => {
    const Renderer = composeRenderer({ modules: [{ name: 'window', surface: Window }] });
    const html = renderToStaticMarkup(<Renderer value={value} virtualization={false} />);
    expect((html.match(/<h2 /g) ?? []).length).toBe(100);
  });

  it('keeps default SSR complete and virtual SSR bounded', () => {
    expect((renderToStaticMarkup(<RichRenderer value={value} />).match(/<h2 /g) ?? []).length).toBe(
      100,
    );
    const html = renderToStaticMarkup(<RichRenderer virtualization value={value} />);
    expect((html.match(/<h2 /g) ?? []).length).toBeGreaterThan(0);
    expect((html.match(/<h2 /g) ?? []).length).toBeLessThanOrEqual(12);
  });

  it('installs the virtual renderer through a compose module', () => {
    const Renderer = composeRenderer({ modules: [rendererVirtualizationModule()] });
    expect(
      (renderToStaticMarkup(<Renderer value={value} />).match(/<h2 /g) ?? []).length,
    ).toBeLessThanOrEqual(12);
    expect(
      (renderToStaticMarkup(<Renderer value={value} virtualization={false} />).match(/<h2 /g) ?? [])
        .length,
    ).toBe(100);
  });
});
