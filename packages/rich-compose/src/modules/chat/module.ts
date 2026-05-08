import { chatNodes,ChatRenderer } from '@haklex/rich-ext-chat/static';

import type { RichRendererModule } from '../../core/types';

export const chatModule: RichRendererModule = {
  name: 'chat',
  nodes: chatNodes,
  renderers: { Chat: ChatRenderer },
};
