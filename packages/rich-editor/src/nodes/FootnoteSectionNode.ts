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

import { FootnoteSectionRenderer } from '../components/renderers/FootnoteSectionRenderer';
import { createRendererDecoration } from '../components/RendererWrapper';
import { semanticClassNames, sharedStyles } from '../styles/shared.css';
import { FOOTNOTE_SECTION_NODE_KEY } from '../types/renderer-keys';

export type SerializedFootnoteSectionNode = Spread<
  {
    definitions: Record<string, string>;
  },
  SerializedLexicalNode
>;

export class FootnoteSectionNode extends DecoratorNode<ReactElement> {
  __definitions: Record<string, string>;

  static getType(): string {
    return 'footnote-section';
  }

  static clone(node: FootnoteSectionNode): FootnoteSectionNode {
    return new FootnoteSectionNode({ ...node.__definitions }, node.__key);
  }

  constructor(definitions: Record<string, string>, key?: NodeKey) {
    super(key);
    this.__definitions = definitions;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.className = `${semanticClassNames.footnoteSection} ${sharedStyles.footnoteSection}`;
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
  ): FootnoteSectionNode {
    const serializedNode = _serializedNode as unknown as SerializedFootnoteSectionNode;
    return $createFootnoteSectionNode(serializedNode.definitions);
  }

  exportJSON(): SerializedFootnoteSectionNode {
    return {
      ...super.exportJSON(),
      type: 'footnote-section',
      definitions: this.__definitions,
      version: 1,
    };
  }

  getDefinitions(): Record<string, string> {
    return this.getLatest().__definitions;
  }

  setDefinitions(definitions: Record<string, string>): void {
    const writable = this.getWritable();
    writable.__definitions = definitions;
  }

  getDefinition(identifier: string): string | undefined {
    return this.getLatest().__definitions[identifier];
  }

  setDefinition(identifier: string, content: string): void {
    const writable = this.getWritable();
    writable.__definitions = {
      ...writable.__definitions,
      [identifier]: content,
    };
  }

  removeDefinition(identifier: string): void {
    const writable = this.getWritable();
    const { [identifier]: _, ...rest } = writable.__definitions;
    writable.__definitions = rest;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createRendererDecoration(FOOTNOTE_SECTION_NODE_KEY, FootnoteSectionRenderer, {
      definitions: this.__definitions,
      nodeKey: this.__key,
    });
  }
}

export function $createFootnoteSectionNode(
  definitions: Record<string, string> = {},
): FootnoteSectionNode {
  return new FootnoteSectionNode(definitions);
}

export function $isFootnoteSectionNode(
  node: LexicalNode | null | undefined,
): node is FootnoteSectionNode {
  return node instanceof FootnoteSectionNode;
}
