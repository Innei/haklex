import type {} from '@haklex/rich-editor';
import type { ComponentType } from 'react';

import type { GalleryRendererProps } from './types';

declare module '@haklex/rich-editor' {
  interface RendererConfig {
    Gallery?: ComponentType<GalleryRendererProps>;
  }
}

export {};
