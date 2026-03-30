import { describe, expect, it } from 'vitest';

import {
  CONTEXT_INSTRUCTION,
  SYSTEM_CONTEXT_END,
  SYSTEM_CONTEXT_START,
} from '../src/messages-engine/base/constants';
import {
  appendSystemContextToUserMessage,
  createContextBlock,
  getUserMessage,
  getUserMessageLocations,
  hasSystemContextWrapper,
  insertIntoExistingWrapper,
  setUserMessage,
  wrapWithSystemContext,
} from '../src/messages-engine/base/messageContextUtils';
import {
  appendText,
  appendToUserMessage,
  createInitialDraft,
  draftToPreparedMessages,
  getLastItem,
  normalizeMessageList,
} from '../src/messages-engine/helpers';
import type { ChatMessage, MessageDraft, MessageEngineContext } from '../src/protocol';

function createUserMessage(
  content: string,
  metadata?: Extract<ChatMessage, { role: 'user' }>['metadata'],
): Extract<ChatMessage, { role: 'user' }> {
  return { role: 'user', content, metadata };
}

function createContext(
  messages: ChatMessage[] = [createUserMessage('Edit this block')],
): MessageEngineContext {
  return { messages };
}

function createDraft(
  messages: ChatMessage[] = [createUserMessage('Edit this block')],
): MessageDraft {
  return {
    systemMessages: [],
    messages,
  };
}

describe('messages-engine helpers', () => {
  it('appendText joins non-empty segments with blank lines', () => {
    expect(appendText('', 'next')).toBe('next');
    expect(appendText('base', '')).toBe('base');
    expect(appendText('base', 'next')).toBe('base\n\nnext');
  });

  it('normalizeMessageList normalizes singular, array, and nullable inputs', () => {
    const message = createUserMessage('Edit this block');

    expect(normalizeMessageList(message)).toEqual([message]);
    expect(normalizeMessageList([message])).toEqual([message]);
    expect(normalizeMessageList(null)).toEqual([]);
    expect(normalizeMessageList(undefined)).toEqual([]);
  });

  it('getLastItem returns the last value when present', () => {
    expect(getLastItem([1, 2, 3])).toBe(3);
    expect(getLastItem([])).toBeUndefined();
  });

  it('appendToUserMessage appends content without mutating the original message', () => {
    const message = createUserMessage('User task');

    const nextMessage = appendToUserMessage(message, 'Injected context');

    expect(nextMessage.content).toBe('User task\n\nInjected context');
    expect(message.content).toBe('User task');
  });

  it('createInitialDraft initializes system messages and clones the top-level message list', () => {
    const messages = [createUserMessage('Edit this block')];
    const context = createContext(messages);

    const draft = createInitialDraft(context);

    expect(draft).toEqual({
      systemMessages: [],
      messages,
    });
    expect(draft.messages).not.toBe(context.messages);
  });

  it('draftToPreparedMessages maps draft messages into preamble messages', () => {
    const draft: MessageDraft = {
      systemMessages: [{ role: 'system', content: 'System role' }],
      messages: [createUserMessage('Edit this block')],
    };

    expect(draftToPreparedMessages(draft)).toEqual({
      systemMessages: [{ role: 'system', content: 'System role' }],
      preambleMessages: [createUserMessage('Edit this block')],
      turns: [],
    });
  });
});

describe('message context utilities', () => {
  it('finds user messages only and supports get/set by location', () => {
    const draft = createDraft([
      { role: 'system', content: 'ignored in draft messages but valid shape' },
      createUserMessage('First'),
      { role: 'assistant', content: 'Intermediate response' },
      createUserMessage('Second'),
    ]);

    const locations = getUserMessageLocations(draft);

    expect(locations).toEqual([
      { scope: 'messages', index: 1 },
      { scope: 'messages', index: 3 },
    ]);
    expect(getUserMessage(draft, locations[1]).content).toBe('Second');

    setUserMessage(draft, locations[0], createUserMessage('Updated first'));
    expect(draft.messages[1]).toMatchObject({ role: 'user', content: 'Updated first' });
  });

  it('creates and wraps system context blocks with the expected markers', () => {
    expect(createContextBlock('<doc />', 'current_page')).toBe(
      '<current_page>\n<doc />\n</current_page>',
    );

    const wrapped = wrapWithSystemContext('<doc />', 'current_page');
    expect(wrapped).toContain(SYSTEM_CONTEXT_START);
    expect(wrapped).toContain(CONTEXT_INSTRUCTION);
    expect(wrapped).toContain('<current_page>');
    expect(wrapped).toContain('</current_page>');
    expect(wrapped).toContain(SYSTEM_CONTEXT_END);
    expect(hasSystemContextWrapper(wrapped)).toBe(true);
    expect(hasSystemContextWrapper('plain text')).toBe(false);
  });

  it('inserts additional context before the wrapper end marker', () => {
    const existing = wrapWithSystemContext('<doc />', 'current_page');

    const next = insertIntoExistingWrapper(
      existing,
      createContextBlock('<selection />', 'user_selections'),
    );

    expect(next).toContain('<current_page>\n<doc />\n</current_page>');
    expect(next).toContain('<user_selections>\n<selection />\n</user_selections>');
    expect(next.indexOf('<user_selections>')).toBeLessThan(next.indexOf(SYSTEM_CONTEXT_END));
  });

  it('falls back to appendText when the end marker is absent', () => {
    expect(insertIntoExistingWrapper('base', '<context />')).toBe('base\n\n<context />');
  });

  it('appends wrapped system context to plain user messages', () => {
    const message = createUserMessage('User task');

    const nextMessage = appendSystemContextToUserMessage(message, '<doc />', 'current_page');

    expect(nextMessage.content).toContain('User task');
    expect(nextMessage.content).toContain(SYSTEM_CONTEXT_START);
    expect(nextMessage.content).toContain('<current_page>\n<doc />\n</current_page>');
  });

  it('merges subsequent injected context into an existing wrapper', () => {
    const initialMessage = appendSystemContextToUserMessage(
      createUserMessage('User task'),
      '<doc />',
      'current_page',
    );

    const nextMessage = appendSystemContextToUserMessage(
      initialMessage,
      '<selection />',
      'user_selections',
    );

    expect(nextMessage.content.split(SYSTEM_CONTEXT_START)).toHaveLength(2);
    expect(nextMessage.content).toContain('<current_page>\n<doc />\n</current_page>');
    expect(nextMessage.content).toContain('<user_selections>\n<selection />\n</user_selections>');
  });
});
