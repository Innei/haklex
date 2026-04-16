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

import { KaTeXRenderer } from '../components/renderers/KaTeXRenderer'
import { createRendererDecoration } from '../components/RendererWrapper'
import { resolveKaTeXEquation } from '../utils/katex-defaults'
import { getRegisteredNodeKlass } from '../utils/getRegisteredNodeKlass'

export type SerializedKaTeXInlineNode = Spread<
  {
    equation: string
  },
  SerializedLexicalNode
>

export class KaTeXInlineNode extends DecoratorNode<ReactElement> {
  __equation: string
  __autoOpenOnMount: boolean

  static getType(): string {
    return 'katex-inline'
  }

  static clone(node: KaTeXInlineNode): KaTeXInlineNode {
    return new KaTeXInlineNode(
      node.__equation,
      node.__key,
      node.__autoOpenOnMount,
    )
  }

  constructor(equation: string, key?: NodeKey, autoOpenOnMount = false) {
    super(key)
    this.__equation = equation
    this.__autoOpenOnMount = autoOpenOnMount
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

  getShouldAutoOpenOnMount(): boolean {
    return this.getLatest().__autoOpenOnMount
  }

  setShouldAutoOpenOnMount(autoOpenOnMount: boolean): void {
    const writable = this.getWritable()
    writable.__autoOpenOnMount = autoOpenOnMount
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createRendererDecoration('KaTeX', KaTeXRenderer, {
      equation: this.__equation,
      displayMode: false,
    })
  }
}

export function $createKaTeXInlineNode(
  equation: string,
  options?: { autoOpenOnMount?: boolean },
): KaTeXInlineNode {
  const NodeKlass = getRegisteredNodeKlass(
    KaTeXInlineNode.getType(),
    KaTeXInlineNode,
  )
  const node = new NodeKlass(resolveKaTeXEquation(equation, options))
  if (options?.autoOpenOnMount) {
    node.setShouldAutoOpenOnMount(true)
  }
  return node
}

export function $isKaTeXInlineNode(
  node: LexicalNode | null | undefined,
): node is KaTeXInlineNode {
  return node instanceof KaTeXInlineNode
}
