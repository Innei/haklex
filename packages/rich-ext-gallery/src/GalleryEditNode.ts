import type { CommandItemConfig } from '@haklex/rich-editor/commands';
import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from 'lexical';
import { $getNodeByKey, $insertNodes } from 'lexical';
import { Images } from 'lucide-react';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { GalleryEditRenderer } from './GalleryEditRenderer';
import { GalleryNode, type GalleryNodePayload, type SerializedGalleryNode } from './GalleryNode';
import type { GalleryImage, GalleryLayout, GalleryRendererProps } from './types';

export class GalleryEditNode extends GalleryNode {
  static commandItems: CommandItemConfig[] = [
    {
      title: 'Gallery',
      icon: createElement(Images, { size: 20 }),
      description: 'Image gallery grid',
      keywords: ['gallery', 'images', 'grid'],
      section: 'MEDIA',
      placement: ['slash', 'toolbar'],
      group: 'insert',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createGalleryEditNode({ images: [] })]);
        });
      },
    },
  ];

  static clone(node: GalleryEditNode): GalleryEditNode {
    return new GalleryEditNode(
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
    super(payload, key);
  }

  static importJSON(
    _serializedNode: SerializedLexicalNode & Record<string, unknown>,
  ): GalleryEditNode {
    const serializedNode = _serializedNode as unknown as SerializedGalleryNode;
    return new GalleryEditNode({
      images: serializedNode.images,
      layout: serializedNode.layout,
      aspect: serializedNode.aspect,
      fit: serializedNode.fit,
      maxItemHeight: serializedNode.maxItemHeight,
    });
  }

  decorate(editor: LexicalEditor, _config: EditorConfig): ReactElement {
    const nodeKey = this.__key;
    const props: GalleryRendererProps = {
      images: this.__images,
      layout: this.__layout,
      aspect: this.__aspect,
      fit: this.__fit,
      maxItemHeight: this.__maxItemHeight,
      onImagesChange: (images: GalleryImage[]) => {
        editor.update(() => {
          const node = $getNodeByKey(nodeKey) as GalleryNode | null;
          if (node) node.setImages(images);
        });
      },
      onLayoutChange: (layout: GalleryLayout) => {
        editor.update(() => {
          const node = $getNodeByKey(nodeKey) as GalleryNode | null;
          if (node) node.setLayout(layout);
        });
      },
    };
    return createElement(GalleryEditRenderer, props);
  }
}

export function $createGalleryEditNode(payload: GalleryNodePayload): GalleryEditNode {
  return new GalleryEditNode(payload);
}

export function $isGalleryEditNode(node: LexicalNode | null | undefined): node is GalleryEditNode {
  return node instanceof GalleryEditNode;
}
