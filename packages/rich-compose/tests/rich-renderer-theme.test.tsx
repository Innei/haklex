import type { SerializedEditorState } from 'lexical';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

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
        type: 'paragraph',
        version: 1,
        direction: null,
        format: '',
        indent: 0,
        children: [
          {
            type: 'text',
            version: 1,
            text: 'Hello',
            format: 0,
            detail: 0,
            mode: 'normal',
            style: '',
          },
        ],
      },
    ],
  },
} as unknown as SerializedEditorState;

describe('RichRenderer theme attribute', () => {
  it('inherits the ancestor theme when no theme is given', () => {
    const html = renderToStaticMarkup(<RichRenderer value={value} />);

    expect(html).toContain('class="rich-content');
    expect(html).not.toContain('data-theme');
  });

  it('pins the given theme on the host', () => {
    const html = renderToStaticMarkup(<RichRenderer theme="dark" value={value} />);

    expect(html).toContain('data-theme="dark"');
  });
});
