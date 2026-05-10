import { galleryNodes } from '@haklex/rich-ext-gallery/node';

import type { RichRendererModule } from '../../core/types';

/**
 * Gallery module — registers GalleryNode (light) and lazy-loads
 * GalleryRenderer (with photo viewer / dnd). Consumers can override with a
 * thin module to keep the default chunk out of the bundle.
 */
export const galleryModule: RichRendererModule = {
  name: 'gallery',
  nodes: galleryNodes,
  lazyRenderers: {
    Gallery: () => import('@haklex/rich-ext-gallery/renderer'),
  },
};
