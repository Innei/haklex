import type { CodeFile } from '@shiro/rich-editor'
import { createRendererDecoration } from '@shiro/rich-editor'
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

import { CodeSnippetRenderer } from '../CodeSnippetRenderer'

export type SerializedCodeSnippetNode = Spread<
  {
    files: CodeFile[]
  },
  SerializedLexicalNode
>

export class CodeSnippetNode extends DecoratorNode<ReactElement> {
  __files: CodeFile[]

  static getType(): string {
    return 'code-snippet'
  }

  static clone(node: CodeSnippetNode): CodeSnippetNode {
    return new CodeSnippetNode(node.__files, node.__key)
  }

  constructor(files: CodeFile[], key?: NodeKey) {
    super(key)
    this.__files = files
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'rich-code-snippet'
    return div
  }

  updateDOM(): boolean {
    return false
  }

  isInline(): boolean {
    return false
  }

  static importJSON(
    serializedNode: SerializedCodeSnippetNode,
  ): CodeSnippetNode {
    return $createCodeSnippetNode(serializedNode.files)
  }

  exportJSON(): SerializedCodeSnippetNode {
    return {
      ...super.exportJSON(),
      type: 'code-snippet',
      files: this.__files,
      version: 1,
    }
  }

  getFiles(): CodeFile[] {
    return this.getLatest().__files
  }

  setFiles(files: CodeFile[]): void {
    const writable = this.getWritable()
    writable.__files = files
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createRendererDecoration('CodeSnippet', CodeSnippetRenderer, {
      files: this.__files,
    })
  }
}

export function $createCodeSnippetNode(files: CodeFile[]): CodeSnippetNode {
  return new CodeSnippetNode(files)
}

export function $isCodeSnippetNode(
  node: LexicalNode | null | undefined,
): node is CodeSnippetNode {
  return node instanceof CodeSnippetNode
}
