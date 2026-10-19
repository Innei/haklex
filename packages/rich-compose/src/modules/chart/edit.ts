import { ChartEditNode } from '@haklex/rich-ext-chart';
import type { Klass, LexicalNode } from 'lexical';

import type { RichEditorModule } from '../../core/types';
import { chartModule } from './module';

const chartEditNodes: Array<Klass<LexicalNode>> = [ChartEditNode];

export const chartEditModule: RichEditorModule = {
  ...chartModule,
  editNodes: chartEditNodes,
};
