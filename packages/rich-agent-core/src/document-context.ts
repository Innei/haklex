import { createDefaultRegistry, serializeToXml } from '@haklex/rich-litexml';
import type { SerializedEditorState } from 'lexical';

import type { DocumentContextOptions } from './protocol';

export function buildDocumentContext(
  editorState: SerializedEditorState,
  options: DocumentContextOptions,
): string {
  const registry = createDefaultRegistry();
  return serializeToXml(editorState, registry, { compact: options.compact ?? true });
}
