import { createEditor } from 'lexical';
import { describe, expect, it, vi } from 'vitest';

import {
  $createDynamicNode,
  $isDynamicNode,
  DEFAULT_DYNAMIC_HEIGHT,
  DynamicNode,
  type SerializedDynamicNode,
} from '../src/DynamicNode';

vi.mock('@haklex/rich-editor/static', () => ({
  createRendererDecoration: vi.fn(),
}));

vi.mock('../src/DynamicSSRRenderer', () => ({
  DynamicSSRRenderer: () => null,
}));

function makeEditor() {
  return createEditor({
    namespace: 'DynamicNodeTest',
    nodes: [DynamicNode],
    onError: (error) => {
      throw error;
    },
  });
}

describe('DynamicNode', () => {
  it('getType returns "dynamic"', () => {
    expect(DynamicNode.getType()).toBe('dynamic');
  });

  it('exportJSON / importJSON round-trip preserves all fields', () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createDynamicNode({
        url: 'https://cdn.example.com/widget.mjs',
        props: { level: 1, labels: ['a', 'b'] },
        initialHeight: 480,
      });

      const json = node.exportJSON();
      expect(json).toMatchObject({
        type: 'dynamic',
        version: 1,
        url: 'https://cdn.example.com/widget.mjs',
        props: { level: 1, labels: ['a', 'b'] },
        initialHeight: 480,
      });

      const restored = DynamicNode.importJSON(json as SerializedDynamicNode);
      expect(restored.exportJSON()).toEqual(json);
    });
  });

  it('clone preserves all fields', () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createDynamicNode({
        url: 'https://cdn.example.com/widget.mjs',
        props: { theme: 'auto' },
        initialHeight: 200,
      });
      const cloned = DynamicNode.clone(node);
      expect(cloned.exportJSON()).toEqual(node.exportJSON());
    });
  });

  it('defaults empty payload', () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createDynamicNode();
      const json = node.exportJSON();
      expect(json.url).toBe('');
      expect(json.props).toEqual({});
      expect(json.initialHeight).toBe(DEFAULT_DYNAMIC_HEIGHT);
    });
  });

  it('setters mutate via writable', () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createDynamicNode();
      node.setUrl('https://cdn.example.com/widget.mjs');
      node.setProps({ level: 2 });
      node.setInitialHeight(600);
      expect(node.getUrl()).toBe('https://cdn.example.com/widget.mjs');
      expect(node.getProps()).toEqual({ level: 2 });
      expect(node.getInitialHeight()).toBe(600);
    });
  });

  it('$isDynamicNode narrows correctly', () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createDynamicNode();
      expect($isDynamicNode(node)).toBe(true);
      expect($isDynamicNode(null)).toBe(false);
      expect($isDynamicNode(undefined)).toBe(false);
    });
  });

  it('isInline returns false', () => {
    const editor = makeEditor();
    editor.update(() => {
      expect($createDynamicNode().isInline()).toBe(false);
    });
  });
});
