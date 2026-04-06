import type { ProviderGroup, SelectedModel } from '@haklex/rich-agent-chat';
import { ChatPanel } from '@haklex/rich-agent-chat';
import type { LLMProvider } from '@haklex/rich-agent-core';
import { createAgentStore, createDirectTransport, createProvider } from '@haklex/rich-agent-core';
import { getVariantClass } from '@haklex/rich-editor';
import { blockIdState } from '@haklex/rich-editor/plugins';
import {
  AgentAskAIAction,
  AgentPanelPlugin,
  AgentSelectionPinPlugin,
  DiffReviewOverlayPlugin,
  useAgentLoop,
} from '@haklex/rich-ext-ai-agent';
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
import { useCallback, useMemo, useRef, useState } from 'react';

import { useTheme } from '../context/ThemeContext';

interface DemoProviderConfig {
  apiKey: string;
  baseUrl: string;
  id: string;
  models: string[];
  name: string;
  type: 'claude' | 'openai-compatible';
}

const STORAGE_KEY_PROVIDERS = 'agent-providers';
const STORAGE_KEY_MODEL = 'agent-selected-model';

function loadProviders(): DemoProviderConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROVIDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
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
  const [providers] = useState<DemoProviderConfig[]>(loadProviders);
  const [selectedModel, setSelectedModel] = useState<SelectedModel | null>(loadSelectedModel);

  const agentLoopRef = useRef<ReturnType<typeof useAgentLoop> | null>(null);
  const editorRef = useRef<LexicalEditor | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const provider = useMemo(() => {
    if (!selectedModel) return null;
    const providerConfig = providers.find((p) => p.id === selectedModel.providerId);
    if (!providerConfig) return null;
    const transport = createDirectTransport({
      apiKey: providerConfig.apiKey,
      baseUrl: providerConfig.baseUrl,
      providerType: providerConfig.type,
    });
    return createProvider({
      model: selectedModel.modelId,
      transport,
      providerType: providerConfig.type,
    });
  }, [selectedModel, providers]);

  const providerGroups: ProviderGroup[] = useMemo(() => {
    return providers.map((p) => ({
      id: p.id,
      name: p.name,
      providerType: p.type,
      models: p.models.map((modelId) => ({
        id: modelId,
        displayName: modelId,
      })),
    }));
  }, [providers]);

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

  const handleAcceptBatch = useCallback(
    (batchId: string) => {
      store.getState().acceptReviewBatch(batchId);
      const reviewState = store.getState().reviewState;
      const batch = reviewState?.batches.find((b) => b.id === batchId);
      if (!batch || !editorRef.current) return;

      const editor = editorRef.current;
      editor.update(() => {
        const root = $getRoot();
        const lastInserted = new Map<string, LexicalNode>();
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
              const anchorKey = `${op.position.type}:${op.position.blockId}`;
              const prev = lastInserted.get(anchorKey);
              if (prev) {
                prev.insertAfter(newNode);
              } else {
                const target = $findBlockByBlockId(op.position.blockId);
                if (!target) continue;
                if (op.position.type === 'after') target.insertAfter(newNode);
                else target.insertBefore(newNode);
              }
              lastInserted.set(anchorKey, newNode);
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
          <ShiroEditor
            floatingToolbarActions={provider ? <AgentAskAIAction /> : undefined}
            header={<ToolbarPlugin />}
            initialValue={initialContent}
          >
            {provider && <AgentPanelPlugin provider={provider} store={store} />}
            {provider && <AgentSelectionPinPlugin store={store} />}
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
            providerGroups={providerGroups}
            selectedModel={selectedModel}
            store={store}
            onAbort={handleAbort}
            onAcceptBatch={handleAcceptBatch}
            onRejectBatch={handleRejectBatch}
            onRetry={handleRetry}
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
