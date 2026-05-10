import '@haklex/rich-ext-gallery/style.css';

export { galleryModule } from './module';
export type { GalleryNodePayload, SerializedGalleryNode } from './node';
export { $createGalleryNode, $isGalleryNode, GalleryNode, galleryNodes } from './node';
export { GalleryRenderer } from './renderer';
