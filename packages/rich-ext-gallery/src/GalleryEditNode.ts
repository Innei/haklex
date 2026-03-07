import type { CommandItemConfig } from '@haklex/rich-editor/commands';
import type { GalleryImage, GalleryRendererProps } from '@haklex/rich-editor/renderers';
import { createRendererDecoration } from '@haklex/rich-editor/renderers';
import type { EditorConfig, LexicalEditor, LexicalNode, NodeKey } from 'lexical';
import { $getNodeByKey, $insertNodes } from 'lexical';
import { Images } from 'lucide-react';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { GalleryNode, type GalleryNodePayload, type SerializedGalleryNode } from './GalleryNode';
import { GalleryRenderer } from './GalleryRenderer';

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
      },
      node.__key,
    );
  }

  constructor(payload: GalleryNodePayload, key?: NodeKey) {
    super(payload, key);
  }

  static importJSON(serializedNode: SerializedGalleryNode): GalleryEditNode {
    return new GalleryEditNode({
      images: serializedNode.images,
      layout: serializedNode.layout,
    });
  }

  decorate(editor: LexicalEditor, _config: EditorConfig): ReactElement {
    const nodeKey = this.__key;
    const props: GalleryRendererProps = {
      images: this.__images,
      layout: this.__layout,
      onImagesChange: (images: GalleryImage[]) => {
        editor.update(() => {
          const node = $getNodeByKey(nodeKey) as GalleryNode | null;
          if (node) node.setImages(images);
        });
      },
      onLayoutChange: (layout: 'grid' | 'masonry' | 'carousel') => {
        editor.update(() => {
          const node = $getNodeByKey(nodeKey) as GalleryNode | null;
          if (node) node.setLayout(layout);
        });
      },
    };
    return createRendererDecoration('Gallery', GalleryRenderer, props);
  }
}

export function $createGalleryEditNode(payload: GalleryNodePayload): GalleryEditNode {
  return new GalleryEditNode(payload);
}

export function $isGalleryEditNode(node: LexicalNode | null | undefined): node is GalleryEditNode {
  return node instanceof GalleryEditNode;
}
