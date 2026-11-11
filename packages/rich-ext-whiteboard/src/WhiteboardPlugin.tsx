import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical';
import { useEffect } from 'react';

import { $createWhiteboardEditNode } from './WhiteboardEditNode';

export const INSERT_WHITEBOARD_COMMAND = createCommand<string>('INSERT_WHITEBOARD');

export function WhiteboardPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      INSERT_WHITEBOARD_COMMAND,
      (snapshot) => {
        const node = $createWhiteboardEditNode(snapshot);
        $insertNodes([node]);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}
