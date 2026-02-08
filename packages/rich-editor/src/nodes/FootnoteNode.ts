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

import { FootnoteRenderer } from '../components/renderers/FootnoteRenderer'

export type SerializedFootnoteNode = Spread<
  {
    identifier: string
  },
  SerializedLexicalNode
>

export class FootnoteNode extends DecoratorNode<ReactElement> {
  __identifier: string

  static getType(): string {
    return 'footnote'
  }

  static clone(node: FootnoteNode): FootnoteNode {
    return new FootnoteNode(node.__identifier, node.__key)
  }

  constructor(identifier: string, key?: NodeKey) {
    super(key)
    this.__identifier = identifier
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const sup = document.createElement('sup')
    sup.className = 'rich-footnote'
    return sup
  }

  updateDOM(): boolean {
    return false
  }

  isInline(): boolean {
    return true
  }

  static importJSON(serializedNode: SerializedFootnoteNode): FootnoteNode {
    return $createFootnoteNode(serializedNode.identifier)
  }

  exportJSON(): SerializedFootnoteNode {
    return {
      ...super.exportJSON(),
      type: 'footnote',
      identifier: this.__identifier,
      version: 1,
    }
  }

  getIdentifier(): string {
    return this.getLatest().__identifier
  }

  setIdentifier(identifier: string): void {
    const writable = this.getWritable()
    writable.__identifier = identifier
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(FootnoteRenderer, {
      identifier: this.__identifier,
    })
  }
}

export function $createFootnoteNode(identifier: string): FootnoteNode {
  return new FootnoteNode(identifier)
}

export function $isFootnoteNode(
  node: LexicalNode | null | undefined,
): node is FootnoteNode {
  return node instanceof FootnoteNode
}
