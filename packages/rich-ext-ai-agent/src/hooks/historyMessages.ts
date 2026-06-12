import type { ChatBubble, ChatMessage } from '@haklex/rich-agent-core';

const SYSTEM_CONTEXT_START = '<!-- SYSTEM CONTEXT (NOT PART OF USER QUERY) -->';

function getVisibleUserContent(content: string): string {
  const [visible] = content.split(SYSTEM_CONTEXT_START, 1);
  return visible.trim();
}

export function chatBubblesToHistoryMessages(
  bubbles: readonly ChatBubble[],
  currentUserInput?: string,
): ChatMessage[] {
  const messages: ChatMessage[] = [];

  for (const bubble of bubbles) {
    if (bubble.type === 'user') {
      const content = bubble.content.trim();
      if (content) {
        messages.push(
          bubble.selection
            ? { role: 'user', content, metadata: { capturedSelection: bubble.selection } }
            : { role: 'user', content },
        );
      }
      continue;
    }

    if (bubble.type === 'assistant' && !bubble.streaming) {
      const content = bubble.content.trim();
      if (content) messages.push({ role: 'assistant', content });
    }
  }

  const lastMessage = messages.at(-1);
  if (
    currentUserInput &&
    lastMessage?.role === 'user' &&
    getVisibleUserContent(lastMessage.content) === currentUserInput.trim()
  ) {
    messages.pop();
  }

  return messages;
}
