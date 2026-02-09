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

import { VideoRenderer } from '../components/renderers/VideoRenderer'
import { RendererWrapper } from '../components/RendererWrapper'

export type SerializedVideoNode = Spread<
  {
    src: string
    poster?: string
    width?: number
    height?: number
  },
  SerializedLexicalNode
>

export interface VideoNodePayload {
  src: string
  poster?: string
  width?: number
  height?: number
}

export class VideoNode extends DecoratorNode<ReactElement> {
  __src: string
  __poster?: string
  __width?: number
  __height?: number

  static getType(): string {
    return 'video'
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(
      {
        src: node.__src,
        poster: node.__poster,
        width: node.__width,
        height: node.__height,
      },
      node.__key,
    )
  }

  constructor(payload: VideoNodePayload, key?: NodeKey) {
    super(key)
    this.__src = payload.src
    this.__poster = payload.poster
    this.__width = payload.width
    this.__height = payload.height
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'rich-video-wrapper'
    return div
  }

  updateDOM(): boolean {
    return false
  }

  isInline(): boolean {
    return false
  }

  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
    return $createVideoNode({
      src: serializedNode.src,
      poster: serializedNode.poster,
      width: serializedNode.width,
      height: serializedNode.height,
    })
  }

  exportJSON(): SerializedVideoNode {
    return {
      ...super.exportJSON(),
      type: 'video',
      src: this.__src,
      poster: this.__poster,
      width: this.__width,
      height: this.__height,
      version: 1,
    }
  }

  getSrc(): string {
    return this.getLatest().__src
  }

  setSrc(src: string): void {
    const writable = this.getWritable()
    writable.__src = src
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(RendererWrapper, {
      rendererKey: 'Video',
      defaultRenderer: VideoRenderer,
      props: {
        src: this.__src,
        poster: this.__poster,
        width: this.__width,
        height: this.__height,
      },
    })
  }
}

export function $createVideoNode(payload: VideoNodePayload): VideoNode {
  return new VideoNode(payload)
}

export function $isVideoNode(
  node: LexicalNode | null | undefined,
): node is VideoNode {
  return node instanceof VideoNode
}
