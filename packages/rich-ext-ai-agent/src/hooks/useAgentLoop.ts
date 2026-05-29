import {
  type AgentStore,
  type AgentToolConfig,
  type ChatMessage,
  createAgentExecutor,
  createReviewBatch,
  createSnapshot,
  type LLMProvider,
} from '@haklex/rich-agent-core';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { SerializedEditorState } from 'lexical';
import { useCallback, useRef } from 'react';

import { $captureSelection } from '../captureSelection';
import { AgentMessagesEngine } from '../messageEngine';
import { projectAgentDiffNodesToFactualState } from '../nodes/diff-node-state';

export type UseAgentLoopOptions = {
  provider: LLMProvider;
  store: AgentStore;
  tools?: AgentToolConfig[];
  messageEngine?: AgentMessagesEngine;
  systemMessages?: ChatMessage[];
};

export function useAgentLoop(options: UseAgentLoopOptions) {
  const [editor] = useLexicalComposerContext();
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (userInput: string) => {
      try {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const serializedWithDiffNodes = editor.getEditorState().toJSON() as SerializedEditorState;
        const serialized = projectAgentDiffNodesToFactualState(serializedWithDiffNodes);
        const snapshot = createSnapshot(serialized);

        const pinned = options.store.getState().pinnedSelection;
        const live =
          options.store.getState().liveSelection ??
          editor.getEditorState().read(() => $captureSelection());
        const selection = pinned ?? live;

        const messageEngine =
          options.messageEngine ??
          new AgentMessagesEngine({ systemMessages: options.systemMessages });
        const preparedMessages = messageEngine.processWithEditor({
          editorState: serialized,
          userInput,
          selection,
        });

        let activeBatchId: string | null = null;

        const executor = createAgentExecutor({
          provider: options.provider,
          snapshot,
          store: options.store,
          tools: options.tools ?? [],
          signal: controller.signal,
          onOperationsChanged: (ops) => {
            const revision = options.store.getState().reviewState?.documentRevision ?? 0;
            const batch = createReviewBatch(ops, serialized, revision);

            if (activeBatchId) {
              // Replace the existing batch
              const reviewState = options.store.getState().reviewState;
              if (reviewState) {
                options.store.getState().setReviewState({
                  ...reviewState,
                  batches: reviewState.batches.map((b) =>
                    b.id === activeBatchId ? { ...batch, id: activeBatchId } : b,
                  ),
                });
              }
            } else {
              activeBatchId = batch.id;
              options.store.getState().addReviewBatch(batch);
              options.store.getState().addBubble({ type: 'diff_review', batchId: batch.id });
            }
          },
        });

        const result = await executor.run(preparedMessages);

        if (pinned) {
          options.store.getState().clearPinnedSelection();
        }

        // Final batch creation if no operations were emitted incrementally
        if (result.operations.length > 0 && !activeBatchId) {
          const revision = options.store.getState().reviewState?.documentRevision ?? 0;
          const batch = createReviewBatch(result.operations, serialized, revision);
          options.store.getState().addReviewBatch(batch);
          options.store.getState().addBubble({ type: 'diff_review', batchId: batch.id });
        }

        return result;
      } catch (error) {
        console.error('[useAgentLoop] run failed:', error);
        throw error;
      }
    },
    [editor, options],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { run, abort };
}
