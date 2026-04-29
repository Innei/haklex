import type { ChatParticipant, ChatVariant } from './types';

export function switchVariant(
  next: ChatVariant,
  participants: ChatParticipant[],
): ChatParticipant[] {
  return participants.map((p, idx) => {
    if (idx !== 1) return p;
    if (next === 'user-user') return { ...p, kind: 'user' };
    return { ...p, kind: 'agent' };
  });
}
