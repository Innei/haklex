import type { EditorConfig, LexicalEditor } from 'lexical'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { KaTeXEditDecorator } from '../components/decorators/KaTeXEditDecorator'
import { KaTeXRenderer } from '../components/renderers/KaTeXRenderer'
import { createRendererDecoration } from '../components/RendererWrapper'
import { KaTeXBlockNode, type SerializedKaTeXBlockNode } from './KaTeXBlockNode'

export class KaTeXBlockEditNode extends KaTeXBlockNode {
  static clone(node: KaTeXBlockEditNode): KaTeXBlockEditNode {
    return new KaTeXBlockEditNode(node.__equation, node.__key)
  }

  static importJSON(
    serializedNode: SerializedKaTeXBlockNode,
  ): KaTeXBlockEditNode {
    return new KaTeXBlockEditNode(serializedNode.equation)
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    const rendererEl = createRendererDecoration('KaTeX', KaTeXRenderer, {
      equation: this.__equation,
      displayMode: true,
    })
    return createElement(KaTeXEditDecorator, {
      nodeKey: this.__key,
      equation: this.__equation,
      displayMode: true,
      children: rendererEl,
    })
  }
}
