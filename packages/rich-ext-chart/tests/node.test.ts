import { $getRoot, $getState, $setState, createEditor, createState } from 'lexical';
import { describe, expect, it, vi } from 'vitest';

import { ChartEditNode } from '../src/ChartEditNode';
import {
  $createChartNode,
  $isChartNode,
  ChartNode,
  type SerializedChartNode,
  toChartSpecSource,
} from '../src/ChartNode';

vi.mock('@haklex/rich-editor/static', () => ({
  createRendererDecoration: vi.fn(),
  RendererWrapper: () => null,
}));

vi.mock('../src/ChartBlockRenderer', () => ({
  ChartBlockRenderer: () => null,
}));

vi.mock('../src/ChartEditRenderer', () => ({
  ChartEditRenderer: () => null,
}));

const SPEC = '{"version":1,"type":"bar","x":"k","series":[{"key":"v"}],"data":[{"k":"a","v":1}]}';

function makeEditor(nodes = [ChartNode]) {
  return createEditor({
    namespace: 'ChartNodeTest',
    nodes,
    onError: (error) => {
      throw error;
    },
  });
}

describe('ChartNode', () => {
  it('getType returns "chart"', () => {
    expect(ChartNode.getType()).toBe('chart');
  });

  it('exports { type, version, spec } with the raw spec string', () => {
    const editor = makeEditor();
    editor.update(() => {
      const json = $createChartNode(SPEC).exportJSON();
      expect(json).toEqual({ type: 'chart', version: 1, spec: SPEC });
      expect(ChartNode.importJSON(json as SerializedChartNode).exportJSON()).toEqual(json);
    });
  });

  it('keeps invalid JSON verbatim', () => {
    const editor = makeEditor();
    editor.update(() => {
      const broken = '{"type": "bar", ';
      const restored = ChartNode.importJSON({ type: 'chart', version: 1, spec: broken });
      expect(restored.getSpec()).toBe(broken);
    });
  });

  it('coerces a missing or object spec into a string', () => {
    expect(toChartSpecSource(undefined)).toBe('');
    expect(toChartSpecSource({ type: 'bar' })).toBe('{"type":"bar"}');
    const editor = makeEditor();
    editor.update(() => {
      expect(ChartNode.importJSON({ type: 'chart', version: 1 }).getSpec()).toBe('');
    });
  });

  it('setSpec mutates via writable and clone preserves spec', () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createChartNode();
      node.setSpec(SPEC);
      expect(node.getSpec()).toBe(SPEC);
      expect(ChartNode.clone(node).exportJSON()).toEqual(node.exportJSON());
    });
  });

  it('is a block-level node', () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createChartNode(SPEC);
      expect(node.isInline()).toBe(false);
      expect($isChartNode(node)).toBe(true);
      expect($isChartNode(null)).toBe(false);
    });
  });
});

it.each([ChartNode, ChartEditNode])('%s round-trips block identity and spec', (NodeClass) => {
  const blockId = createState('blockId', {
    parse: (value) => (typeof value === 'string' ? value : ''),
  });
  const editor = makeEditor([NodeClass]);
  editor.update(
    () => {
      const node = new NodeClass(SPEC);
      $setState(node, blockId, 'c1');
      $getRoot().append(node);
    },
    { discrete: true },
  );
  const saved = editor.getEditorState().toJSON();
  expect(saved.root.children[0]).toEqual({
    type: 'chart',
    version: 1,
    spec: SPEC,
    $: { blockId: 'c1' },
  });
  editor.setEditorState(editor.parseEditorState(saved));
  editor.read(() => {
    const target = $getRoot().getFirstChild();
    expect(target).toBeInstanceOf(NodeClass);
    expect($getState(target!, blockId)).toBe('c1');
    expect((target as ChartNode).getSpec()).toBe(SPEC);
  });
});
