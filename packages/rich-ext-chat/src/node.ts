import type { Klass, LexicalNode } from 'lexical';

import { ChatNode } from './nodes/ChatNode';

export * from './augment';
export { $createChatNode, $isChatNode, ChatNode } from './nodes/ChatNode';
export { CHAT_NODE_KEY } from './slot';
export type {
  ChatMessage,
  ChatParticipant,
  ChatParticipantKind,
  ChatRendererProps,
  ChatVariant,
  SerializedChatNode,
} from './types';

export const chatNodes: Array<Klass<LexicalNode>> = [ChatNode];
