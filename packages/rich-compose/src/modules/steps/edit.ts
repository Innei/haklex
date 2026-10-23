import { stepsEditNodes } from '@haklex/rich-ext-steps/edit';

import type { RichEditorModule } from '../../core/types';
import { stepsModule } from './module';

export const stepsEditModule: RichEditorModule = {
  ...stepsModule,
  editNodes: stepsEditNodes,
};
