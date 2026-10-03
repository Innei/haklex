import { createHeadlessEditor } from '@lexical/headless';
import { describe, expect, it } from 'vitest';

import { allHeadlessNodes } from '../src';

describe('headless ImageNode', () => {
  it('round-trips sizing and float layout', () => {
    const image = {
      type: 'image',
      version: 1,
      src: 'a.jpg',
      altText: 'a',
      width: 1800,
      height: 2400,
      displayWidth: 40,
      layout: 'float-right',
    };
    const editor = createHeadlessEditor({ nodes: allHeadlessNodes });
    const state = editor.parseEditorState(
      JSON.stringify({
        root: {
          type: 'root',
          version: 1,
          children: [image],
          direction: null,
          format: '',
          indent: 0,
        },
      }),
    );

    expect(JSON.parse(JSON.stringify(state.toJSON())).root.children[0]).toEqual(image);
  });
});
