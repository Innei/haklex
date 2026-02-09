import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import { DecoratorNode } from 'lexical'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { LinkCardRenderer } from '../components/renderers/LinkCardRenderer'
import { RendererWrapper } from '../components/RendererWrapper'

export type SerializedLinkCardNode = Spread<
  {
    url: string
    title?: string
    description?: string
    favicon?: string
    image?: string
  },
  SerializedLexicalNode
>

export interface LinkCardNodePayload {
  url: string
  title?: string
  description?: string
  favicon?: string
  image?: string
}

export class LinkCardNode extends DecoratorNode<ReactElement> {
  __url: string
  __title?: string
  __description?: string
  __favicon?: string
  __image?: string

  static getType(): string {
    return 'link-card'
  }

  static clone(node: LinkCardNode): LinkCardNode {
    return new LinkCardNode(
      {
        url: node.__url,
        title: node.__title,
        description: node.__description,
        favicon: node.__favicon,
        image: node.__image,
      },
      node.__key,
    )
  }

  constructor(payload: LinkCardNodePayload, key?: NodeKey) {
    super(key)
    this.__url = payload.url
    this.__title = payload.title
    this.__description = payload.description
    this.__favicon = payload.favicon
    this.__image = payload.image
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'rich-link-card-wrapper'
    return div
  }

  updateDOM(): boolean {
    return false
  }

  isInline(): boolean {
    return false
  }

  static importJSON(serializedNode: SerializedLinkCardNode): LinkCardNode {
    return $createLinkCardNode({
      url: serializedNode.url,
      title: serializedNode.title,
      description: serializedNode.description,
      favicon: serializedNode.favicon,
      image: serializedNode.image,
    })
  }

  exportJSON(): SerializedLinkCardNode {
    return {
      ...super.exportJSON(),
      type: 'link-card',
      url: this.__url,
      title: this.__title,
      description: this.__description,
      favicon: this.__favicon,
      image: this.__image,
      version: 1,
    }
  }

  getUrl(): string {
    return this.getLatest().__url
  }

  setUrl(url: string): void {
    const writable = this.getWritable()
    writable.__url = url
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(RendererWrapper as any, {
      rendererKey: 'LinkCard',
      defaultRenderer: LinkCardRenderer,
      props: {
        url: this.__url,
        title: this.__title,
        description: this.__description,
        favicon: this.__favicon,
        image: this.__image,
      },
    })
  }
}

export function $createLinkCardNode(
  payload: LinkCardNodePayload,
): LinkCardNode {
  return new LinkCardNode(payload)
}

export function $isLinkCardNode(
  node: LexicalNode | null | undefined,
): node is LinkCardNode {
  return node instanceof LinkCardNode
}
