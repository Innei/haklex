import { katexEditNodes } from '@haklex/rich-renderer-katex';

import type { RichEditorModule } from '../../core/types';
import { katexModule } from './module';

export const katexEditModule: RichEditorModule = {
  ...katexModule,
  editNodes: katexEditNodes,
};
