import type { CommandItemConfig } from '@haklex/rich-editor/commands';
import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from 'lexical';
import { $insertNodes } from 'lexical';
import { ChartColumnBig } from 'lucide-react';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { ChartEditRenderer } from './ChartEditRenderer';
import type { SerializedChartNode } from './ChartNode';
import { ChartNode, toChartSpecSource } from './ChartNode';

const DEFAULT_CHART_SPEC = JSON.stringify({
  version: 1,
  type: 'bar',
  title: 'Monthly visits',
  x: 'month',
  series: [{ key: 'visits', label: 'Visits' }],
  data: [
    { month: 'Jan', visits: 120 },
    { month: 'Feb', visits: 160 },
    { month: 'Mar', visits: 140 },
    { month: 'Apr', visits: 200 },
  ],
});

export class ChartEditNode extends ChartNode {
  static commandItems: CommandItemConfig[] = [
    {
      title: 'Chart',
      icon: createElement(ChartColumnBig, { size: 20 }),
      description: 'Bar, line, area or pie chart',
      keywords: ['chart', 'graph', 'bar', 'line', 'pie', 'data'],
      section: 'ADVANCED',
      placement: ['slash', 'toolbar'],
      group: 'insert',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createChartEditNode(DEFAULT_CHART_SPEC)]);
        });
      },
    },
  ];

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
