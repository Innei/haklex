import {
  type AgentStore,
  type AgentToolConfig,
  type ChatMessage,
  createAgentExecutor,
  createDiffEngine,
  createSnapshot,
  type LLMProvider,
} from '@haklex/rich-agent-core';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { SerializedEditorState } from 'lexical';
import { useCallback, useRef } from 'react';

import type { AgentActionConfig } from '../registry';

export type UseAgentLoopOptions = {
  provider: LLMProvider;
  store: AgentStore;
  tools?: AgentToolConfig[];
  systemMessages?: ChatMessage[];
};

export function useAgentLoop(options: UseAgentLoopOptions) {
  const [editor] = useLexicalComposerContext();
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (action: AgentActionConfig, userInput: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const serialized = editor.getEditorState().toJSON() as SerializedEditorState;
      const snapshot = createSnapshot(serialized);

      const prompt =
        typeof action.prompt === 'function'
          ? action.prompt({
              selection: null,
              getBlockByBlockId: (id) => snapshot.getBlock(id) ?? null,
              getDocumentStructure: () => serialized.root as any,
            })
          : action.prompt;

      const actionPrompt: ChatMessage = {
        role: 'user',
        content: `${prompt}\n\nUser instruction: ${userInput}`,
        cacheBreakpoint: true,
      };

      const documentMessage: ChatMessage = {
        role: 'user',
        content: `## Document\n${JSON.stringify(serialized)}`,
      };

      const executor = createAgentExecutor({
        provider: options.provider,
        snapshot,
        store: options.store,
        tools: options.tools ?? [],
        systemMessages: options.systemMessages ?? [
          {
            role: 'system',
            content: 'You are an AI editor agent. Use the provided tools to modify the document.',
            cacheBreakpoint: true,
          },
        ],
        signal: controller.signal,
      });

      const result = await executor.run(actionPrompt, documentMessage);

      if (result.operations.length > 0) {
        const diffState = createDiffEngine(result.operations, serialized);
        options.store.dispatch({ type: 'set_diff_state', diffState });
      }

      return result;
    },
    [editor, options],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { run, abort };
}
