import type {
  AgentStore,
  AgentToolConfig,
  ChatMessage,
  LLMProvider,
} from '@haklex/rich-agent-core';
import type { ReactElement } from 'react';

import { useAgentLoop } from '../hooks/useAgentLoop';
import type { AgentActionConfig } from '../registry';

export interface AgentPanelPluginProps {
  actions?: AgentActionConfig[];
  provider: LLMProvider;
  store: AgentStore;
  systemMessages?: ChatMessage[];
  tools?: AgentToolConfig[];
}

export function AgentPanelPlugin({
  provider,
  store,
  tools,
  systemMessages,
}: AgentPanelPluginProps): ReactElement | null {
  useAgentLoop({ provider, store, tools, systemMessages });
  return null;
}
