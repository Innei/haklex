import type { MessageDraft, MessageEngineContext } from '../../protocol';
import { getLastItem } from '../helpers';
import { BaseMessageEngineProcessor } from './BaseMessageEngineProcessor';
import {
  appendSystemContextToUserMessage,
  createContextBlock,
  getUserMessage,
  getUserMessageLocations,
  hasSystemContextWrapper,
  setUserMessage,
  wrapWithSystemContext,
} from './messageContextUtils';

export abstract class BaseLastUserContentProvider extends BaseMessageEngineProcessor {
  protected abstract buildContent(
    context: MessageEngineContext,
  ): { content: string; contextType: string } | null;

  protected doProcess(draft: MessageDraft, context: MessageEngineContext): MessageDraft {
    const locations = getUserMessageLocations(draft);
    const lastLocation = getLastItem(locations);
    if (!lastLocation) return draft;

    const nextContent = this.buildContent(context);
    if (!nextContent) return draft;

    const message = getUserMessage(draft, lastLocation);
    setUserMessage(
      draft,
      lastLocation,
      appendSystemContextToUserMessage(message, nextContent.content, nextContent.contextType),
    );

    return draft;
  }

  protected hasExistingSystemContext(draft: MessageDraft): boolean {
    const locations = getUserMessageLocations(draft);
    const lastLocation = getLastItem(locations);
    if (!lastLocation) return false;

    return hasSystemContextWrapper(getUserMessage(draft, lastLocation).content);
  }

  protected wrapWithSystemContext(content: string, contextType: string): string {
    return wrapWithSystemContext(content, contextType);
  }

  protected createContextBlock(content: string, contextType: string): string {
    return createContextBlock(content, contextType);
  }
}
