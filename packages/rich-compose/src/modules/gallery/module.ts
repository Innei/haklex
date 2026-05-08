import { galleryNodes, GalleryRenderer } from '@haklex/rich-ext-gallery/static';

import type { RichRendererModule } from '../../core/types';

export const galleryModule: RichRendererModule = {
  name: 'gallery',
  nodes: galleryNodes,
  renderers: { Gallery: GalleryRenderer },
};
