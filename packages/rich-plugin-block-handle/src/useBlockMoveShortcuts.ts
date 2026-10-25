import { detectPlatform } from '@haklex/rich-editor-ui';
import type { CommandListener, LexicalEditor } from 'lexical';
import { COMMAND_PRIORITY_CRITICAL, KEY_DOWN_COMMAND } from 'lexical';
import { useEffect } from 'react';

import { $moveBlocks, $selectionBlockKeys } from './blockMoves';

const DIRECTIONS: Record<string, 'up' | 'down'> = { ArrowUp: 'up', ArrowDown: 'down' };

export function createBlockMoveHandler(
  editor: LexicalEditor,
  getSelectedKeys: () => string[],
  isMac: boolean,
): CommandListener<KeyboardEvent> {
  return (event, fromEditor) => {
    if (fromEditor !== editor) return false;
    const direction = DIRECTIONS[event.key];
    if (!direction || !event.shiftKey || event.altKey) return false;
    if (isMac ? !event.metaKey || event.ctrlKey : !event.ctrlKey || event.metaKey) return false;
    const blockKeys = getSelectedKeys();
    const keys = blockKeys.length > 0 ? blockKeys : $selectionBlockKeys();
    if (keys.length === 0) return false;
    event.preventDefault();
    $moveBlocks(keys, direction);
    return true;
  };
}

export function useBlockMoveShortcuts(editor: LexicalEditor, getSelectedKeys: () => string[]) {
  useEffect(() => {
    const isMac =
      detectPlatform(typeof navigator === 'undefined' ? undefined : navigator) === 'mac';
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      createBlockMoveHandler(editor, getSelectedKeys, isMac),
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, getSelectedKeys]);
}
