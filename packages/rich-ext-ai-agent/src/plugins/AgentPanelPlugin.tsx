import type {
  AgentStore,
  AgentToolConfig,
  ChatMessage,
  LitexmlRegistryProvider,
  LLMProvider,
} from '@haklex/rich-agent-core';
import { useTextSelectionSnapshot } from '@haklex/rich-editor';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { ReactElement } from 'react';
import { useEffect } from 'react';

import { useAgentLoop } from '../hooks/useAgentLoop';
import type { AgentMessagesEngine } from '../messageEngine';

export interface AgentPanelPluginProps {
  litexmlRegistry?: LitexmlRegistryProvider;
  messageEngine?: AgentMessagesEngine;
  provider: LLMProvider;
  store: AgentStore;
  systemMessages?: ChatMessage[];
  tools?: AgentToolConfig[];
}

export function AgentPanelPlugin({
  messageEngine,
  provider,
  store,
  litexmlRegistry,
  tools,
  systemMessages,
}: AgentPanelPluginProps): ReactElement | null {
  const [editor] = useLexicalComposerContext();
  const textSelectionSnapshot = useTextSelectionSnapshot();

  useEffect(() => {
    const rootElement = editor.getRootElement();
    const activeElement = rootElement?.ownerDocument.activeElement;
    const isEditorFocused = Boolean(
      rootElement && activeElement && rootElement.contains(activeElement),
    );

    if (textSelectionSnapshot) {
      store.getState().setLiveSelection({ type: 'text', ...textSelectionSnapshot });
      return;
    }

    if (isEditorFocused) {
      store.getState().clearLiveSelection();
    }
  }, [editor, store, textSelectionSnapshot]);

  useEffect(() => {
    return () => {
      store.getState().clearLiveSelection();
    };
  }, [store]);

  useAgentLoop({ provider, store, tools, litexmlRegistry, systemMessages, messageEngine });
  return null;
}
