import './styles.css';
import './augment';

import { ChatRenderer } from './ChatRenderer';

export type {
  ChatMessage,
  ChatParticipant,
  ChatParticipantKind,
  ChatRendererProps,
  ChatVariant,
} from './types';
export { ChatRenderer };
export default ChatRenderer;
