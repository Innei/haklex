import { pollNodes } from '@haklex/rich-ext-poll/node';

import type { RichRendererModule } from '../../core/types';

export const pollModule: RichRendererModule = {
  name: 'poll',
  nodes: pollNodes,
  lazyRenderers: {
    Poll: () => import('@haklex/rich-ext-poll/renderer'),
  },
};
