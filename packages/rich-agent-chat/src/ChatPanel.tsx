import type { AgentStore, AgentStoreState } from '@haklex/rich-agent-core';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { ChatInput } from './ChatInput';
import { ChatMessageList } from './ChatMessageList';
import { chatPanel } from './styles.css';

interface ChatPanelProps {
  onSend?: (message: string) => void;
  store: AgentStore;
}

export function ChatPanel({ store, onSend }: ChatPanelProps): ReactElement {
  const [state, setState] = useState<AgentStoreState>(store.getState);

  useEffect(() => store.subscribe(setState), [store]);

  const handleSend = useCallback(
    (message: string) => {
      store.dispatch({ type: 'add_bubble', bubble: { type: 'user', content: message } });
      onSend?.(message);
    },
    [store, onSend],
  );

  return (
    <div className={chatPanel}>
      <ChatMessageList bubbles={state.bubbles} />
      <ChatInput disabled={state.status === 'running'} onSend={handleSend} />
    </div>
  );
}
