import { createDefaultRegistry, serializeToXml } from '@haklex/rich-litexml';
import type { SerializedEditorState } from 'lexical';

import type { ChatMessage, DocumentContextOptions, MessagePipeline } from './protocol';

export function buildMessages(pipeline: MessagePipeline): ChatMessage[] {
  return [...pipeline.systemMessages, pipeline.actionPrompt, ...pipeline.turns];
}

export function buildDocumentContext(
  editorState: SerializedEditorState,
  _options: DocumentContextOptions,
): string {
  const registry = createDefaultRegistry();
  return serializeToXml(editorState, registry);
}
