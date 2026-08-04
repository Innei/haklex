import { code } from '@streamdown/code';
import type { ComponentProps, FC, ReactElement } from 'react';
import { Streamdown } from 'streamdown';

import * as styles from './styles.css';
import type {
  ChatMessage,
  ChatParticipant,
  ChatParticipantKind,
  ChatRendererProps,
  ChatVariant,
} from './types';

// @streamdown/code types against its own shiki 3 while streamdown resolves the hoisted shiki 4
const streamdownPlugins = { code } as unknown as ComponentProps<typeof Streamdown>['plugins'];

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

const Avatar: FC<{ participant: ChatParticipant; dark?: boolean; small?: boolean }> = ({
  participant,
  dark,
  small,
}) => {
  const className = [
    styles.avatar,
    small ? styles.avatarSmall : '',
    dark ? styles.avatarDark : '',
    styles.semanticClassNames.avatar,
  ]
    .filter(Boolean)
    .join(' ');
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
          className={`${styles.bubble} ${styles.bubbleRightTail} ${styles.semanticClassNames.bubble}`}
        >
          <Markdown content={message.content} />
        </div>
        <Avatar participant={participant} />
      </div>
    );
  }

  return (
    <div className={`${styles.row} ${styles.semanticClassNames.row}`}>
      <div className={styles.agent}>
        <div className={styles.agentHeader}>
          <Avatar dark small participant={participant} />
          <span className={styles.agentHeaderName}>{displayName}</span>
        </div>
        <div className={`${styles.article} ${styles.semanticClassNames.article}`}>
          <Markdown content={message.content} />
        </div>
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
  const tailClass = isRight ? styles.bubbleRightTail : styles.bubbleLeftTail;
  const clusterClass = `${styles.authorCluster}${isRight ? ` ${styles.authorClusterRight}` : ''}`;

  const cluster = (
    <div className={clusterClass}>
      <span className={`${styles.authorLabel} ${styles.semanticClassNames.author}`}>
        {displayName}
      </span>
      <div className={`${styles.bubble} ${tailClass} ${styles.semanticClassNames.bubble}`}>
        <Markdown content={message.content} />
      </div>
    </div>
  );

  if (isRight) {
    return (
      <div className={`${styles.row} ${styles.rowRight} ${styles.semanticClassNames.row}`}>
        {cluster}
        <Avatar participant={participant} />
      </div>
    );
  }
  return (
    <div className={`${styles.row} ${styles.semanticClassNames.row}`}>
      <Avatar participant={participant} />
      {cluster}
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
