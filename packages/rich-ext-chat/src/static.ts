import type { Klass, LexicalNode } from 'lexical';

import { ChatNode } from './nodes/ChatNode';

export { ChatRenderer } from './ChatRenderer';
export type { SerializedChatNode } from './nodes/ChatNode';
export { $createChatNode, $isChatNode, ChatNode } from './nodes/ChatNode';
export type {
  ChatMessage,
  ChatParticipant,
  ChatParticipantKind,
  ChatRendererProps,
  ChatVariant,
} from './types';

export const chatNodes: Array<Klass<LexicalNode>> = [ChatNode];
