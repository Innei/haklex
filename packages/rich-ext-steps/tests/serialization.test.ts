import type { SerializedEditorState } from 'lexical';
import { $getRoot, createEditor } from 'lexical';
import { describe, expect, it, vi } from 'vitest';

import {
  $createStepsNode,
  $isStepsNode,
  type SerializedStepsNode,
  StepsNode,
} from '../src/nodes/StepsNode';

vi.mock('@haklex/rich-editor/renderers', () => ({
  createRendererDecoration: vi.fn(),
}));

vi.mock('../src/StepsRenderer', () => ({
  StepsRenderer: vi.fn(),
}));

const content = (value: string) =>
  ({
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
  }) as unknown as SerializedEditorState;

function makeEditor() {
  return createEditor({
    namespace: 'StepsNodeTest',
    nodes: [StepsNode],
    onError: (error) => {
      throw error;
    },
  });
}

describe('StepsNode', () => {
  it('getType returns "steps"', () => {
    expect(StepsNode.getType()).toBe('steps');
  });

  it('round-trips steps through exportJSON / importJSON', () => {
    const editor = makeEditor();
    editor.update(
      () => {
        const node = $createStepsNode([
          { id: 's_a', title: 'Install', content: content('Download it') },
          { id: 's_b', title: 'Configure', content: content('Add the key') },
        ]);
        const json = node.exportJSON();
        expect(json).toMatchObject({
          type: 'steps',
          version: 1,
          steps: [
            { id: 's_a', title: 'Install' },
            { id: 's_b', title: 'Configure' },
          ],
        });
        const restored = StepsNode.importJSON(json as SerializedStepsNode);
        expect(restored.getSteps()).toEqual(json.steps);
      },
      { discrete: true },
    );
  });

  it('keeps the block id across a parse round trip', () => {
    const editor = makeEditor();
    const state = editor.parseEditorState(
      JSON.stringify({
        root: {
          type: 'root',
          version: 1,
          direction: null,
          format: '',
          indent: 0,
          children: [
            {
              type: 'steps',
              version: 1,
              steps: [{ id: 's_a', title: 'One', content: content('x') }],
              $: { blockId: 'b1' },
            },
          ],
        },
      }),
    );
    editor.setEditorState(state);
    const out = editor.getEditorState().toJSON().root.children[0] as any;
    expect(out.$).toEqual({ blockId: 'b1' });
    expect(out.steps[0].title).toBe('One');
  });

  it('gives an id to imported steps that lack one', () => {
    const editor = makeEditor();
    editor.update(
      () => {
        const node = StepsNode.importJSON({
          type: 'steps',
          version: 1,
          steps: [{ title: 'No id', content: content('x') }],
        } as unknown as SerializedStepsNode);
        const [step] = node.getSteps();
        expect(step.id).toMatch(/^s_[\da-z]+$/);
        expect(step.title).toBe('No id');
      },
      { discrete: true },
    );
  });

  it('includes titles and content in getTextContent', () => {
    const editor = makeEditor();
    editor.update(
      () => {
        const node = $createStepsNode([
          { id: 's_a', title: 'Install', content: content('Download it') },
        ]);
        $getRoot().append(node);
        expect($isStepsNode(node)).toBe(true);
        expect(node.getTextContent()).toContain('Install');
        expect(node.getTextContent()).toContain('Download it');
      },
      { discrete: true },
    );
  });
});
