import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from 'lexical'
import { ElementNode } from 'lexical'

export type SerializedDetailsNode = Spread<
  {
    summary: string
    open: boolean
  },
  SerializedElementNode
>

export class DetailsNode extends ElementNode {
  __summary: string
  __open: boolean

  static getType(): string {
    return 'details'
  }

  static clone(node: DetailsNode): DetailsNode {
    return new DetailsNode(node.__summary, node.__open, node.__key)
  }

  constructor(summary: string, open = false, key?: NodeKey) {
    super(key)
    this.__summary = summary
    this.__open = open
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const details = document.createElement('details')
    details.className = 'rich-details'
    if (this.__open) {
      details.open = true
    }

    const summary = document.createElement('summary')
    summary.className = 'rich-details-summary'
    summary.textContent = this.__summary
    details.append(summary)

    const content = document.createElement('div')
    content.className = 'rich-details-content'
    details.append(content)

    return details
  }

  updateDOM(prevNode: DetailsNode, dom: HTMLElement): boolean {
    const details = dom as HTMLDetailsElement
    if (prevNode.__open !== this.__open) {
      details.open = this.__open
    }
    if (prevNode.__summary !== this.__summary) {
      const summary = dom.querySelector('.rich-details-summary')
      if (summary) {
        summary.textContent = this.__summary
      }
    }
    return false
  }

  static importJSON(serializedNode: SerializedDetailsNode): DetailsNode {
    return $createDetailsNode(serializedNode.summary, serializedNode.open)
  }

  exportJSON(): SerializedDetailsNode {
    return {
      ...super.exportJSON(),
      type: 'details',
      summary: this.__summary,
      open: this.__open,
      version: 1,
    }
  }

  getSummary(): string {
    return this.getLatest().__summary
  }

  setSummary(summary: string): void {
    const writable = this.getWritable()
    writable.__summary = summary
  }

  getOpen(): boolean {
    return this.getLatest().__open
  }

  setOpen(open: boolean): void {
    const writable = this.getWritable()
    writable.__open = open
  }

  toggleOpen(): void {
    this.setOpen(!this.getOpen())
  }

  isInline(): boolean {
    return false
  }
}

export function $createDetailsNode(
  summary: string,
  open = false,
): DetailsNode {
  return new DetailsNode(summary, open)
}

export function $isDetailsNode(
  node: LexicalNode | null | undefined,
): node is DetailsNode {
  return node instanceof DetailsNode
}
