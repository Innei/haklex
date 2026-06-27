import { KaTeXInlineNode, type SerializedKaTeXInlineNode } from '@haklex/rich-editor/nodes';
import { createRendererDecoration, KaTeXRenderer } from '@haklex/rich-editor/renderers';
import type { EditorConfig, LexicalEditor, SerializedLexicalNode } from 'lexical';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { KaTeXEditDecorator } from './KaTeXEditDecorator';

export class KaTeXInlineEditNode extends KaTeXInlineNode {
  static clone(node: KaTeXInlineEditNode): KaTeXInlineEditNode {
    return new KaTeXInlineEditNode(
      node.__equation,
      node.__key,
      node.getShouldAutoOpenOnMount(),
      node.__color,
    );
  }

  static importJSON(
    _serializedNode: SerializedLexicalNode & Record<string, unknown>,
  ): KaTeXInlineEditNode {
    const serializedNode = _serializedNode as unknown as SerializedKaTeXInlineNode;
    const node = new KaTeXInlineEditNode(serializedNode.equation);
    if (serializedNode.color) node.setColor(serializedNode.color);
    return node;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    const rendererEl = createRendererDecoration('KaTeX', KaTeXRenderer, {
      equation: this.__equation,
      displayMode: false,
    });
    const decorator = createElement(KaTeXEditDecorator, {
      nodeKey: this.__key,
      equation: this.__equation,
      displayMode: false,
      autoOpenOnMount: this.getShouldAutoOpenOnMount(),
      children: rendererEl,
    });
    if (!this.__color) return decorator;
    return createElement('span', { style: { color: this.__color } }, decorator);
  }
}
