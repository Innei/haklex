import type { ChatBubble, ReviewBatch, ToolCallGroupItem } from '@haklex/rich-agent-core';
import { ScrollArea } from '@haklex/rich-editor-ui';
import type { ReactElement } from 'react';
import { useRef } from 'react';

import { DiffReviewBubble } from './components/DiffReviewBubble';
import { ErrorBubble } from './components/ErrorBubble';
import { StreamdownBubble } from './components/StreamdownBubble';
import { ThinkingChain } from './components/ThinkingChain';
import { ToolCallGroup } from './components/ToolCallGroup';
import { bubbleTool, bubbleUser, messageList } from './styles.css';

interface ChatMessageListProps {
  bubbles: ChatBubble[];
  getBatch?: (batchId: string) => ReviewBatch | undefined;
  onAcceptBatch?: (batchId: string) => void;
  onRejectBatch?: (batchId: string) => void;
  onRetry?: () => void;
}

interface ToolCallGroupView {
  id: string;
  items: ToolCallGroupItem[];
  type: 'tool_call_group_view';
}

type MergedBubble = ChatBubble | ToolCallGroupView;

function mergeBubbles(bubbles: ChatBubble[]): MergedBubble[] {
  const result: MergedBubble[] = [];
  let legacyGroup: ToolCallGroupItem[] | null = null;
  let legacyGroupStartIdx = 0;

  function flushLegacy() {
    if (legacyGroup && legacyGroup.length > 0) {
      result.push({
        type: 'tool_call_group_view',
        id: `legacy-${legacyGroupStartIdx}`,
        items: legacyGroup,
      });
      legacyGroup = null;
    }
  }

  for (let i = 0; i < bubbles.length; i++) {
    const b = bubbles[i];

    // New canonical type — pass through
    if (b.type === 'tool_call_group') {
      flushLegacy();
      result.push({
        type: 'tool_call_group_view',
        id: b.id,
        items: b.items,
      });
      continue;
    }

    // Legacy: merge adjacent tool_call + tool_result
    if (b.type === 'tool_call') {
      if (!legacyGroup) {
        legacyGroup = [];
        legacyGroupStartIdx = i;
      }
      const next = bubbles[i + 1];
      if (next?.type === 'tool_result' && next.toolName === b.toolName) {
        legacyGroup.push({
          id: `fallback-${i}`,
          toolName: b.toolName,
          params: b.params,
          status: next.success ? 'completed' : 'error',
          result: next.success ? next.summary : undefined,
          resultPreview: next.success ? next.summary.slice(0, 80) : undefined,
          error: !next.success ? next.summary : undefined,
        });
        i++;
      } else {
        legacyGroup.push({
          id: `fallback-${i}`,
          toolName: b.toolName,
          params: b.params,
          status: 'running',
        });
      }
      continue;
    }

    if (b.type === 'tool_result') {
      flushLegacy();
      continue;
    }

    flushLegacy();
    result.push(b);
  }
  flushLegacy();
  return result;
}

export function ChatMessageList({
  bubbles,
  getBatch,
  onAcceptBatch,
  onRejectBatch,
  onRetry,
}: ChatMessageListProps): ReactElement {
  const scrollRef = useRef<HTMLDivElement>(null);
  const merged = mergeBubbles(bubbles);

  return (
    <ScrollArea autoScrollToBottom className={messageList} scrollRef={scrollRef}>
      {merged.map((item, i) => {
        switch (item.type) {
          case 'user': {
            return (
              <div className={bubbleUser} key={i}>
                {item.content}
              </div>
            );
          }

          case 'thinking': {
            if ('id' in item && item.id && 'rawText' in item) {
              return (
                <ThinkingChain
                  id={item.id}
                  isStreaming={item.isStreaming ?? false}
                  key={i}
                  rawText={item.rawText ?? item.content}
                  steps={item.steps ?? []}
                />
              );
            }
            return (
              <ThinkingChain
                id={`legacy-thinking-${i}`}
                isStreaming={false}
                key={i}
                rawText={item.content}
                steps={item.content ? item.content.split(/\n{2,}/).filter(Boolean) : []}
              />
            );
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

          case 'tool_call_group_view': {
            return <ToolCallGroup id={item.id} items={item.items} key={i} />;
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

          case 'diff_review': {
            const batch = getBatch?.(item.batchId);
            if (!batch) return null;
            return (
              <DiffReviewBubble
                batch={batch}
                key={i}
                onAccept={onAcceptBatch}
                onReject={onRejectBatch}
              />
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
