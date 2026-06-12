import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical';
import { useEffect } from 'react';

import { $createDynamicEditNode } from './DynamicEditNode';
import type { DynamicNodePayload } from './DynamicNode';

export const INSERT_DYNAMIC_COMMAND = createCommand<Partial<DynamicNodePayload> | undefined>(
  'INSERT_DYNAMIC',
);

export function DynamicPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      INSERT_DYNAMIC_COMMAND,
      (payload) => {
        const node = $createDynamicEditNode(payload ?? {});
        $insertNodes([node]);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}
