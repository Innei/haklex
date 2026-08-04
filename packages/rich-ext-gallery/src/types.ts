export type GalleryAspect = 'auto' | '1:1' | '4:3' | '16:9' | '3:4';

export type GalleryFit = 'cover' | 'contain';

export type GalleryLayout = 'grid' | 'masonry' | 'carousel';

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
  aspect?: GalleryAspect;
  fit?: GalleryFit;
  images: GalleryImage[];
  layout: GalleryLayout;
  maxItemHeight?: number;
  onImageClick?: GalleryOnImageClick;
  onImagesChange?: (images: GalleryImage[]) => void;
  onLayoutChange?: (layout: GalleryLayout) => void;
}
