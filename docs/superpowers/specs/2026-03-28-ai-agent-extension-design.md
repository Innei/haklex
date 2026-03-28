# AI Agent Extension Design Spec

## Overview

Lexical editor AI agent extension. Three packages: headless core (protocol + primitives), editor integration (diff UI + action registry), and chat UI (conversation panel).

Agent runs client-side, operates on Lexical editor state via structured commands, presents changes as inline diff with per-change accept/reject.

**V1 scope limitation**: Operations target **root-level blocks only**. Nested editor content (Banner, Grid, etc.) is not addressable by the agent in v1. This constraint applies across the entire protocol, action, and selection system.

## Architecture: Command-Driven

```
User triggers action
  → AgentExecutor builds message pipeline
  → LLM returns tool_calls via function calling
  → Each tool_call dispatched to registered AgentToolConfig
  → Document tools accumulate AgentOperation[]
  → DiffEngine generates DiffState
  → Inline diff rendered in editor
  → User accept/reject per-change
```

LLM provider injected by consumer. No SDK bundled.

## Packages

### `@haklex/rich-agent-core`

Headless, zero React. Protocol + primitives + diff engine + vanilla store.

```
packages/rich-agent-core/
├── src/
│   ├── index.ts
│   ├── types.ts              # AgentOperation, NodePosition, DiffEntry, DiffState
│   ├── protocol.ts           # LLMProvider, ChatMessage, LLMChunk, ToolSchema, MessagePipeline
│   ├── diff-engine.ts        # createDiffEngine, acceptDiff, rejectDiff
│   ├── document-tools.ts     # createDocumentTools(editor) → AgentToolConfig[]
│   ├── agent-executor.ts     # createAgentExecutor: LLM loop, tool_call → operations
│   ├── snapshot.ts           # createSnapshot, conflict detection
│   ├── registry.ts           # registerAgentTool, getAgentTools (executor-scoped)
│   └── store.ts              # createAgentStore: vanilla pub/sub store for cross-component state
```

Dependencies:

- `@haklex/rich-editor: workspace:*` (peer — for `blockIdState` from `plugins` entry)
- `lexical: ^0.42.0` (peer)

Note: `blockIdState` is defined in `@haklex/rich-editor` (`packages/rich-editor/src/plugins/BlockIdPlugin.tsx`), exported via `@haklex/rich-editor/plugins`. Core imports it as a peer dependency. Future refactor may move `blockIdState` to `@haklex/rich-headless`.

### `@haklex/rich-ext-ai-agent`

Editor integration. Diff nodes, renderers, action registry, agent panel plugin.

```
packages/rich-ext-ai-agent/
├── src/
│   ├── index.ts
│   ├── static.ts
│   ├── nodes/
│   │   ├── AgentDiffNode.ts
│   │   └── AgentDiffEditNode.ts
│   ├── renderers/
│   │   ├── AgentDiffRenderer.tsx
│   │   └── AgentDiffEditRenderer.tsx
│   ├── plugins/
│   │   └── AgentPanelPlugin.tsx
│   ├── components/
│   │   ├── DiffOverlay.tsx
│   │   └── AgentActionBar.tsx
│   ├── hooks/
│   │   └── useAgentLoop.ts
│   ├── registry.ts
│   └── styles.css.ts
```

Dependencies:

- `@haklex/rich-agent-core: workspace:*`
- `@haklex/rich-editor: workspace:*`
- `@haklex/rich-editor-ui: workspace:*`
- `@haklex/rich-style-token: workspace:*`
- Peers: `lexical`, `@lexical/react`, `react`

### `@haklex/rich-agent-chat`

Standalone chat panel. No editor dependency.

```
packages/rich-agent-chat/
├── src/
│   ├── index.ts
│   ├── ChatPanel.tsx
│   ├── ChatMessageList.tsx
│   ├── ChatInput.tsx
│   ├── types.ts
│   ├── context.ts
│   └── styles.css.ts
```

Dependencies:

- `@haklex/rich-agent-core: workspace:*`
- `@haklex/rich-style-token: workspace:*`
- Peer: `react >= 19`

Initial scope: render 5 bubble types (user, assistant, tool_call, tool_result, error), assistant streaming, input box. Subscribes to `AgentStore` from core for state.

