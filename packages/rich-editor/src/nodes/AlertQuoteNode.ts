import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from 'lexical'
import { ElementNode } from 'lexical'
import { __iconNode as InfoIcon } from 'lucide-react/dist/esm/icons/info'
import { __iconNode as Lightbulb } from 'lucide-react/dist/esm/icons/lightbulb'
import { __iconNode as MessageSquareWarning } from 'lucide-react/dist/esm/icons/message-square-warning'
import { __iconNode as OctagonAlert } from 'lucide-react/dist/esm/icons/octagon-alert'
import { __iconNode as TriangleAlert } from 'lucide-react/dist/esm/icons/triangle-alert'

import { createLucideSvg } from '../utils/lucide-dom'

export type AlertType = 'note' | 'tip' | 'important' | 'warning' | 'caution'

const ALERT_ICON_DATA: Record<AlertType, any[]> = {
  note: InfoIcon,
  tip: Lightbulb,
  important: MessageSquareWarning,
  warning: TriangleAlert,
  caution: OctagonAlert,
}

const ALERT_LABELS: Record<AlertType, string> = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
}

function createAlertHeader(alertType: AlertType): HTMLElement {
  const header = document.createElement('div')
  header.className = `rich-alert-header rich-alert-header-${alertType}`
  header.contentEditable = 'false'

  const icon = document.createElement('span')
  icon.className = 'rich-alert-icon'
  const iconData = ALERT_ICON_DATA[alertType]
  icon.append(createLucideSvg(iconData, { width: '16', height: '16' }))

  const label = document.createElement('span')
  label.className = 'rich-alert-label'
  label.textContent = ALERT_LABELS[alertType]

  header.append(icon, label)
  return header
}

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
    blockquote.prepend(createAlertHeader(this.__alertType))
    return blockquote
  }

  updateDOM(prevNode: AlertQuoteNode, dom: HTMLElement): boolean {
    if (prevNode.__alertType !== this.__alertType) {
      dom.className = `rich-alert rich-alert-${this.__alertType}`
      dom.dataset.alertType = this.__alertType
      const oldHeader = dom.querySelector('.rich-alert-header')
      if (oldHeader) oldHeader.remove()
      dom.prepend(createAlertHeader(this.__alertType))
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

  getDOMSlot(element: HTMLElement) {
    const header = element.querySelector('.rich-alert-header')
    return super.getDOMSlot(element).withAfter(header)
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
