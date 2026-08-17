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
import {
  imageDisplayFieldsFromSize,
  type ImageDisplaySize,
  resolveImageDisplaySize,
  sanitizeImageDisplayWidth,
  sanitizeImageFixedPx,
} from '../utils/image-display-size';
import { $withAdaptiveImageDisplayWidth } from '../utils/image-insertion';

export { sanitizeImageDisplayWidth } from '../utils/image-display-size';

export type ImageLayout = 'align-left' | 'align-right' | 'float-left' | 'float-right';

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    width?: number;
    height?: number;
    caption?: string;
    thumbhash?: string;
    accent?: string;
    displayWidth?: number;
    fixedHeight?: number;
    fixedWidth?: number;
    layout?: ImageLayout;
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

const IMAGE_LAYOUTS: readonly ImageLayout[] = [
  'align-left',
  'align-right',
  'float-left',
  'float-right',
];

export function sanitizeImageLayout(value: string | undefined): ImageLayout | undefined {
  return IMAGE_LAYOUTS.includes(value as ImageLayout) ? (value as ImageLayout) : undefined;
}

function applyLayoutToDOM(
  dom: HTMLElement,
  layout: ImageLayout | undefined,
  size: ImageDisplaySize,
): void {
  if (layout) {
    dom.dataset.layout = layout;
  } else {
    delete dom.dataset.layout;
  }
  if (size.mode === 'auto') {
    delete dom.dataset.display;
  } else {
    dom.dataset.display = size.mode;
  }
  const isFloat = layout === 'float-left' || layout === 'float-right';
  if (isFloat && size.mode === 'percent') {
    dom.style.width = `${size.value}%`;
    dom.style.maxWidth = '';
    return;
  }
  if (isFloat && size.mode === 'fixed-width') {
    dom.style.width = `${size.px}px`;
    dom.style.maxWidth = '100%';
    return;
  }
  if (isFloat && size.mode === 'fixed-height') {
    dom.style.width = 'auto';
    dom.style.maxWidth = '100%';
    return;
  }
  dom.style.width = '';
  dom.style.maxWidth = '';
}

export interface ImageNodePayload {
  accent?: string;
  altText: string;
  caption?: string;
  displayWidth?: number;
  fixedHeight?: number;
  fixedWidth?: number;
  height?: number;
  layout?: ImageLayout;
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
  __displayWidth?: number;
  __fixedHeight?: number;
  __fixedWidth?: number;
  __layout?: ImageLayout;

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
          $insertNodes([
            $createImageNode($withAdaptiveImageDisplayWidth({ src: '', altText: '' })),
          ]);
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
        displayWidth: node.__displayWidth,
        fixedWidth: node.__fixedWidth,
        fixedHeight: node.__fixedHeight,
        layout: node.__layout,
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
    const display = imageDisplayFieldsFromSize(resolveImageDisplaySize(payload));
    this.__displayWidth = display.displayWidth;
    this.__fixedWidth = display.fixedWidth;
    this.__fixedHeight = display.fixedHeight;
    this.__layout = sanitizeImageLayout(payload.layout);
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.className = 'rich-image-wrapper';
    applyLayoutToDOM(div, this.__layout, this.getDisplaySize());
    return div;
  }

  updateDOM(prevNode: this, dom: HTMLElement): boolean {
    if (
      prevNode.__layout !== this.__layout ||
      prevNode.__displayWidth !== this.__displayWidth ||
      prevNode.__fixedWidth !== this.__fixedWidth ||
      prevNode.__fixedHeight !== this.__fixedHeight
    ) {
      applyLayoutToDOM(dom, this.__layout, this.getDisplaySize());
    }
    return false;
  }

  isInline(): boolean {
    return false;
  }

  static importJSON(_serializedNode: SerializedLexicalNode & Record<string, unknown>): ImageNode {
    const serializedNode = _serializedNode as unknown as SerializedImageNode;
    return $createImageNode({
      src: serializedNode.src,
      altText: serializedNode.altText,
      width: serializedNode.width,
      height: serializedNode.height,
      caption: serializedNode.caption,
      thumbhash: serializedNode.thumbhash,
      accent: serializedNode.accent,
      displayWidth: serializedNode.displayWidth,
      fixedWidth: serializedNode.fixedWidth,
      fixedHeight: serializedNode.fixedHeight,
      layout: serializedNode.layout,
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
      displayWidth: this.__displayWidth,
      fixedWidth: this.__fixedWidth,
      fixedHeight: this.__fixedHeight,
      layout: this.__layout,
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

  applyDisplaySize(size: ImageDisplaySize): void {
    const writable = this.getWritable();
    const fields = imageDisplayFieldsFromSize(size);
    writable.__displayWidth = fields.displayWidth;
    writable.__fixedWidth = fields.fixedWidth;
    writable.__fixedHeight = fields.fixedHeight;
  }

  setDisplayWidth(width?: number): void {
    const value = sanitizeImageDisplayWidth(width);
    this.applyDisplaySize(value === undefined ? { mode: 'auto' } : { mode: 'percent', value });
  }

  setFixedWidth(width?: number): void {
    const px = sanitizeImageFixedPx(width);
    this.applyDisplaySize(px === undefined ? { mode: 'auto' } : { mode: 'fixed-width', px });
  }

  setFixedHeight(height?: number): void {
    const px = sanitizeImageFixedPx(height);
    this.applyDisplaySize(px === undefined ? { mode: 'auto' } : { mode: 'fixed-height', px });
  }

  setLayout(layout?: ImageLayout): void {
    const writable = this.getWritable();
    writable.__layout = sanitizeImageLayout(layout);
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

  getDisplayWidth(): number | undefined {
    return this.__displayWidth;
  }

  getFixedWidth(): number | undefined {
    return this.__fixedWidth;
  }

  getFixedHeight(): number | undefined {
    return this.__fixedHeight;
  }

  getDisplaySize(): ImageDisplaySize {
    return resolveImageDisplaySize({
      displayWidth: this.__displayWidth,
      fixedWidth: this.__fixedWidth,
      fixedHeight: this.__fixedHeight,
    });
  }

  getLayout(): ImageLayout | undefined {
    return this.__layout;
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
      displayWidth: this.__displayWidth,
      fixedWidth: this.__fixedWidth,
      fixedHeight: this.__fixedHeight,
      layout: this.__layout,
    });
  }
}

export function $createImageNode(payload: ImageNodePayload): ImageNode {
  return new ImageNode(payload);
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}
