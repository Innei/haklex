import { QuoteNode } from '@lexical/rich-text';
import { createEditor } from 'lexical';
import { describe, expect, it } from 'vitest';

import { $createRichQuoteNode, RichQuoteNode } from '../src/nodes/RichQuoteNode';

describe('RichQuoteNode', () => {
  it('reports its type as rich-quote', () => {
    expect(RichQuoteNode.getType()).toBe('rich-quote');
  });

  it('round-trips attribution through exportJSON / importJSON', () => {
    const editor = createEditor({
      namespace: 'RichQuoteNodeTest',
      nodes: [QuoteNode, RichQuoteNode, { replace: QuoteNode, with: () => new RichQuoteNode() }],
      onError: (error) => {
        throw error;
      },
    });

    editor.update(() => {
      const node = $createRichQuoteNode('Author, Work');
      expect(node.getAttribution()).toBe('Author, Work');

      const json = node.exportJSON();
      expect(json.type).toBe('rich-quote');
      expect(json.attribution).toBe('Author, Work');

      const restored = RichQuoteNode.importJSON(json);
      expect(restored.getAttribution()).toBe('Author, Work');
    });
  });

  it('treats null attribution as null', () => {
    const editor = createEditor({
      namespace: 'RichQuoteNodeNullTest',
      nodes: [QuoteNode, RichQuoteNode, { replace: QuoteNode, with: () => new RichQuoteNode() }],
      onError: (error) => {
        throw error;
      },
    });

    editor.update(() => {
      const node = $createRichQuoteNode();
      expect(node.getAttribution()).toBeNull();
      const json = node.exportJSON();
      expect(json.attribution).toBeNull();
    });
  });

  it('normalizes empty / whitespace attribution to null', () => {
    const editor = createEditor({
      namespace: 'RichQuoteNodeNormalizeTest',
      nodes: [QuoteNode, RichQuoteNode, { replace: QuoteNode, with: () => new RichQuoteNode() }],
      onError: (error) => {
        throw error;
      },
    });

    editor.update(() => {
      const node = $createRichQuoteNode('   ');
      expect(node.getAttribution()).toBeNull();

      const node2 = $createRichQuoteNode('Innei');
      node2.setAttribution('  ');
      expect(node2.getAttribution()).toBeNull();

      node2.setAttribution('  spaced  ');
      expect(node2.getAttribution()).toBe('spaced');
    });
  });
});
