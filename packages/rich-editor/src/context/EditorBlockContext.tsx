import type { LexicalEditor, NodeKey } from 'lexical';
import { createContext, use } from 'react';

export interface DocumentBlocks {
  clear: () => void;
  readonly editor: LexicalEditor;
  extend: (step: -1 | 1) => boolean;
  focusSelection: () => void;
  islandKeys: (editor: LexicalEditor) => NodeKey[];
  keys: () => NodeKey[];
  select: (editor: LexicalEditor, anchorKey: NodeKey, focusKey: NodeKey) => void;
  selectAll: () => void;
  subscribe: (listener: () => void) => () => void;
}

export interface EditorBlockBinding {
  active: boolean;
  blockId: string;
  documentBlocks?: DocumentBlocks;
  editor: LexicalEditor;
  nodeState: (key?: NodeKey) => Map<string, unknown>;
  retain: () => () => void;
}
export const EditorBlockContext = createContext<EditorBlockBinding | null>(null);
/** Optional logical block identity/state for views that rebind editing instances. */
export function useEditorBlock() {
  return use(EditorBlockContext);
}
