import { DynamicEditNode, DynamicPlugin } from '@haklex/rich-ext-dynamic';
import type { Klass, LexicalNode } from 'lexical';

import type { RichEditorModule } from '../../core/types';
import { dynamicModule } from './module';

const dynamicEditNodes: Array<Klass<LexicalNode>> = [DynamicEditNode];

export const dynamicEditModule: RichEditorModule = {
  ...dynamicModule,
  editNodes: dynamicEditNodes,
  plugins: <DynamicPlugin />,
};
