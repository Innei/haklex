import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
} from 'lexical'
import { $insertNodes, TextNode } from 'lexical'
import { Tag } from 'lucide-react'
import { createElement } from 'react'

import type { CommandItemConfig } from '../types/slash-menu'
import { getTagBgColor } from '../utils/tag-color'

export type SerializedTagNode = Omit<SerializedTextNode, 'type'> & {
  type: 'tag'
}

export class TagNode extends TextNode {
  static commandItems: CommandItemConfig[] = [
    {
      title: 'Tag',
      icon: createElement(Tag, { size: 20 }),
      description: 'Insert a tag',
      keywords: ['tag', 'label', 'badge'],
      section: 'INLINE',
      placement: ['slash', 'toolbar'],
      group: 'insert',
      onSelect: (editor: LexicalEditor, queryString: string) => {
        editor.update(() => {
          $insertNodes([$createTagNode(queryString || 'tag')])
        })
      },
    },
  ]

  static getType(): string {
    return 'tag'
  }

  static clone(node: TagNode): TagNode {
    return new TagNode(node.__text, node.__key)
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: () => ({
        conversion: (domNode: Node): DOMConversionOutput | null => {
          if (!(domNode instanceof HTMLElement)) return null
          if (!domNode.classList.contains('rich-tag')) return null

          return {
            node: $createTagNode(domNode.textContent ?? ''),
          }
        },
        priority: 2,
      }),
    }
  }

  constructor(text: string, key?: NodeKey) {
    super(text, key)
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config)
    element.classList.add('rich-tag')
    element.style.backgroundColor = getTagBgColor(this.getTextContent())
    return element
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    const updated = super.updateDOM(prevNode, dom, config)

    dom.classList.add('rich-tag')

    if (prevNode.__text !== this.__text) {
      dom.style.backgroundColor = getTagBgColor(this.__text)
    }

    return updated
  }

  exportDOM(_editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement('span')
    element.className = 'rich-tag'
    element.style.backgroundColor = getTagBgColor(this.getTextContent())
    element.textContent = this.getTextContent()

    return { element }
  }

  getText(): string {
    return this.getTextContent()
  }

  canInsertTextBefore(): boolean {
    return false
  }

  canInsertTextAfter(): boolean {
    return false
  }

  isTextEntity(): true {
    return true
  }

  static importJSON(serializedNode: SerializedTagNode): TagNode {
    const node = $createTagNode(serializedNode.text ?? '')
    node.setFormat(serializedNode.format ?? 0)
    node.setDetail(serializedNode.detail ?? 0)
    node.setMode(serializedNode.mode ?? 'normal')
    node.setStyle(serializedNode.style ?? '')
    return node
  }

  exportJSON(): SerializedTagNode {
    return {
      ...super.exportJSON(),
      type: 'tag',
      version: 1,
    }
  }
}

export function $createTagNode(text: string): TagNode {
  return new TagNode(text)
}

export function $isTagNode(
  node: LexicalNode | null | undefined,
): node is TagNode {
  return node instanceof TagNode
}
