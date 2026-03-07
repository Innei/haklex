import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { $insertNodes, DecoratorNode } from 'lexical';
import { Link } from 'lucide-react';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { LinkCardRenderer } from '../components/renderers/LinkCardRenderer';
import { createRendererDecoration } from '../components/RendererWrapper';
import type { CommandItemConfig } from '../types/slash-menu';

export type SerializedLinkCardNode = Spread<
  {
    url: string;
    source?: string;
    id?: string;
    title?: string;
    description?: string;
    favicon?: string;
    image?: string;
  },
  SerializedLexicalNode
>;

export interface LinkCardNodePayload {
  description?: string;
  favicon?: string;
  id?: string;
  image?: string;
  source?: string;
  title?: string;
  url: string;
}

export class LinkCardNode extends DecoratorNode<ReactElement> {
  __url: string;
  __source?: string;
  __id?: string;
  __title?: string;
  __description?: string;
  __favicon?: string;
  __image?: string;

  static commandItems: CommandItemConfig[] = [
    {
      title: 'Link Card',
      icon: createElement(Link, { size: 20 }),
      description: 'Link preview card',
      keywords: ['link', 'card', 'bookmark', 'embed'],
      section: 'MEDIA',
      placement: ['slash', 'toolbar'],
      group: 'insert',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createLinkCardNode({ url: '' })]);
        });
      },
    },
  ];

  static getType(): string {
    return 'link-card';
  }

  static clone(node: LinkCardNode): LinkCardNode {
    return new LinkCardNode(
      {
        url: node.__url,
        source: node.__source,
        id: node.__id,
        title: node.__title,
        description: node.__description,
        favicon: node.__favicon,
        image: node.__image,
      },
      node.__key,
    );
  }

  constructor(payload: LinkCardNodePayload, key?: NodeKey) {
    super(key);
    this.__url = payload.url;
    this.__source = payload.source;
    this.__id = payload.id;
    this.__title = payload.title;
    this.__description = payload.description;
    this.__favicon = payload.favicon;
    this.__image = payload.image;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.className = 'rich-link-card-wrapper';
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedLinkCardNode): LinkCardNode {
    return $createLinkCardNode({
      url: serializedNode.url,
      source: serializedNode.source,
      id: serializedNode.id,
      title: serializedNode.title,
      description: serializedNode.description,
      favicon: serializedNode.favicon,
      image: serializedNode.image,
    });
  }

  exportJSON(): SerializedLinkCardNode {
    return {
      ...super.exportJSON(),
      type: 'link-card',
      url: this.__url,
      source: this.__source,
      id: this.__id,
      title: this.__title,
      description: this.__description,
      favicon: this.__favicon,
      image: this.__image,
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

  getSource(): string | undefined {
    return this.getLatest().__source;
  }

  setSource(source: string | undefined): void {
    const writable = this.getWritable();
    writable.__source = source;
  }

  getId(): string | undefined {
    return this.getLatest().__id;
  }

  setId(id: string | undefined): void {
    const writable = this.getWritable();
    writable.__id = id;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createRendererDecoration('LinkCard', LinkCardRenderer, {
      url: this.__url,
      source: this.__source,
      id: this.__id,
      title: this.__title,
      description: this.__description,
      favicon: this.__favicon,
      image: this.__image,
    });
  }
}

export function $createLinkCardNode(payload: LinkCardNodePayload): LinkCardNode {
  return new LinkCardNode(payload);
}

export function $isLinkCardNode(node: LexicalNode | null | undefined): node is LinkCardNode {
  return node instanceof LinkCardNode;
}
