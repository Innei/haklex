import '@haklex/rich-ext-embed/style.css';

import { embedEditNodes } from '@haklex/rich-ext-embed';

import type { RichEditorModule } from '../../core/types';
import { embedModule } from './module';

export const embedEditModule: RichEditorModule = {
  ...embedModule,
  editNodes: embedEditNodes,
};
