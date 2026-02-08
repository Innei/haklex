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

import { ImageRenderer } from '../components/renderers/ImageRenderer'

export type SerializedImageNode = Spread<
  {
    src: string
    altText: string
    width?: number
    height?: number
    caption?: string
  },
  SerializedLexicalNode
>

export interface ImageNodePayload {
  src: string
  altText: string
  width?: number
  height?: number
  caption?: string
}

export class ImageNode extends DecoratorNode<ReactElement> {
  __src: string
  __altText: string
  __width?: number
  __height?: number
  __caption?: string

  static getType(): string {
    return 'image'
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      {
        src: node.__src,
        altText: node.__altText,
        width: node.__width,
        height: node.__height,
        caption: node.__caption,
      },
      node.__key,
    )
  }

  constructor(payload: ImageNodePayload, key?: NodeKey) {
    super(key)
    this.__src = payload.src
    this.__altText = payload.altText
    this.__width = payload.width
    this.__height = payload.height
    this.__caption = payload.caption
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'rich-image-wrapper'
    return div
  }

  updateDOM(): boolean {
    return false
  }

  isInline(): boolean {
    return false
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return $createImageNode({
      src: serializedNode.src,
      altText: serializedNode.altText,
      width: serializedNode.width,
      height: serializedNode.height,
      caption: serializedNode.caption,
    })
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      type: 'image',
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      caption: this.__caption,
      version: 1,
    }
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(ImageRenderer, {
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      caption: this.__caption,
    })
  }
}

export function $createImageNode(payload: ImageNodePayload): ImageNode {
  return new ImageNode(payload)
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode
}