## §1 Operation Protocol

### AgentOperation

```typescript
type NodePosition =
  | { type: 'after'; blockId: string }
  | { type: 'before'; blockId: string }
  | { type: 'root'; index?: number };

type AgentOperation =
  | { op: 'insert'; position: NodePosition; node: SerializedLexicalNode }
  | { op: 'replace'; blockId: string; node: SerializedLexicalNode }
  | { op: 'delete'; blockId: string };
```

Uses existing `blockIdState` from `BlockIdPlugin` (packages/rich-editor/src/plugins/BlockIdPlugin.tsx). Stable `nanoid(8)` IDs persisted in node `$` property. No new ID system needed.

**Root-level only**: `blockId` addresses root children of the editor. Nested content (Banner cells, Grid cells) is opaque to the agent — the agent operates on the outer container node as a whole.

### SelectionSnapshot

```typescript
type SelectionSnapshot = {
  text: string;
  // blockId-based addressing (not nodeKey)
  anchorBlockId: string;
  anchorOffset: number;
  focusBlockId: string;
  focusOffset: number;
};
```

When selection spans nested editor content, the snapshot reports the **root-level container's blockId** that contains the selection. The agent sees only the outer block.

### AgentContext

```typescript
type AgentContext = {
  selection: SelectionSnapshot | null;
  getBlockByBlockId: (blockId: string) => SerializedLexicalNode | null;
  getDocumentStructure: () => SerializedEditorState;
};
```

### LLM Provider (consumer-injected)

```typescript
type TextContent = { type: 'text'; text: string };
type ImageContent = { type: 'image'; url: string };

type ChatMessage =
  | { role: 'system'; content: string; cacheBreakpoint?: boolean }
  | { role: 'user'; content: string; cacheBreakpoint?: boolean }
  | { role: 'assistant'; content: string }
  | { role: 'assistant_tool_call'; toolCalls: ToolCall[] }
  | { role: 'tool_result'; toolCallId: string; content: string; isError?: boolean };

type ToolCall = {
  id: string;
  name: string;
  arguments: string; // JSON string
};

type ToolSchema = {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON Schema object
};

type LLMChunk =
  | { type: 'text'; text: string }
  | { type: 'tool_call'; id: string; name: string; arguments: string }
  | { type: 'done' };

type LLMProvider = {
  chat: (messages: ChatMessage[], tools?: ToolSchema[]) => AsyncIterable<LLMChunk>;
};
```

`cacheBreakpoint` translated by provider adapters to SDK-specific cache directives (e.g., Anthropic `cache_control: { type: 'ephemeral' }`). Only `system` and `user` messages support breakpoints — these are the stable prefix layers.

## §2 Diff Engine

### DiffState

```typescript
type DiffEntry = {
  id: string;
  op: AgentOperation;
  status: 'pending' | 'accepted' | 'rejected';
  originalNode?: SerializedLexicalNode;
};

type DiffState = {
  entries: DiffEntry[];
  getByBlockId: (blockId: string) => DiffEntry | undefined;
  getPending: () => DiffEntry[];
};
```

### DiffEngine API

```typescript
function createDiffEngine(
  operations: AgentOperation[],
  editorState: SerializedEditorState,
): DiffState;
function acceptDiff(state: DiffState, entryId: string): DiffState;
function rejectDiff(state: DiffState, entryId: string): DiffState;
function acceptAllDiffs(state: DiffState): DiffState;
function rejectAllDiffs(state: DiffState): DiffState;
```

`acceptAllDiffs`/`rejectAllDiffs` are UI convenience — they iterate entries sequentially in document order, not a batch transaction. Each accept/reject is an independent operation.

### Apply logic

- `accept insert`: insert node at target position, assign new blockId via `$setState(node, blockIdState, nanoid(8))`
- `accept replace`: find node by blockId, replace with new node, **preserve original blockId** via `$setState(newNode, blockIdState, originalBlockId)` to maintain identity continuity
- `accept delete`: find node by blockId, remove
- `reject`: mark `status: 'rejected'`, no editor mutation
- All entries resolved: clear diff state

### Diff-period mutation prevention

While diff entries are pending, the editor prevents mutation of affected blocks via **node transform**:

