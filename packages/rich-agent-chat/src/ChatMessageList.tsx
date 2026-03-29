import type { ChatBubble } from '@haklex/rich-agent-core';
import { ScrollArea } from '@haklex/rich-editor-ui';
import type { ReactElement } from 'react';
import { useRef } from 'react';

import { ErrorBubble } from './components/ErrorBubble';
import { StreamdownBubble } from './components/StreamdownBubble';
import { ThinkingBlock } from './components/ThinkingBlock';
import { ToolCallBubble } from './components/ToolCallBubble';
import { bubbleTool, bubbleUser, messageList } from './styles.css';

interface ChatMessageListProps {
  bubbles: ChatBubble[];
  onRetry?: () => void;
}

interface ToolCallItem {
  name: string;
  params: Record<string, unknown>;
  result?: { success: boolean; summary: string };
}

type MergedBubble = ChatBubble | { type: 'tool_call_group'; items: ToolCallItem[] };

function mergeBubbles(bubbles: ChatBubble[]): MergedBubble[] {
  const result: MergedBubble[] = [];
  let currentGroup: ToolCallItem[] | null = null;

  function flushGroup() {
    if (currentGroup && currentGroup.length > 0) {
      result.push({ type: 'tool_call_group', items: currentGroup });
      currentGroup = null;
    }
  }

  for (let i = 0; i < bubbles.length; i++) {
    const b = bubbles[i];

    if (b.type === 'tool_call') {
      if (!currentGroup) currentGroup = [];
      const next = bubbles[i + 1];
      if (next?.type === 'tool_result' && next.toolName === b.toolName) {
        currentGroup.push({
          name: b.toolName,
          params: b.params,
          result: { success: next.success, summary: next.summary },
        });
        i++; // skip tool_result
      } else {
        currentGroup.push({
          name: b.toolName,
          params: b.params,
        });
      }
    } else if (b.type === 'tool_result') {
      // orphaned tool_result — skip
      flushGroup();
    } else {
      flushGroup();
      result.push(b);
    }
  }
  flushGroup();
  return result;
}

export function ChatMessageList({ bubbles, onRetry }: ChatMessageListProps): ReactElement {
  const scrollRef = useRef<HTMLDivElement>(null);
  const mergedBubbles = mergeBubbles(bubbles);

  return (
    <ScrollArea autoScrollToBottom className={messageList} scrollRef={scrollRef}>
      {mergedBubbles.map((item, i) => {
        switch (item.type) {
          case 'user': {
            return (
              <div className={bubbleUser} key={i}>
                {item.content}
              </div>
            );
          }

          case 'thinking': {
            return <ThinkingBlock content={item.content} isStreaming={false} key={i} />;
          }

          case 'assistant': {
            return (
              <StreamdownBubble
                content={item.content}
                isStreaming={item.streaming ?? false}
                key={i}
              />
            );
          }

          case 'tool_call_group': {
            return <ToolCallBubble items={item.items} key={i} />;
          }

          case 'error': {
            return <ErrorBubble key={i} message={item.message} onRetry={onRetry} />;
          }

          case 'diff_summary': {
            return (
              <div className={bubbleTool} key={i}>
                Diff: {item.accepted} accepted, {item.rejected} rejected, {item.pending} pending
              </div>
            );
          }

          default: {
            return null;
          }
        }
      })}
    </ScrollArea>
  );
}
