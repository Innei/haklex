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
import { RendererWrapper } from '../components/RendererWrapper'

export type SerializedImageNode = Spread<
  {
    src: string
    altText: string
    width?: number
    height?: number
    caption?: string
    blurhash?: string
    accent?: string
  },
  SerializedLexicalNode
>

function sanitizeImageSrc(src: string): string {
  const trimmed = src.trim()
  if (/^(javascript\s*:|vbscript\s*:|data\s*:(?!image\/))/i.test(trimmed)) {
    return ''
  }
  return trimmed
}

function sanitizeColor(value: string | undefined): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (/^#[\da-f]{3,8}$/i.test(trimmed)) return trimmed
  if (/^(rgb|hsl)a?\([^)]+\)$/i.test(trimmed)) return trimmed
  if (/^[a-z]{3,20}$/i.test(trimmed)) return trimmed
  return undefined
}

export interface ImageNodePayload {
  src: string
  altText: string
  width?: number
  height?: number
  caption?: string
  blurhash?: string
  accent?: string
}

export class ImageNode extends DecoratorNode<ReactElement> {
  __src: string
  __altText: string
  __width?: number
  __height?: number
  __caption?: string
  __blurhash?: string
  __accent?: string

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
        blurhash: node.__blurhash,
        accent: node.__accent,
      },
      node.__key,
    )
  }

  constructor(payload: ImageNodePayload, key?: NodeKey) {
    super(key)
    this.__src = sanitizeImageSrc(payload.src)
    this.__altText = payload.altText
    this.__width = payload.width
    this.__height = payload.height
    this.__caption = payload.caption
    this.__blurhash = payload.blurhash
    this.__accent = sanitizeColor(payload.accent)
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
      blurhash: serializedNode.blurhash,
      accent: serializedNode.accent,
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
      blurhash: this.__blurhash,
      accent: this.__accent,
      version: 1,
    }
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(RendererWrapper as any, {
      rendererKey: 'Image',
      defaultRenderer: ImageRenderer,
      props: {
        src: this.__src,
        altText: this.__altText,
        width: this.__width,
        height: this.__height,
        caption: this.__caption,
        blurhash: this.__blurhash,
        accent: this.__accent,
      },
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
