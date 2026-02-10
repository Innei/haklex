import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import { DecoratorNode } from 'lexical'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { MermaidRenderer } from '../components/renderers/MermaidRenderer'
import { RendererWrapper } from '../components/RendererWrapper'

export type SerializedMermaidNode = Spread<
  {
    diagram: string
  },
  SerializedLexicalNode
>

export class MermaidNode extends DecoratorNode<ReactElement> {
  __diagram: string

  static getType(): string {
    return 'mermaid'
  }

  static clone(node: MermaidNode): MermaidNode {
    return new MermaidNode(node.__diagram, node.__key)
  }

  constructor(diagram: string, key?: NodeKey) {
    super(key)
    this.__diagram = diagram
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'rich-mermaid-wrapper'
    return div
  }

  updateDOM(): boolean {
    return false
  }

  isInline(): boolean {
    return false
  }

  static importJSON(serializedNode: SerializedMermaidNode): MermaidNode {
    return $createMermaidNode(serializedNode.diagram)
  }

  exportJSON(): SerializedMermaidNode {
    return {
      ...super.exportJSON(),
      type: 'mermaid',
      diagram: this.__diagram,
      version: 1,
    }
  }

  getDiagram(): string {
    return this.__diagram
  }

  setDiagram(diagram: string): void {
    const writable = this.getWritable()
    writable.__diagram = diagram
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(RendererWrapper as any, {
      rendererKey: 'Mermaid',
      defaultRenderer: MermaidRenderer,
      props: {
        content: this.__diagram,
      },
    })
  }
}

export function $createMermaidNode(diagram: string): MermaidNode {
  return new MermaidNode(diagram)
}

export function $isMermaidNode(
  node: LexicalNode | null | undefined,
): node is MermaidNode {
  return node instanceof MermaidNode
}
