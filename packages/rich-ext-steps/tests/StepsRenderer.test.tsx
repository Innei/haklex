import { NestedContentRendererProvider } from '@haklex/rich-editor/static';
import type { SerializedEditorState } from 'lexical';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { StepsRenderer } from '../src/StepsRenderer';

const state = (label: string) => ({ label }) as unknown as SerializedEditorState;

const renderContent = (value: SerializedEditorState) => (
  <p>{(value as unknown as { label: string }).label}</p>
);

describe('StepsRenderer', () => {
  it('numbers steps by position and renders titles and content', () => {
    const html = renderToStaticMarkup(
      <NestedContentRendererProvider value={renderContent}>
        <StepsRenderer
          steps={[
            { id: 'a', title: 'Install', content: state('body one') },
            { id: 'b', title: 'Configure', content: state('body two') },
          ]}
        />
      </NestedContentRendererProvider>,
    );
    expect(html).toContain('<ol');
    expect(html).toMatch(/rich-steps-marker[^>]*>1</);
    expect(html).toMatch(/rich-steps-marker[^>]*>2</);
    expect(html).toContain('Install');
    expect(html).toContain('body two');
  });

  it('renders nothing for an empty list', () => {
    expect(renderToStaticMarkup(<StepsRenderer steps={[]} />)).toBe('');
  });

  it('keeps the number when the title is empty', () => {
    const html = renderToStaticMarkup(
      <StepsRenderer steps={[{ id: 'a', title: '', content: state('x') }]} />,
    );
    expect(html).toMatch(/rich-steps-marker[^>]*>1</);
    expect(html).not.toContain('rich-steps-title');
  });
});
