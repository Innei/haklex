import { createHeadlessEditor } from '@lexical/headless';
import { $getRoot } from 'lexical';
import { describe, expect, it } from 'vitest';

import { $toMarkdown, allHeadlessNodes } from '../src';

const content = (value: string) => ({
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
        textFormat: 0,
        textStyle: '',
        children: [
          {
            type: 'text',
            version: 1,
            text: value,
            format: 0,
            detail: 0,
            mode: 'normal',
            style: '',
          },
        ],
      },
    ],
  },
});

const stepsNode = {
  type: 'steps',
  version: 1,
  steps: [
    { id: 's_a', title: 'Install "it"', content: content('Download the app') },
    { id: 's_b', title: 'Configure', content: content('Add the key') },
  ],
  $: { blockId: 'b1' },
};

function load() {
  const editor = createHeadlessEditor({
    nodes: allHeadlessNodes,
    onError: (e) => {
      throw e;
    },
  });
  const state = editor.parseEditorState(
    JSON.stringify({
      root: {
        type: 'root',
        version: 1,
        direction: null,
        format: '',
        indent: 0,
        children: [stepsNode],
      },
    }),
  );
  editor.setEditorState(state);
  return editor;
}

describe('headless steps node', () => {
  it('round-trips steps and the block id', () => {
    const out = load().getEditorState().toJSON().root.children[0] as any;
    expect(out.type).toBe('steps');
    expect(out.$).toEqual({ blockId: 'b1' });
    expect(out.steps).toEqual(stepsNode.steps);
  });

  it('includes titles and content in the text content', () => {
    const text = load()
      .getEditorState()
      .read(() => $getRoot().getTextContent());
    expect(text).toContain('Configure');
    expect(text).toContain('Add the key');
  });

  it('exports steps as a directive block', () => {
    const md = load()
      .getEditorState()
      .read(() => $toMarkdown());
    expect(md).toBe(
      [
        '::: steps',
        '::: step{title="Install \\"it\\""}',
        'Download the app',
        ':::',
        '::: step{title="Configure"}',
        'Add the key',
        ':::',
        ':::',
      ].join('\n'),
    );
  });
});
