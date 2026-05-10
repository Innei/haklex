import './styles.css';

import { ChatRenderer } from './ChatRenderer';

export * from './augment';
export type {
  ChatMessage,
  ChatParticipant,
  ChatParticipantKind,
  ChatRendererProps,
  ChatVariant,
} from './types';
export { ChatRenderer };
export default ChatRenderer;
