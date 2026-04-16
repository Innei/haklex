import { createEditor } from 'lexical';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/components/RendererWrapper', () => ({
  createRendererDecoration: vi.fn(),
}));

vi.mock('../src/components/renderers/KaTeXRenderer', () => ({
  KaTeXRenderer: vi.fn(),
}));

import { $createKaTeXBlockNode } from '../src/nodes/KaTeXBlockNode';
import { $createKaTeXInlineNode, KaTeXInlineNode } from '../src/nodes/KaTeXInlineNode';
import { KaTeXBlockNode } from '../src/nodes/KaTeXBlockNode';
import { DEFAULT_KATEX_EQUATION } from '../src/utils/katex-defaults';

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
});
