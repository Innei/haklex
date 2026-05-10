import './styles.css';

import type { Klass, LexicalNode } from 'lexical';

import { GalleryEditNode } from './GalleryEditNode';

export { $createGalleryEditNode, $isGalleryEditNode, GalleryEditNode } from './GalleryEditNode';
export { GalleryEditRenderer } from './GalleryEditRenderer';

export const galleryEditNodes: Array<Klass<LexicalNode>> = [GalleryEditNode];
