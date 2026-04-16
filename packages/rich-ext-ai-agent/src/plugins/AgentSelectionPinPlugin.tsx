import type { AgentStore } from '@haklex/rich-agent-core';
import { useTextSelectionStore } from '@haklex/rich-editor';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_HIGH } from 'lexical';
import { useEffect } from 'react';

import { $captureSelection } from '../captureSelection';
import { AGENT_PIN_SELECTION_COMMAND } from '../commands';

export function AgentSelectionPinPlugin({ store }: { store: AgentStore }) {
  const [editor] = useLexicalComposerContext();
  const textSelectionStore = useTextSelectionStore();

  useEffect(() => {
    return editor.registerCommand(
      AGENT_PIN_SELECTION_COMMAND,
      () => {
        const textSelection = textSelectionStore.getState().snapshot;
        if (textSelection) {
          store.getState().pinSelection({ type: 'text', ...textSelection });
          return true;
        }

        const selection = editor.getEditorState().read(() => $captureSelection());
        if (selection?.type === 'block') {
          store.getState().pinSelection(selection);
        }
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor, store, textSelectionStore]);

  return null;
}
