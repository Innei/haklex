import { createRendererDecoration } from '@haklex/rich-editor/static';
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

import { WHITEBOARD_NODE_KEY } from './slot';
import { WhiteboardSSRRenderer } from './WhiteboardSSRRenderer';

export type SerializedWhiteboardNode = Spread<{ snapshot: string }, SerializedLexicalNode>;

export class WhiteboardNode extends DecoratorNode<ReactElement> {
  __snapshot: string;

  static getType(): string {
    return 'excalidraw';
  }

  static clone(node: WhiteboardNode): WhiteboardNode {
    return new WhiteboardNode(node.__snapshot, node.__key);
  }

  constructor(snapshot: string, key?: NodeKey) {
    super(key);
    this.__snapshot = snapshot;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.className = 'rich-excalidraw-wrapper';
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  static importJSON(
    _serializedNode: SerializedLexicalNode & Record<string, unknown>,
  ): WhiteboardNode {
    const serializedNode = _serializedNode as unknown as SerializedWhiteboardNode;
    return $createWhiteboardNode(serializedNode.snapshot).updateFromJSON(_serializedNode);
  }

  exportJSON(): SerializedWhiteboardNode {
    return {
      ...super.exportJSON(),
      type: 'excalidraw',
      snapshot: this.__snapshot,
      version: 1,
    };
  }

  getSnapshot(): string {
    return this.__snapshot;
  }

  setSnapshot(snapshot: string): void {
    const writable = this.getWritable();
    writable.__snapshot = snapshot;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createRendererDecoration(WHITEBOARD_NODE_KEY, WhiteboardSSRRenderer, {
      snapshot: this.__snapshot,
    });
  }
}

export function $createWhiteboardNode(snapshot: string): WhiteboardNode {
  return new WhiteboardNode(snapshot);
}

export function $isWhiteboardNode(node: LexicalNode | null | undefined): node is WhiteboardNode {
  return node instanceof WhiteboardNode;
}