- For `replace` and `delete` entries: register node transform on the target block's node type. If the node's blockId matches a pending entry, revert the mutation (restore from snapshot).
- For `insert` entries: the anchor block (the block referenced in `position.after` / `position.before`) is also protected by the same transform, preventing position drift.

This is block-scoped — unaffected blocks remain freely editable. This approach avoids the Lexical `editable` flag which is editor-wide.

## §3 Diff UI

Follows static/edit split convention.

### Nodes

- `AgentDiffNode extends DecoratorNode` — static, renders diff markers only
- `AgentDiffEditNode extends AgentDiffNode` — edit variant, adds accept/reject buttons

### Rendering strategy

- **insert**: new block with green semi-transparent background, `+` marker
- **delete**: original block with red strikethrough + semi-transparent, `-` marker
- **replace**: original content red strikethrough + new content green overlay, adjacent vertically

Per-entry: `Accept` / `Reject` buttons on right side.
Batch: `Accept All` / `Reject All` bar at document top or floating.

### Styling

Vanilla Extract (`styles.css.ts`). CSS variables for theme adaptation:

- `--agent-diff-insert-bg`
- `--agent-diff-delete-bg`

Buttons reuse `@haklex/rich-editor-ui` Popover/Button components.

## §4 Action & Tool Extension

### Action Registry (UI layer, rich-ext-ai-agent)

```typescript
type AgentActionConfig = {
  name: string;
  description: string;
  icon?: ReactNode;
  placement?: ('toolbar' | 'floating' | 'slash')[];
  when?: 'always' | 'selection';
  prompt: string | ((context: AgentContext) => string);
};
```

Actions define "what to do" (prompt). AgentExecutor handles LLM + tool loop. Action authors write prompts only.

Built-in actions (v1):

- **Edit Selection**: `when: 'selection'`, `placement: ['floating']` — limited to root-level block selections
- **Insert Below**: `when: 'always'`, `placement: ['slash']`

### Tool Registry (agent reasoning layer, rich-agent-core)

Tools are **executor-scoped**, not process-global. Each `AgentExecutor` instance owns its tool set. This supports multiple editor instances on the same page.

```typescript
type AgentToolResult = { ok: true; content: string } | { ok: false; error: ToolError };

type ToolError = {
  error: 'block_modified' | 'block_not_found' | string;
  blockId?: string;
  message: string;
  currentContent?: string;
};

type AgentToolConfig = {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON Schema
  execute: (params: unknown) => Promise<AgentToolResult>;
};
```

### Built-in Document Tools

`createDocumentTools(editor)` produces 5 tools:

1. `read_selection` — return current selection text + blockId range
2. `insert_node` — params: `{ position, node }` → insert operation
3. `replace_node` — params: `{ blockId, node }` → replace operation, returns `ToolError` if block content differs from snapshot
4. `delete_node` — params: `{ blockId }` → delete operation, returns `ToolError` if block content differs from snapshot
5. `search_document` — params: `{ query, blockType? }` → matching root-level blocks with blockId + content

### Action vs Tool

Actions = user-facing ("do what"), Tools = agent-facing ("can use what"). Independently registered, orthogonally composed.

```
Action (user)          Tool (agent)
  ↓ prompt              ↓ LLM function calling
  AgentExecutor ←——→ LLM ←——→ Tools
       ↓
  AgentOperation[]
       ↓
  DiffEngine → UI
```

## §5 Message Pipeline

### Layer structure

```
Layer 1: System Prompt          ← cross-loop cacheable
  - system messages (may be multiple ChatMessage[])
  - Agent role + behavior
  - Output format constraints
  - cacheBreakpoint on last system message

Layer 2: Action Prompt          ← stable within loop
  - user message: action prompt template + user instructions
  - cacheBreakpoint: true

Layer 3: Conversation Turns     ← grows per turn
  - First user message: document snapshot + selection (locked for loop)
  - Subsequent: assistant_tool_call ↔ tool_result
```

Tool schemas are passed as the `tools` parameter of `LLMProvider.chat()`, separate from message content. They are part of the LLM API call, not inlined into prompts.

### Snapshot lifecycle

Snapshot is bound to a single Agent Loop:

