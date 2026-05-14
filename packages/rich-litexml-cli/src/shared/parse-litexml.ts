import { createDefaultRegistry, deserializeFromXml } from '@haklex/rich-litexml';
import type { SerializedEditorState } from 'lexical';

export function parseLiteXmlToState(xml: string): SerializedEditorState {
  const registry = createDefaultRegistry();
  return deserializeFromXml(xml, registry);
}
