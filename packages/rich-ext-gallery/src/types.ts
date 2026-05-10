export interface GalleryImage {
  alt?: string;
  height?: number;
  src: string;
  thumbhash?: string;
  width?: number;
}

export interface GalleryRendererProps {
  images: GalleryImage[];
  layout: 'grid' | 'masonry' | 'carousel';
  onImagesChange?: (images: GalleryImage[]) => void;
  onLayoutChange?: (layout: 'grid' | 'masonry' | 'carousel') => void;
}
