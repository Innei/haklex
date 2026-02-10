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

import { KaTeXEditDecorator } from '../components/decorators/KaTeXEditDecorator'
import { KaTeXRenderer } from '../components/renderers/KaTeXRenderer'
import { RendererWrapper } from '../components/RendererWrapper'

export type SerializedKaTeXInlineNode = Spread<
  {
    equation: string
  },
  SerializedLexicalNode
>

export class KaTeXInlineNode extends DecoratorNode<ReactElement> {
  __equation: string

  static getType(): string {
    return 'katex-inline'
  }

  static clone(node: KaTeXInlineNode): KaTeXInlineNode {
    return new KaTeXInlineNode(node.__equation, node.__key)
  }

  constructor(equation: string, key?: NodeKey) {
    super(key)
    this.__equation = equation
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

  static importJSON(
    serializedNode: SerializedKaTeXInlineNode,
  ): KaTeXInlineNode {
    return $createKaTeXInlineNode(serializedNode.equation)
  }

  exportJSON(): SerializedKaTeXInlineNode {
    return {
      ...super.exportJSON(),
      type: 'katex-inline',
      equation: this.__equation,
      version: 1,
    }
  }

  getEquation(): string {
    return this.__equation
  }

  setEquation(equation: string): void {
    const writable = this.getWritable()
    writable.__equation = equation
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    const rendererEl = createElement(RendererWrapper as any, {
      rendererKey: 'KaTeX',
      defaultRenderer: KaTeXRenderer,
      props: {
        equation: this.__equation,
        displayMode: false,
      },
    })
    return createElement(KaTeXEditDecorator, {
      nodeKey: this.__key,
      equation: this.__equation,
      displayMode: false,
      children: rendererEl,
    })
  }
}

export function $createKaTeXInlineNode(equation: string): KaTeXInlineNode {
  return new KaTeXInlineNode(equation)
}

export function $isKaTeXInlineNode(
  node: LexicalNode | null | undefined,
): node is KaTeXInlineNode {
  return node instanceof KaTeXInlineNode
}
