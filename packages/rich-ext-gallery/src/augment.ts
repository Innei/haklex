import type {} from '@haklex/rich-editor/static';
import type { ComponentType } from 'react';

import type { GalleryRendererProps } from './types';

declare module '@haklex/rich-editor/static' {
  interface RendererConfig {
    Gallery?: ComponentType<GalleryRendererProps>;
  }
}

export const __augmentLoaded_gallery = true;
