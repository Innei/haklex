import {
  type AgentStore,
  type AgentToolConfig,
  type CapturedSelection,
  type ChatMessage,
  createAgentExecutor,
  createReviewBatch,
  createSnapshot,
  type LLMProvider,
} from '@haklex/rich-agent-core';
import { $getRootBlock, $getTextOffsetInBlock, $resolveSelectionPoint } from '@haklex/rich-editor';
import { blockIdState } from '@haklex/rich-editor/plugins';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getRoot,
  $getSelection,
  $getState,
  $isNodeSelection,
  $isRangeSelection,
  type SerializedEditorState,
} from 'lexical';
import { useCallback, useRef } from 'react';

import { AgentMessagesEngine } from '../messageEngine';

export type UseAgentLoopOptions = {
  provider: LLMProvider;
  store: AgentStore;
  tools?: AgentToolConfig[];
  messageEngine?: AgentMessagesEngine;
  systemMessages?: ChatMessage[];
};

function $captureSelection(): CapturedSelection | null {
  const sel = $getSelection();
  const root = $getRoot();

  if ($isNodeSelection(sel)) {
    const rootChildKeys = new Set(root.getChildrenKeys());
    const blockIds: string[] = [];
    for (const node of sel.getNodes()) {
      if (!rootChildKeys.has(node.getKey())) continue;
      const blockId = $getState(node, blockIdState);
      if (blockId) blockIds.push(blockId);
    }
    return blockIds.length ? { type: 'block', blockIds } : null;
  }

  if ($isRangeSelection(sel) && !sel.isCollapsed()) {
    const anchorBlock = $getRootBlock(sel.anchor.getNode());
    const focusBlock = $getRootBlock(sel.focus.getNode());
    if (!anchorBlock || !focusBlock) return null;

    const anchorBlockId = $getState(anchorBlock, blockIdState);
    const focusBlockId = $getState(focusBlock, blockIdState);
    if (!anchorBlockId || !focusBlockId) return null;

    const anchorPoint = $resolveSelectionPoint(sel, 'anchor');
    const focusPoint = $resolveSelectionPoint(sel, 'focus');

    const anchorOffset = $getTextOffsetInBlock(anchorBlock, anchorPoint.node, anchorPoint.offset);
    const focusOffset = $getTextOffsetInBlock(focusBlock, focusPoint.node, focusPoint.offset);

    return {
      type: 'text',
      text: sel.getTextContent(),
      anchorBlockId,
      anchorOffset,
      focusBlockId,
      focusOffset,
    };
  }

  return null;
}

export function useAgentLoop(options: UseAgentLoopOptions) {
  const [editor] = useLexicalComposerContext();
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (userInput: string) => {
      try {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const serialized = editor.getEditorState().toJSON() as SerializedEditorState;
        const snapshot = createSnapshot(serialized);

        const selection = editor.getEditorState().read(() => $captureSelection());

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
