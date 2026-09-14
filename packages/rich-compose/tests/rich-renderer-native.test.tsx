import type { SerializedEditorState } from 'lexical';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import type { BuiltinNodeRenderer } from '../src/static-renderer';
import { RichRenderer } from '../src/static-renderer';

const value = {
  root: {
    type: 'root',
    version: 1,
    direction: null,
    format: '',
    indent: 0,
    children: [
      {
        $: { blockId: 'b1' },
        type: 'paragraph',
        version: 1,
        direction: null,
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        children: [
          {
            type: 'text',
            version: 1,
            detail: 0,
            format: 1,
            mode: 'normal',
            style: '',
            text: 'hello',
          },
        ],
      },
      {
        $: { blockId: 'b2' },
        type: 'mermaid',
        version: 1,
        diagram: 'graph TD; A-->B',
      },
    ],
  },
} as unknown as SerializedEditorState;

function Host({ children }: { children?: ReactNode }) {
  return <host-root>{children}</host-root>;
}

const overrides: Record<string, BuiltinNodeRenderer> = {
  text: (node, key) => <x-text data-format={node.format} data-text={node.text} key={key} />,
  paragraph: (_node, key, children) => <x-paragraph key={key}>{children}</x-paragraph>,
  mermaid: (node, key, children) => (
    <x-mermaid data-decorations={children?.length ?? 0} data-diagram={node.diagram} key={key} />
  ),
};

describe('RichRenderer platform injection', () => {
  it('routes text, element and decorator nodes through overrides with a custom host and anchor', () => {
    const html = renderToStaticMarkup(
      <RichRenderer
        as={Host}
        builtinNodeOverrides={overrides}
        value={value}
        blockAnchor={(element, blockId, nodeKey) => (
          <x-block data-block-id={blockId} key={`${nodeKey}-anchor`}>
            {element}
          </x-block>
        )}
      />,
    );

    expect(html).toBe(
      '<host-root>' +
        '<x-block data-block-id="b1"><x-paragraph><x-text data-format="1" data-text="hello"></x-text></x-paragraph></x-block>' +
        '<x-block data-block-id="b2"><x-mermaid data-decorations="1" data-diagram="graph TD; A--&gt;B"></x-mermaid></x-block>' +
        '</host-root>',
    );
  });

  it('keeps the DOM shell, span text and div anchor when nothing is injected', () => {
    const html = renderToStaticMarkup(<RichRenderer value={value} />);

    expect(html).toContain('<div class="rich-content');
    expect(html).toContain('<p class="rich-paragraph');
    expect(html).toContain('data-block-id="b1"');
    expect(html).toContain('class="rich-block-anchor" data-block-id="b2"');
    expect(html).toContain('rich-text-bold');
  });
});
