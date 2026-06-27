import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { DecoratorNode } from 'lexical';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { EmbedStaticRenderer } from '../renderers/EmbedStaticRenderer';
import { semanticClassNames, wrapper } from '../styles.css';
import type { EmbedType } from '../url-matchers';

export type SerializedEmbedNode = Spread<
  { url: string; source: EmbedType | null },
  SerializedLexicalNode
>;

export class EmbedNode extends DecoratorNode<ReactElement> {
  __url: string;
  __source: EmbedType | null;

  static getType(): string {
    return 'embed';
  }

  static clone(node: EmbedNode): EmbedNode {
    return new EmbedNode(node.__url, node.__source, node.__key);
  }

  constructor(url: string, source: EmbedType | null, key?: NodeKey) {
    super(key);
    this.__url = url;
    this.__source = source;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.className = `${wrapper} ${semanticClassNames.wrapper}`;
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  static importJSON(_serializedNode: SerializedLexicalNode & Record<string, unknown>): EmbedNode {
    const serializedNode = _serializedNode as unknown as SerializedEmbedNode;
    return $createEmbedNode(serializedNode.url, serializedNode.source);
  }

  exportJSON(): SerializedEmbedNode {
    return {
      ...super.exportJSON(),
      type: 'embed',
      url: this.__url,
      source: this.__source,
      version: 1,
    };
  }

  getUrl(): string {
    return this.getLatest().__url;
  }

  setUrl(url: string): void {
    const writable = this.getWritable();
    writable.__url = url;
  }

  getSource(): EmbedType | null {
    return this.getLatest().__source;
  }

  setSource(source: EmbedType | null): void {
    const writable = this.getWritable();
    writable.__source = source;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(EmbedStaticRenderer, {
      type: this.__source,
      url: this.__url,
    });
  }
}

export function $createEmbedNode(url: string, source: EmbedType | null): EmbedNode {
  return new EmbedNode(url, source);
}

export function $isEmbedNode(node: LexicalNode | null | undefined): node is EmbedNode {
  return node instanceof EmbedNode;
}
