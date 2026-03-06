import {
  type CommandItemConfig,
  editorTheme,
  getResolvedEditNodes,
} from '@haklex/rich-editor'
import type {
  EditorConfig,
  LexicalEditor,
  SerializedEditorState,
} from 'lexical'
import { $insertNodes, createEditor } from 'lexical'
import { FileText } from 'lucide-react'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { NestedDocEditDecorator } from './NestedDocEditDecorator'
import { NestedDocNode, type SerializedNestedDocNode } from './NestedDocNode'

function createContentEditor(): LexicalEditor {
  return createEditor({
    namespace: 'NestedDocContent',
    nodes: getResolvedEditNodes(),
    theme: editorTheme,
    onError: (error: Error) => {
      console.error('[NestedDocContent]', error)
    },
  })
}

export class NestedDocEditNode extends NestedDocNode {
  __contentEditor: LexicalEditor

  static commandItems: CommandItemConfig[] = [
    {
      title: 'Nested Document',
      icon: createElement(FileText, { size: 20 }),
      description: 'Embed a collapsible nested document',
      keywords: ['nested', 'document', 'nested-doc', 'embed'],
      section: 'ADVANCED',
      placement: ['slash', 'toolbar'],
      group: 'insert',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createNestedDocEditNode()])
        })
      },
    },
  ]

  static clone(node: NestedDocEditNode): NestedDocEditNode {
    const cloned = new NestedDocEditNode(node.__contentState, node.__key)
    cloned.__contentEditor = node.__contentEditor
    return cloned
  }

  constructor(contentState?: SerializedEditorState, key?: string) {
    super(contentState, key)
    this.__contentEditor = createContentEditor()
    if (contentState) {
      const editorState = this.__contentEditor.parseEditorState(contentState)
      this.__contentEditor.setEditorState(editorState)
    }
  }

  getContentEditor(): LexicalEditor {
    return this.__contentEditor
  }

  static importJSON(
    serializedNode: SerializedNestedDocNode,
  ): NestedDocEditNode {
    return new NestedDocEditNode(serializedNode.content)
  }

  exportJSON(): SerializedNestedDocNode {
    return {
      ...super.exportJSON(),
      type: 'nested-doc',
      content: this.__contentEditor.getEditorState().toJSON(),
      version: 1,
    }
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(NestedDocEditDecorator, {
      nodeKey: this.__key,
      contentEditor: this.__contentEditor,
      contentState: this.__contentState,
    })
  }
}

export function $createNestedDocEditNode(
  contentState?: SerializedEditorState,
): NestedDocEditNode {
  return new NestedDocEditNode(contentState)
}

export function $isNestedDocEditNode(node: unknown): node is NestedDocEditNode {
  return node instanceof NestedDocEditNode
}
