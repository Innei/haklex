import type { MessageDraft, MessageEngineContext } from '../../protocol';
import { normalizeMessageList, type SystemMessage } from '../helpers';
import { BaseMessageEngineProcessor } from './BaseMessageEngineProcessor';

export abstract class BaseSystemRootProvider extends BaseMessageEngineProcessor {
  protected abstract buildMessages(
    context: MessageEngineContext,
  ): SystemMessage | SystemMessage[] | null;

  protected doProcess(draft: MessageDraft, context: MessageEngineContext): MessageDraft {
    const messages = this.buildMessages(context);
    if (!messages) return draft;

    draft.systemMessages = normalizeMessageList(messages);
    return draft;
  }
}
