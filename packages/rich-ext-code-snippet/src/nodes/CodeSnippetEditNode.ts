import type { CodeFile, SlashMenuItemConfig } from '@shiro/rich-editor'
import type { EditorConfig, LexicalEditor, LexicalNode } from 'lexical'
import { $insertNodes } from 'lexical'
import { FileCode } from 'lucide-react'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { CodeSnippetEditDecorator } from '../CodeSnippetEditDecorator'
import {
  CodeSnippetNode,
  type SerializedCodeSnippetNode,
} from './CodeSnippetNode'

export class CodeSnippetEditNode extends CodeSnippetNode {
  static slashMenuItems: SlashMenuItemConfig[] = [
    {
      title: 'Code Snippet',
      icon: createElement(FileCode, { size: 20 }),
      description: 'Multi-file code snippet with tabs',
      keywords: ['code', 'snippet', 'files', 'tabs'],
      section: 'MEDIA',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([
            $createCodeSnippetEditNode([
              { filename: 'index.ts', code: '', language: 'typescript' },
            ]),
          ])
        })
      },
    },
  ]

  static clone(node: CodeSnippetEditNode): CodeSnippetEditNode {
    return new CodeSnippetEditNode(node.__files, node.__key)
  }

  static importJSON(
    serializedNode: SerializedCodeSnippetNode,
  ): CodeSnippetEditNode {
    return new CodeSnippetEditNode(serializedNode.files)
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(CodeSnippetEditDecorator, {
      nodeKey: this.__key,
      files: this.__files,
    })
  }
}

export function $createCodeSnippetEditNode(
  files: CodeFile[],
): CodeSnippetEditNode {
  return new CodeSnippetEditNode(files)
}

export function $isCodeSnippetEditNode(
  node: LexicalNode | null | undefined,
): node is CodeSnippetEditNode {
  return node instanceof CodeSnippetEditNode
}
