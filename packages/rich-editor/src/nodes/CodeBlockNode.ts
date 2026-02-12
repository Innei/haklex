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

import { CodeBlockEditDecorator } from '../components/decorators/CodeBlockEditDecorator'

export type SerializedCodeBlockNode = Spread<
  {
    code: string
    language: string
  },
  SerializedLexicalNode
>

export class CodeBlockNode extends DecoratorNode<ReactElement> {
  __code: string
  __language: string

  static getType(): string {
    return 'code-block'
  }

  static clone(node: CodeBlockNode): CodeBlockNode {
    return new CodeBlockNode(node.__code, node.__language, node.__key)
  }

  constructor(code: string, language: string, key?: NodeKey) {
    super(key)
    this.__code = code
    this.__language = language
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.className = 'rich-code-block-wrapper'
    return div
  }

  updateDOM(): boolean {
    return false
  }

  isInline(): boolean {
    return false
  }

  static importJSON(serializedNode: SerializedCodeBlockNode): CodeBlockNode {
    return $createCodeBlockNode(serializedNode.code, serializedNode.language)
  }

  exportJSON(): SerializedCodeBlockNode {
    return {
      ...super.exportJSON(),
      type: 'code-block',
      code: this.__code,
      language: this.__language,
      version: 1,
    }
  }

  getCode(): string {
    return this.__code
  }

  setCode(code: string): void {
    const writable = this.getWritable()
    writable.__code = code
  }

  getLanguage(): string {
    return this.__language
  }

  setLanguage(language: string): void {
    const writable = this.getWritable()
    writable.__language = language
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(CodeBlockEditDecorator, {
      nodeKey: this.__key,
      code: this.__code,
      language: this.__language,
    })
  }
}

export function $createCodeBlockNode(
  code: string,
  language: string,
): CodeBlockNode {
  return new CodeBlockNode(code, language)
}

export function $isCodeBlockNode(
  node: LexicalNode | null | undefined,
): node is CodeBlockNode {
  return node instanceof CodeBlockNode
}
