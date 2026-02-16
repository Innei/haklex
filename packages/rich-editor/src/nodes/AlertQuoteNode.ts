import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedEditorState,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import { $getRoot, $insertNodes, createEditor, DecoratorNode } from 'lexical'
import {
  Info,
  Lightbulb,
  TriangleAlert as TriangleAlertIcon,
} from 'lucide-react'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { AlertReadOnlyDecorator } from '../components/renderers/AlertReadOnlyDecorator'
import { editorTheme } from '../styles/theme'
import type { SlashMenuItemConfig } from '../types/slash-menu'
import { NESTED_EDITOR_NODES } from './shared'

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

function createContentEditor(): LexicalEditor {
  return createEditor({
    namespace: 'AlertContent',
    nodes: NESTED_EDITOR_NODES,
    theme: editorTheme,
    onError: (error: Error) => {
      console.error('[AlertContent]', error)
    },
  })
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
  __contentEditor: LexicalEditor

  static slashMenuItems: SlashMenuItemConfig[] = [
    {
      title: 'Callout',
      icon: createElement(Info, { size: 20 }),
      description: 'Info callout block',
      keywords: ['alert', 'note', 'info', 'callout'],
      section: 'ADVANCED',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createAlertQuoteNode('note')])
        })
      },
    },
    {
      title: 'Tip',
      icon: createElement(Lightbulb, { size: 20 }),
      description: 'Highlight a useful tip',
      keywords: ['alert', 'tip', 'hint'],
      section: 'ADVANCED',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createAlertQuoteNode('tip')])
        })
      },
    },
    {
      title: 'Warning',
      icon: createElement(TriangleAlertIcon, { size: 20 }),
      description: 'Warn about something',
      keywords: ['alert', 'warning', 'caution'],
      section: 'ADVANCED',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createAlertQuoteNode('warning')])
        })
      },
    },
  ]

  static getType(): string {
    return 'alert-quote'
  }

  static clone(node: AlertQuoteNode): AlertQuoteNode {
    return new AlertQuoteNode(
      node.__alertType,
      node.__contentEditor,
      node.__key,
    )
  }

  constructor(
    alertType: AlertType,
    contentEditor?: LexicalEditor,
    key?: NodeKey,
  ) {
    super(key)
    this.__alertType = alertType
    this.__contentEditor = contentEditor || createContentEditor()
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

  getContentEditor(): LexicalEditor {
    return this.__contentEditor
  }

  getTextContent(): string {
    return this.__contentEditor.getEditorState().read(() => {
      return $getRoot().getTextContent()
    })
  }

  static importJSON(serializedNode: SerializedAlertQuoteNode): AlertQuoteNode {
    const node = new AlertQuoteNode(serializedNode.alertType)
    if (serializedNode.content) {
      const editorState = node.__contentEditor.parseEditorState(
        serializedNode.content,
      )
      node.__contentEditor.setEditorState(editorState)
    }
    return node
  }

  exportJSON(): SerializedAlertQuoteNode {
    return {
      ...super.exportJSON(),
      type: 'alert-quote',
      alertType: this.__alertType,
      content: this.__contentEditor.getEditorState().toJSON(),
      version: 1,
    }
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(AlertReadOnlyDecorator, {
      alertType: this.__alertType,
      contentEditor: this.__contentEditor,
    })
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
