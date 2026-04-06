import type { AgentStore } from '@haklex/rich-agent-core';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_HIGH } from 'lexical';
import { useEffect } from 'react';

import { $captureSelection } from '../captureSelection';
import { AGENT_PIN_SELECTION_COMMAND } from '../commands';

export function AgentSelectionPinPlugin({ store }: { store: AgentStore }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      AGENT_PIN_SELECTION_COMMAND,
      () => {
        const selection = editor.getEditorState().read(() => $captureSelection());
        if (selection) {
          store.getState().pinSelection(selection);
        }
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor, store]);

  return null;
}
