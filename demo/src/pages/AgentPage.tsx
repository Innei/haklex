import type { ProviderConfig, SelectedModel } from '@haklex/rich-agent-chat';
import { ChatPanel } from '@haklex/rich-agent-chat';
import type { AgentOperation, LLMProvider } from '@haklex/rich-agent-core';
import {
  createAgentStore,
  createDocumentTools,
  createReviewBatch,
  createSnapshot,
} from '@haklex/rich-agent-core';
import { getVariantClass } from '@haklex/rich-editor';
import { blockIdState } from '@haklex/rich-editor/plugins';
import { AgentPanelPlugin, DiffReviewOverlayPlugin, useAgentLoop } from '@haklex/rich-ext-ai-agent';
import { MentionPlatformProvider, ShiroEditor } from '@haklex/rich-kit-shiro';
import { ToolbarPlugin } from '@haklex/rich-plugin-toolbar';
import { PortalThemeProvider } from '@haklex/rich-style-token';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getRoot,
  $getState,
  $parseSerializedNode,
  type LexicalEditor,
  type LexicalNode,
  type SerializedEditorState,
} from 'lexical';
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

function $findBlockByBlockId(blockId: string): LexicalNode | null {
  const root = $getRoot();
  for (const child of root.getChildren()) {
    if ($getState(child, blockIdState) === blockId) {
      return child;
    }
  }
  return null;
}

