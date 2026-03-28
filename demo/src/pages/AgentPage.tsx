import { ChatPanel, getProviderFromModel } from '@haklex/rich-agent-chat';
import type { LLMProvider } from '@haklex/rich-agent-core';
import { createAgentStore } from '@haklex/rich-agent-core';
import { AgentPanelPlugin, builtInActions, useAgentLoop } from '@haklex/rich-ext-ai-agent';
import { MentionPlatformProvider, ShiroEditor } from '@haklex/rich-kit-shiro';
import { ToolbarPlugin } from '@haklex/rich-plugin-toolbar';
import type { SerializedEditorState } from 'lexical';
import { useCallback, useMemo, useRef, useState } from 'react';

import { useTheme } from '../context/ThemeContext';
import { createClaudeProvider } from '../providers/claude-provider';
import { createOpenAIProvider } from '../providers/openai-provider';

const initialContent: SerializedEditorState = {
  root: {
    type: 'root',
    children: [
      {
        type: 'heading',
        children: [
          {
            type: 'text',
            text: 'AI Agent Demo',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        tag: 'h1',
        textFormat: 0,
        textStyle: '',
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'This is a demo of the AI agent extension. The agent can insert, replace, and delete blocks in the document via tool calling.',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'Try typing a message in the chat panel to interact with the agent. The agent will propose changes as inline diffs that you can accept or reject.',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
} as any;

function createProvider(model: string): LLMProvider {
  const provider = getProviderFromModel(model);
  return provider === 'claude' ? createClaudeProvider(model) : createOpenAIProvider(model);
}

function AgentEditorWithChat({ store }: { store: ReturnType<typeof createAgentStore> }) {
  const theme = useTheme();
  const [model, setModel] = useState('claude-sonnet-4-20250514');
  const providerRef = useRef<LLMProvider>(createProvider(model));
  const agentLoopRef = useRef<ReturnType<typeof useAgentLoop> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleModelChange = useCallback((newModel: string) => {
    setModel(newModel);
    providerRef.current = createProvider(newModel);
  }, []);

  const handleSend = useCallback(
    (message: string) => {
      const loop = agentLoopRef.current;
      if (!loop) return;
      abortRef.current = new AbortController();
      loop.run(builtInActions[1], message).catch((err: unknown) => {
        if ((err as Error).name === 'AbortError') return;
        store.dispatch({
          type: 'add_bubble',
          bubble: { type: 'error', message: String(err) },
        });
      });
    },
    [store],
  );

  const handleAbort = useCallback(() => {
    abortRef.current?.abort();
    store.dispatch({ type: 'set_status', status: 'idle' });
  }, [store]);

  const handleRetry = useCallback(() => {
    const bubbles = store.getState().bubbles;
    const lastUserBubble = [...bubbles].reverse().find((b) => b.type === 'user');
    if (lastUserBubble && lastUserBubble.type === 'user') {
      handleSend(lastUserBubble.content);
    }
  }, [store, handleSend]);

  return (
    <div className="agent-split">
      <div className="agent-pane-editor">
        <MentionPlatformProvider platforms={{}}>
          <ShiroEditor header={<ToolbarPlugin />} initialValue={initialContent}>
            <AgentPanelPlugin provider={providerRef.current} store={store} />
            <AgentLoopCapture loopRef={agentLoopRef} provider={providerRef.current} store={store} />
          </ShiroEditor>
        </MentionPlatformProvider>
      </div>
      <div className="agent-pane-chat" data-theme={theme}>
        <ChatPanel
          model={model}
          store={store}
          onAbort={handleAbort}
          onModelChange={handleModelChange}
          onRetry={handleRetry}
          onSend={handleSend}
        />
      </div>
    </div>
  );
}

function AgentLoopCapture({
  loopRef,
  provider,
  store,
}: {
  loopRef: React.RefObject<ReturnType<typeof useAgentLoop> | null>;
  provider: LLMProvider;
  store: ReturnType<typeof createAgentStore>;
}) {
  const loop = useAgentLoop({ provider, store });
  loopRef.current = loop;
  return null;
}

export function AgentPage() {
  const store = useMemo(() => createAgentStore(), []);

  return <AgentEditorWithChat store={store} />;
}
