export interface RichImageInfo {
  alt?: string;
  caption?: string;
  height?: number;
  src: string;
  thumbhash?: string;
  width?: number;
}

export interface ImageClickPayload {
  current: RichImageInfo;
  images: RichImageInfo[];
  index: number;
  target: HTMLElement;
}

export type OnImageClick = (payload: ImageClickPayload) => void;

export interface ImageModuleConfig {
  onImageClick?: OnImageClick;
}
