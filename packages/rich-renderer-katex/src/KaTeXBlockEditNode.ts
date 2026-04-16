import { KaTeXBlockNode, type SerializedKaTeXBlockNode } from '@haklex/rich-editor/nodes';
import { createRendererDecoration, KaTeXRenderer } from '@haklex/rich-editor/renderers';
import type { EditorConfig, LexicalEditor } from 'lexical';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { KaTeXEditDecorator } from './KaTeXEditDecorator';

export class KaTeXBlockEditNode extends KaTeXBlockNode {
  static clone(node: KaTeXBlockEditNode): KaTeXBlockEditNode {
    return new KaTeXBlockEditNode(
      node.__equation,
      node.__key,
      node.getShouldAutoOpenOnMount(),
    );
  }

  static importJSON(serializedNode: SerializedKaTeXBlockNode): KaTeXBlockEditNode {
    return new KaTeXBlockEditNode(serializedNode.equation);
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    const rendererEl = createRendererDecoration('KaTeX', KaTeXRenderer, {
      equation: this.__equation,
      displayMode: true,
    });
    return createElement(KaTeXEditDecorator, {
      nodeKey: this.__key,
      equation: this.__equation,
      displayMode: true,
      autoOpenOnMount: this.getShouldAutoOpenOnMount(),
      children: rendererEl,
    });
  }
}
