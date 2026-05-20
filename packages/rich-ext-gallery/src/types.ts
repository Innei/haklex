export interface GalleryImage {
  alt?: string;
  height?: number;
  src: string;
  thumbhash?: string;
  width?: number;
}

export interface GalleryImageClickPayload {
  current: GalleryImage;
  images: GalleryImage[];
  index: number;
  target: HTMLElement;
}

export type GalleryOnImageClick = (payload: GalleryImageClickPayload) => void;

export interface GalleryRendererProps {
  images: GalleryImage[];
  layout: 'grid' | 'masonry' | 'carousel';
  onImageClick?: GalleryOnImageClick;
  onImagesChange?: (images: GalleryImage[]) => void;
  onLayoutChange?: (layout: 'grid' | 'masonry' | 'carousel') => void;
}
