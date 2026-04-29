import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { ChatRenderer } from '../src/ChatRenderer';
import type { ChatMessage, ChatParticipant } from '../src/types';

vi.mock('streamdown', () => ({
  Streamdown: ({ children }: { children: string }) => <span>{children}</span>,
}));

vi.mock('../src/styles.css', () => {
  const semanticClassNames = {
    container: 'rich-chat-container',
    row: 'rich-chat-row',
    bubble: 'rich-chat-bubble',
    article: 'rich-chat-article',
    avatar: 'rich-chat-avatar',
    author: 'rich-chat-author',
    empty: 'rich-chat-empty',
  };
  return {
    semanticClassNames,
    container: '',
    row: '',
    rowRight: '',
    avatar: '',
    avatarSmall: '',
    avatarDark: '',
    avatarImg: '',
    bubble: '',
    bubbleRightTail: '',
    bubbleLeftTail: '',
    agent: '',
    agentHeader: '',
    agentHeaderName: '',
    article: '',
    authorCluster: '',
    authorClusterRight: '',
    authorLabel: '',
    empty: '',
  };
});

describe('ChatRenderer', () => {
  const userAgentParticipants: ChatParticipant[] = [
    { id: 'p_u', kind: 'user', name: 'Innei' },
    { id: 'p_a', kind: 'agent', name: 'Claude' },
  ];

  it('renders empty placeholder when messages is empty', () => {
    const html = renderToStaticMarkup(
      <ChatRenderer messages={[]} participants={userAgentParticipants} variant="user-agent" />,
    );
    expect(html).toContain('rich-chat-empty');
    expect(html).toContain('Empty chat');
  });

  it('renders user bubble + agent article in user-agent variant', () => {
    const messages: ChatMessage[] = [
      { id: 'm1', participantId: 'p_u', content: 'Hello' },
      { id: 'm2', participantId: 'p_a', content: 'Hi there' },
    ];
    const html = renderToStaticMarkup(
      <ChatRenderer
        messages={messages}
        participants={userAgentParticipants}
        variant="user-agent"
      />,
    );
    expect(html).toContain('rich-chat-bubble');
    expect(html).toContain('rich-chat-article');
  });

  it('renders both sides as bubbles in user-user variant', () => {
    const participants: ChatParticipant[] = [
      { id: 'p_a', kind: 'user', name: 'Alice' },
      { id: 'p_b', kind: 'user', name: 'Bob' },
    ];
    const messages: ChatMessage[] = [
      { id: 'm1', participantId: 'p_a', content: 'Hi' },
      { id: 'm2', participantId: 'p_b', content: 'Hello' },
    ];
    const html = renderToStaticMarkup(
      <ChatRenderer messages={messages} participants={participants} variant="user-user" />,
    );
    expect(html).not.toContain('rich-chat-article');
    expect(html).toContain('Alice');
    expect(html).toContain('Bob');
  });

  it('falls back to "Unknown" for dangling participantId references', () => {
    const messages: ChatMessage[] = [{ id: 'm1', participantId: 'p_missing', content: 'Orphan' }];
    const html = renderToStaticMarkup(
      <ChatRenderer
        messages={messages}
        variant="user-user"
        participants={[
          { id: 'p_a', kind: 'user', name: 'Alice' },
          { id: 'p_b', kind: 'user', name: 'Bob' },
        ]}
      />,
    );
    expect(html).toContain('Unknown');
    expect(html).toContain('Orphan');
  });

  it('falls back to kind-based names when participant.name is missing', () => {
    const html = renderToStaticMarkup(
      <ChatRenderer
        variant="user-agent"
        messages={[
          { id: 'm1', participantId: 'p_u', content: 'q' },
          { id: 'm2', participantId: 'p_a', content: 'a' },
        ]}
        participants={[
          { id: 'p_u', kind: 'user' },
          { id: 'p_a', kind: 'agent' },
        ]}
      />,
    );
    expect(html).toContain('Assistant');
  });

  it('renders avatar img when avatar URL is provided, initial otherwise', () => {
    const html = renderToStaticMarkup(
      <ChatRenderer
        variant="user-user"
        messages={[
          { id: 'm1', participantId: 'p_a', content: 'hi' },
          { id: 'm2', participantId: 'p_b', content: 'hi' },
        ]}
        participants={[
          { id: 'p_a', kind: 'user', name: 'Alice', avatar: 'https://example.com/a.png' },
          { id: 'p_b', kind: 'user', name: 'Bob' },
        ]}
      />,
    );
    expect(html).toContain('https://example.com/a.png');
    expect(html).toMatch(/>B</);
  });
});
