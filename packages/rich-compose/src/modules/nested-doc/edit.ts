import { nestedDocEditNodes } from '@haklex/rich-ext-nested-doc';

import type { RichEditorModule } from '../../core/types';
import { nestedDocModule } from './module';

export const nestedDocEditModule: RichEditorModule = {
  ...nestedDocModule,
  editNodes: nestedDocEditNodes,
};
