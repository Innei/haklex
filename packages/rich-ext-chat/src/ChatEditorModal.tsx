import type { FC } from 'react';

import type { ChatMessage, ChatParticipant, ChatVariant } from './types';

export interface ChatEditorModalProps {
  dismiss: () => void;
  initial: { variant: ChatVariant; participants: ChatParticipant[]; messages: ChatMessage[] };
  onCancel?: () => void;
  onCommit?: (next: {
    variant: ChatVariant;
    participants: ChatParticipant[];
    messages: ChatMessage[];
  }) => void;
}

export const ChatEditorModal: FC<ChatEditorModalProps> = ({ dismiss }) => {
  return <div onClick={dismiss}>chat editor (stub)</div>;
};
