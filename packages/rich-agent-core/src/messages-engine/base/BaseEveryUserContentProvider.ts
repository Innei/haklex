import type { MessageDraft, MessageEngineContext } from '../../protocol';
import type { UserMessage } from '../helpers';
import { BaseMessageEngineProcessor } from './BaseMessageEngineProcessor';
import {
  appendSystemContextToUserMessage,
  getUserMessage,
  getUserMessageLocations,
  setUserMessage,
} from './messageContextUtils';

export abstract class BaseEveryUserContentProvider extends BaseMessageEngineProcessor {
  protected abstract buildContentForMessage(
    message: UserMessage,
    index: number,
    isLastUser: boolean,
    context: MessageEngineContext,
  ): { content: string; contextType: string } | null;

  protected doProcess(draft: MessageDraft, context: MessageEngineContext): MessageDraft {
    const locations = getUserMessageLocations(draft);
    const lastIndex = locations.length - 1;

    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      const message = getUserMessage(draft, location);
      const nextContent = this.buildContentForMessage(message, i, i === lastIndex, context);
      if (!nextContent) continue;

      setUserMessage(
        draft,
        location,
        appendSystemContextToUserMessage(message, nextContent.content, nextContent.contextType),
      );
    }

    return draft;
  }
}
