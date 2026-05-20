import type { GalleryRendererProps } from '@haklex/rich-ext-gallery/renderer';
import { GalleryRenderer } from '@haklex/rich-ext-gallery/renderer';
import { type ComponentType } from 'react';

import { useGalleryConfig } from './module-config';

export const ComposedGalleryRenderer: ComponentType<GalleryRendererProps> = (props) => {
  const { onImageClick } = useGalleryConfig();
  return <GalleryRenderer {...props} onImageClick={onImageClick} />;
};
