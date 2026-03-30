import type {
  ChatMessage,
  MessageEngine,
  MessageEngineContext,
  PreparedMessages,
} from '../protocol';
import { createInitialDraft, draftToPreparedMessages } from './helpers';
import type { BaseMessageEngineProcessor } from './processors';

export class MessagesEngine implements MessageEngine {
  constructor(private readonly processors: BaseMessageEngineProcessor[]) {}

  process(context: MessageEngineContext): PreparedMessages {
    const draft = this.processors.reduce(
      (nextDraft, processor) => processor.process(nextDraft, context),
      createInitialDraft(context),
    );

    return draftToPreparedMessages(draft);
  }
}

export function buildMessages(preparedMessages: PreparedMessages): ChatMessage[] {
  return [
    ...preparedMessages.systemMessages,
    ...preparedMessages.preambleMessages,
    ...preparedMessages.turns,
  ];
}
