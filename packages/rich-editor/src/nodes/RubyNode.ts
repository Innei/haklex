import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { $createTextNode, ElementNode } from 'lexical';

import { semanticClassNames, sharedStyles } from '../styles/shared.css';

export type SerializedRubyNode = Spread<
  {
    reading: string;
  },
  SerializedElementNode
>;

function readBaseTextFromRuby(element: HTMLElement): string {
  let base = '';

  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      base += child.textContent ?? '';
      continue;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) continue;

    const childElement = child as HTMLElement;
    const tag = childElement.tagName.toLowerCase();

    if (tag === 'rt' || tag === 'rp') continue;

    base += childElement.textContent ?? '';
  }

  return base;
}

export class RubyNode extends ElementNode {
  __reading: string;

  static getType(): string {
    return 'ruby';
  }

  static clone(node: RubyNode): RubyNode {
    return new RubyNode(node.__reading, node.__key);
  }

  constructor(reading: string, key?: NodeKey) {
    super(key);
    this.__reading = reading;
  }

  static importJSON(_serializedNode: SerializedLexicalNode & Record<string, unknown>): RubyNode {
    const serializedNode = _serializedNode as unknown as SerializedRubyNode;
    return $createRubyNode(serializedNode.reading ?? '');
  }

  exportJSON(): SerializedRubyNode {
    return {
      ...super.exportJSON(),
      type: 'ruby',
      reading: this.__reading,
      version: 1,
    };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      ruby: () => ({
        conversion: (domNode: Node): DOMConversionOutput | null => {
          if (!(domNode instanceof HTMLElement)) return null;

          const reading = domNode.querySelector('rt')?.textContent ?? '';
          const baseText = readBaseTextFromRuby(domNode);

          const node = $createRubyNode(reading);
          if (baseText) {
            node.append($createTextNode(baseText));
          }

          return { node };
        },
        priority: 2,
      }),
    };
  }

  exportDOM(): DOMExportOutput {
    const ruby = document.createElement('ruby');
    ruby.className = `${semanticClassNames.ruby} ${sharedStyles.ruby}`;

    const baseText = this.getTextContent();
    if (baseText) {
      ruby.append(baseText);
    }

    if (this.__reading) {
      const rt = document.createElement('rt');
      rt.className = `${semanticClassNames.rubyRt} ${sharedStyles.rubyRt}`;
      rt.textContent = this.__reading;
      ruby.append(rt);
    }

    return { element: ruby };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    span.className = `${semanticClassNames.ruby} ${sharedStyles.ruby}`;

    if (this.__reading) {
      span.dataset.ruby = this.__reading;
    }

    return span;
  }

  updateDOM(prevNode: RubyNode, dom: HTMLElement): boolean {
    if (prevNode.__reading !== this.__reading) {
      if (this.__reading) {
        dom.dataset.ruby = this.__reading;
      } else {
        delete dom.dataset.ruby;
      }
    }

    return false;
  }

  canInsertTextBefore(): boolean {
    return true;
  }

  canInsertTextAfter(): boolean {
    return true;
  }

  isInline(): boolean {
    return true;
  }

  getReading(): string {
    return this.getLatest().__reading;
  }

  setReading(reading: string): void {
    const writable = this.getWritable();
    writable.__reading = reading;
  }
}

export function $createRubyNode(reading: string): RubyNode {
  return new RubyNode(reading);
}

export function $isRubyNode(node: LexicalNode | null | undefined): node is RubyNode {
  return node instanceof RubyNode;
}
