import type { MessageDraft, MessageEngineContext } from '../../protocol';
import { appendText, getLastItem } from '../helpers';
import { BaseMessageEngineProcessor } from './BaseMessageEngineProcessor';

export abstract class BaseSystemRoleProvider extends BaseMessageEngineProcessor {
  protected abstract buildContent(context: MessageEngineContext): string | null;

  protected doProcess(draft: MessageDraft, context: MessageEngineContext): MessageDraft {
    const content = this.buildContent(context)?.trim();
    if (!content) return draft;

    const lastSystemMessage = getLastItem(draft.systemMessages);

    if (!lastSystemMessage) {
      draft.systemMessages = [{ role: 'system', content }];
      return draft;
    }

    draft.systemMessages[draft.systemMessages.length - 1] = {
      ...lastSystemMessage,
      content: appendText(lastSystemMessage.content, content),
    };
    return draft;
  }
}
