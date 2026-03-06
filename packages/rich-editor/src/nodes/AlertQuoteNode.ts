import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedEditorState,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import { DecoratorNode } from 'lexical'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { AlertStaticDecorator } from '../components/renderers/AlertStaticDecorator'
import { extractTextContent } from '../utils/extractTextContent'

export type AlertType = 'note' | 'tip' | 'important' | 'warning' | 'caution'

export const ALERT_TYPES: AlertType[] = [
  'note',
  'tip',
  'important',
  'warning',
  'caution',
]

export const ALERT_LABELS: Record<AlertType, string> = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
}

export type SerializedAlertQuoteNode = Spread<
  {
    alertType: AlertType
    content: SerializedEditorState
  },
  SerializedLexicalNode
>

export class AlertQuoteNode extends DecoratorNode<ReactElement> {
  __alertType: AlertType
  __contentState: SerializedEditorState

  static getType(): string {
    return 'alert-quote'
  }

  static clone(node: AlertQuoteNode): AlertQuoteNode {
    return new AlertQuoteNode(node.__alertType, node.__contentState, node.__key)
  }

  constructor(
    alertType: AlertType,
    contentState?: SerializedEditorState,
    key?: NodeKey,
  ) {
    super(key)
    this.__alertType = alertType
    this.__contentState =
      contentState ||
      ({
        root: {
          children: [
            {
              type: 'paragraph',
              children: [],
              direction: null,
              format: '',
              indent: 0,
              textFormat: 0,
              textStyle: '',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      } as unknown as SerializedEditorState)
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = `rich-alert rich-alert-${this.__alertType}`
    return div
  }

  updateDOM(prevNode: AlertQuoteNode, dom: HTMLElement): boolean {
    if (prevNode.__alertType !== this.__alertType) {
      dom.className = `rich-alert rich-alert-${this.__alertType}`
    }
    return false
  }

  isInline(): boolean {
    return false
  }

  getAlertType(): AlertType {
    return this.__alertType
  }

  setAlertType(alertType: AlertType): void {
    const writable = this.getWritable()
    writable.__alertType = alertType
  }

  getContentState(): SerializedEditorState {
    return this.getLatest().__contentState
  }

  setContentState(state: SerializedEditorState): void {
    const writable = this.getWritable()
    writable.__contentState = state
  }

  getTextContent(): string {
    return extractTextContent(this.__contentState)
  }

  static importJSON(serializedNode: SerializedAlertQuoteNode): AlertQuoteNode {
    return new AlertQuoteNode(serializedNode.alertType, serializedNode.content)
  }

  exportJSON(): SerializedAlertQuoteNode {
    return {
      ...super.exportJSON(),
      type: 'alert-quote',
      alertType: this.__alertType,
      content: this.__contentState,
      version: 1,
    }
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(AlertStaticDecorator, {
      alertType: this.__alertType,
      contentState: this.__contentState,
    })
  }
}

export function $createAlertQuoteNode(
  alertType: AlertType,
  contentState?: SerializedEditorState,
): AlertQuoteNode {
  return new AlertQuoteNode(alertType, contentState)
}

export function $isAlertQuoteNode(
  node: LexicalNode | null | undefined,
): node is AlertQuoteNode {
  return node instanceof AlertQuoteNode
}
