import { galleryNodes } from '@haklex/rich-ext-gallery/node';

import { createGalleryModule } from './module-config';
import { ComposedGalleryRenderer } from './renderer';

export const galleryModule = createGalleryModule({
  nodes: galleryNodes,
  renderers: { Gallery: ComposedGalleryRenderer },
});
