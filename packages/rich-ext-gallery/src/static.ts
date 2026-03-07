import type { Klass, LexicalNode } from 'lexical'

import { GalleryNode } from './GalleryNode'

export type { GalleryNodePayload, SerializedGalleryNode } from './GalleryNode'
export { $createGalleryNode, $isGalleryNode, GalleryNode } from './GalleryNode'
export { default, GalleryRenderer } from './GalleryRenderer'

export const galleryNodes: Array<Klass<LexicalNode>> = [GalleryNode]
