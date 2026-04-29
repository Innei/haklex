import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { NodeKey } from 'lexical';
import { $getNodeByKey } from 'lexical';
import type { FC } from 'react';
import { useCallback, useEffect, useRef } from 'react';

import { ChatEditRenderer } from './ChatEditRenderer';
import { $isChatNode } from './nodes/ChatNode';
import type { ChatMessage, ChatParticipant, ChatVariant } from './types';

export interface ChatEditDecoratorProps {
  messages: ChatMessage[];
  nodeKey: NodeKey;
  participants: ChatParticipant[];
  variant: ChatVariant;
}

export const ChatEditDecorator: FC<ChatEditDecoratorProps> = ({
  nodeKey,
  variant,
  participants,
  messages,
}) => {
  const [editor] = useLexicalComposerContext();
  const hasOpenedRef = useRef(false);
  const openTriggerRef = useRef<(() => void) | null>(null);
  const messagesLengthRef = useRef(messages.length);

  const onChange = useCallback(
    (next: { variant: ChatVariant; participants: ChatParticipant[]; messages: ChatMessage[] }) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isChatNode(node)) {
          node.setVariant(next.variant);
          node.setParticipants(next.participants);
          node.setMessages(next.messages);
        }
      });
    },
    [editor, nodeKey],
  );

  const onCancel = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isChatNode(node) && node.getMessages().length === 0) {
        node.remove();
      }
    });
  }, [editor, nodeKey]);

  useEffect(() => {
    if (hasOpenedRef.current) return;
    if (messagesLengthRef.current > 0) return;
    const trigger = openTriggerRef.current;
    if (!trigger) return;
    hasOpenedRef.current = true;
    trigger();
  }, []);

  return (
    <ChatEditRenderer
      messages={messages}
      participants={participants}
      variant={variant}
      registerOpenTrigger={(open) => {
        openTriggerRef.current = open;
      }}
      onCancel={onCancel}
      onChange={onChange}
    />
  );
};
