import type { ProviderConfig, SelectedModel } from '@haklex/rich-agent-chat';
import { ChatPanel } from '@haklex/rich-agent-chat';
import type { LLMProvider } from '@haklex/rich-agent-core';
import { createAgentStore } from '@haklex/rich-agent-core';
import { AgentPanelPlugin, builtInActions, useAgentLoop } from '@haklex/rich-ext-ai-agent';
import { MentionPlatformProvider, ShiroEditor } from '@haklex/rich-kit-shiro';
import { ToolbarPlugin } from '@haklex/rich-plugin-toolbar';
import type { SerializedEditorState } from 'lexical';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTheme } from '../context/ThemeContext';
import { createClaudeProvider } from '../providers/claude-provider';
import { createOpenAIProvider } from '../providers/openai-provider';

const STORAGE_KEY_PROVIDERS = 'agent-providers';
const STORAGE_KEY_MODEL = 'agent-selected-model';

function loadProviders(): ProviderConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROVIDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProviders(providers: ProviderConfig[]) {
  localStorage.setItem(STORAGE_KEY_PROVIDERS, JSON.stringify(providers));
}

function loadSelectedModel(): SelectedModel | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MODEL);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSelectedModel(model: SelectedModel | null) {
  if (model) {
    localStorage.setItem(STORAGE_KEY_MODEL, JSON.stringify(model));
  } else {
    localStorage.removeItem(STORAGE_KEY_MODEL);
  }
}

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

function AgentEditorWithChat({ store }: { store: ReturnType<typeof createAgentStore> }) {
  const theme = useTheme();
  const [providers, setProviders] = useState<ProviderConfig[]>(loadProviders);
  const [selectedModel, setSelectedModel] = useState<SelectedModel | null>(loadSelectedModel);

  const providerRef = useRef<LLMProvider | null>(null);
  const agentLoopRef = useRef<ReturnType<typeof useAgentLoop> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!selectedModel) {
      providerRef.current = null;
      return;
    }
    const providerConfig = providers.find((p) => p.id === selectedModel.providerId);
    if (!providerConfig) {
      providerRef.current = null;
      return;
    }
    const opts = {
      model: selectedModel.modelId,
      apiKey: providerConfig.apiKey,
      baseUrl: providerConfig.baseUrl,
    };
    providerRef.current =
      providerConfig.type === 'claude' ? createClaudeProvider(opts) : createOpenAIProvider(opts);
  }, [selectedModel, providers]);

  function handleProvidersChange(next: ProviderConfig[]) {
    setProviders(next);
    saveProviders(next);
  }

  function handleSelectModel(selected: SelectedModel) {
    setSelectedModel(selected);
    saveSelectedModel(selected);
  }

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
            {providerRef.current && (
              <AgentPanelPlugin provider={providerRef.current} store={store} />
            )}
            <AgentLoopCapture loopRef={agentLoopRef} provider={providerRef.current} store={store} />
          </ShiroEditor>
        </MentionPlatformProvider>
      </div>
      <div className="agent-pane-chat" data-theme={theme}>
        <ChatPanel
          providers={providers}
          selectedModel={selectedModel}
          store={store}
          onAbort={handleAbort}
          onProvidersChange={handleProvidersChange}
          onRetry={handleRetry}
          onSelectModel={handleSelectModel}
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
  provider: LLMProvider | null;
  store: ReturnType<typeof createAgentStore>;
}) {
  if (!provider) {
    loopRef.current = null;
    return null;
  }
  return <AgentLoopCaptureInner loopRef={loopRef} provider={provider} store={store} />;
}

function AgentLoopCaptureInner({
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
