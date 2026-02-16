import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from 'lexical'
import { DecoratorNode } from 'lexical'

export type SerializedHorizontalRuleNode = SerializedLexicalNode

/**
 * Horizontal rule node. Replaces deprecated @lexical/react LexicalHorizontalRuleNode.
 * Renders <hr> with class "rich-hr" for styling.
 */
export class HorizontalRuleNode extends DecoratorNode<null> {
  static getType(): string {
    return 'horizontalrule'
  }

  static clone(node: HorizontalRuleNode): HorizontalRuleNode {
    return new HorizontalRuleNode(node.__key)
  }

  constructor(key?: NodeKey) {
    super(key)
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const hr = document.createElement('hr')
    hr.className = 'rich-hr'
    hr.dataset.lexicalDecorator = 'true'
    hr.setAttribute('contenteditable', 'false')
    return hr
  }

  updateDOM(): boolean {
    return false
  }

  static importJSON(
    _serializedNode: SerializedHorizontalRuleNode,
  ): HorizontalRuleNode {
    return $createHorizontalRuleNode()
  }

  exportJSON(): SerializedHorizontalRuleNode {
    return {
      ...super.exportJSON(),
      type: 'horizontalrule',
      version: 1,
    }
  }

  decorate(): null {
    return null
  }
}

export function $createHorizontalRuleNode(): HorizontalRuleNode {
  return new HorizontalRuleNode()
}

export function $isHorizontalRuleNode(
  node: LexicalNode | null | undefined,
): node is HorizontalRuleNode {
  return node instanceof HorizontalRuleNode
}
