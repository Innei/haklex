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
import type {
  GalleryAspect,
  GalleryFit,
  GalleryImage,
  GalleryLayout,
  GalleryRendererProps,
} from './types';

export type SerializedGalleryNode = Spread<
  {
    aspect?: GalleryAspect;
    fit?: GalleryFit;
    images: GalleryImage[];
    layout?: GalleryLayout;
    maxItemHeight?: number;
  },
  SerializedLexicalNode
>;

export interface GalleryNodePayload {
  aspect?: GalleryAspect;
  fit?: GalleryFit;
  images: GalleryImage[];
  layout?: GalleryLayout;
  maxItemHeight?: number;
}

export class GalleryNode extends DecoratorNode<ReactElement> {
  __images: GalleryImage[];
  __layout: GalleryLayout;
  __aspect: GalleryAspect;
  __fit: GalleryFit;
  __maxItemHeight: number | undefined;

  static getType(): string {
    return 'gallery';
  }

  static clone(node: GalleryNode): GalleryNode {
    return new GalleryNode(
      {
        images: node.__images.map((img) => ({ ...img })),
        layout: node.__layout,
        aspect: node.__aspect,
        fit: node.__fit,
        maxItemHeight: node.__maxItemHeight,
      },
      node.__key,
    );
  }

  constructor(payload: GalleryNodePayload, key?: NodeKey) {
    super(key);
    this.__images = payload.images;
    this.__layout = payload.layout || 'grid';
    this.__aspect = payload.aspect || 'auto';
    this.__fit = payload.fit || 'cover';
    this.__maxItemHeight = payload.maxItemHeight;
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

  static importJSON(_serializedNode: SerializedLexicalNode & Record<string, unknown>): GalleryNode {
    const serializedNode = _serializedNode as unknown as SerializedGalleryNode;
    return $createGalleryNode({
      images: serializedNode.images,
      layout: serializedNode.layout,
      aspect: serializedNode.aspect,
      fit: serializedNode.fit,
      maxItemHeight: serializedNode.maxItemHeight,
    });
  }

  exportJSON(): SerializedGalleryNode {
    return {
      ...super.exportJSON(),
      type: 'gallery',
      images: this.__images,
      layout: this.__layout,
      aspect: this.__aspect,
      fit: this.__fit,
      ...(this.__maxItemHeight === undefined ? null : { maxItemHeight: this.__maxItemHeight }),
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

  getLayout(): GalleryLayout {
    return this.getLatest().__layout;
  }

  setLayout(layout: GalleryLayout): void {
    const writable = this.getWritable();
    writable.__layout = layout;
  }

  getAspect(): GalleryAspect {
    return this.getLatest().__aspect;
  }

  setAspect(aspect: GalleryAspect): void {
    const writable = this.getWritable();
    writable.__aspect = aspect;
  }

  getFit(): GalleryFit {
    return this.getLatest().__fit;
  }

  setFit(fit: GalleryFit): void {
    const writable = this.getWritable();
    writable.__fit = fit;
  }

  getMaxItemHeight(): number | undefined {
    return this.getLatest().__maxItemHeight;
  }

  setMaxItemHeight(maxItemHeight: number | undefined): void {
    const writable = this.getWritable();
    writable.__maxItemHeight = maxItemHeight;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    const props: GalleryRendererProps = {
      images: this.__images,
      layout: this.__layout,
      aspect: this.__aspect,
      fit: this.__fit,
      maxItemHeight: this.__maxItemHeight,
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
