import { code } from '@streamdown/code';
import type { FC, ReactElement } from 'react';
import { Streamdown } from 'streamdown';

import * as styles from './styles.css';
import type {
  ChatMessage,
  ChatParticipant,
  ChatParticipantKind,
  ChatRendererProps,
  ChatVariant,
} from './types';

const streamdownPlugins = { code };

const UNKNOWN: ChatParticipant = {
  id: '__unknown__',
  kind: 'user',
  name: 'Unknown',
};

function defaultName(kind: ChatParticipantKind): string {
  return kind === 'agent' ? 'Assistant' : 'User';
}

function resolveParticipant(
  participants: ChatParticipant[],
  participantId: string,
): ChatParticipant {
  return participants.find((p) => p.id === participantId) ?? UNKNOWN;
}

const Avatar: FC<{ participant: ChatParticipant; dark?: boolean }> = ({ participant, dark }) => {
  const className = `${styles.avatar} ${dark ? styles.avatarDark : ''} ${styles.semanticClassNames.avatar}`;
  if (participant.avatar) {
    return (
      <span className={className}>
        <img alt="" className={styles.avatarImg} src={participant.avatar} />
      </span>
    );
  }
  const display = participant.name ?? defaultName(participant.kind);
  const initial = display.trim().charAt(0).toUpperCase() || '?';
  return <span className={className}>{initial}</span>;
};

const Markdown: FC<{ content: string }> = ({ content }) => (
  <Streamdown plugins={streamdownPlugins}>{content}</Streamdown>
);

const UserAgentRow: FC<{
  message: ChatMessage;
  participants: ChatParticipant[];
}> = ({ message, participants }) => {
  const participant = resolveParticipant(participants, message.participantId);
  const isUser = participant.kind !== 'agent';
  const displayName = participant.name ?? defaultName(participant.kind);

  if (isUser) {
    return (
      <div className={`${styles.row} ${styles.rowRight} ${styles.semanticClassNames.row}`}>
        <div
          className={`${styles.bubble} ${styles.userBubble} ${styles.semanticClassNames.bubble}`}
        >
          <Markdown content={message.content} />
        </div>
        <Avatar participant={participant} />
      </div>
    );
  }

  return (
    <div className={`${styles.row} ${styles.semanticClassNames.row}`}>
      <Avatar dark participant={participant} />
      <div className={`${styles.article} ${styles.semanticClassNames.article}`}>
        <div className={styles.articleHeader}>{displayName}</div>
        <Markdown content={message.content} />
      </div>
    </div>
  );
};

const UserUserRow: FC<{
  message: ChatMessage;
  participants: ChatParticipant[];
  isRight: boolean;
}> = ({ message, participants, isRight }) => {
  const participant = resolveParticipant(participants, message.participantId);
  const displayName = participant.name ?? defaultName(participant.kind);
  const bubbleClass = isRight ? styles.rightBubble : styles.leftBubble;
  const authorClass = isRight ? `${styles.author} ${styles.authorOnDark}` : styles.author;

  const authorEl = (
    <div className={`${authorClass} ${styles.semanticClassNames.author}`}>{displayName}</div>
  );
  const bubble = (
    <div className={`${styles.bubble} ${bubbleClass} ${styles.semanticClassNames.bubble}`}>
      {authorEl}
      <Markdown content={message.content} />
    </div>
  );

  if (isRight) {
    return (
      <div className={`${styles.row} ${styles.rowRight} ${styles.semanticClassNames.row}`}>
        {bubble}
        <Avatar dark participant={participant} />
      </div>
    );
  }
  return (
    <div className={`${styles.row} ${styles.semanticClassNames.row}`}>
      <Avatar participant={participant} />
      {bubble}
    </div>
  );
};

function isRightSide(
  variant: ChatVariant,
  message: ChatMessage,
  participants: ChatParticipant[],
): boolean {
  if (variant !== 'user-user') return false;
  const idx = participants.findIndex((p) => p.id === message.participantId);
  return idx === 1;
}

export const ChatRenderer: FC<ChatRendererProps> = ({
  variant,
  participants,
  messages,
}): ReactElement => {
  if (messages.length === 0) {
    return (
      <div className={`${styles.container} ${styles.semanticClassNames.container}`}>
        <div className={`${styles.empty} ${styles.semanticClassNames.empty}`}>Empty chat</div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${styles.semanticClassNames.container}`}>
      {messages.map((message) => {
        if (variant === 'user-agent') {
          return <UserAgentRow key={message.id} message={message} participants={participants} />;
        }
        return (
          <UserUserRow
            isRight={isRightSide(variant, message, participants)}
            key={message.id}
            message={message}
            participants={participants}
          />
        );
      })}
    </div>
  );
};
