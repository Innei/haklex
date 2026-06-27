import '../augment';

import { createRendererDecoration } from '@haklex/rich-editor/renderers';
import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from 'lexical';
import { DecoratorNode } from 'lexical';
import type { ReactElement } from 'react';

import { CHAT_NODE_KEY } from '../slot';
import type { ChatMessage, ChatParticipant, ChatVariant, SerializedChatNode } from '../types';
import { createDefaultParticipants } from '../utils';

export type { SerializedChatNode } from '../types';

export interface ChatNodePayload {
  messages?: ChatMessage[];
  participants?: ChatParticipant[];
  variant: ChatVariant;
}

export class ChatNode extends DecoratorNode<ReactElement> {
  __variant: ChatVariant;
  __participants: ChatParticipant[];
  __messages: ChatMessage[];

  static getType(): string {
    return 'chat';
  }

  static clone(node: ChatNode): ChatNode {
    return new ChatNode(
      {
        variant: node.__variant,
        participants: node.__participants,
        messages: node.__messages,
      },
      node.__key,
    );
  }

  constructor(payload: ChatNodePayload, key?: NodeKey) {
    super(key);
    this.__variant = payload.variant;
    this.__participants =
      payload.participants && payload.participants.length > 0
        ? payload.participants
        : createDefaultParticipants(payload.variant);
    this.__messages = payload.messages ?? [];
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.className = 'rich-chat-wrapper';
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getVariant(): ChatVariant {
    return this.getLatest().__variant;
  }

  setVariant(variant: ChatVariant): void {
    const writable = this.getWritable();
    writable.__variant = variant;
  }

  getParticipants(): ChatParticipant[] {
    return this.getLatest().__participants;
  }

  setParticipants(participants: ChatParticipant[]): void {
    const writable = this.getWritable();
    writable.__participants = participants;
  }

  getMessages(): ChatMessage[] {
    return this.getLatest().__messages;
  }

  setMessages(messages: ChatMessage[]): void {
    const writable = this.getWritable();
    writable.__messages = messages;
  }

  static importJSON(_serializedNode: SerializedLexicalNode & Record<string, unknown>): ChatNode {
    const serializedNode = _serializedNode as unknown as SerializedChatNode;
    return new ChatNode({
      variant: serializedNode.variant,
      participants: serializedNode.participants,
      messages: serializedNode.messages,
    });
  }

  exportJSON(): SerializedChatNode {
    return {
      ...super.exportJSON(),
      type: 'chat',
      variant: this.__variant,
      participants: this.__participants,
      messages: this.__messages,
      version: 1,
    };
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createRendererDecoration(CHAT_NODE_KEY, undefined, {
      variant: this.__variant,
      participants: this.__participants,
      messages: this.__messages,
    });
  }
}

export function $createChatNode(payload: ChatNodePayload): ChatNode {
  return new ChatNode(payload);
}

export function $isChatNode(node: LexicalNode | null | undefined): node is ChatNode {
  return node instanceof ChatNode;
}
