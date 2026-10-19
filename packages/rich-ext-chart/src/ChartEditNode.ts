import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from 'lexical';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { ChartEditRenderer } from './ChartEditRenderer';
import type { SerializedChartNode } from './ChartNode';
import { ChartNode, toChartSpecSource } from './ChartNode';

export class ChartEditNode extends ChartNode {
  static clone(node: ChartEditNode): ChartEditNode {
    return new ChartEditNode(node.__spec, node.__key);
  }

  constructor(spec = '', key?: NodeKey) {
    super(spec, key);
  }

  static importJSON(
    _serializedNode: SerializedLexicalNode & Record<string, unknown>,
  ): ChartEditNode {
    const serializedNode = _serializedNode as unknown as SerializedChartNode;
    return new ChartEditNode(toChartSpecSource(serializedNode.spec)).updateFromJSON(
      _serializedNode,
    );
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(ChartEditRenderer, { spec: this.__spec, nodeKey: this.__key });
  }
}

export function $createChartEditNode(spec = ''): ChartEditNode {
  return new ChartEditNode(spec);
}

export function $isChartEditNode(node: LexicalNode | null | undefined): node is ChartEditNode {
  return node instanceof ChartEditNode;
}
