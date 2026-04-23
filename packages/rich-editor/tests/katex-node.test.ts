import { createEditor } from 'lexical';
import { describe, expect, it, vi } from 'vitest';

import { $createKaTeXBlockNode, KaTeXBlockNode } from '../src/nodes/KaTeXBlockNode';
import { $createKaTeXInlineNode, KaTeXInlineNode } from '../src/nodes/KaTeXInlineNode';
import { DEFAULT_KATEX_EQUATION } from '../src/utils/katex-defaults';

vi.mock('../src/components/RendererWrapper', () => ({
  createRendererDecoration: vi.fn(),
}));

vi.mock('../src/components/renderers/KaTeXRenderer', () => ({
  KaTeXRenderer: vi.fn(),
}));

describe('KaTeX node creation', () => {
  it('injects the default block equation into the node when auto-open creation is requested', () => {
    const editor = createEditor({
      namespace: 'KaTeXBlockNodeTest',
      nodes: [KaTeXBlockNode],
      onError: (error) => {
        throw error;
      },
    });

    editor.update(() => {
      const existingNode = $createKaTeXBlockNode('x');
      const insertedNode = $createKaTeXBlockNode('', { autoOpenOnMount: true });

      expect(existingNode.getEquation()).toBe('x');
      expect(existingNode.getShouldAutoOpenOnMount()).toBe(false);
      expect(insertedNode.getEquation()).toBe(DEFAULT_KATEX_EQUATION);
      expect(insertedNode.getShouldAutoOpenOnMount()).toBe(true);
    });
  });

  it('injects the default inline equation into the node when auto-open creation is requested', () => {
    const editor = createEditor({
      namespace: 'KaTeXInlineNodeTest',
      nodes: [KaTeXInlineNode],
      onError: (error) => {
        throw error;
      },
    });

    editor.update(() => {
      const existingNode = $createKaTeXInlineNode('x');
      const insertedNode = $createKaTeXInlineNode('', { autoOpenOnMount: true });

      expect(existingNode.getEquation()).toBe('x');
      expect(existingNode.getShouldAutoOpenOnMount()).toBe(false);
      expect(insertedNode.getEquation()).toBe(DEFAULT_KATEX_EQUATION);
      expect(insertedNode.getShouldAutoOpenOnMount()).toBe(true);
    });
  });

  it('roundtrips color through JSON and preserves it across clone', () => {
    const editor = createEditor({
      namespace: 'KaTeXInlineColorTest',
      nodes: [KaTeXInlineNode],
      onError: (error) => {
        throw error;
      },
    });

    editor.update(() => {
      const node = $createKaTeXInlineNode('E=mc^2');
      expect(node.getColor()).toBeNull();

      node.setColor('#ef4444');
      expect(node.getColor()).toBe('#ef4444');

      const json = node.exportJSON();
      expect(json.color).toBe('#ef4444');

      const restored = KaTeXInlineNode.importJSON(json);
      expect(restored.getColor()).toBe('#ef4444');
    });
  });
});
