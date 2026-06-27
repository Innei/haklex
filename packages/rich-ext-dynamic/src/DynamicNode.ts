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

import { DynamicSSRRenderer } from './DynamicSSRRenderer';
import { DYNAMIC_NODE_KEY } from './slot';

export interface DynamicNodePayload {
  initialHeight: number;
  props: Record<string, unknown>;
  url: string;
}

export type SerializedDynamicNode = Spread<DynamicNodePayload, SerializedLexicalNode>;

export const DEFAULT_DYNAMIC_HEIGHT = 320;

export class DynamicNode extends DecoratorNode<ReactElement> {
  __url: string;
  __props: Record<string, unknown>;
  __initialHeight: number;

  static getType(): string {
    return 'dynamic';
  }

  static clone(node: DynamicNode): DynamicNode {
    return new DynamicNode(node.__url, node.__props, node.__initialHeight, node.__key);
  }

  constructor(
    url: string,
    props: Record<string, unknown> = {},
    initialHeight: number = DEFAULT_DYNAMIC_HEIGHT,
    key?: NodeKey,
  ) {
    super(key);
    this.__url = url;
    this.__props = props;
    this.__initialHeight = initialHeight;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.className = 'rich-dynamic-wrapper';
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  static importJSON(_serializedNode: SerializedLexicalNode & Record<string, unknown>): DynamicNode {
    const serializedNode = _serializedNode as unknown as SerializedDynamicNode;
    return $createDynamicNode(serializedNode);
  }

  exportJSON(): SerializedDynamicNode {
    return {
      ...super.exportJSON(),
      type: 'dynamic',
      url: this.__url,
      props: this.__props,
      initialHeight: this.__initialHeight,
      version: 1,
    };
  }

  getUrl(): string {
    return this.getLatest().__url;
  }

  setUrl(url: string): void {
    const writable = this.getWritable();
    writable.__url = url;
  }

  getProps(): Record<string, unknown> {
    return this.getLatest().__props;
  }

  setProps(props: Record<string, unknown>): void {
    const writable = this.getWritable();
    writable.__props = props;
  }

  getInitialHeight(): number {
    return this.getLatest().__initialHeight;
  }

  setInitialHeight(initialHeight: number): void {
    const writable = this.getWritable();
    writable.__initialHeight = initialHeight;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createRendererDecoration(DYNAMIC_NODE_KEY, DynamicSSRRenderer, {
      url: this.__url,
      componentProps: this.__props,
      initialHeight: this.__initialHeight,
    });
  }
}

export function $createDynamicNode(payload: Partial<DynamicNodePayload> = {}): DynamicNode {
  return new DynamicNode(
    payload.url ?? '',
    payload.props ?? {},
    payload.initialHeight ?? DEFAULT_DYNAMIC_HEIGHT,
  );
}

export function $isDynamicNode(node: LexicalNode | null | undefined): node is DynamicNode {
  return node instanceof DynamicNode;
}
