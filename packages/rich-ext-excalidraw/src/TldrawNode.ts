import type { SlashMenuItemConfig } from '@shiro/rich-editor'
import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import { $getNodeByKey, $insertNodes, DecoratorNode } from 'lexical'
import { PenTool } from 'lucide-react'
import type { ReactElement } from 'react'
import { createElement, lazy, Suspense } from 'react'

const LazyTldrawRenderer = lazy(() =>
  import('./TldrawRenderer').then((m) => ({ default: m.TldrawRenderer })),
)

export type SerializedTldrawNode = Spread<
  { snapshot: string },
  SerializedLexicalNode
>

export class TldrawNode extends DecoratorNode<ReactElement> {
  __snapshot: string

  static slashMenuItems: SlashMenuItemConfig[] = [
    {
      title: 'Whiteboard',
      icon: createElement(PenTool, { size: 20 }),
      description: 'Tldraw whiteboard canvas',
      keywords: ['tldraw', 'whiteboard', 'draw', 'canvas'],
      section: 'MEDIA',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createTldrawNode('{}')])
        })
      },
    },
  ]

  static getType(): string {
    return 'tldraw'
  }

  static clone(node: TldrawNode): TldrawNode {
    return new TldrawNode(node.__snapshot, node.__key)
  }

  constructor(snapshot: string, key?: NodeKey) {
    super(key)
    this.__snapshot = snapshot
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'rich-tldraw-wrapper'
    return div
  }

  updateDOM(): boolean {
    return false
  }

  isInline(): boolean {
    return false
  }

  static importJSON(serializedNode: SerializedTldrawNode): TldrawNode {
    return $createTldrawNode(serializedNode.snapshot)
  }

  exportJSON(): SerializedTldrawNode {
    return {
      ...super.exportJSON(),
      type: 'tldraw',
      snapshot: this.__snapshot,
      version: 1,
    }
  }

  getSnapshot(): string {
    return this.__snapshot
  }

  setSnapshot(snapshot: string): void {
    const writable = this.getWritable()
    writable.__snapshot = snapshot
  }

  decorate(editor: LexicalEditor, _config: EditorConfig): ReactElement {
    const nodeKey = this.__key
    const isEditable = editor.isEditable()

    return createElement(
      Suspense,
      {
        fallback: createElement(
          'div',
          { className: 'rich-tldraw-loading' },
          'Loading tldraw...',
        ),
      },
      createElement(LazyTldrawRenderer, {
        snapshot: this.__snapshot,
        onSnapshotChange: isEditable
          ? (newSnapshot: string) => {
              editor.update(() => {
                const node = $getNodeByKey(nodeKey) as TldrawNode | null
                if (node) {
                  node.setSnapshot(newSnapshot)
                }
              })
            }
          : undefined,
      }),
    )
  }
}

export function $createTldrawNode(snapshot: string): TldrawNode {
  return new TldrawNode(snapshot)
}

export function $isTldrawNode(
  node: LexicalNode | null | undefined,
): node is TldrawNode {
  return node instanceof TldrawNode
}
