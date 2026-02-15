import type { EditorConfig, LexicalEditor } from 'lexical'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { AlertEditDecorator } from '../components/decorators/AlertEditDecorator'
import { AlertQuoteNode, type SerializedAlertQuoteNode } from './AlertQuoteNode'

export class AlertQuoteEditNode extends AlertQuoteNode {
  static clone(node: AlertQuoteEditNode): AlertQuoteEditNode {
    return new AlertQuoteEditNode(
      node.__alertType,
      node.__contentEditor,
      node.__key,
    )
  }

  static importJSON(
    serializedNode: SerializedAlertQuoteNode,
  ): AlertQuoteEditNode {
    const node = new AlertQuoteEditNode(serializedNode.alertType)
    if (serializedNode.content) {
      const editorState = node.__contentEditor.parseEditorState(
        serializedNode.content,
      )
      node.__contentEditor.setEditorState(editorState)
    }
    return node
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(AlertEditDecorator, {
      nodeKey: this.__key,
      alertType: this.__alertType,
      contentEditor: this.__contentEditor,
    })
  }
}
