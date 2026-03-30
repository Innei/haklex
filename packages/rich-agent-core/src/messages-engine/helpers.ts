import type {
  ChatMessage,
  MessageDraft,
  MessageEngineContext,
  PreparedMessages,
} from '../protocol';

export type SystemMessage = Extract<ChatMessage, { role: 'system' }>;
export type UserMessage = Extract<ChatMessage, { role: 'user' }>;

type MessageListValue<TMessage> = TMessage | TMessage[] | undefined | null;

export function appendText(base: string, next: string): string {
  if (!next) return base;
  if (!base) return next;
  return `${base}\n\n${next}`;
}

export function normalizeMessageList<TMessage>(value: MessageListValue<TMessage>): TMessage[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function getLastItem<TValue>(items: readonly TValue[]): TValue | undefined {
  // eslint-disable-next-line unicorn/prefer-at
  return items.length > 0 ? items[items.length - 1] : undefined;
}

export function appendToUserMessage(message: UserMessage, content: string): UserMessage {
  return {
    ...message,
    content: appendText(message.content, content),
  };
}

export function createInitialDraft(context: MessageEngineContext): MessageDraft {
  return {
    systemMessages: [],
    messages: [...context.messages],
  };
}

export function draftToPreparedMessages(draft: MessageDraft): PreparedMessages {
  return {
    systemMessages: draft.systemMessages,
    preambleMessages: draft.messages,
    turns: [],
  };
}
