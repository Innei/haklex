import { chatNodes } from '@haklex/rich-ext-chat/node';

import type { RichRendererModule } from '../../core/types';

export const CHAT_MODULE_NAME = 'chat' as const;

export const chatModule: RichRendererModule = {
  name: CHAT_MODULE_NAME,
  nodes: chatNodes,
  lazyRenderers: {
    Chat: () => import('@haklex/rich-ext-chat/renderer'),
  },
};
