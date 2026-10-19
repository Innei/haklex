import type { SerializedEditorState } from 'lexical';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { composeRenderer } from '../src/core/compose';
import { chartModule } from '../src/modules/chart/module';

const SPEC = JSON.stringify({
  version: 1,
  type: 'bar',
  title: 'Render commits',
  x: 'component',
  series: [{ key: 'count', label: 'Commits' }],
  data: [
    { component: 'Editor', count: 48 },
    { component: 'Toolbar', count: 36 },
  ],
});

function stateWith(spec: string): SerializedEditorState {
  return {
    root: {
      type: 'root',
      version: 1,
      direction: null,
      format: '',
      indent: 0,
      children: [{ type: 'chart', version: 1, spec, $: { blockId: 'c1' } }],
    },
  } as unknown as SerializedEditorState;
}

const Renderer = composeRenderer({ modules: [chartModule] });

describe('chartModule', () => {
  it('registers the chart node and renderer', () => {
    expect(chartModule.name).toBe('chart');
    expect(chartModule.nodes?.[0]?.getType()).toBe('chart');
    expect(chartModule.renderers?.Chart).toBeTypeOf('function');
  });

  it('server-renders a valid spec as an SVG chart', () => {
    const html = renderToStaticMarkup(<Renderer value={stateWith(SPEC)} />);
    expect(html).toContain('Render commits');
    expect(html).toContain('<svg');
    expect(html).toContain('data-block-id="c1"');
  });

  it('server-renders an invalid spec as an error card', () => {
    const html = renderToStaticMarkup(<Renderer value={stateWith('{"type":"bar"')} />);
    expect(html).toContain('Chart data has 1 problem');
  });
});
