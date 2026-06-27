import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { $getSelection, $isRangeSelection, DecoratorNode } from 'lexical';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { MentionRenderer } from '../components/renderers/MentionRenderer';
import { createRendererDecoration } from '../components/RendererWrapper';
import { MENTION_NODE_KEY } from '../types/renderer-keys';
import type { SlashMenuItemConfig } from '../types/slash-menu';

export type SerializedMentionNode = Spread<
  {
    platform: string;
    handle: string;
    displayName?: string;
  },
  SerializedLexicalNode
>;

export class MentionNode extends DecoratorNode<ReactElement> {
  __platform: string;
  __handle: string;
  __displayName?: string;

  static slashMenuItems: SlashMenuItemConfig[] = [
    {
      title: 'Mention',
      icon: createElement('span', { style: { fontSize: 16, fontWeight: 700 } }, '@'),
      description: 'Mention a social account',
      keywords: ['mention', 'at', '@', 'github', 'twitter'],
      section: 'INLINE',
      onSelect: (editor: LexicalEditor) => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertText('@');
          }
        });
      },
    },
  ];

  static getType(): string {
    return 'mention';
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__platform, node.__handle, node.__displayName, node.__key);
  }

  constructor(platform: string, handle: string, displayName?: string, key?: NodeKey) {
    super(key);
    this.__platform = platform;
    this.__handle = handle;
    this.__displayName = displayName;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const el = document.createElement('span');
    el.style.display = 'inline-flex';
    el.style.alignItems = 'center';
    el.style.height = '1lh';
    return el;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return true;
  }

  getPlatform(): string {
    return this.getLatest().__platform;
  }

  getHandle(): string {
    return this.getLatest().__handle;
  }

  getDisplayName(): string | undefined {
    return this.getLatest().__displayName;
  }

  static importJSON(_serializedNode: SerializedLexicalNode & Record<string, unknown>): MentionNode {
    const serializedNode = _serializedNode as unknown as SerializedMentionNode;
    return $createMentionNode(
      serializedNode.platform,
      serializedNode.handle,
      serializedNode.displayName,
    );
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      type: 'mention',
      platform: this.__platform,
      handle: this.__handle,
      ...(this.__displayName ? { displayName: this.__displayName } : {}),
      version: 1,
    };
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createRendererDecoration(MENTION_NODE_KEY, MentionRenderer, {
      platform: this.__platform,
      handle: this.__handle,
      displayName: this.__displayName,
    });
  }
}

export function $createMentionNode(
  platform: string,
  handle: string,
  displayName?: string,
): MentionNode {
  return new MentionNode(platform, handle, displayName);
}

export function $isMentionNode(node: LexicalNode | null | undefined): node is MentionNode {
  return node instanceof MentionNode;
}
