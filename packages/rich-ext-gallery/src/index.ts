import './styles.css'

import type { Klass, LexicalNode } from 'lexical'

import { GalleryEditNode } from './GalleryEditNode'
import { GalleryNode } from './GalleryNode'

export {
  $createGalleryEditNode,
  $isGalleryEditNode,
  GalleryEditNode,
} from './GalleryEditNode'
export { GalleryEditRenderer } from './GalleryEditRenderer'
export type { GalleryNodePayload, SerializedGalleryNode } from './GalleryNode'
export { $createGalleryNode, $isGalleryNode, GalleryNode } from './GalleryNode'
export { default, GalleryRenderer } from './GalleryRenderer'

export const galleryNodes: Array<Klass<LexicalNode>> = [GalleryNode]
export const galleryEditNodes: Array<Klass<LexicalNode>> = [GalleryEditNode]
