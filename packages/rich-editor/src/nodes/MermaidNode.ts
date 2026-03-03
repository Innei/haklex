import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import { $getNodeByKey, $insertNodes, DecoratorNode } from 'lexical'
import { Workflow } from 'lucide-react'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { MermaidRenderer } from '../components/renderers/MermaidRenderer'
import { createRendererDecoration } from '../components/RendererWrapper'
import type { CommandItemConfig } from '../types/slash-menu'

export type SerializedMermaidNode = Spread<
  {
    diagram: string
  },
  SerializedLexicalNode
>

export class MermaidNode extends DecoratorNode<ReactElement> {
  __diagram: string

  static commandItems: CommandItemConfig[] = [
    {
      title: 'Mermaid Diagram',
      icon: createElement(Workflow, { size: 20 }),
      description: 'Flowchart, sequence diagram',
      keywords: ['mermaid', 'diagram', 'chart', 'flowchart'],
      section: 'MEDIA',
      placement: ['slash', 'toolbar'],
      group: 'insert',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([
            $createMermaidNode('graph TD\n    A[Start] --> B[End]'),
          ])
        })
      },
    },
  ]

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

  decorate(editor: LexicalEditor, _config: EditorConfig): ReactElement {
    const nodeKey = this.__key
    return createRendererDecoration('Mermaid', MermaidRenderer, {
      content: this.__diagram,
      onContentChange: (newDiagram: string) => {
        editor.update(() => {
          const node = $getNodeByKey(nodeKey) as MermaidNode | null
          if (node) {
            node.setDiagram(newDiagram)
          }
        })
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
