import type {
  EditorConfig,
  LexicalEditor,
  SerializedEditorState, SerializedLexicalNode 
} from 'lexical'
import { createEditor } from 'lexical'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { GridEditDecorator } from '../components/decorators/GridEditDecorator'
import { editorTheme } from '../styles/theme'
import {
  GridContainerNode,
  type SerializedGridContainerNode,
} from './GridContainerNode'
import { NESTED_EDITOR_NODES } from './shared'

interface LegacySerializedGridEditNode extends SerializedGridContainerNode {
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

export class GridEditNode extends GridContainerNode {
  static clone(node: GridEditNode): GridEditNode {
    return new GridEditNode(
      node.__cols,
      node.__gap,
      [...node.__cellEditors],
      node.__key,
    )
  }

  static importJSON(serializedNode: SerializedGridContainerNode): GridEditNode {
    const legacy = serializedNode as LegacySerializedGridEditNode
    const cols = serializedNode.cols || 2
    const rawGap = legacy.gap
    const gap = typeof rawGap === 'number' ? `${rawGap}px` : rawGap
    const node = new GridEditNode(cols, gap)

    if (serializedNode.cells && serializedNode.cells.length > 0) {
      const editors: LexicalEditor[] = serializedNode.cells.map((cellState) => {
        const editor = createCellEditor()
        const editorState = editor.parseEditorState(cellState)
        editor.setEditorState(editorState)
        return editor
      })
      node.__cellEditors = editors
    } else if (legacy.children) {
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

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(GridEditDecorator, {
      nodeKey: this.__key,
      cols: this.__cols,
      gap: this.__gap,
      cellEditors: this.__cellEditors,
    })
  }
}
