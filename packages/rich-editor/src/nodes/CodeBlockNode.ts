import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import { $insertNodes, DecoratorNode } from 'lexical'
import { Code } from 'lucide-react'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { CodeBlockRenderer } from '../components/renderers/CodeBlockRenderer'
import { createRendererDecoration } from '../components/RendererWrapper'
import type { CommandItemConfig } from '../types/slash-menu'

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

  static commandItems: CommandItemConfig[] = [
    {
      title: 'Code Block',
      icon: createElement(Code, { size: 20 }),
      description: 'Syntax-highlighted code',
      keywords: ['code', 'snippet', 'codeblock'],
      section: 'MEDIA',
      placement: ['slash', 'toolbar'],
      group: 'insert',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createCodeBlockNode('', 'text')])
        })
      },
    },
  ]

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

  isKeyboardSelectable(): boolean {
    return true
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
    return createRendererDecoration('CodeBlock', CodeBlockRenderer, {
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
