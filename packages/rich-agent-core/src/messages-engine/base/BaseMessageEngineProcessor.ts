import type { MessageDraft, MessageEngineContext } from '../../protocol';

export abstract class BaseMessageEngineProcessor {
  process(draft: MessageDraft, context: MessageEngineContext): MessageDraft {
    if (!this.shouldProcess(context, draft)) {
      return draft;
    }

    return this.doProcess(this.cloneDraft(draft), context);
  }

  protected shouldProcess(_context: MessageEngineContext, _draft: MessageDraft): boolean {
    return true;
  }

  protected cloneDraft(draft: MessageDraft): MessageDraft {
    return {
      systemMessages: [...draft.systemMessages],
      messages: draft.messages.map((message) =>
        message.role === 'user' || message.role === 'system' || message.role === 'assistant'
          ? { ...message }
          : message.role === 'assistant_tool_call'
            ? { ...message, toolCalls: [...message.toolCalls] }
            : { ...message },
      ),
    };
  }

  protected abstract doProcess(draft: MessageDraft, context: MessageEngineContext): MessageDraft;
}
