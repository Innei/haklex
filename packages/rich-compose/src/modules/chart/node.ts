import { $createChartNode, $isChartNode, ChartNode } from '@haklex/rich-ext-chart/static';
import type { Klass, LexicalNode } from 'lexical';

export type { SerializedChartNode } from '@haklex/rich-ext-chart/static';
export { $createChartNode, $isChartNode, ChartNode };

export const chartNodes: Array<Klass<LexicalNode>> = [ChartNode];
