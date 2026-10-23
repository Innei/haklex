import type { SerializedEditorState } from 'lexical';
import { $createParagraphNode, $createTextNode, $getRoot, createEditor } from 'lexical';
import { describe, expect, it, vi } from 'vitest';

import { $createStepsEditNode, StepsEditNode } from '../src/nodes/StepsEditNode';
import type { SerializedStepsNode } from '../src/types';

vi.mock('@haklex/rich-editor/renderers', () => ({
  createRendererDecoration: vi.fn(),
}));

vi.mock('../src/StepsRenderer', () => ({ StepsRenderer: vi.fn() }));
vi.mock('../src/StepsEditDecorator', () => ({ StepsEditDecorator: vi.fn() }));

vi.mock('@haklex/rich-editor', async () => {
  const lexical = await import('lexical');
  return {
    NESTED_EDITOR_NODES: [],
    createNestedEditor: (namespace: string) =>
      lexical.createEditor({
        namespace,
        nodes: [],
        onError: (e: Error) => {
          throw e;
        },
      }),
  };
});

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
    namespace: 'StepsEditTest',
    nodes: [StepsEditNode],
    onError: (error) => {
      throw error;
    },
  });
}

function run<T>(fn: () => T): T {
  const editor = makeEditor();
  let out!: T;
  editor.update(
    () => {
      out = fn();
    },
    { discrete: true },
  );
  return out;
}

const twoSteps = () =>
  StepsEditNode.importJSON({
    type: 'steps',
    version: 1,
    steps: [
      { id: 'a', title: 'One', content: content('first') },
      { id: 'b', title: 'Two', content: content('second') },
    ],
  } as SerializedStepsNode);

const textOf = (json: SerializedStepsNode) =>
  json.steps.map((s) => (s.content.root.children[0] as any).children[0]?.text ?? '');

describe('StepsEditNode', () => {
  it('starts with one empty step when created from the menu', () => {
    const json = run(() => $createStepsEditNode().exportJSON());
    expect(json.steps).toHaveLength(1);
    expect(json.steps[0].title).toBe('');
  });

  it('exports content from the step editors', () => {
    const json = run(() => {
      const node = twoSteps();
      node.getStepEditors()[0].update(
        () => {
          const p = $createParagraphNode().append($createTextNode('edited'));
          $getRoot().clear().append(p);
        },
        { discrete: true },
      );
      return node.exportJSON();
    });
    expect(textOf(json)).toEqual(['edited', 'second']);
  });

  it('sets a title by step id', () => {
    const json = run(() => {
      const node = twoSteps();
      node.setStepTitle('b', 'Renamed');
      return node.exportJSON();
    });
    expect(json.steps.map((s) => s.title)).toEqual(['One', 'Renamed']);
  });

  it('adds an empty step after the given one', () => {
    const json = run(() => {
      const node = twoSteps();
      node.addStepAfter('a');
      return node.exportJSON();
    });
    expect(json.steps.map((s) => s.title)).toEqual(['One', '', 'Two']);
    expect(json.steps[1].id).not.toBe('a');
    expect(textOf(json)).toEqual(['first', '', 'second']);
  });

  it('moves a step and its content together', () => {
    const json = run(() => {
      const node = twoSteps();
      node.moveStep('b', -1);
      return node.exportJSON();
    });
    expect(json.steps.map((s) => s.id)).toEqual(['b', 'a']);
    expect(textOf(json)).toEqual(['second', 'first']);
  });

  it('ignores moves past either end', () => {
    const json = run(() => {
      const node = twoSteps();
      node.moveStep('a', -1);
      node.moveStep('b', 1);
      return node.exportJSON();
    });
    expect(json.steps.map((s) => s.id)).toEqual(['a', 'b']);
  });

  it('removes a step and its content', () => {
    const json = run(() => {
      const node = twoSteps();
      node.removeStep('a');
      return node.exportJSON();
    });
    expect(json.steps.map((s) => s.id)).toEqual(['b']);
    expect(textOf(json)).toEqual(['second']);
  });

  it('leaves one empty step when the last one is removed', () => {
    const json = run(() => {
      const node = twoSteps();
      node.removeStep('a');
      node.removeStep('b');
      return node.exportJSON();
    });
    expect(json.steps).toHaveLength(1);
    expect(json.steps[0].title).toBe('');
    expect(json.steps[0].id).not.toBe('b');
  });
});
