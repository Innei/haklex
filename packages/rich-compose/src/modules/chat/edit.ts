import { chatEditNodes, ChatEditRenderer } from '@haklex/rich-ext-chat/edit';

import type { RichEditorModule } from '../../core/types';
import { chatModule } from './module';

export const chatEditModule: RichEditorModule = {
  ...chatModule,
  editNodes: chatEditNodes,
  editRenderers: { Chat: ChatEditRenderer },
};
