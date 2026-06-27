import { extractTextContent } from '@haklex/rich-editor/static';
import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedEditorState,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { DecoratorNode } from 'lexical';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { NestedDocStaticDecorator } from './NestedDocStaticDecorator';

export type SerializedNestedDocNode = Spread<
  {
    content: SerializedEditorState;
  },
  SerializedLexicalNode
>;

export class NestedDocNode extends DecoratorNode<ReactElement> {
  __contentState: SerializedEditorState;

  static getType(): string {
    return 'nested-doc';
  }

  static clone(node: NestedDocNode): NestedDocNode {
    return new NestedDocNode(node.__contentState, node.__key);
  }

  constructor(contentState?: SerializedEditorState, key?: NodeKey) {
    super(key);
    this.__contentState =
      contentState ||
      ({
        root: {
          children: [
            {
              type: 'paragraph',
              children: [],
              direction: null,
              format: '',
              indent: 0,
              textFormat: 0,
              textStyle: '',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      } as unknown as SerializedEditorState);
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.className = 'rich-nested-doc';
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getContentState(): SerializedEditorState {
    return this.getLatest().__contentState;
  }

  setContentState(state: SerializedEditorState): void {
    const writable = this.getWritable();
    writable.__contentState = state;
  }

  getTextContent(): string {
    return extractTextContent(this.__contentState);
  }

  static importJSON(
    _serializedNode: SerializedLexicalNode & Record<string, unknown>,
  ): NestedDocNode {
    const serializedNode = _serializedNode as unknown as SerializedNestedDocNode;
    return new NestedDocNode(serializedNode.content);
  }

  exportJSON(): SerializedNestedDocNode {
    return {
      ...super.exportJSON(),
      type: 'nested-doc',
      content: this.__contentState,
      version: 1,
    };
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(NestedDocStaticDecorator, {
      contentState: this.__contentState,
    });
  }
}

export function $createNestedDocNode(contentState?: SerializedEditorState): NestedDocNode {
  return new NestedDocNode(contentState);
}

export function $isNestedDocNode(node: LexicalNode | null | undefined): node is NestedDocNode {
  return node instanceof NestedDocNode;
}
