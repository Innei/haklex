import { QuoteNode, type SerializedQuoteNode } from '@lexical/rich-text';
import type { LexicalNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical';

export type SerializedRichQuoteNode = Spread<{ attribution: string | null }, SerializedQuoteNode>;

function normalizeAttribution(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export class RichQuoteNode extends QuoteNode {
  __attribution: string | null;

  constructor(attribution: string | null = null, key?: NodeKey) {
    super(key);
    this.__attribution = normalizeAttribution(attribution);
  }

  static getType(): string {
    return 'rich-quote';
  }

  static clone(node: RichQuoteNode): RichQuoteNode {
    return new RichQuoteNode(node.__attribution, node.__key);
  }

  static importJSON(
    _serializedNode: SerializedLexicalNode & Record<string, unknown>,
  ): RichQuoteNode {
    const serializedNode = _serializedNode as unknown as SerializedRichQuoteNode;
    const node = $createRichQuoteNode(serializedNode.attribution ?? null);
    return node.updateFromJSON(serializedNode);
  }

  exportJSON(): SerializedRichQuoteNode {
    return {
      ...super.exportJSON(),
      type: 'rich-quote',
      attribution: this.__attribution,
    };
  }

  getAttribution(): string | null {
    return this.getLatest().__attribution;
  }

  setAttribution(value: string | null): this {
    const writable = this.getWritable();
    writable.__attribution = normalizeAttribution(value);
    return writable;
  }
}

export function $createRichQuoteNode(attribution: string | null = null): RichQuoteNode {
  return new RichQuoteNode(attribution);
}

export function $isRichQuoteNode(node: LexicalNode | null | undefined): node is RichQuoteNode {
  return node instanceof RichQuoteNode;
}
