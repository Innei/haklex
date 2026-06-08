import { serializeToXml } from '@haklex/rich-litexml';
import type { SerializedEditorState } from 'lexical';

import { resolveLitexmlRegistry } from './litexml';
import type { DocumentContextOptions } from './protocol';

export function buildDocumentContext(
  editorState: SerializedEditorState,
  options: DocumentContextOptions,
): string {
  const registry = resolveLitexmlRegistry(options);
  return serializeToXml(editorState, registry, {
    compact: options.compact ?? true,
    selectedBlockIds: options.selectedBlockIds,
  });
}
