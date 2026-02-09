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

import { MentionRenderer } from '../components/renderers/MentionRenderer'
import { RendererWrapper } from '../components/RendererWrapper'

export type SerializedMentionNode = Spread<
  {
    platform: string
    handle: string
  },
  SerializedLexicalNode
>

export class MentionNode extends DecoratorNode<ReactElement> {
  __platform: string
  __handle: string

  static getType(): string {
    return 'mention'
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__platform, node.__handle, node.__key)
  }

  constructor(platform: string, handle: string, key?: NodeKey) {
    super(key)
    this.__platform = platform
    this.__handle = handle
  }

  createDOM(_config: EditorConfig): HTMLElement {
    return document.createElement('span')
  }

  updateDOM(): boolean {
    return false
  }

  isInline(): boolean {
    return true
  }

  getPlatform(): string {
    return this.getLatest().__platform
  }

  getHandle(): string {
    return this.getLatest().__handle
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    return $createMentionNode(serializedNode.platform, serializedNode.handle)
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      type: 'mention',
      platform: this.__platform,
      handle: this.__handle,
      version: 1,
    }
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(RendererWrapper as any, {
      rendererKey: 'Mention',
      defaultRenderer: MentionRenderer,
      props: {
        platform: this.__platform,
        handle: this.__handle,
      },
    })
  }
}

export function $createMentionNode(
  platform: string,
  handle: string,
): MentionNode {
  return new MentionNode(platform, handle)
}

export function $isMentionNode(
  node: LexicalNode | null | undefined,
): node is MentionNode {
  return node instanceof MentionNode
}
