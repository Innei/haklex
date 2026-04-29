export type ChatVariant = 'user-agent' | 'user-user';
export type ChatParticipantKind = 'user' | 'agent';

export interface ChatParticipant {
  avatar?: string;
  id: string;
  kind: ChatParticipantKind;
  name?: string;
}

export interface ChatMessage {
  content: string;
  id: string;
  participantId: string;
}

export interface ChatRendererProps {
  messages: ChatMessage[];
  participants: ChatParticipant[];
  variant: ChatVariant;
}
