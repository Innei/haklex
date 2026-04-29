import { customAlphabet } from 'nanoid';

import type { ChatParticipant, ChatVariant } from './types';

const idAlphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
const makeParticipantId = customAlphabet(idAlphabet, 6);
const makeMessageId = customAlphabet(idAlphabet, 8);

export function createParticipantId(): string {
  return `p_${makeParticipantId()}`;
}

export function createMessageId(): string {
  return `m_${makeMessageId()}`;
}

export function createDefaultParticipants(variant: ChatVariant): ChatParticipant[] {
  if (variant === 'user-agent') {
    return [
      { id: createParticipantId(), kind: 'user' },
      { id: createParticipantId(), kind: 'agent' },
    ];
  }
  return [
    { id: createParticipantId(), kind: 'user' },
    { id: createParticipantId(), kind: 'user' },
  ];
}
