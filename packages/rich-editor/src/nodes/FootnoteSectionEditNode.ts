import type { EditorConfig, LexicalEditor } from 'lexical'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { FootnoteSectionEditRenderer } from '../components/renderers/FootnoteSectionEditRenderer'
import {
  FootnoteSectionNode,
  type SerializedFootnoteSectionNode,
} from './FootnoteSectionNode'

export class FootnoteSectionEditNode extends FootnoteSectionNode {
  static getType(): string {
    return 'footnote-section'
  }

  static clone(node: FootnoteSectionEditNode): FootnoteSectionEditNode {
    return new FootnoteSectionEditNode({ ...node.__definitions }, node.__key)
  }

  static importJSON(
    serializedNode: SerializedFootnoteSectionNode,
  ): FootnoteSectionEditNode {
    return new FootnoteSectionEditNode(serializedNode.definitions)
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(FootnoteSectionEditRenderer, {
      definitions: this.__definitions,
      nodeKey: this.__key,
    })
  }
}
