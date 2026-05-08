import { ImageRenderer } from '@haklex/rich-renderer-image/static';

import type { RichRendererModule } from '../../core/types';

export const imageModule: RichRendererModule = {
  name: 'image',
  renderers: { Image: ImageRenderer },
};
