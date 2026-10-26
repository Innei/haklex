import type { LexicalEditor, NodeKey } from 'lexical';
import { createContext, use } from 'react';

export interface EditorBlockBinding {
  active: boolean;
  blockId: string;
  editor: LexicalEditor;
  nodeState: (key?: NodeKey) => Map<string, unknown>;
  retain: () => () => void;
}
export const EditorBlockContext = createContext<EditorBlockBinding | null>(null);
/** Optional logical block identity/state for views that rebind editing instances. */
export function useEditorBlock() {
  return use(EditorBlockContext);
}
