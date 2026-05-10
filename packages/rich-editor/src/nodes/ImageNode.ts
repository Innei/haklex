import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { $insertNodes, DecoratorNode } from 'lexical';
import { ImageIcon } from 'lucide-react';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { ImageRenderer } from '../components/renderers/ImageRenderer';
import { createRendererDecoration } from '../components/RendererWrapper';
import { OPEN_IMAGE_UPLOAD_DIALOG_COMMAND } from '../plugins/image-upload-command';
import { IMAGE_NODE_KEY } from '../types/renderer-keys';
import type { CommandItemConfig } from '../types/slash-menu';

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    width?: number;
    height?: number;
    caption?: string;
    thumbhash?: string;
    accent?: string;
  },
  SerializedLexicalNode
>;

function sanitizeImageSrc(src: string): string {
  const trimmed = src.trim();
  if (/^(?:javascript\s*:|vbscript\s*:|data\s*:(?!image\/))/i.test(trimmed)) {
    return '';
  }
  return trimmed;
}

function sanitizeColor(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (/^#[\da-f]{3,8}$/i.test(trimmed)) return trimmed;
  if (/^(?:rgb|hsl)a?\([^)]+\)$/i.test(trimmed)) return trimmed;
  if (/^[a-z]{3,20}$/i.test(trimmed)) return trimmed;
  return undefined;
}

export interface ImageNodePayload {
  accent?: string;
  altText: string;
  caption?: string;
  height?: number;
  src: string;
  thumbhash?: string;
  width?: number;
}

export class ImageNode extends DecoratorNode<ReactElement> {
  __src: string;
  __altText: string;
  __width?: number;
  __height?: number;
  __caption?: string;
  __thumbhash?: string;
  __accent?: string;

  static commandItems: CommandItemConfig[] = [
    {
      title: 'Image',
      icon: createElement(ImageIcon, { size: 20 }),
      description: 'Upload or embed an image',
      keywords: ['image', 'picture', 'photo'],
      section: 'MEDIA',
      placement: ['slash', 'toolbar'],
      group: 'insert',
      onSelect: (editor) => {
        const opened = editor.dispatchCommand(OPEN_IMAGE_UPLOAD_DIALOG_COMMAND, void 0);
        if (opened) return;

        editor.update(() => {
          $insertNodes([$createImageNode({ src: '', altText: '' })]);
        });
      },
    },
  ];

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      {
        src: node.__src,
        altText: node.__altText,
        width: node.__width,
        height: node.__height,
        caption: node.__caption,
        thumbhash: node.__thumbhash,
        accent: node.__accent,
      },
      node.__key,
    );
  }

  constructor(payload: ImageNodePayload, key?: NodeKey) {
    super(key);
    this.__src = sanitizeImageSrc(payload.src);
    this.__altText = payload.altText;
    this.__width = payload.width;
    this.__height = payload.height;
    this.__caption = payload.caption;
    this.__thumbhash = payload.thumbhash;
    this.__accent = sanitizeColor(payload.accent);
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.className = 'rich-image-wrapper';
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return $createImageNode({
      src: serializedNode.src,
      altText: serializedNode.altText,
      width: serializedNode.width,
      height: serializedNode.height,
      caption: serializedNode.caption,
      thumbhash: serializedNode.thumbhash,
      accent: serializedNode.accent,
    });
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      type: 'image',
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      caption: this.__caption,
      thumbhash: this.__thumbhash,
      accent: this.__accent,
      version: 1,
    };
  }

  setSrc(src: string): void {
    const writable = this.getWritable();
    writable.__src = sanitizeImageSrc(src);
  }

  setAltText(altText: string): void {
    const writable = this.getWritable();
    writable.__altText = altText;
  }

  setCaption(caption?: string): void {
    const writable = this.getWritable();
    writable.__caption = caption;
  }

  setDimensions(width?: number, height?: number): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  setThumbhash(thumbhash?: string): void {
    const writable = this.getWritable();
    writable.__thumbhash = thumbhash;
  }

  setAccent(accent?: string): void {
    const writable = this.getWritable();
    writable.__accent = sanitizeColor(accent);
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  getCaption(): string | undefined {
    return this.__caption;
  }

  getWidth(): number | undefined {
    return this.__width;
  }

  getHeight(): number | undefined {
    return this.__height;
  }

  getThumbhash(): string | undefined {
    return this.__thumbhash;
  }

  getAccent(): string | undefined {
    return this.__accent;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createRendererDecoration(IMAGE_NODE_KEY, ImageRenderer, {
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      caption: this.__caption,
      thumbhash: this.__thumbhash,
      accent: this.__accent,
    });
  }
}

export function $createImageNode(payload: ImageNodePayload): ImageNode {
  return new ImageNode(payload);
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}
