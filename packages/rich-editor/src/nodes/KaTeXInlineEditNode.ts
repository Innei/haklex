import type { EditorConfig, LexicalEditor } from 'lexical'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { KaTeXEditDecorator } from '../components/decorators/KaTeXEditDecorator'
import { KaTeXRenderer } from '../components/renderers/KaTeXRenderer'
import { createRendererDecoration } from '../components/RendererWrapper'
import {
  KaTeXInlineNode,
  type SerializedKaTeXInlineNode,
} from './KaTeXInlineNode'

export class KaTeXInlineEditNode extends KaTeXInlineNode {
  static clone(node: KaTeXInlineEditNode): KaTeXInlineEditNode {
    return new KaTeXInlineEditNode(node.__equation, node.__key)
  }

  static importJSON(
    serializedNode: SerializedKaTeXInlineNode,
  ): KaTeXInlineEditNode {
    return new KaTeXInlineEditNode(serializedNode.equation)
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    const rendererEl = createRendererDecoration('KaTeX', KaTeXRenderer, {
      equation: this.__equation,
      displayMode: false,
    })
    return createElement(KaTeXEditDecorator, {
      nodeKey: this.__key,
      equation: this.__equation,
      displayMode: false,
      children: rendererEl,
    })
  }
}
