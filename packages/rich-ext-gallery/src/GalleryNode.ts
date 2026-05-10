import './augment';

import { createRendererDecoration } from '@haklex/rich-editor/renderers';
import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { DecoratorNode } from 'lexical';
import type { ReactElement } from 'react';

import { GALLERY_NODE_KEY } from './slot';
import type { GalleryImage, GalleryRendererProps } from './types';

export type SerializedGalleryNode = Spread<
  {
    images: GalleryImage[];
    layout?: 'grid' | 'masonry' | 'carousel';
  },
  SerializedLexicalNode
>;

export interface GalleryNodePayload {
  images: GalleryImage[];
  layout?: 'grid' | 'masonry' | 'carousel';
}

export class GalleryNode extends DecoratorNode<ReactElement> {
  __images: GalleryImage[];
  __layout: 'grid' | 'masonry' | 'carousel';

  static getType(): string {
    return 'gallery';
  }

  static clone(node: GalleryNode): GalleryNode {
    return new GalleryNode(
      {
        images: node.__images.map((img) => ({ ...img })),
        layout: node.__layout,
      },
      node.__key,
    );
  }

  constructor(payload: GalleryNodePayload, key?: NodeKey) {
    super(key);
    this.__images = payload.images;
    this.__layout = payload.layout || 'grid';
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.className = `rich-gallery rich-gallery-${this.__layout}`;
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedGalleryNode): GalleryNode {
    return $createGalleryNode({
      images: serializedNode.images,
      layout: serializedNode.layout,
    });
  }

  exportJSON(): SerializedGalleryNode {
    return {
      ...super.exportJSON(),
      type: 'gallery',
      images: this.__images,
      layout: this.__layout,
      version: 1,
    };
  }

  getImages(): GalleryImage[] {
    return this.getLatest().__images;
  }

  setImages(images: GalleryImage[]): void {
    const writable = this.getWritable();
    writable.__images = images;
  }

  getLayout(): 'grid' | 'masonry' | 'carousel' {
    return this.getLatest().__layout;
  }

  setLayout(layout: 'grid' | 'masonry' | 'carousel'): void {
    const writable = this.getWritable();
    writable.__layout = layout;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    const props: GalleryRendererProps = {
      images: this.__images,
      layout: this.__layout,
    };
    return createRendererDecoration(GALLERY_NODE_KEY, undefined, props);
  }
}

export function $createGalleryNode(payload: GalleryNodePayload): GalleryNode {
  return new GalleryNode(payload);
}

export function $isGalleryNode(node: LexicalNode | null | undefined): node is GalleryNode {
  return node instanceof GalleryNode;
}
