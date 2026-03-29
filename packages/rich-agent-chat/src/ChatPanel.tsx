import { type AgentStore, agentStoreSelectors } from '@haklex/rich-agent-core';
import { useCallback, useState } from 'react';
import { useStore } from 'zustand';

import { ChatInput } from './ChatInput';
import { ChatMessageList } from './ChatMessageList';
import { ModelSelector } from './components/ModelSelector';
import { SettingsModal } from './components/SettingsModal';
import * as css from './styles.css';
import type { ProviderConfig, SelectedModel } from './types';

interface ChatPanelProps {
  onAbort?: () => void;
  onProvidersChange: (providers: ProviderConfig[]) => void;
  onRetry?: () => void;
  onRetryToolCall?: (name: string, params: Record<string, unknown>) => void;
  onSelectModel: (selected: SelectedModel) => void;
  onSend?: (message: string) => void;
  providers: ProviderConfig[];
  selectedModel: SelectedModel | null;
  store: AgentStore;
}

const STATUS_LABELS: Record<string, string> = {
  thinking: 'Thinking...',
  writing: 'Writing...',
  running: 'Processing...',
};

export function ChatPanel({
  onAbort,
  onRetry,
  onRetryToolCall,
  onSend,
  providers,
  onProvidersChange,
  selectedModel,
  onSelectModel,
  store,
}: ChatPanelProps) {
  const bubbles = useStore(store, agentStoreSelectors.bubbles);
  const status = useStore(store, agentStoreSelectors.status);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSend = useCallback(
    (message: string) => {
      store.getState().addBubble({ type: 'user', content: message });
      onSend?.(message);
    },
    [onSend, store],
  );

  const isRunning = status !== 'idle' && status !== 'done';
  const hasModel = selectedModel !== null;

  // Build status label for composer
  let statusLabel: string | undefined;
  if (isRunning) {
    if (status === 'calling_tool') {
      statusLabel = 'Calling tool...';
    } else {
      statusLabel = STATUS_LABELS[status] || 'Processing...';
    }
  }

  return (
    <div className={css.chatPanel}>
      <ChatMessageList bubbles={bubbles} onRetry={onRetry} onRetryToolCall={onRetryToolCall} />
      <ChatInput
        disabled={!hasModel}
        isRunning={isRunning}
        statusLabel={statusLabel}
        modelSelector={
          <ModelSelector
            providers={providers}
            selectedModel={selectedModel}
            onOpenSettings={() => setSettingsOpen(true)}
            onSelectModel={onSelectModel}
          />
        }
        onAbort={onAbort}
        onSend={handleSend}
      />
      <SettingsModal
        open={settingsOpen}
        providers={providers}
        onOpenChange={setSettingsOpen}
        onProvidersChange={onProvidersChange}
      />
    </div>
  );
}
