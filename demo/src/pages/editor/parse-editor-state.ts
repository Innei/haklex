import type { SerializedEditorState } from 'lexical';

export type ParseResult = { ok: true; state: SerializedEditorState } | { ok: false; error: string };

export function parseEditorState(text: string): ParseResult {
  if (!text.trim()) return { ok: false, error: 'Paste JSON first.' };
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Not valid JSON.' };
  }
  if (!value || typeof value !== 'object' || !('root' in value)) {
    return { ok: false, error: 'Missing "root": paste a serialized EditorState.' };
  }
  return { ok: true, state: value as SerializedEditorState };
}
