import { ChartBlockRenderer } from '@haklex/rich-ext-chart/static';

import type { RichRendererModule } from '../../core/types';
import { chartNodes } from './node';

export const chartModule: RichRendererModule = {
  name: 'chart',
  nodes: chartNodes,
  renderers: { Chart: ChartBlockRenderer },
};
