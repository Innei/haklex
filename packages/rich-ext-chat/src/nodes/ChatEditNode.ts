import type { CommandItemConfig } from '@haklex/rich-editor/commands';
import type { EditorConfig, LexicalEditor, LexicalNode, SerializedLexicalNode } from 'lexical';
import { $insertNodes } from 'lexical';
import { MessageSquare } from 'lucide-react';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { ChatEditDecorator } from '../ChatEditDecorator';
import type { ChatMessage, ChatParticipant, ChatVariant, SerializedChatNode } from '../types';
import { ChatNode } from './ChatNode';

export interface ChatEditNodePayload {
  messages?: ChatMessage[];
  participants?: ChatParticipant[];
  variant: ChatVariant;
}

export class ChatEditNode extends ChatNode {
  static commandItems: CommandItemConfig[] = [
    {
      title: 'Chat',
      icon: createElement(MessageSquare, { size: 20 }),
      description: 'Embed a conversation snapshot',
      keywords: ['chat', 'conversation', 'dialog', 'agent'],
      nested: false,
      section: 'MEDIA',
      placement: ['slash', 'toolbar'],
      group: 'insert',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createChatEditNode({ variant: 'user-agent' })]);
        });
      },
    },
  ];

  static clone(node: ChatEditNode): ChatEditNode {
    return new ChatEditNode(
      {
        variant: node.__variant,
        participants: node.__participants,
        messages: node.__messages,
      },
      node.__key,
    );
  }

  static importJSON(
    _serializedNode: SerializedLexicalNode & Record<string, unknown>,
  ): ChatEditNode {
    const serializedNode = _serializedNode as unknown as SerializedChatNode;
    return new ChatEditNode({
      variant: serializedNode.variant,
      participants: serializedNode.participants,
      messages: serializedNode.messages,
    });
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(ChatEditDecorator, {
      nodeKey: this.__key,
      variant: this.__variant,
      participants: this.__participants,
      messages: this.__messages,
    });
  }
}

export function $createChatEditNode(payload: ChatEditNodePayload): ChatEditNode {
  return new ChatEditNode(payload);
}

export function $isChatEditNode(node: LexicalNode | null | undefined): node is ChatEditNode {
  return node instanceof ChatEditNode;
}
