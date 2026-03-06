import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedEditorState,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import { DecoratorNode } from 'lexical'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { GridStaticDecorator } from '../components/renderers/GridStaticDecorator'
import { extractTextContent } from '../utils/extractTextContent'

export type SerializedGridContainerNode = Spread<
  {
    cols: number
    gap?: string
    cells: SerializedEditorState[]
  },
  SerializedLexicalNode
>

interface LegacySerializedGridNode {
  type?: string
  version?: number
  cols?: number
  gap?: string | number
  cells?: SerializedEditorState[]
  children?: SerializedLexicalNode[]
}

export class GridContainerNode extends DecoratorNode<ReactElement> {
  __cols: number
  __gap: string
  __cellStates: SerializedEditorState[]

  static getType(): string {
    return 'grid-container'
  }

  static clone(node: GridContainerNode): GridContainerNode {
    return new GridContainerNode(
      node.__cols,
      node.__gap,
      [...node.__cellStates],
      node.__key,
    )
  }

  constructor(
    cols = 2,
    gap?: string,
    cellStates?: SerializedEditorState[],
    key?: NodeKey,
  ) {
    super(key)
    this.__cols = cols
    this.__gap = gap || '16px'
    if (cellStates) {
      this.__cellStates = cellStates
    } else {
      const emptyState = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [],
              direction: null,
              format: '',
              indent: 0,
              textFormat: 0,
              textStyle: '',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      } as unknown as SerializedEditorState
      this.__cellStates = Array.from({ length: cols }, () => emptyState)
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
    const prev = writable.__cellStates.length
    writable.__cols = cols
    if (cols > prev) {
      const emptyState = {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [],
              direction: null,
              format: '',
              indent: 0,
              textFormat: 0,
              textStyle: '',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      } as unknown as SerializedEditorState
      for (let i = prev; i < cols; i++) {
        writable.__cellStates.push(emptyState)
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

  getCellStates(): SerializedEditorState[] {
    return this.getLatest().__cellStates
  }

  addCells(count: number): void {
    const writable = this.getWritable()
    const emptyState = {
      root: {
        children: [
          {
            type: 'paragraph',
            children: [],
            direction: null,
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            version: 1,
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    } as unknown as SerializedEditorState
    for (let i = 0; i < count; i++) {
      writable.__cellStates.push(emptyState)
    }
  }

  removeCells(count: number): void {
    const writable = this.getWritable()
    const states = writable.__cellStates
    const toRemove = Math.min(count, states.length)
    for (let i = 0; i < toRemove; i++) {
      const state = states.at(-1)
      if (!state) break
      const isEmpty = extractTextContent(state).trim() === ''
      if (!isEmpty) break
      states.pop()
    }
  }

  getTextContent(): string {
    return this.__cellStates.map((s) => extractTextContent(s)).join('\n')
  }

  static importJSON(
    serializedNode: SerializedGridContainerNode,
  ): GridContainerNode {
    const legacy = serializedNode as LegacySerializedGridNode
    const cols = legacy.cols || 2
    const rawGap = legacy.gap
    const gap = typeof rawGap === 'number' ? `${rawGap}px` : rawGap

    if (legacy.cells && legacy.cells.length > 0) {
      return new GridContainerNode(cols, gap, legacy.cells)
    }

    if (legacy.children) {
      const cellStates: SerializedEditorState[] = legacy.children.map(
        (child) => {
          return {
            root: {
              children: [child],
              direction: null,
              format: '',
              indent: 0,
              type: 'root',
              version: 1,
            },
          } as unknown as SerializedEditorState
        },
      )
      return new GridContainerNode(cols, gap, cellStates)
    }

    return new GridContainerNode(cols, gap)
  }

  exportJSON(): SerializedGridContainerNode {
    return {
      ...super.exportJSON(),
      type: 'grid-container',
      cols: this.__cols,
      gap: this.__gap,
      cells: this.__cellStates,
      version: 1,
    }
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(GridStaticDecorator, {
      cols: this.__cols,
      gap: this.__gap,
      cellStates: this.__cellStates,
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
