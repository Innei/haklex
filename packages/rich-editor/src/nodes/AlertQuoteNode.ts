import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from 'lexical'
import { ElementNode } from 'lexical'

export type AlertType = 'note' | 'tip' | 'important' | 'warning' | 'caution'

export type SerializedAlertQuoteNode = Spread<
  {
    alertType: AlertType
  },
  SerializedElementNode
>

export class AlertQuoteNode extends ElementNode {
  __alertType: AlertType

  static getType(): string {
    return 'alert-quote'
  }

  static clone(node: AlertQuoteNode): AlertQuoteNode {
    return new AlertQuoteNode(node.__alertType, node.__key)
  }

  constructor(alertType: AlertType, key?: NodeKey) {
    super(key)
    this.__alertType = alertType
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const blockquote = document.createElement('blockquote')
    blockquote.className = `rich-alert rich-alert-${this.__alertType}`
    blockquote.dataset.alertType = this.__alertType
    return blockquote
  }

  updateDOM(prevNode: AlertQuoteNode, dom: HTMLElement): boolean {
    if (prevNode.__alertType !== this.__alertType) {
      dom.className = `rich-alert rich-alert-${this.__alertType}`
      dom.dataset.alertType = this.__alertType
    }
    return false
  }

  static importJSON(serializedNode: SerializedAlertQuoteNode): AlertQuoteNode {
    return $createAlertQuoteNode(serializedNode.alertType)
  }

  exportJSON(): SerializedAlertQuoteNode {
    return {
      ...super.exportJSON(),
      type: 'alert-quote',
      alertType: this.__alertType,
      version: 1,
    }
  }

  getAlertType(): AlertType {
    return this.__alertType
  }

  setAlertType(alertType: AlertType): void {
    const writable = this.getWritable()
    writable.__alertType = alertType
  }

  isInline(): boolean {
    return false
  }
}

export function $createAlertQuoteNode(alertType: AlertType): AlertQuoteNode {
  return new AlertQuoteNode(alertType)
}

export function $isAlertQuoteNode(
  node: LexicalNode | null | undefined,
): node is AlertQuoteNode {
  return node instanceof AlertQuoteNode
}
