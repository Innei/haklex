import type { AgentContext } from '@haklex/rich-agent-core';
import type { ReactNode } from 'react';

export type AgentActionConfig = {
  name: string;
  description: string;
  icon?: ReactNode;
  placement?: ('toolbar' | 'floating' | 'slash')[];
  when?: 'always' | 'selection';
  prompt: string | ((context: AgentContext) => string);
};

export function registerAgentAction(
  actions: AgentActionConfig[],
  config: AgentActionConfig,
): () => void {
  actions.push(config);
  return () => {
    const idx = actions.indexOf(config);
    if (idx >= 0) actions.splice(idx, 1);
  };
}

export const builtInActions: AgentActionConfig[] = [
  {
    name: 'edit-selection',
    description: 'Edit the selected text with AI',
    placement: ['floating'],
    when: 'selection',
    prompt: (ctx) =>
      `Edit the following selected text as instructed by the user. Selection:\n${ctx.selection?.text ?? ''}`,
  },
  {
    name: 'insert-below',
    description: 'Insert AI-generated content below',
    placement: ['slash'],
    when: 'always',
    prompt: 'Insert new content below the current block as instructed by the user.',
  },
];
