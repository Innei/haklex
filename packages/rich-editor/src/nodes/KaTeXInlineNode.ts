import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { DecoratorNode } from 'lexical';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { KaTeXRenderer } from '../components/renderers/KaTeXRenderer';
import { createRendererDecoration } from '../components/RendererWrapper';
import { getRegisteredNodeKlass } from '../utils/getRegisteredNodeKlass';
import { resolveKaTeXEquation } from '../utils/katex-defaults';

export type SerializedKaTeXInlineNode = Spread<
  {
    equation: string;
    color?: string | null;
  },
  SerializedLexicalNode
>;

export class KaTeXInlineNode extends DecoratorNode<ReactElement> {
  __equation: string;
  __autoOpenOnMount: boolean;
  __color: string | null;

  static getType(): string {
    return 'katex-inline';
  }

  static clone(node: KaTeXInlineNode): KaTeXInlineNode {
    return new KaTeXInlineNode(node.__equation, node.__key, node.__autoOpenOnMount, node.__color);
  }

  constructor(
    equation: string,
    key?: NodeKey,
    autoOpenOnMount = false,
    color: string | null = null,
  ) {
    super(key);
    this.__equation = equation;
    this.__autoOpenOnMount = autoOpenOnMount;
    this.__color = color;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    return document.createElement('span');
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return true;
  }

  static importJSON(serializedNode: SerializedKaTeXInlineNode): KaTeXInlineNode {
    const node = $createKaTeXInlineNode(serializedNode.equation);
    if (serializedNode.color) node.setColor(serializedNode.color);
    return node;
  }

  exportJSON(): SerializedKaTeXInlineNode {
    return {
      ...super.exportJSON(),
      type: 'katex-inline',
      equation: this.__equation,
      color: this.__color,
      version: 1,
    };
  }

  getEquation(): string {
    return this.__equation;
  }

  setEquation(equation: string): void {
    const writable = this.getWritable();
    writable.__equation = equation;
  }

  getShouldAutoOpenOnMount(): boolean {
    return this.getLatest().__autoOpenOnMount;
  }

  setShouldAutoOpenOnMount(autoOpenOnMount: boolean): void {
    const writable = this.getWritable();
    writable.__autoOpenOnMount = autoOpenOnMount;
  }

  getColor(): string | null {
    return this.getLatest().__color;
  }

  setColor(color: string | null): void {
    const writable = this.getWritable();
    writable.__color = color;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    const decoration = createRendererDecoration('KaTeX', KaTeXRenderer, {
      equation: this.__equation,
      displayMode: false,
    });
    if (!this.__color) return decoration;
    return createElement('span', { style: { color: this.__color } }, decoration);
  }
}

export function $createKaTeXInlineNode(
  equation: string,
  options?: { autoOpenOnMount?: boolean },
): KaTeXInlineNode {
  const NodeKlass = getRegisteredNodeKlass(KaTeXInlineNode.getType(), KaTeXInlineNode);
  const node = new NodeKlass(resolveKaTeXEquation(equation, options));
  if (options?.autoOpenOnMount) {
    node.setShouldAutoOpenOnMount(true);
  }
  return node;
}

export function $isKaTeXInlineNode(node: LexicalNode | null | undefined): node is KaTeXInlineNode {
  return node instanceof KaTeXInlineNode;
}
