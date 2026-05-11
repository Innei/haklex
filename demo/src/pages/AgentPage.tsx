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
import { ToolbarPlugin } from '@haklex/rich-plugin-toolbar';
import { MentionPlatformProvider } from '@haklex/rich-renderer-mention/static';
import { PortalThemeProvider } from '@haklex/rich-style-token';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getRoot,
  $getState,
  $parseSerializedNode,
  type LexicalEditor as LexicalEditorInstance,
  type LexicalNode,
  type SerializedEditorState,
} from 'lexical';
import { useCallback, useMemo, useRef, useState } from 'react';

import { useFullWidth } from '../context/FullWidthContext';
import { useTheme } from '../context/ThemeContext';
import { LexicalEditor } from '../lexical';

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

const MOCK_PROVIDER: DemoProviderConfig = {
  id: 'aimock',
  name: 'aimock (local)',
  type: 'openai-compatible',
  apiKey: 'sk-mock',
  baseUrl: 'http://localhost:4010/v1',
  models: ['mock-gpt-4o'],
};

const MOCK_SELECTED: SelectedModel = {
  providerId: 'aimock',
  modelId: 'mock-gpt-4o',
  providerType: 'openai-compatible',
};

function isMockEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('mock');
}

function loadProviders(): DemoProviderConfig[] {
  if (isMockEnabled()) return [MOCK_PROVIDER];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROVIDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadSelectedModel(): SelectedModel | null {
  if (isMockEnabled()) return MOCK_SELECTED;
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

let __blockCounter = 0;
function bid(explicit?: string) {
  if (explicit) return explicit;
  __blockCounter += 1;
  return `b-${String(__blockCounter).padStart(3, '0')}`;
}

function textNode(text: string, format = 0) {
  return {
    type: 'text',
    text,
    detail: 0,
    format,
    mode: 'normal',
    style: '',
    version: 1,
  };
}

function paragraph(text: string, blockId?: string) {
  return {
    type: 'paragraph',
    children: [textNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    textFormat: 0,
    textStyle: '',
    $: { blockId: bid(blockId) },
  };
}

function heading(text: string, tag: 'h1' | 'h2' | 'h3' = 'h2', blockId?: string) {
  return {
    type: 'heading',
    children: [textNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    tag,
    textFormat: 0,
    textStyle: '',
    $: { blockId: bid(blockId) },
  };
}

function listItem(text: string) {
  return {
    type: 'listitem',
    children: [textNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    value: 1,
  };
}

function bulletList(items: string[], blockId?: string) {
  return {
    type: 'list',
    children: items.map((t) => listItem(t)),
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    listType: 'bullet',
    start: 1,
    tag: 'ul',
    $: { blockId: bid(blockId) },
  };
}

function quote(text: string, blockId?: string) {
  return {
    type: 'quote',
    children: [textNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    $: { blockId: bid(blockId) },
  };
}

const initialContent: SerializedEditorState = {
  root: {
    type: 'root',
    children: [
      heading('AI Agent Demo', 'h1'),
      paragraph(
        'This is a demo of the AI agent extension. The agent can insert, replace, and delete blocks in the document via tool calling. The sample text below is deliberately long so you can exercise the diff review overlay across scroll positions, resize events, and image-load reflows.',
      ),
      paragraph(
        'Try typing a message in the chat panel to interact with the agent. The agent will propose changes as inline diffs that you can accept or reject. When multiple changes land on the same stretch of content you should see the preview panels stack without colliding.',
      ),

      heading('1. Architecture Overview', 'h2'),
      paragraph(
        'The agent extension is composed of three collaborating layers: the agent-core package provides transport and tool routing; the agent-chat package ships a ChatPanel UI that is opinionated yet themable; and the ext-ai-agent package wires Lexical plugins that mediate between conversational turns and block-level document operations.',
      ),
      paragraph(
        'Each turn of the conversation emits a batch of operations. Batches arrive as atomic proposals and are persisted in the AgentStore so the review overlay can render them independently of the underlying editor state. Operations are canonicalised into insert / replace / delete primitives with a stable block-id anchor system so subsequent edits in the editor do not desynchronise the overlay.',
      ),
      quote(
        'Design goal: treat the editor as the ground truth and the overlay as a deferred projection. The overlay never mutates the document directly — it always routes through editor.update() so history, collaborators, and plugins see the same transactional boundary.',
      ),

      heading('2. Diff Review Overlay', 'h2'),
      paragraph(
        'The DiffReviewOverlayPlugin renders preview panels anchored to the nearest stable block. Each panel is positioned absolutely inside the editor container and tracks its anchor via rect measurement. When multiple inserts target the same anchor, the plugin stacks them with an accumulated margin so the preview stream reads top-to-bottom in document order.',
      ),
      bulletList([
        'Insert previews appear before or after the anchor block.',
        'Replace previews overlay the original block while it is visually suppressed.',
        'Delete previews decorate the original block in place with a strikethrough treatment.',
        'Batches are grouped in a floating bar for bulk accept / reject.',
      ]),
      paragraph(
        'Positioning uses a two-phase algorithm. The first phase writes accumulated margins onto anchor blocks; the second phase reads rectangles from the now-laid-out DOM and translates each panel into its final top offset. A requestAnimationFrame scheduled second pass absorbs any chained offsets introduced by the first pass, so panels settle without visible jitter even when several overlays share a neighbouring region.',
      ),

      heading('3. Positioning Invariants', 'h2'),
      paragraph(
        'Several input signals can invalidate panel positions: editor updates that change block height, image and embed load events, font loading, window resize, scroll, and overlay panels whose own content changes. Each of these signals is bridged to a single scheduleReposition entry point that is rAF-coalesced to keep work off the critical input path.',
      ),
      paragraph(
        'The ResizeObserver observes the preview panels themselves, the anchor block elements, and the container element. A capture-phase window scroll listener captures nested scroll containers as well. Together these give full coverage of the cases where visual layout can drift without the React tree re-rendering, which previously left panels stuck at stale positions.',
      ),
      quote(
        'Rule of thumb: if the measurement could change without a React render, attach an observer or listener. Never rely on a re-render as a side effect of unrelated state changes to keep the overlay aligned.',
      ),

      heading('4. Styling Philosophy', 'h2'),
      paragraph(
        'Preview panels are deliberately not rendered with the host variant styles. An article-variant heading is tuned for document reading at scale, with generous top and bottom margins, a larger font size, and loose line-height. Those choices are appropriate in the running text but fight for space inside a compact preview panel, where the reader needs to scan a delta rather than settle into the flow.',
      ),
      paragraph(
        'The diffCompact scope applies a tight typographic reset. Headings are flattened to body size while retaining weight to preserve semantic hierarchy. Paragraphs, lists, quotes, and pre blocks use small uniform margins. Lists use a narrower indent and no inter-item spacing so multi-bullet changes read as a single cohesive cell. Images are constrained to the preview width to avoid horizontal overflow.',
      ),
      bulletList([
        'Tight margins on all block-level elements.',
        'Flattened heading scale (semantic weight preserved).',
        'Reduced list indent for dense bullet change sets.',
        'Constrained media width to respect preview width.',
      ]),

      heading('5. Testing Surface Area', 'h2'),
      paragraph(
        'Several scenarios should all render and behave correctly in the overlay. Scroll the editor to an arbitrary offset and issue an agent change: the preview should land on the correct anchor. Resize the window after the overlay is on screen: the preview should track its anchor in real time. Trigger an image-load reflow above an overlay: the preview should follow the anchor downward without flicker.',
      ),
      paragraph(
        'Chained overlays deserve special attention. When two inserts target consecutive anchors, the second panel must account for the first panel’s height so that the anchor block below receives enough margin to clear both. The two-phase positioning pass plus the rAF second pass handles this case; regression tests should exercise three or more stacked overlays at the same anchor.',
      ),

      heading('6. Performance Notes', 'h2'),
      paragraph(
        'All reposition work is rAF-coalesced. A burst of events — a resize gesture, a scroll trajectory, multiple overlay resizes within the same frame — collapses into a single reposition call. getBoundingClientRect is called once per panel per frame, which is adequate for realistic document sizes.',
      ),
      paragraph(
        'The observer set is rebuilt whenever the overlays collection changes. This keeps the observer set tight and avoids leaking observations of stale DOM nodes that have been removed from the tree after edits. The tradeoff is a small cost on overlay collection change, which is infrequent compared to scroll and resize events.',
      ),

      heading('7. Edge Cases', 'h2'),
      bulletList([
        'Anchor block removed by an external edit — the overlay entry gracefully drops.',
        'Anchor block replaced with an incompatible node — the overlay entry re-resolves by block id on the next store tick.',
        'Preview panel grows asynchronously due to media — ResizeObserver triggers a reposition.',
        'Rapid agent turns — overlay rebuilds atomically per batch, avoiding partial-state flicker.',
      ]),
      paragraph(
        'Together, these guarantees make the overlay safe to present as the primary review surface for AI-authored edits. The document remains the source of truth; the overlay is a deterministic, side-effect-free projection that can be dismissed without leaving behind any state in the document.',
      ),

      heading('8. Getting Started', 'h2'),
      paragraph(
        'Configure a provider in the agent extensions page, pick a model, and start chatting. A plain prompt such as "add a section about caching" should yield an insert operation; "rewrite the intro to be more concise" should yield a replace; "remove the third paragraph" should yield a delete. Each produces a distinct overlay treatment that you can accept or reject individually or in bulk.',
      ),
      paragraph(
        'Use the full-width toggle in the demo sidebar to give the editor more horizontal room — the overlay is designed to work at narrow and wide column widths alike. You can also switch the theme to verify that the diff color tokens follow the active color scheme without additional wiring.',
      ),
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
  const editorRef = useRef<LexicalEditorInstance | null>(null);
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
          <LexicalEditor
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
          </LexicalEditor>
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
  editorRef: React.RefObject<LexicalEditorInstance | null>;
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
  editorRef: React.RefObject<LexicalEditorInstance | null>;
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
  useFullWidth();
  const store = useMemo(() => createAgentStore(), []);

  return <AgentEditorWithChat store={store} />;
}
