export type EditorHistoryShortcut = 'redo' | 'undo';

export interface EditorHistoryShortcutEvent {
  altKey?: boolean;
  ctrlKey: boolean;
  key: string;
  metaKey: boolean;
  shiftKey: boolean;
}

export interface EditorHistoryShortcutOptions {
  isDirty?: boolean;
}

export function getEditorHistoryShortcut(
  event: EditorHistoryShortcutEvent,
  options: EditorHistoryShortcutOptions = {},
): EditorHistoryShortcut | null {
  if (options.isDirty) return null;
  if (event.altKey) return null;
  if (!event.metaKey && !event.ctrlKey) return null;

  const key = event.key.toLowerCase();

  if (key === 'z') {
    return event.shiftKey ? 'redo' : 'undo';
  }

  if (key === 'y' && event.ctrlKey && !event.metaKey && !event.shiftKey) {
    return 'redo';
  }

  return null;
}
