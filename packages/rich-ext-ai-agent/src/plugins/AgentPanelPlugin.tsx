import type {
  AgentStore,
  AgentToolConfig,
  ChatMessage,
  LLMProvider,
} from '@haklex/rich-agent-core';
import type { ReactElement } from 'react';

import { useAgentLoop } from '../hooks/useAgentLoop';
import type { AgentMessagesEngine } from '../messageEngine';

export interface AgentPanelPluginProps {
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
  tools,
  systemMessages,
}: AgentPanelPluginProps): ReactElement | null {
  useAgentLoop({ provider, store, tools, systemMessages, messageEngine });
  return null;
}
