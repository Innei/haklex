import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { $insertNodes, DecoratorNode } from 'lexical';
import { Sigma } from 'lucide-react';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { KaTeXRenderer } from '../components/renderers/KaTeXRenderer';
import { createRendererDecoration } from '../components/RendererWrapper';
import { KATEX_NODE_KEY } from '../types/renderer-keys';
import type { SlashMenuItemConfig } from '../types/slash-menu';
import { getRegisteredNodeKlass } from '../utils/getRegisteredNodeKlass';
import { resolveKaTeXEquation } from '../utils/katex-defaults';

export type SerializedKaTeXBlockNode = Spread<
  {
    equation: string;
  },
  SerializedLexicalNode
>;

export class KaTeXBlockNode extends DecoratorNode<ReactElement> {
  __equation: string;
  __autoOpenOnMount: boolean;

  static slashMenuItems: SlashMenuItemConfig[] = [
    {
      title: 'Math Equation',
      icon: createElement(Sigma, { size: 20 }),
      description: 'KaTeX block formula',
      keywords: ['math', 'equation', 'latex', 'katex'],
      section: 'ADVANCED',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createKaTeXBlockNode('', { autoOpenOnMount: true })]);
        });
      },
    },
  ];

  static getType(): string {
    return 'katex-block';
  }

  static clone(node: KaTeXBlockNode): KaTeXBlockNode {
    return new KaTeXBlockNode(node.__equation, node.__key, node.__autoOpenOnMount);
  }

  constructor(equation: string, key?: NodeKey, autoOpenOnMount = false) {
    super(key);
    this.__equation = equation;
    this.__autoOpenOnMount = autoOpenOnMount;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.className = 'rich-katex-block-wrapper';
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  static importJSON(
    _serializedNode: SerializedLexicalNode & Record<string, unknown>,
  ): KaTeXBlockNode {
    const serializedNode = _serializedNode as unknown as SerializedKaTeXBlockNode;
    return $createKaTeXBlockNode(serializedNode.equation);
  }

  exportJSON(): SerializedKaTeXBlockNode {
    return {
      ...super.exportJSON(),
      type: 'katex-block',
      equation: this.__equation,
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

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createRendererDecoration(KATEX_NODE_KEY, KaTeXRenderer, {
      equation: this.__equation,
      displayMode: true,
    });
  }
}

export function $createKaTeXBlockNode(
  equation: string,
  options?: { autoOpenOnMount?: boolean },
): KaTeXBlockNode {
  const NodeKlass = getRegisteredNodeKlass(KaTeXBlockNode.getType(), KaTeXBlockNode);
  const node = new NodeKlass(resolveKaTeXEquation(equation, options));
  if (options?.autoOpenOnMount) {
    node.setShouldAutoOpenOnMount(true);
  }
  return node;
}

export function $isKaTeXBlockNode(node: LexicalNode | null | undefined): node is KaTeXBlockNode {
  return node instanceof KaTeXBlockNode;
}
