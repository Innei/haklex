import { createHeadlessEditor } from '@lexical/headless';
import { describe, expect, it } from 'vitest';

import { $toMarkdown, allHeadlessNodes, sanitizeSerializedJSON } from '../src';

const richQuoteState = JSON.stringify({
  root: {
    type: 'root',
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    children: [
      {
        type: 'rich-quote',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        attribution: 'Lu Xun',
        children: [
          {
            type: 'paragraph',
            version: 1,
            direction: 'ltr',
            format: '',
            indent: 0,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Hello quote',
                format: 0,
                detail: 0,
                mode: 'normal',
                style: '',
              },
            ],
          },
        ],
      },
    ],
  },
});

describe('rich-quote headless', () => {
  it('is a known node type for the sanitizer', () => {
    const unknown: string[] = [];
    sanitizeSerializedJSON(richQuoteState, {
      nodes: allHeadlessNodes,
      onUnknown: (type) => unknown.push(type),
    });
    expect(unknown).toEqual([]);
  });

  it('parses and exports as a blockquote, round-tripping attribution', () => {
    const editor = createHeadlessEditor({ nodes: allHeadlessNodes });
    const state = editor.parseEditorState(richQuoteState);
    editor.setEditorState(state);

    let md = '';
    state.read(() => {
      md = $toMarkdown();
    });
    expect(md).toBe('> Hello quote');

    const json = state.toJSON() as any;
    expect(json.root.children[0].type).toBe('rich-quote');
    expect(json.root.children[0].attribution).toBe('Lu Xun');
  });
});
