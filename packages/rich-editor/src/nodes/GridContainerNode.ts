import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from 'lexical'
import { ElementNode } from 'lexical'

export type SerializedGridContainerNode = Spread<
  {
    cols: number
    gap?: string
  },
  SerializedElementNode
>

export class GridContainerNode extends ElementNode {
  __cols: number
  __gap: string

  static getType(): string {
    return 'grid-container'
  }

  static clone(node: GridContainerNode): GridContainerNode {
    return new GridContainerNode(node.__cols, node.__gap, node.__key)
  }

  constructor(cols = 2, gap?: string, key?: NodeKey) {
    super(key)
    this.__cols = cols
    this.__gap = gap || '16px'
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'rich-grid-container'
    div.style.display = 'grid'
    div.style.gridTemplateColumns = `repeat(${this.__cols}, 1fr)`
    div.style.gap = this.__gap
    return div
  }

  updateDOM(prevNode: GridContainerNode, dom: HTMLElement): boolean {
    if (prevNode.__cols !== this.__cols) {
      dom.style.gridTemplateColumns = `repeat(${this.__cols}, 1fr)`
    }
    if (prevNode.__gap !== this.__gap) {
      dom.style.gap = this.__gap
    }
    return false
  }

  static importJSON(
    serializedNode: SerializedGridContainerNode,
  ): GridContainerNode {
    return $createGridContainerNode(serializedNode.cols, serializedNode.gap)
  }

  exportJSON(): SerializedGridContainerNode {
    return {
      ...super.exportJSON(),
      type: 'grid-container',
      cols: this.__cols,
      gap: this.__gap,
      version: 1,
    }
  }

  getCols(): number {
    return this.getLatest().__cols
  }

  setCols(cols: number): void {
    const writable = this.getWritable()
    writable.__cols = cols
  }

  getGap(): string {
    return this.getLatest().__gap
  }

  setGap(gap: string): void {
    const writable = this.getWritable()
    writable.__gap = gap
  }

  isInline(): boolean {
    return false
  }
}

export function $createGridContainerNode(
  cols = 2,
  gap?: string,
): GridContainerNode {
  return new GridContainerNode(cols, gap)
}

export function $isGridContainerNode(
  node: LexicalNode | null | undefined,
): node is GridContainerNode {
  return node instanceof GridContainerNode
}
