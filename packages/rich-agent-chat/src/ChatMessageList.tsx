import type { ChatBubble } from '@haklex/rich-agent-core';
import type { ReactElement } from 'react';
import { useEffect, useRef } from 'react';

import { bubbleAssistant, bubbleError, bubbleTool, bubbleUser, messageList } from './styles.css';

interface ChatMessageListProps {
  bubbles: ChatBubble[];
}

export function ChatMessageList({ bubbles }: ChatMessageListProps): ReactElement {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [bubbles.length]);

  return (
    <div className={messageList} ref={listRef}>
      {bubbles.map((bubble, i) => {
        switch (bubble.type) {
          case 'user': {
            return (
              <div className={bubbleUser} key={i}>
                {bubble.content}
              </div>
            );
          }
          case 'assistant': {
            return (
              <div className={bubbleAssistant} key={i}>
                {bubble.content}
                {bubble.streaming && <span style={{ opacity: 0.5 }}> ...</span>}
              </div>
            );
          }
          case 'tool_call': {
            return (
              <div className={bubbleTool} key={i}>
                Tool: {bubble.toolName}
              </div>
            );
          }
          case 'tool_result': {
            return (
              <div className={bubbleTool} key={i}>
                {bubble.success ? 'OK' : 'Error'}: {bubble.summary}
              </div>
            );
          }
          case 'error': {
            return (
              <div className={bubbleError} key={i}>
                {bubble.message}
              </div>
            );
          }
          case 'diff_summary': {
            return (
              <div className={bubbleTool} key={i}>
                Diff: {bubble.accepted} accepted, {bubble.rejected} rejected, {bubble.pending}{' '}
                pending
              </div>
            );
          }
        }
      })}
    </div>
  );
}
