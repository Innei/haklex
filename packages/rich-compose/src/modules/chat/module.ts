import { chatNodes } from '@haklex/rich-ext-chat/node';

import type { RichRendererModule } from '../../core/types';

/**
 * Chat module — registers ChatNode (light) and lazy-loads ChatRenderer.
 *
 * Consumers can write a thin override module using `chatNodes` from
 * `@haklex/rich-ext-chat/node` plus a custom `renderers: { Chat: ... }` to
 * keep the default ChatRenderer chunk out of their bundle.
 */
export const chatModule: RichRendererModule = {
  name: 'chat',
  nodes: chatNodes,
  lazyRenderers: {
    Chat: () => import('@haklex/rich-ext-chat/renderer'),
  },
};
