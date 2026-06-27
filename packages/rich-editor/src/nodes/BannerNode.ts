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

import { BannerStaticDecorator } from '../components/renderers/BannerStaticDecorator';
import { extractTextContent } from '../utils/extractTextContent';

export type BannerType = 'note' | 'tip' | 'important' | 'warning' | 'caution';

const LEGACY_TYPE_MAP: Record<string, BannerType> = {
  info: 'note',
  success: 'tip',
  error: 'caution',
};

export function normalizeBannerType(type: string): BannerType {
  if (type in LEGACY_TYPE_MAP) return LEGACY_TYPE_MAP[type];
  return (type as BannerType) || 'note';
}

export const BANNER_TYPES: BannerType[] = ['note', 'tip', 'important', 'warning', 'caution'];

export const BANNER_LABELS: Record<BannerType, string> = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
};

export type SerializedBannerNode = Spread<
  {
    bannerType: BannerType;
    content: SerializedEditorState;
  },
  SerializedLexicalNode
>;

interface LegacySerializedBannerNode extends SerializedBannerNode {
  children?: SerializedLexicalNode[];
}

export class BannerNode extends DecoratorNode<ReactElement> {
  __bannerType: BannerType;
  __contentState: SerializedEditorState;

  static getType(): string {
    return 'banner';
  }

  static clone(node: BannerNode): BannerNode {
    return new BannerNode(node.__bannerType, node.__contentState, node.__key);
  }

  constructor(bannerType: BannerType, contentState?: SerializedEditorState, key?: NodeKey) {
    super(key);
    this.__bannerType = bannerType;
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
    div.className = `rich-banner rich-banner-${this.__bannerType}`;
    return div;
  }

  updateDOM(prevNode: BannerNode, dom: HTMLElement): boolean {
    if (prevNode.__bannerType !== this.__bannerType) {
      dom.className = `rich-banner rich-banner-${this.__bannerType}`;
    }
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getBannerType(): BannerType {
    return this.__bannerType;
  }

  setBannerType(bannerType: BannerType): void {
    const writable = this.getWritable();
    writable.__bannerType = bannerType;
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

  static importJSON(_serializedNode: SerializedLexicalNode & Record<string, unknown>): BannerNode {
    const serializedNode = _serializedNode as unknown as SerializedBannerNode;
    const legacy = serializedNode as LegacySerializedBannerNode;
    const bannerType = normalizeBannerType(serializedNode.bannerType);

    if (serializedNode.content) {
      return new BannerNode(bannerType, serializedNode.content);
    }

    if (legacy.children) {
      const content = {
        root: {
          children: legacy.children,
          direction: null,
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      } as unknown as SerializedEditorState;
      return new BannerNode(bannerType, content);
    }

    return new BannerNode(bannerType);
  }

  exportJSON(): SerializedBannerNode {
    return {
      ...super.exportJSON(),
      type: 'banner',
      bannerType: this.__bannerType,
      content: this.__contentState,
      version: 1,
    };
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(BannerStaticDecorator, {
      bannerType: this.__bannerType,
      contentState: this.__contentState,
    });
  }
}

export function $createBannerNode(
  bannerType: BannerType,
  contentState?: SerializedEditorState,
): BannerNode {
  return new BannerNode(bannerType, contentState);
}

export function $isBannerNode(node: LexicalNode | null | undefined): node is BannerNode {
  return node instanceof BannerNode;
}
