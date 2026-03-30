import type { MessageDraft } from '../../protocol';
import { appendText, type UserMessage } from '../helpers';
import { CONTEXT_INSTRUCTION, SYSTEM_CONTEXT_END, SYSTEM_CONTEXT_START } from './constants';

export type UserMessageLocation = { scope: 'messages'; index: number };

export function getUserMessageLocations(draft: MessageDraft): UserMessageLocation[] {
  const locations: UserMessageLocation[] = [];

  for (let i = 0; i < draft.messages.length; i++) {
    if (draft.messages[i].role === 'user') {
      locations.push({ scope: 'messages', index: i });
    }
  }

  return locations;
}

export function getUserMessage(draft: MessageDraft, location: UserMessageLocation): UserMessage {
  return draft.messages[location.index] as UserMessage;
}

export function setUserMessage(
  draft: MessageDraft,
  location: UserMessageLocation,
  message: UserMessage,
): void {
  draft.messages[location.index] = message;
}

export function hasSystemContextWrapper(content: string): boolean {
  return content.includes(SYSTEM_CONTEXT_START) && content.includes(SYSTEM_CONTEXT_END);
}

export function createContextBlock(content: string, contextType: string): string {
  return `<${contextType}>
${content}
</${contextType}>`;
}

export function wrapWithSystemContext(content: string, contextType: string): string {
  return `${SYSTEM_CONTEXT_START}
${CONTEXT_INSTRUCTION}
<${contextType}>
${content}
</${contextType}>
${SYSTEM_CONTEXT_END}`;
}

export function insertIntoExistingWrapper(
  existingContent: string,
  newContextBlock: string,
): string {
  const endMarkerIndex = existingContent.lastIndexOf(SYSTEM_CONTEXT_END);
  if (endMarkerIndex === -1) {
    return appendText(existingContent, newContextBlock);
  }

  const beforeEnd = existingContent.slice(0, endMarkerIndex);
  const afterEnd = existingContent.slice(endMarkerIndex);

  return `${beforeEnd}${newContextBlock}\n${afterEnd}`;
}

export function appendSystemContextToUserMessage(
  message: UserMessage,
  content: string,
  contextType: string,
): UserMessage {
  const currentContent = message.content;

  if (hasSystemContextWrapper(currentContent)) {
    return {
      ...message,
      content: insertIntoExistingWrapper(currentContent, createContextBlock(content, contextType)),
    };
  }

  return {
    ...message,
    content: appendText(currentContent, wrapWithSystemContext(content, contextType)),
  };
}
