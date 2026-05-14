import type { SerializedEditorState } from 'lexical';

export function renderJson(state: SerializedEditorState, compact: boolean): string {
  return JSON.stringify(state, null, compact ? 0 : 2);
}
