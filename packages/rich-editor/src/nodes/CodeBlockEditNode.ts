import type { EditorConfig, LexicalEditor, SerializedLexicalNode } from 'lexical';
import { $insertNodes } from 'lexical';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { CodeBlockEditDecorator } from '../components/decorators/CodeBlockEditDecorator';
import { CodeBlockNode, type SerializedCodeBlockNode } from './CodeBlockNode';

export class CodeBlockEditNode extends CodeBlockNode {
  static commandItems = CodeBlockNode.commandItems.map((item) => ({
    ...item,
    onSelect: (editor: LexicalEditor) => {
      editor.update(() => {
        $insertNodes([new CodeBlockEditNode('', 'text')]);
      });
    },
  }));

  static clone(node: CodeBlockEditNode): CodeBlockEditNode {
    return new CodeBlockEditNode(node.__code, node.__language, node.__key);
  }

  static importJSON(
    _serializedNode: SerializedLexicalNode & Record<string, unknown>,
  ): CodeBlockEditNode {
    const serializedNode = _serializedNode as unknown as SerializedCodeBlockNode;
    return new CodeBlockEditNode(serializedNode.code, serializedNode.language);
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(CodeBlockEditDecorator, {
      nodeKey: this.__key,
      code: this.__code,
      language: this.__language,
    });
  }
}

export function $createCodeBlockEditNode(code: string, language: string): CodeBlockEditNode {
  return new CodeBlockEditNode(code, language);
}