function AgentEditorWithChat({ store }: { store: ReturnType<typeof createAgentStore> }) {
  const theme = useTheme();
  const [providers, setProviders] = useState<ProviderConfig[]>(loadProviders);
  const [selectedModel, setSelectedModel] = useState<SelectedModel | null>(loadSelectedModel);

  const [provider, setProvider] = useState<LLMProvider | null>(null);
  const agentLoopRef = useRef<ReturnType<typeof useAgentLoop> | null>(null);
  const editorRef = useRef<LexicalEditor | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!selectedModel) {
      setProvider(null);
      return;
    }
    const providerConfig = providers.find((p) => p.id === selectedModel.providerId);
    if (!providerConfig) {
      setProvider(null);
      return;
    }
    const opts = {
      model: selectedModel.modelId,
      apiKey: providerConfig.apiKey,
      baseUrl: providerConfig.baseUrl,
    };
    setProvider(
      providerConfig.type === 'claude' ? createClaudeProvider(opts) : createOpenAIProvider(opts),
    );
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
      loop.run(message).catch((err: unknown) => {
        if ((err as Error).name === 'AbortError') return;
        store.getState().addBubble({ type: 'error', message: String(err) });
      });
    },
    [store],
  );

  const handleAbort = useCallback(() => {
    abortRef.current?.abort();
    store.getState().setStatus('idle');
  }, [store]);

  const handleRetry = useCallback(() => {
    const bubbles = store.getState().bubbles;
    const lastUserBubble = [...bubbles].reverse().find((b) => b.type === 'user');
    if (lastUserBubble && lastUserBubble.type === 'user') {
      handleSend(lastUserBubble.content);
    }
  }, [store, handleSend]);

  const handleRetryToolCall = useCallback(
    async (toolName: string, params: Record<string, unknown>) => {
      const editor = editorRef.current;
      if (!editor) return;

      const serialized = editor.getEditorState().toJSON() as SerializedEditorState;
      const snapshot = createSnapshot(serialized);
      const operations: AgentOperation[] = [];
      const tools = createDocumentTools(snapshot, operations);
      const tool = tools.find((t) => t.name === toolName);
      if (!tool) return;

      store.getState().addBubble({ type: 'tool_call', toolName, params });
      const result = await tool.execute(params);
      const content = result.ok ? result.content : JSON.stringify(result.error);
      store.getState().addBubble({
        type: 'tool_result',
        toolName,
        success: result.ok,
        summary: content,
      });

      if (operations.length > 0) {
        const revision = store.getState().reviewState?.documentRevision ?? 0;
        const batch = createReviewBatch(operations, serialized, revision);
        store.getState().addReviewBatch(batch);
        store.getState().addBubble({ type: 'diff_review', batchId: batch.id });
      }
    },
    [store],
  );

  const handleAcceptBatch = useCallback(
    (batchId: string) => {
      store.getState().acceptReviewBatch(batchId);
      const reviewState = store.getState().reviewState;
      const batch = reviewState?.batches.find((b) => b.id === batchId);
      if (!batch || !editorRef.current) return;

      const editor = editorRef.current;
      editor.update(() => {
        const root = $getRoot();
        for (const entry of batch.entries) {
          const { op } = entry;
          if (op.op === 'insert') {
            if (!op.node?.type) continue;
            const newNode = $parseSerializedNode(op.node);
            if (op.position.type === 'root') {
              const idx = op.position.index ?? root.getChildrenSize();
              const children = root.getChildren();
              if (idx >= children.length) root.append(newNode);
              else children[idx].insertBefore(newNode);
            } else {
              const target = $findBlockByBlockId(op.position.blockId);
              if (!target) continue;
              if (op.position.type === 'after') target.insertAfter(newNode);
              else target.insertBefore(newNode);
            }
          } else if (op.op === 'replace') {
            if (!op.node?.type) continue;
            const target = $findBlockByBlockId(op.blockId);
            if (!target) continue;
            target.replace($parseSerializedNode(op.node));
          } else if (op.op === 'delete') {
            const target = $findBlockByBlockId(op.blockId);
            if (!target) continue;
            target.remove();
          }
        }
      });
    },
    [store],
  );

  const handleRejectBatch = useCallback(
    (batchId: string) => {
      store.getState().rejectReviewBatch(batchId);
    },
    [store],
  );

  return (
    <div className="agent-split">
      <div className="agent-pane-editor">
        <MentionPlatformProvider platforms={{}}>
          <ShiroEditor header={<ToolbarPlugin />} initialValue={initialContent}>
            {provider && <AgentPanelPlugin provider={provider} store={store} />}
            <DiffReviewOverlayPlugin store={store} />
            <AgentLoopCapture
              editorRef={editorRef}
              loopRef={agentLoopRef}
              provider={provider}
              store={store}
            />
          </ShiroEditor>
        </MentionPlatformProvider>
      </div>
      <div className="agent-pane-chat" data-theme={theme}>
        <PortalThemeProvider className={getVariantClass('article')} theme={theme}>
          <ChatPanel
            providers={providers}
            selectedModel={selectedModel}
            store={store}
            onAbort={handleAbort}
            onAcceptBatch={handleAcceptBatch}
            onProvidersChange={handleProvidersChange}
            onRejectBatch={handleRejectBatch}
            onRetry={handleRetry}
            onRetryToolCall={handleRetryToolCall}
            onSelectModel={handleSelectModel}
            onSend={handleSend}
          />
        </PortalThemeProvider>
      </div>
    </div>
  );
}

function AgentLoopCapture({
  editorRef,
  loopRef,
  provider,
  store,
}: {
  editorRef: React.RefObject<LexicalEditor | null>;
  loopRef: React.RefObject<ReturnType<typeof useAgentLoop> | null>;
  provider: LLMProvider | null;
  store: ReturnType<typeof createAgentStore>;
}) {
  if (!provider) {
    loopRef.current = null;
    return null;
  }
  return (
    <AgentLoopCaptureInner
      editorRef={editorRef}
      loopRef={loopRef}
      provider={provider}
      store={store}
    />
  );
}

function AgentLoopCaptureInner({
  editorRef,
  loopRef,
  provider,
  store,
}: {
  editorRef: React.RefObject<LexicalEditor | null>;
  loopRef: React.RefObject<ReturnType<typeof useAgentLoop> | null>;
  provider: LLMProvider;
  store: ReturnType<typeof createAgentStore>;
}) {
  const loop = useAgentLoop({ provider, store });
  loopRef.current = loop;

  const [editor] = useLexicalComposerContext();
  editorRef.current = editor;

  return null;
}

export function AgentPage() {
  const store = useMemo(() => createAgentStore(), []);

  return <AgentEditorWithChat store={store} />;
}
