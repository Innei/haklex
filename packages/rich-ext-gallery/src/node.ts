import type { Klass, LexicalNode } from 'lexical';

import { GalleryNode } from './GalleryNode';

export * from './augment';
export type { GalleryNodePayload, SerializedGalleryNode } from './GalleryNode';
export { $createGalleryNode, $isGalleryNode, GalleryNode } from './GalleryNode';
export { GALLERY_NODE_KEY } from './slot';
export type { GalleryImage, GalleryRendererProps } from './types';

export const galleryNodes: Array<Klass<LexicalNode>> = [GalleryNode];
