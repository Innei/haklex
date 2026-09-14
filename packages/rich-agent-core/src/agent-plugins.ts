import { createDocumentTools } from './document-tools';
import type { LitexmlRegistryProvider } from './litexml';
import type { AgentToolConfig } from './protocol';
import type { EditorSnapshot } from './snapshot';
import type { AgentOperation } from './types';

export type AgentExecutorPluginContext = {
  litexmlRegistry?: LitexmlRegistryProvider;
  operations: AgentOperation[];
  snapshot: EditorSnapshot;
};

export type AgentExecutorPlugin = {
  tools: (ctx: AgentExecutorPluginContext) => AgentToolConfig[];
};

export function documentToolsPlugin(): AgentExecutorPlugin {
  return {
    tools: (ctx) =>
      createDocumentTools(ctx.snapshot, ctx.operations, {
        litexmlRegistry: ctx.litexmlRegistry,
      }),
  };
}
