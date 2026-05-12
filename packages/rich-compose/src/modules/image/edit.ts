import { ImageEditRenderer } from '@haklex/rich-renderer-image';

import type { RichEditorModule } from '../../core/types';
import { imageModule } from './module';

export const imageEditModule: RichEditorModule = {
  ...imageModule,
  editRenderers: { Image: ImageEditRenderer },
};
