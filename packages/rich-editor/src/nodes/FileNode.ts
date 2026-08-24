import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { DecoratorNode } from 'lexical';
import { Paperclip } from 'lucide-react';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { FileRenderer } from '../components/renderers/FileRenderer';
import { createRendererDecoration } from '../components/RendererWrapper';
import { OPEN_FILE_PICKER_COMMAND } from '../plugins/file-upload-command';
import { markInlineDraggable } from '../plugins/inline-dnd-shared';
import { FILE_NODE_KEY } from '../types/renderer-keys';
import type { CommandItemConfig } from '../types/slash-menu';

export type FileDisplay = 'block' | 'inline';

export type SerializedFileNode = Spread<
  {
    src: string;
    name: string;
    size?: number;
    mimeType?: string;
    ext?: string;
    display?: FileDisplay;
  },
  SerializedLexicalNode
>;

export interface FileNodePayload {
  display?: FileDisplay;
  ext?: string;
  mimeType?: string;
  name: string;
  size?: number;
  src: string;
}

export function fileExtFromName(name: string): string | undefined {
  const index = name.lastIndexOf('.');
  if (index <= 0 || index === name.length - 1) return undefined;
  const ext = name.slice(index + 1).toLowerCase();
  return ext.length > 8 ? undefined : ext;
}

export class FileNode extends DecoratorNode<ReactElement> {
  __src: string;
  __name: string;
  __size?: number;
  __mimeType?: string;
  __ext?: string;
  __display: FileDisplay;

  static commandItems: CommandItemConfig[] = [
    {
      title: 'File',
      icon: createElement(Paperclip, { size: 20 }),
      description: 'Attach a file',
      keywords: ['file', 'attachment', 'upload', 'wenjian', 'fujian'],
      section: 'MEDIA',
      placement: ['slash', 'toolbar'],
      group: 'insert',
      onSelect: (editor) => {
        editor.dispatchCommand(OPEN_FILE_PICKER_COMMAND, undefined);
      },
    },
  ];

  static getType(): string {
    return 'file';
  }

  static clone(node: FileNode): FileNode {
    return new FileNode(
      {
        src: node.__src,
        name: node.__name,
        size: node.__size,
        mimeType: node.__mimeType,
        ext: node.__ext,
        display: node.__display,
      },
      node.__key,
    );
  }

  constructor(payload: FileNodePayload, key?: NodeKey) {
    super(key);
    this.__src = payload.src;
    this.__name = payload.name;
    this.__size = payload.size;
    this.__mimeType = payload.mimeType;
    this.__ext = payload.ext;
    this.__display = payload.display ?? 'block';
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const el = document.createElement(this.__display === 'inline' ? 'span' : 'div');
    el.className = 'rich-file-wrapper';
    if (this.__display === 'inline') markInlineDraggable(el, this.getKey());
    return el;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return this.__display === 'inline';
  }

  static importJSON(_serializedNode: SerializedLexicalNode & Record<string, unknown>): FileNode {
    const serializedNode = _serializedNode as unknown as SerializedFileNode;
    return $createFileNode({
      src: serializedNode.src,
      name: serializedNode.name,
      size: serializedNode.size,
      mimeType: serializedNode.mimeType,
      ext: serializedNode.ext,
      display: serializedNode.display,
    });
  }

  exportJSON(): SerializedFileNode {
    return {
      ...super.exportJSON(),
      type: 'file',
      src: this.__src,
      name: this.__name,
      size: this.__size,
      mimeType: this.__mimeType,
      ext: this.__ext,
      display: this.__display,
      version: 1,
    };
  }

  getSrc(): string {
    return this.getLatest().__src;
  }

  setSrc(src: string): void {
    this.getWritable().__src = src;
  }

  getName(): string {
    return this.getLatest().__name;
  }

  setName(name: string): void {
    this.getWritable().__name = name;
  }

  getDisplay(): FileDisplay {
    return this.getLatest().__display;
  }

  getPayload(): FileNodePayload {
    const latest = this.getLatest();
    return {
      src: latest.__src,
      name: latest.__name,
      size: latest.__size,
      mimeType: latest.__mimeType,
      ext: latest.__ext,
      display: latest.__display,
    };
  }

  setFilePayload(payload: Partial<Omit<FileNodePayload, 'display'>>): void {
    const writable = this.getWritable();
    if (payload.src !== undefined) writable.__src = payload.src;
    if (payload.name !== undefined) writable.__name = payload.name;
    writable.__size = payload.size;
    writable.__mimeType = payload.mimeType;
    writable.__ext = payload.ext;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createRendererDecoration(FILE_NODE_KEY, FileRenderer, {
      src: this.__src,
      name: this.__name,
      size: this.__size,
      mimeType: this.__mimeType,
      ext: this.__ext,
      display: this.__display,
      nodeKey: this.getKey(),
    });
  }
}

export function $createFileNode(payload: FileNodePayload): FileNode {
  return new FileNode(payload);
}

export function $isFileNode(node: LexicalNode | null | undefined): node is FileNode {
  return node instanceof FileNode;
}
