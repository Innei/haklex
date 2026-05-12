import { galleryEditNodes, GalleryEditRenderer } from '@haklex/rich-ext-gallery/edit';

import type { RichEditorModule } from '../../core/types';
import { galleryModule } from './module';

export const galleryEditModule: RichEditorModule = {
  ...galleryModule,
  editNodes: galleryEditNodes,
  editRenderers: { Gallery: GalleryEditRenderer },
};
