# rich-agent-chat Refactor Design

**Date:** 2026-04-03
**Goal:** Make `@haklex/rich-agent-chat` generic enough for direct integration in admin-vue3 (React-in-Vue bridge, shared React root with editor), while refining UI to shadcn/Vercel design style.

## Context

`rich-agent-chat` is currently demo-only. It needs to become a production-ready package consumed by admin-vue3 with full editor integration (tool calls, diff review). Provider configuration lives in mx-core backend; API requests go through backend proxy.

## 1. Provider Layer Refactor (`@haklex/rich-agent-core`)

### Transport Adapter Interface

```typescript
type TransportAdapter = (
  messages: ChatMessage[],
  tools: ToolSchema[] | undefined,
  model: string,
  signal: AbortSignal,
) => Promise<Response>;
```

### Built-in Transports

**DirectTransport** — browser direct to LLM API:

```typescript
function createDirectTransport(config: {
  baseUrl: string;
  apiKey: string;
  providerType: 'claude' | 'openai-compatible';
}): TransportAdapter;
```

**ProxyTransport** — browser to backend proxy:

```typescript
function createProxyTransport(config: {
  endpoint: string; // e.g. '/api/ai/chat'
  headers?: Record<string, string>; // auth token, etc.
}): TransportAdapter;
```

### Provider Factory

```typescript
function createProvider(config: {
  model: string;
  transport: TransportAdapter;
  providerType: 'claude' | 'openai-compatible';
}): LLMProvider;
```

- SSE parsing split by `providerType` (Claude / OpenAI parsers)
- Shared stream reader infrastructure
- Message format conversion (ChatMessage → API body) encapsulated per providerType
- Move existing `demo/src/providers/` logic into `rich-agent-core`

### `LLMProvider` Interface (unchanged)

```typescript
type LLMProvider = {
  chat: (messages: ChatMessage[], tools?: ToolSchema[]) => AsyncIterable<LLMChunk>;
};
```

Agent executor (`useAgentLoop`) requires zero changes.

## 2. Chat UI Refactor (`@haklex/rich-agent-chat`)

### Remove from Package

- **DirectToolBar** — move to `demo/` as demo-only component, not exported
- **SettingsModal** — remove entirely, provider config managed by consumer (mx-core backend)
- **`onProvidersChange` prop** — removed
- **`onRetryToolCall` prop** — removed (tool retry handled inside agent loop)
- Hardcoded model name regex in ModelSelector
- Hardcoded provider presets (Anthropic, OpenAI, etc. list)

### New ChatPanel Props

```typescript
interface ChatPanelProps {
  store: AgentStore;
  // Model selection
  providerGroups: ProviderGroup[];
  selectedModel: SelectedModel | null;
  onSelectModel: (selected: SelectedModel) => void;
  // Agent interaction
  onSend: (message: string) => void;
  onAbort: () => void;
  onRetry?: () => void;
  // Diff review
  onAcceptBatch?: (batchId: string) => void;
  onRejectBatch?: (batchId: string) => void;
}

interface ProviderGroup {
  id: string;
  name: string;
  icon?: React.ReactNode;
  models: ModelOption[];
  providerType: 'claude' | 'openai-compatible';
}

interface ModelOption {
  id: string;
  displayName: string; // consumer controls display name
  icon?: React.ReactNode;
}

interface SelectedModel {
  providerId: string;
  providerType: 'claude' | 'openai-compatible'; // needed by createProvider
  modelId: string;
}
```

### ModelSelector Changes

- Receives `ProviderGroup[]` — no hardcoded provider list
- Groups displayed by `ProviderGroup.name`
- Model display name from `ModelOption.displayName` (no regex formatting)
- No settings button (SettingsModal removed)
- Compact trigger at composer footer: `[dot] Model Name [chevron]`

## 3. UI Redesign — shadcn/Vercel Style

Reference mockup: `.superpowers/brainstorm/8061-1775221646/content/chat-ui-mockup.html`

### Message Bubbles

- **User**: right-aligned, dark background (accent/fg), rounded `18px 18px 4px 18px`
- **Assistant**: left-aligned, no background, content blends with page. Font 14px, line-height 1.7

### Thinking Chain

- Collapsed: sparkles icon + "Thinking" + duration + chevron. Color: text-tertiary
- Streaming: 3 pulsing dots instead of bounce animation
- Expanded: steps in text-tertiary, no skeleton loaders for completed chains

### Tool Calls

- Flat row layout: status icon → mono tool name → description → duration → chevron
- Status icons: dot (pending), spinner (running), check (success), X (error)
- No colored backgrounds. Expand reveals params/result in monospace pre blocks
- Group counter removed; just sequential rows

### Diff Review

- Card with 1px border, rounded-sm
- Header: badge ("N changes") left, Accept/Reject buttons right
- Accept: solid accent button. Reject: outline with error color
- Hunks: monospace, add lines green-tinted bg, del lines red-tinted bg

### Composer

- Single rounded input box (border 1px, radius 12px)
- Textarea inside, placeholder "Message..."
- Send button (ArrowUp) embedded at right end of input box, rounded-sm, accent bg
- Running state: button switches to Stop (Square icon), error-colored outline
- Status line above input box: green dot + "Writing..." / "Thinking..."
- Below input box: model trigger (left) + keyboard hint (right)

### Color System

- Remove all hardcoded colors (`#22c55e`, `#ef4444`)
- Define semantic CSS variables or use existing `rich-style-token` vars
- Neutral palette: pure grays (no tinted grays)
- Error/success via semantic variables only

### Animation

- Remove bounce keyframes
- Thinking dots: simple opacity pulse
- Streaming: blinking cursor (2px bar)
- Transitions: 150ms ease on borders/opacity only

## 4. Agent Loop Integration

`@haklex/rich-ext-ai-agent` `useAgentLoop` remains unchanged. Admin integration:

```typescript
// In admin-vue3 React bridge
const transport = createProxyTransport({
  endpoint: '/api/ai/chat',
  headers: { Authorization: `Bearer ${token}` },
});
const provider = createProvider({
  model: selectedModel.modelId,
  transport,
  providerType: selectedModel.providerType,
});
const { run, abort } = useAgentLoop({ provider, store });
```

Demo continues to use `createDirectTransport` with API key.

## 5. Package Boundary Summary

| Package             | Changes                                                                            |
| ------------------- | ---------------------------------------------------------------------------------- |
| `rich-agent-core`   | Add `createProvider`, `createDirectTransport`, `createProxyTransport`, SSE parsers |
| `rich-agent-chat`   | Remove DirectToolBar/SettingsModal, new props interface, full UI redesign          |
| `rich-ext-ai-agent` | No changes                                                                         |
| `demo/`             | Move DirectToolBar here, update AgentPage to use new APIs                          |

## 6. Admin Integration Pattern

```
admin-vue3 (Vue 3)
└── React-in-Vue bridge (shared React root)
    ├── RichEditor (existing)
    └── ChatPanel (new)
        ├── providerGroups from backend API
        ├── selectedModel from local state
        ├── useAgentLoop with ProxyTransport → /api/ai/chat
        └── Editor context shared via React tree
```

Backend (mx-core) provides:

- `GET /api/ai/providers` — returns `ProviderGroup[]` (no API keys)
- `POST /api/ai/chat` — proxy to LLM, accepts model + messages + tools, streams SSE back
