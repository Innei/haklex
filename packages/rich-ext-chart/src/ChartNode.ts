import { createRendererDecoration } from '@haklex/rich-editor/static';
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

import { ChartBlockRenderer } from './ChartBlockRenderer';
import { CHART_NODE_KEY } from './slot';

export type SerializedChartNode = Spread<{ spec: string }, SerializedLexicalNode>;

export function toChartSpecSource(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return JSON.stringify(value);
}

export class ChartNode extends DecoratorNode<ReactElement> {
  __spec: string;

  static getType(): string {
    return 'chart';
  }

  static clone(node: ChartNode): ChartNode {
    return new ChartNode(node.__spec, node.__key);
  }

  constructor(spec = '', key?: NodeKey) {
    super(key);
    this.__spec = spec;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.className = 'rich-chart-wrapper';
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  static importJSON(_serializedNode: SerializedLexicalNode & Record<string, unknown>): ChartNode {
    const serializedNode = _serializedNode as unknown as SerializedChartNode;
    return $createChartNode(toChartSpecSource(serializedNode.spec)).updateFromJSON(_serializedNode);
  }

  exportJSON(): SerializedChartNode {
    return {
      ...super.exportJSON(),
      type: 'chart',
      spec: this.__spec,
      version: 1,
    };
  }

  getSpec(): string {
    return this.getLatest().__spec;
  }

  setSpec(spec: string): void {
    const writable = this.getWritable();
    writable.__spec = spec;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createRendererDecoration(CHART_NODE_KEY, ChartBlockRenderer, {
      spec: this.__spec,
    });
  }
}

export function $createChartNode(spec = ''): ChartNode {
  return new ChartNode(spec);
}

export function $isChartNode(node: LexicalNode | null | undefined): node is ChartNode {
  return node instanceof ChartNode;
}
