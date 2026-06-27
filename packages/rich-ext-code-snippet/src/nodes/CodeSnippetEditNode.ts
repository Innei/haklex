import type { CommandItemConfig } from '@haklex/rich-editor/commands';
import type { EditorConfig, LexicalEditor, LexicalNode, SerializedLexicalNode } from 'lexical';
import { $insertNodes } from 'lexical';
import { FileCode } from 'lucide-react';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { CodeSnippetEditDecorator } from '../CodeSnippetEditDecorator';
import type { CodeFile } from '../types';
import { CodeSnippetNode, type SerializedCodeSnippetNode } from './CodeSnippetNode';

export class CodeSnippetEditNode extends CodeSnippetNode {
  static commandItems: CommandItemConfig[] = [
    {
      title: 'Code Snippet',
      icon: createElement(FileCode, { size: 20 }),
      description: 'Multi-file code snippet with tabs',
      keywords: ['code', 'snippet', 'files', 'tabs'],
      section: 'MEDIA',
      placement: ['slash', 'toolbar'],
      group: 'insert',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([
            $createCodeSnippetEditNode([
              { filename: 'index.ts', code: '', language: 'typescript' },
            ]),
          ]);
        });
      },
    },
  ];

  static clone(node: CodeSnippetEditNode): CodeSnippetEditNode {
    return new CodeSnippetEditNode(node.__files, node.__key);
  }

  static importJSON(
    _serializedNode: SerializedLexicalNode & Record<string, unknown>,
  ): CodeSnippetEditNode {
    const serializedNode = _serializedNode as unknown as SerializedCodeSnippetNode;
    return new CodeSnippetEditNode(serializedNode.files);
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(CodeSnippetEditDecorator, {
      nodeKey: this.__key,
      files: this.__files,
    });
  }
}

export function $createCodeSnippetEditNode(files: CodeFile[]): CodeSnippetEditNode {
  return new CodeSnippetEditNode(files);
}

export function $isCodeSnippetEditNode(
  node: LexicalNode | null | undefined,
): node is CodeSnippetEditNode {
  return node instanceof CodeSnippetEditNode;
}
