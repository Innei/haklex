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

import { KaTeXRenderer } from '../components/renderers/KaTeXRenderer'
import { RendererWrapper } from '../components/RendererWrapper'

export type SerializedKaTeXBlockNode = Spread<
  {
    equation: string
  },
  SerializedLexicalNode
>

export class KaTeXBlockNode extends DecoratorNode<ReactElement> {
  __equation: string

  static getType(): string {
    return 'katex-block'
  }

  static clone(node: KaTeXBlockNode): KaTeXBlockNode {
    return new KaTeXBlockNode(node.__equation, node.__key)
  }

  constructor(equation: string, key?: NodeKey) {
    super(key)
    this.__equation = equation
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'rich-katex-block-wrapper'
    return div
  }

  updateDOM(): boolean {
    return false
  }

  isInline(): boolean {
    return false
  }

  static importJSON(serializedNode: SerializedKaTeXBlockNode): KaTeXBlockNode {
    return $createKaTeXBlockNode(serializedNode.equation)
  }

  exportJSON(): SerializedKaTeXBlockNode {
    return {
      ...super.exportJSON(),
      type: 'katex-block',
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
    return createElement(RendererWrapper as any, {
      rendererKey: 'KaTeX',
      defaultRenderer: KaTeXRenderer,
      props: {
        equation: this.__equation,
        displayMode: true,
      },
    })
  }
}

export function $createKaTeXBlockNode(equation: string): KaTeXBlockNode {
  return new KaTeXBlockNode(equation)
}

export function $isKaTeXBlockNode(
  node: LexicalNode | null | undefined,
): node is KaTeXBlockNode {
  return node instanceof KaTeXBlockNode
}
