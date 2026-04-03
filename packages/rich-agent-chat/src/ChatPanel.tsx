import { type AgentStore, agentStoreSelectors, type ReviewBatch } from '@haklex/rich-agent-core';
import { useCallback } from 'react';
import { useStore } from 'zustand';

import { ChatInput } from './ChatInput';
import { ChatMessageList } from './ChatMessageList';
import { ModelSelector } from './components/ModelSelector';
import * as css from './styles.css';
import type { ProviderGroup, SelectedModel } from './types';

interface ChatPanelProps {
  onAbort: () => void;
  onAcceptBatch?: (batchId: string) => void;
  onRejectBatch?: (batchId: string) => void;
  onRetry?: () => void;
  onSelectModel: (selected: SelectedModel) => void;
  onSend: (message: string) => void;
  providerGroups: ProviderGroup[];
  selectedModel: SelectedModel | null;
  store: AgentStore;
}

export function ChatPanel({
  onAbort,
  onAcceptBatch,
  onRejectBatch,
  onRetry,
  onSend,
  providerGroups,
  selectedModel,
  onSelectModel,
  store,
}: ChatPanelProps) {
  const bubbles = useStore(store, agentStoreSelectors.bubbles);
  const status = useStore(store, agentStoreSelectors.status);
  const reviewState = useStore(store, agentStoreSelectors.reviewState);

  const getBatch = useCallback(
    (batchId: string) => reviewState?.batches.find((b: ReviewBatch) => b.id === batchId),
    [reviewState],
  );

  const handleSend = useCallback(
    (message: string) => {
      store.getState().addBubble({ type: 'user', content: message });
      onSend(message);
    },
    [onSend, store],
  );

  const isRunning = status !== 'idle' && status !== 'done';
  const hasModel = selectedModel !== null;

  return (
    <div className={css.chatPanel}>
      <ChatMessageList
        bubbles={bubbles}
        getBatch={getBatch}
        onAcceptBatch={onAcceptBatch}
        onRejectBatch={onRejectBatch}
        onRetry={onRetry}
      />
      <ChatInput
        disabled={!hasModel}
        isRunning={isRunning}
        status={status}
        modelSelector={
          <ModelSelector
            providerGroups={providerGroups}
            selectedModel={selectedModel}
            onSelectModel={onSelectModel}
          />
        }
        onAbort={onAbort}
        onSend={handleSend}
      />
    </div>
  );
}
