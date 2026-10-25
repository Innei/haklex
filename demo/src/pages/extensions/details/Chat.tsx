import { getVariantClass } from '@haklex/rich-editor';
import type { ChatMessage, ChatParticipant, ChatVariant } from '@haklex/rich-ext-chat';
import { ChatRenderer } from '@haklex/rich-ext-chat/static';

import { Panel } from '../../../components/Panel';
import { useTheme } from '../../../context/ThemeContext';

interface ChatSample {
  description: string;
  key: string;
  label: string;
  messages: ChatMessage[];
  participants: ChatParticipant[];
  variant: ChatVariant;
}

const chatSamples: ChatSample[] = [
  {
    key: 'user-agent',
    label: 'User · Agent',
    description: 'User as right-aligned bubble; agent as flowing article',
    variant: 'user-agent',
    participants: [
      { id: 'p_u', kind: 'user', name: 'Innei' },
      { id: 'p_a', kind: 'agent', name: 'Claude' },
    ],
    messages: [
      {
        id: 'm1',
        participantId: 'p_u',
        content: "How does Lexical's DecoratorNode differ from ElementNode?",
      },
      {
        id: 'm2',
        participantId: 'p_a',
        content:
          "The two serve different purposes:\n\n- **ElementNode** contains other nodes — paragraphs, headings, lists.\n- **DecoratorNode** renders a React component as a leaf — polls, embeds, charts.\n\nUse a decorator when the content isn't editable as text.",
      },
      {
        id: 'm3',
        participantId: 'p_u',
        content: 'Got it. So for the chat node we should subclass DecoratorNode.',
      },
    ],
  },
  {
    key: 'user-user',
    label: 'User · User',
    description: 'Two-person dialogue — both sides as bubbles',
    variant: 'user-user',
    participants: [
      { id: 'p_alice', kind: 'user', name: 'Alice' },
      { id: 'p_bob', kind: 'user', name: 'Bob' },
    ],
    messages: [
      {
        id: 'm1',
        participantId: 'p_alice',
        content: 'Are we still doing the static/edit split for the new chat node?',
      },
      {
        id: 'm2',
        participantId: 'p_bob',
        content: 'Yes — same pattern as code-snippet.',
      },
      {
        id: 'm3',
        participantId: 'p_alice',
        content: 'Perfect. Should I open a draft PR?',
      },
      {
        id: 'm4',
        participantId: 'p_bob',
        content: "Hold on — let's get the spec approved first.",
      },
    ],
  },
];

export function ChatDetail() {
  const theme = useTheme();

  return (
    <>
      <p
        style={{
          margin: '0 0 16px',
          color: 'var(--rc-text-tertiary)',
          fontSize: 14,
        }}
      >
        <code>variant</code> selects the layout. <strong>user-agent</strong> stylises agent replies
        as flowing prose; <strong>user-user</strong> renders both speakers as bubbles. Markdown is
        rendered via
        <code> streamdown</code>.
      </p>

      <div className="biz-grid">
        {chatSamples.map((sample) => (
          <Panel badge={`chat · ${sample.variant}`} key={sample.key} title={sample.label}>
            <p className="node-description">{sample.description}</p>
            <div
              className={`node-render ${getVariantClass('article')}`}
              data-color-scheme={theme}
              data-theme={theme}
              style={{ marginTop: 8 }}
            >
              <ChatRenderer
                messages={sample.messages}
                participants={sample.participants}
                variant={sample.variant}
              />
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
