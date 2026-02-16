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
import { LayoutGrid } from 'lucide-react'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { GridReadOnlyDecorator } from '../components/renderers/GridReadOnlyDecorator'
import { editorTheme } from '../styles/theme'
import type { SlashMenuItemConfig } from '../types/slash-menu'
import { NESTED_EDITOR_NODES } from './shared'

export type SerializedGridContainerNode = Spread<
  {
    cols: number
    gap?: string
    cells: SerializedEditorState[]
  },
  SerializedLexicalNode
>

interface LegacySerializedGridNode extends SerializedGridContainerNode {
  gap?: string | number
  children?: SerializedLexicalNode[]
}

function createCellEditor(): LexicalEditor {
  return createEditor({
    namespace: 'GridCell',
    nodes: NESTED_EDITOR_NODES,
    theme: editorTheme,
    onError: (error: Error) => {
      console.error('[GridCell]', error)
    },
  })
}

export class GridContainerNode extends DecoratorNode<ReactElement> {
  __cols: number
  __gap: string
  __cellEditors: LexicalEditor[]

  static slashMenuItems: SlashMenuItemConfig[] = [
    {
      title: 'Grid',
      icon: createElement(LayoutGrid, { size: 20 }),
      description: 'Grid layout container',
      keywords: ['grid', 'columns', 'layout'],
      section: 'LAYOUT',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createGridContainerNode(2)])
        })
      },
    },
  ]

  static getType(): string {
    return 'grid-container'
  }

  static clone(node: GridContainerNode): GridContainerNode {
    return new GridContainerNode(
      node.__cols,
      node.__gap,
      [...node.__cellEditors],
      node.__key,
    )
  }

  constructor(
    cols = 2,
    gap?: string,
    cellEditors?: LexicalEditor[],
    key?: NodeKey,
  ) {
    super(key)
    this.__cols = cols
    this.__gap = gap || '16px'
    if (cellEditors) {
      this.__cellEditors = cellEditors
    } else {
      this.__cellEditors = Array.from({ length: cols }, () =>
        createCellEditor(),
      )
    }
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'rich-grid-container'
    return div
  }

  updateDOM(): boolean {
    return false
  }

  isInline(): boolean {
    return false
  }

  getCols(): number {
    return this.getLatest().__cols
  }

  setCols(cols: number): void {
    const writable = this.getWritable()
    const prev = writable.__cellEditors.length
    writable.__cols = cols
    if (cols > prev) {
      for (let i = prev; i < cols; i++) {
        writable.__cellEditors.push(createCellEditor())
      }
    }
  }

  getGap(): string {
    return this.getLatest().__gap
  }

  setGap(gap: string): void {
    const writable = this.getWritable()
    writable.__gap = gap
  }

  getCellEditors(): LexicalEditor[] {
    return this.getLatest().__cellEditors
  }

  addCells(count: number): void {
    const writable = this.getWritable()
    for (let i = 0; i < count; i++) {
      writable.__cellEditors.push(createCellEditor())
    }
  }

  removeCells(count: number): void {
    const writable = this.getWritable()
    const editors = writable.__cellEditors
    const toRemove = Math.min(count, editors.length)
    for (let i = 0; i < toRemove; i++) {
      const editor = editors.at(-1)
      if (!editor) break
      const isEmpty = editor.getEditorState().read(() => {
        return $getRoot().getTextContentSize() === 0
      })
      if (!isEmpty) break
      editors.pop()
    }
  }

  getTextContent(): string {
    return this.__cellEditors
      .map((editor) =>
        editor.getEditorState().read(() => $getRoot().getTextContent()),
      )
      .join('\n')
  }

  static importJSON(
    serializedNode: SerializedGridContainerNode,
  ): GridContainerNode {
    const legacy = serializedNode as LegacySerializedGridNode
    const cols = serializedNode.cols || 2
    const rawGap = legacy.gap
    const gap = typeof rawGap === 'number' ? `${rawGap}px` : rawGap
    const node = new GridContainerNode(cols, gap)

    if (serializedNode.cells && serializedNode.cells.length > 0) {
      const editors: LexicalEditor[] = serializedNode.cells.map((cellState) => {
        const editor = createCellEditor()
        const editorState = editor.parseEditorState(cellState)
        editor.setEditorState(editorState)
        return editor
      })
      node.__cellEditors = editors
    } else if (legacy.children) {
      // Legacy ElementNode format: each child becomes a cell
      const {children} = legacy
      const editors: LexicalEditor[] = children.map((child) => {
        const editor = createCellEditor()
        const content = {
          root: {
            children: [child],
            direction: null,
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        } as unknown as SerializedEditorState
        const editorState = editor.parseEditorState(content)
        editor.setEditorState(editorState)
        return editor
      })
      node.__cellEditors = editors
    }

    return node
  }

  exportJSON(): SerializedGridContainerNode {
    return {
      ...super.exportJSON(),
      type: 'grid-container',
      cols: this.__cols,
      gap: this.__gap,
      cells: this.__cellEditors.map((editor) =>
        editor.getEditorState().toJSON(),
      ),
      version: 1,
    }
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(GridReadOnlyDecorator, {
      cols: this.__cols,
      gap: this.__gap,
      cellEditors: this.__cellEditors,
    })
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
