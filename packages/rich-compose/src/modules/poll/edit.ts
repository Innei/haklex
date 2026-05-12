import { pollEditNodes } from '@haklex/rich-ext-poll/edit';

import type { RichEditorModule } from '../../core/types';
import { pollModule } from './module';

export const pollEditModule: RichEditorModule = {
  ...pollModule,
  editNodes: pollEditNodes,
};
