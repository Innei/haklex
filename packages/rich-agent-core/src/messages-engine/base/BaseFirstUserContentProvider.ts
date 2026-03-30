import type { ChatMessage, MessageDraft, MessageEngineContext } from '../../protocol';
import { normalizeMessageList } from '../helpers';
import { BaseMessageEngineProcessor } from './BaseMessageEngineProcessor';

export abstract class BaseFirstUserContentProvider extends BaseMessageEngineProcessor {
  protected abstract buildMessages(
    context: MessageEngineContext,
  ): ChatMessage | ChatMessage[] | null;

  protected doProcess(draft: MessageDraft, context: MessageEngineContext): MessageDraft {
    const messages = this.buildMessages(context);
    if (!messages) return draft;

    const firstUserIndex = draft.messages.findIndex((message) => message.role === 'user');
    if (firstUserIndex === -1) return draft;

    draft.messages.splice(firstUserIndex, 0, ...normalizeMessageList(messages));
    return draft;
  }
}
