import type {
  ChatMessage,
  ChatParticipant,
  ChatParticipantKind,
  ChatRendererProps,
  ChatVariant,
} from '@haklex/rich-editor/renderers';
import type { SerializedLexicalNode } from 'lexical';

export type { ChatMessage, ChatParticipant, ChatParticipantKind, ChatRendererProps, ChatVariant };

export interface SerializedChatNode extends SerializedLexicalNode {
  messages: ChatMessage[];
  participants: ChatParticipant[];
  type: 'chat';
  variant: ChatVariant;
  version: 1;
}
