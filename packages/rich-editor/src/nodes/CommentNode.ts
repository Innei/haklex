import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  SerializedTextNode,
} from 'lexical';
import { $insertNodes, TextNode } from 'lexical';
import { MessageSquareQuote } from 'lucide-react';
import { createElement } from 'react';

import { semanticClassNames, sharedStyles } from '../styles/shared.css';
import type { CommandItemConfig } from '../types/slash-menu';

export type SerializedCommentNode = Omit<SerializedTextNode, 'type'> & {
  type: 'comment';
};

const DEFAULT_COMMENT_TEXT = 'comment';

export class CommentNode extends TextNode {
  static commandItems: CommandItemConfig[] = [
    {
      title: 'HTML Comment',
      icon: createElement(MessageSquareQuote, { size: 20 }),
      description: 'Insert an HTML comment node',
      keywords: ['comment', 'html', 'annotation', 'hidden', '<!-- -->'],
      section: 'INLINE',
      placement: ['slash', 'toolbar'],
      group: 'insert',
      onSelect: (editor: LexicalEditor, _queryString: string) => {
        editor.update(() => {
          const node = $createCommentNode(DEFAULT_COMMENT_TEXT);
          $insertNodes([node]);
          node.select(0, node.getTextContentSize());
        });
      },
    },
  ];

  static getType(): string {
    return 'comment';
  }

  static clone(node: CommentNode): CommentNode {
    return new CommentNode(node.__text, node.__key);
  }

  static importDOM(): DOMConversionMap | null {
    return {
      '#comment': () => ({
        conversion: (domNode: Node): DOMConversionOutput | null => {
          if (!(domNode instanceof Comment)) return null;

          return {
            node: $createCommentNode(domNode.data),
          };
        },
        priority: 4,
      }),
      'span': () => ({
        conversion: (domNode: Node): DOMConversionOutput | null => {
          if (!(domNode instanceof HTMLElement)) return null;
          if (!domNode.classList.contains(semanticClassNames.comment)) return null;

          return {
            node: $createCommentNode(domNode.dataset.comment ?? domNode.textContent ?? ''),
          };
        },
        priority: 2,
      }),
    };
  }

  constructor(text: string, key?: NodeKey) {
    super(text, key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    element.classList.add(semanticClassNames.comment, sharedStyles.comment);
    element.dataset.comment = this.__text;
    return element;
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    const updated = super.updateDOM(prevNode, dom, config);

    dom.classList.add(semanticClassNames.comment, sharedStyles.comment);

    if (prevNode.__text !== this.__text) {
      dom.dataset.comment = this.__text;
    }

    return updated;
  }

  exportDOM(_editor: LexicalEditor): DOMExportOutput {
    return {
      element: document.createComment(this.getTextContent()) as any,
    };
  }

  static importJSON(_serializedNode: SerializedLexicalNode & Record<string, unknown>): CommentNode {
    const serializedNode = _serializedNode as unknown as SerializedCommentNode;
    const node = $createCommentNode(serializedNode.text ?? '');
    node.setFormat(serializedNode.format ?? 0);
    node.setDetail(serializedNode.detail ?? 0);
    node.setMode(serializedNode.mode ?? 'normal');
    node.setStyle(serializedNode.style ?? '');
    return node;
  }

  exportJSON(): SerializedCommentNode {
    return {
      ...super.exportJSON(),
      type: 'comment',
      version: 1,
    };
  }
}

export function $createCommentNode(text: string): CommentNode {
  return new CommentNode(text);
}

export function $createCommentPlaceholderNode(): CommentNode {
  return $createCommentNode(DEFAULT_COMMENT_TEXT);
}

export function $isCommentNode(node: LexicalNode | null | undefined): node is CommentNode {
  return node instanceof CommentNode;
}
