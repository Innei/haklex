import type { AgentStore } from '@haklex/rich-agent-core';
import { createContext, use } from 'react';

const AgentStoreContext = createContext<AgentStore | null>(null);

export const AgentStoreProvider = AgentStoreContext.Provider;

export function useAgentStore(): AgentStore {
  const store = use(AgentStoreContext);
  if (!store) throw new Error('useAgentStore must be used within AgentStoreProvider');
  return store;
}
