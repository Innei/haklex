import type { ChatBubble, ChatMessage } from '@haklex/rich-agent-core';
import { describe, expect, it } from 'vitest';

import { chatBubblesToHistoryMessages } from '../src/hooks/historyMessages';
import { AgentMessagesEngine } from '../src/messageEngine';

const emptyEditorState = {
  root: {
    type: 'root',
    children: [],
    direction: null,
    format: '',
    indent: 0,
    version: 1,
  },
} as any;

describe('chatBubblesToHistoryMessages', () => {
  it('keeps stable user and assistant bubbles as history', () => {
    const bubbles: ChatBubble[] = [
      { type: 'user', content: 'Previous request' },
      { type: 'assistant', content: 'Previous response' },
      { type: 'assistant', content: 'Streaming response', streaming: true },
      { type: 'error', message: 'Failed' },
    ];

    expect(chatBubblesToHistoryMessages(bubbles)).toEqual([
      { role: 'user', content: 'Previous request' },
      { role: 'assistant', content: 'Previous response' },
    ]);
  });

  it('carries the bubble selection into the history message metadata', () => {
    const bubbles: ChatBubble[] = [
      {
        type: 'user',
        content: 'Rewrite this',
        selection: {
          type: 'text',
          text: 'Selected sentence',
          anchorBlockId: 'a',
          anchorOffset: 0,
          focusBlockId: 'a',
          focusOffset: 17,
        },
      },
      { type: 'assistant', content: 'Done' },
    ];

    expect(chatBubblesToHistoryMessages(bubbles)).toEqual([
      {
        role: 'user',
        content: 'Rewrite this',
        metadata: {
          capturedSelection: {
            type: 'text',
            text: 'Selected sentence',
            anchorBlockId: 'a',
            anchorOffset: 0,
            focusBlockId: 'a',
            focusOffset: 17,
          },
        },
      },
      { role: 'assistant', content: 'Done' },
    ]);
  });

  it('removes the duplicated current user input when the host already added it to the store', () => {
    const bubbles: ChatBubble[] = [
      { type: 'user', content: 'Previous request' },
      { type: 'assistant', content: 'Previous response' },
      { type: 'user', content: 'Current request' },
    ];

    expect(chatBubblesToHistoryMessages(bubbles, 'Current request')).toEqual([
      { role: 'user', content: 'Previous request' },
      { role: 'assistant', content: 'Previous response' },
    ]);
  });
});

describe('AgentMessagesEngine history', () => {
  it('preserves prior turns before injecting context into the current user turn', () => {
    const history: ChatMessage[] = [
      { role: 'user', content: 'Earlier request' },
      { role: 'assistant', content: 'Earlier response' },
    ];

    const prepared = new AgentMessagesEngine({
      systemMessages: [{ role: 'system', content: 'System prompt' }],
    }).processWithEditor({
      editorState: emptyEditorState,
      messages: history,
      userInput: 'Current request',
    });

    expect(prepared.preambleMessages).toHaveLength(3);
    expect(prepared.preambleMessages[0]).toEqual(history[0]);
    expect(prepared.preambleMessages[1]).toEqual(history[1]);
    expect(prepared.preambleMessages[2]).toMatchObject({
      role: 'user',
      content: expect.stringContaining('Current request'),
    });
    expect(prepared.preambleMessages[2]).toMatchObject({
      content: expect.stringContaining('<current_page title="Current Document">'),
    });
  });

  it('injects captured selections into prior user turns but not the current one', () => {
    const history: ChatMessage[] = [
      {
        role: 'user',
        content: 'Earlier request',
        metadata: {
          capturedSelection: { type: 'block', blockIds: ['b1', 'b2'] },
        },
      },
      { role: 'assistant', content: 'Earlier response' },
    ];

    const prepared = new AgentMessagesEngine({
      systemMessages: [{ role: 'system', content: 'System prompt' }],
    }).processWithEditor({
      editorState: emptyEditorState,
      messages: history,
      userInput: 'Current request',
    });

    expect(prepared.preambleMessages[0]).toMatchObject({
      role: 'user',
      content: expect.stringContaining('<block_selection blockIds="b1,b2" />'),
    });
    expect(prepared.preambleMessages[2]).toMatchObject({
      role: 'user',
      content: expect.not.stringContaining('block_selection'),
    });
  });
});
