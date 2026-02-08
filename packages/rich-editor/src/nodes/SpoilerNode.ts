import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
} from 'lexical'
import { ElementNode } from 'lexical'

export class SpoilerNode extends ElementNode {
  static getType(): string {
    return 'spoiler'
  }

  static clone(node: SpoilerNode): SpoilerNode {
    return new SpoilerNode(node.__key)
  }

  constructor(key?: NodeKey) {
    super(key)
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const span = document.createElement('span')
    span.className = 'rich-spoiler'
    return span
  }

  updateDOM(): boolean {
    return false
  }

  static importJSON(_serializedNode: SerializedElementNode): SpoilerNode {
    return $createSpoilerNode()
  }

  exportJSON(): SerializedElementNode {
    return {
      ...super.exportJSON(),
      type: 'spoiler',
      version: 1,
    }
  }

  canInsertTextBefore(): boolean {
    return true
  }

  canInsertTextAfter(): boolean {
    return true
  }

  isInline(): boolean {
    return true
  }
}

export function $createSpoilerNode(): SpoilerNode {
  return new SpoilerNode()
}

export function $isSpoilerNode(
  node: LexicalNode | null | undefined,
): node is SpoilerNode {
  return node instanceof SpoilerNode
}