- **Loop start**: capture current editor state as snapshot
- **Loop duration**: snapshot locked, all conflict detection runs against it
- **Loop end** (agent done or user abort): snapshot released
- **Next loop**: fresh snapshot from current editor state

Cache hit within loop: Layer 1 + 2 + Layer 3 first message are constant prefix. Only new turns appended.

### Conflict detection

When tool executes (insert/replace/delete), executor compares target block's current editor content against snapshot:

- Content matches snapshot: proceed
- Content modified by user: return `ToolError`

```typescript
type ToolError = {
  error: 'block_modified' | 'block_not_found';
  blockId: string;
  message: string;
  currentContent?: string; // provided on block_modified
};
```

Agent recovery: on error, agent can call `search_document` tool to re-locate content, then retry with correct blockId.

### Document context strategy

```typescript
type DocumentContextOptions = {
  mode: 'full' | 'structure' | 'selection-window';
  windowSize?: number; // default 5
};
```

Default `selection-window`: full content for root-level blocks near selection, structure-only summary for distant blocks.

### Message construction

```typescript
type MessagePipeline = {
  systemMessages: ChatMessage[]; // Layer 1, last one has cacheBreakpoint
  actionPrompt: ChatMessage; // Layer 2, cacheBreakpoint
  turns: ChatMessage[]; // Layer 3
};

function buildMessages(pipeline: MessagePipeline): ChatMessage[] {
  return [...pipeline.systemMessages, pipeline.actionPrompt, ...pipeline.turns];
}
```

## §6 Chat UI

### ChatBubble types

```typescript
type ChatBubble =
  | { type: 'user'; content: string }
  | { type: 'assistant'; content: string; streaming?: boolean }
  | { type: 'tool_call'; toolName: string; params: Record<string, unknown> }
  | { type: 'tool_result'; toolName: string; success: boolean; summary: string }
  | { type: 'error'; message: string }
  | { type: 'diff_summary'; accepted: number; rejected: number; pending: number };
```

### Chat history vs message pipeline

- Chat history: all bubbles, accumulated across loops, for user review
- Message pipeline: rebuilt each loop, only current loop's system + action + turns
- Optional: inject previous loop summary into Layer 2 for cross-loop context

### AgentStore (vanilla pub/sub)

`ChatPanel` and `AgentPanelPlugin` are siblings — they cannot share React context. Instead, `@haklex/rich-agent-core` exports a vanilla store:

```typescript
type AgentStore = {
  getState: () => AgentStoreState;
  subscribe: (listener: (state: AgentStoreState) => void) => () => void;
  dispatch: (action: AgentStoreAction) => void;
};

type AgentStoreState = {
  status: 'idle' | 'running' | 'done';
  bubbles: ChatBubble[];
  diffState: DiffState | null;
};

function createAgentStore(): AgentStore;
```

Consumer wraps both components with the same store instance:

```typescript
const store = createAgentStore()

<div style={{ display: 'flex' }}>
  <RichEditor>
    <AgentPanelPlugin provider={myProvider} store={store} />
  </RichEditor>
  <ChatPanel store={store} />
</div>
```

Both components subscribe to the store. No shared React context needed.

## Package Dependency Graph

```
@haklex/rich-agent-chat (chat panel, standalone React)
├── @haklex/rich-agent-core
└── @haklex/rich-style-token

@haklex/rich-ext-ai-agent (editor integration, diff UI, actions)
├── @haklex/rich-agent-core
├── @haklex/rich-editor
├── @haklex/rich-editor-ui
└── @haklex/rich-style-token

@haklex/rich-agent-core (headless protocol + primitives + store)
├── @haklex/rich-editor (peer — for blockIdState)
└── lexical (peer)
```

Consumer injects `LLMProvider` — no LLM SDK bundled in any package.

## Out of Scope (v1)

- Nested editor content addressing (Banner/Grid cells) — agent sees outer container only
- Panel positioning/dragging/collapse animation
- Chat history persistence
- Cross-loop context summary injection
- Virtual document state (agent seeing post-operation state)
- Batch/transaction operations (acceptAll/rejectAll is sequential iteration, not atomic batch)
- Format text / wrap/unwrap / move node operations
- Persistent highlight/annotation marks
- Collaborative editing integration
