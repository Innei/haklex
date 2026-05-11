import { galleryNodes } from '@haklex/rich-ext-gallery/node';

import type { RichRendererModule } from '../../core/types';

export const galleryModule: RichRendererModule = {
  name: 'gallery',
  nodes: galleryNodes,
  lazyRenderers: {
    Gallery: () => import('@haklex/rich-ext-gallery/renderer'),
  },
};
