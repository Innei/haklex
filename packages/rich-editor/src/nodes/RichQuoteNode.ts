import { QuoteNode, type SerializedQuoteNode } from '@lexical/rich-text';
import type {
  DOMExportOutput,
  EditorConfig,
  ElementDOMSlot,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { isHTMLElement, setDOMUnmanaged } from 'lexical';

const ATTRIBUTION_SLOT_ATTR = 'data-quote-attribution-slot';

function findAttributionSlot(element: HTMLElement): HTMLElement | null {
  for (const child of element.children) {
    if (child.hasAttribute(ATTRIBUTION_SLOT_ATTR)) return child as HTMLElement;
  }
  return null;
}

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

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    const slot = document.createElement('div');
    slot.setAttribute(ATTRIBUTION_SLOT_ATTR, '');
    slot.contentEditable = 'false';
    setDOMUnmanaged(slot, { captureSelection: true });
    dom.append(slot);
    return dom;
  }

  getDOMSlot(element: HTMLElement): ElementDOMSlot<HTMLElement> {
    return super.getDOMSlot(element).withBefore(findAttributionSlot(element));
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const output = super.exportDOM(editor);
    const { element } = output;
    if (!isHTMLElement(element)) return output;
    findAttributionSlot(element)?.remove();
    const attribution = this.getAttribution();
    if (!attribution) return output;
    return {
      ...output,
      after: (generated) => {
        const target = output.after ? output.after(generated) : generated;
        if (isHTMLElement(target)) {
          const footer = document.createElement('footer');
          footer.textContent = `— ${attribution}`;
          target.append(footer);
        }
        return target;
      },
    };
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
