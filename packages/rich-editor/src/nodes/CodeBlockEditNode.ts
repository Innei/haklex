import type { EditorConfig, LexicalEditor } from 'lexical'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { CodeBlockEditDecorator } from '../components/decorators/CodeBlockEditDecorator'
import { CodeBlockNode, type SerializedCodeBlockNode } from './CodeBlockNode'

export class CodeBlockEditNode extends CodeBlockNode {
  static clone(node: CodeBlockEditNode): CodeBlockEditNode {
    return new CodeBlockEditNode(node.__code, node.__language, node.__key)
  }

  static importJSON(
    serializedNode: SerializedCodeBlockNode,
  ): CodeBlockEditNode {
    return new CodeBlockEditNode(serializedNode.code, serializedNode.language)
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(CodeBlockEditDecorator, {
      nodeKey: this.__key,
      code: this.__code,
      language: this.__language,
    })
  }
}
