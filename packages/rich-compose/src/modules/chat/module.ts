import { chatNodes } from '@haklex/rich-ext-chat/node';

import type { RichRendererModule } from '../../core/types';

export const chatModule: RichRendererModule = {
  name: 'chat',
  nodes: chatNodes,
  lazyRenderers: {
    Chat: () => import('@haklex/rich-ext-chat/renderer'),
  },
};
