# Tool Call UI Refine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign tool call and thinking UI from card-based to minimal row-based layout, with store-level `tool_call_group` bubble type and real-time per-item status updates.

**Architecture:** Three-layer change: (1) `rich-agent-core` store types + actions + executor rewrite, (2) `rich-agent-chat` new components (ToolCall, ToolCallGroup, ThinkingChain) replacing old ones, (3) new Vanilla Extract row-based styles replacing the collapsedBar system.

**Tech Stack:** TypeScript, Zustand vanilla store, React, Vanilla Extract CSS-in-TS, lucide-react icons.

---

## File Map

### `@haklex/rich-agent-core`

| File                           | Action | Responsibility                                                                 |
| ------------------------------ | ------ | ------------------------------------------------------------------------------ |
| `src/initialState.ts`          | Modify | Add `ToolCallGroupBubble`, `ToolCallGroupItem`, enhance `ThinkingBubble` types |
| `src/protocol.ts`              | Modify | Add `describeCall?` to `AgentToolConfig`                                       |
| `src/store-actions.ts`         | Modify | Add `updateToolCallItem` action                                                |
| `src/agent-executor.ts`        | Modify | Rewrite tool call loop + thinking flow                                         |
| `src/index.ts`                 | Modify | Export new types                                                               |
| `tests/store.test.ts`          | Modify | Add `updateToolCallItem` tests                                                 |
| `tests/agent-executor.test.ts` | Modify | Update assertions for new bubble shapes                                        |

### `@haklex/rich-agent-chat`

| File                                | Action | Responsibility                                    |
| ----------------------------------- | ------ | ------------------------------------------------- |
| `src/components/ToolCall.tsx`       | Create | Single tool call row component                    |
| `src/components/ToolCallGroup.tsx`  | Create | Nested group container component                  |
| `src/components/ThinkingChain.tsx`  | Create | Thinking steps component (replaces ThinkingBlock) |
| `src/components/ToolCallBubble.tsx` | Delete | Replaced by ToolCall + ToolCallGroup              |
| `src/components/ThinkingBlock.tsx`  | Delete | Replaced by ThinkingChain                         |
| `src/ChatMessageList.tsx`           | Modify | Update mergeBubbles + render switch               |
| `src/styles.css.ts`                 | Modify | Remove collapsedBar, add row-based styles         |

---

### Task 1: Store types — Add `ToolCallGroupBubble` and enhance `ThinkingBubble`

**Files:**

- Modify: `packages/rich-agent-core/src/initialState.ts`
- Modify: `packages/rich-agent-core/src/index.ts`

- [ ] **Step 1: Write failing test for new bubble types**

Add to `packages/rich-agent-core/tests/store.test.ts`:

```typescript
it('accepts tool_call_group bubble', () => {
  const store = createAgentStore();
  store.getState().addBubble({
    type: 'tool_call_group',
    id: 'g1',
    items: [
      {
        id: 'tc1',
        toolName: 'replace_node',
        description: 'replacing paragraph at block-3',
        params: { blockId: 'p3' },
        status: 'pending',
      },
    ],
  });
  expect(store.getState().bubbles).toHaveLength(1);
  const bubble = store.getState().bubbles[0];
  expect(bubble.type).toBe('tool_call_group');
  if (bubble.type === 'tool_call_group') {
    expect(bubble.items[0].status).toBe('pending');
  }
});

it('accepts enhanced thinking bubble with steps', () => {
  const store = createAgentStore();
  store.getState().addBubble({
    type: 'thinking',
    content: 'Step one.\n\nStep two.',
    id: 'th1',
    rawText: 'Step one.\n\nStep two.',
    steps: ['Step one.', 'Step two.'],
    isStreaming: false,
  });
  const bubble = store.getState().bubbles[0];
  expect(bubble.type).toBe('thinking');
  if (bubble.type === 'thinking') {
    expect(bubble.steps).toEqual(['Step one.', 'Step two.']);
  }
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run packages/rich-agent-core/tests/store.test.ts`
Expected: TypeScript compilation errors — `tool_call_group` not in `ChatBubble` union, `ThinkingBubble` missing `id`/`rawText`/`steps`/`isStreaming`.

- [ ] **Step 3: Update `initialState.ts` with new types**

Replace the content of `packages/rich-agent-core/src/initialState.ts`:

```typescript
import type { ReviewState } from './review-types';
import type { DiffState } from './types';

export type ToolCallItemStatus = 'pending' | 'running' | 'completed' | 'error';

export type ToolCallGroupItem = {
  id: string;
  toolName: string;
  description?: string;
  params: Record<string, unknown>;
  status: ToolCallItemStatus;
  result?: string;
  resultPreview?: string;
  error?: string;
  startedAt?: number;
  finishedAt?: number;
};

export type ChatBubble =
  | { type: 'user'; content: string }
  | { type: 'assistant'; content: string; streaming?: boolean }
  | { type: 'tool_call'; toolName: string; params: Record<string, unknown> }
  | { type: 'tool_result'; toolName: string; success: boolean; summary: string }
  | {
      type: 'thinking';
      content: string; // legacy compat — kept for old bubbles, new code sets to rawText
      id?: string;
      rawText?: string;
      steps?: string[];
      isStreaming?: boolean;
    }
  | { type: 'tool_call_group'; id: string; items: ToolCallGroupItem[] }
  | { type: 'error'; message: string }
  | { type: 'diff_summary'; accepted: number; rejected: number; pending: number }
  | { type: 'diff_review'; batchId: string };

export type AgentStoreStatus =
  | 'idle'
  | 'running'
  | 'thinking'
  | 'calling_tool'
  | 'writing'
  | 'done';

export type AgentStoreState = {
  status: AgentStoreStatus;
  bubbles: ChatBubble[];
  diffState: DiffState | null;
  reviewState: ReviewState | null;
};

export function createInitialAgentStoreState(): AgentStoreState {
  return {
    status: 'idle',
    bubbles: [],
    diffState: null,
    reviewState: null,
  };
}
```

Note: The `thinking` variant uses a single shape with optional fields for backward compat. New code always sets `id`, `rawText`, `steps`, `isStreaming` and sets `content` to the same value as `rawText`. The renderer checks for `id` presence to decide which rendering path.

- [ ] **Step 4: Export new types from `index.ts`**

In `packages/rich-agent-core/src/index.ts`, add to the existing exports:

```typescript
export type { ToolCallGroupItem, ToolCallItemStatus } from './initialState';
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run packages/rich-agent-core/tests/store.test.ts`
Expected: All tests PASS, including the two new ones.

- [ ] **Step 6: Commit**

```bash
git add packages/rich-agent-core/src/initialState.ts packages/rich-agent-core/src/index.ts packages/rich-agent-core/tests/store.test.ts
git commit -m "feat(agent-core): add ToolCallGroupBubble and enhance ThinkingBubble types"
```

---

### Task 2: Protocol — Add `describeCall` to `AgentToolConfig`

**Files:**

- Modify: `packages/rich-agent-core/src/protocol.ts`

- [ ] **Step 1: Add `describeCall` to `AgentToolConfig`**

In `packages/rich-agent-core/src/protocol.ts`, update the `AgentToolConfig` type:

```typescript
export type AgentToolConfig = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (params: unknown) => Promise<AgentToolResult>;
  describeCall?: (params: unknown) => string;
};
```

- [ ] **Step 2: Add `describeCall` to built-in document tools**

In `packages/rich-agent-core/src/document-tools.ts`, add `describeCall` to each tool. Examples:

For `readSelectionTool`, add after `parameters`:

```typescript
describeCall: () => 'reading current selection',
```

For `insertNodeTool`:

```typescript
describeCall: (params: unknown) => {
  const p = params as { position?: { type?: string; blockId?: string } };
  const pos = p.position;
  return pos?.blockId ? `inserting ${pos.type} block "${pos.blockId}"` : 'inserting node';
},
```

For `replaceNodeTool`:

```typescript
describeCall: (params: unknown) => {
  const p = params as { blockId?: string };
  return p.blockId ? `replacing block "${p.blockId}"` : 'replacing node';
},
```

For `deleteNodeTool`:

```typescript
describeCall: (params: unknown) => {
  const p = params as { blockId?: string };
  return p.blockId ? `deleting block "${p.blockId}"` : 'deleting node';
},
```

For `searchDocumentTool`:

```typescript
describeCall: (params: unknown) => {
  const p = params as { query?: string; blockType?: string };
  const parts: string[] = [];
  if (p.query) parts.push(`"${p.query}"`);
  if (p.blockType) parts.push(`type=${p.blockType}`);
  return `searching ${parts.join(', ') || 'document'}`;
},
```

- [ ] **Step 3: Commit**

```bash
git add packages/rich-agent-core/src/protocol.ts packages/rich-agent-core/src/document-tools.ts
git commit -m "feat(agent-core): add describeCall to AgentToolConfig and built-in tools"
```

---

### Task 3: Store action — Add `updateToolCallItem`

**Files:**

- Modify: `packages/rich-agent-core/src/store-actions.ts`
- Test: `packages/rich-agent-core/tests/store.test.ts`

- [ ] **Step 1: Write failing test**

Add to `packages/rich-agent-core/tests/store.test.ts`:

```typescript
it('updateToolCallItem patches an item by groupId and itemId', () => {
  const store = createAgentStore();
  store.getState().addBubble({
    type: 'tool_call_group',
    id: 'g1',
    items: [
      { id: 'tc1', toolName: 'read_selection', params: {}, status: 'pending' },
      { id: 'tc2', toolName: 'replace_node', params: { blockId: 'p1' }, status: 'pending' },
    ],
  });

  store.getState().updateToolCallItem('g1', 'tc1', {
    status: 'running',
    startedAt: 1000,
  });

  const bubble = store.getState().bubbles[0];
  if (bubble.type === 'tool_call_group') {
    expect(bubble.items[0].status).toBe('running');
    expect(bubble.items[0].startedAt).toBe(1000);
    expect(bubble.items[1].status).toBe('pending');
  }
});

it('updateToolCallItem completes an item with result', () => {
  const store = createAgentStore();
  store.getState().addBubble({
    type: 'tool_call_group',
    id: 'g1',
    items: [
      {
        id: 'tc1',
        toolName: 'delete_node',
        params: { blockId: 'p1' },
        status: 'running',
        startedAt: 1000,
      },
    ],
  });

  store.getState().updateToolCallItem('g1', 'tc1', {
    status: 'completed',
    result: 'Deleted block "p1"',
    resultPreview: 'Deleted block "p1"',
    finishedAt: 1050,
  });

  const bubble = store.getState().bubbles[0];
  if (bubble.type === 'tool_call_group') {
    expect(bubble.items[0].status).toBe('completed');
    expect(bubble.items[0].result).toBe('Deleted block "p1"');
    expect(bubble.items[0].finishedAt).toBe(1050);
  }
});

it('updateToolCallItem is a no-op for unknown groupId', () => {
  const store = createAgentStore();
  store.getState().addBubble({
    type: 'tool_call_group',
    id: 'g1',
    items: [{ id: 'tc1', toolName: 'x', params: {}, status: 'pending' }],
  });
  const before = store.getState().bubbles;
  store.getState().updateToolCallItem('unknown', 'tc1', { status: 'running' });
  expect(store.getState().bubbles).toBe(before);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run packages/rich-agent-core/tests/store.test.ts`
Expected: FAIL — `updateToolCallItem` is not a function.

- [ ] **Step 3: Implement `updateToolCallItem` in `store-actions.ts`**

Add to `AgentStoreActionMethods` interface:

```typescript
updateToolCallItem: (
  groupId: string,
  itemId: string,
  patch: Partial<import('./initialState').ToolCallGroupItem>,
) => void;
```

Add to `AgentStoreActionImpl` class:

```typescript
updateToolCallItem = (
  groupId: string,
  itemId: string,
  patch: Partial<import('./initialState').ToolCallGroupItem>,
) => {
  this.#set((state) => {
    const idx = state.bubbles.findIndex((b) => b.type === 'tool_call_group' && b.id === groupId);
    if (idx === -1) return {};

    const group = state.bubbles[idx] as Extract<
      (typeof state.bubbles)[number],
      { type: 'tool_call_group' }
    >;
    const itemIdx = group.items.findIndex((item) => item.id === itemId);
    if (itemIdx === -1) return {};

    const nextItems = [...group.items];
    nextItems[itemIdx] = { ...nextItems[itemIdx], ...patch };

    const nextBubbles = [...state.bubbles];
    nextBubbles[idx] = { ...group, items: nextItems };

    return { bubbles: nextBubbles };
  });
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run packages/rich-agent-core/tests/store.test.ts`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/rich-agent-core/src/store-actions.ts packages/rich-agent-core/tests/store.test.ts
git commit -m "feat(agent-core): add updateToolCallItem store action"
```

---

### Task 4: Executor — Rewrite tool call loop and thinking flow

**Files:**

- Modify: `packages/rich-agent-core/src/agent-executor.ts`
- Test: `packages/rich-agent-core/tests/agent-executor.test.ts`

- [ ] **Step 1: Write failing test for new tool_call_group emission**

Add to `packages/rich-agent-core/tests/agent-executor.test.ts`:

```typescript
it('emits tool_call_group bubble with per-item status updates', async () => {
  const store = createAgentStore();
  const snapshot = createSnapshot(makeEditorState() as any);

  let callCount = 0;
  const provider: LLMProvider = {
    async *chat() {
      callCount++;
      if (callCount === 1) {
        yield {
          type: 'tool_call' as const,
          id: 'tc1',
          name: 'search_document',
          arguments: JSON.stringify({ query: 'Hello' }),
        };
        yield {
          type: 'tool_call' as const,
          id: 'tc2',
          name: 'delete_node',
          arguments: JSON.stringify({ blockId: 'p1' }),
        };
        yield { type: 'done' as const };
      } else {
        yield { type: 'text' as const, text: 'Done.' };
        yield { type: 'done' as const };
      }
    },
  };

  const executor = createAgentExecutor({
    provider,
    snapshot,
    store,
    tools: [],
    systemMessages: [{ role: 'system', content: 'Agent' }],
  });

  await executor.run({ role: 'user', content: 'Do it' }, { role: 'user', content: 'Doc' });

  const groupBubbles = store.getState().bubbles.filter((b) => b.type === 'tool_call_group');
  expect(groupBubbles).toHaveLength(1);

  const group = groupBubbles[0];
  if (group.type === 'tool_call_group') {
    expect(group.items).toHaveLength(2);
    expect(group.items[0].toolName).toBe('search_document');
    expect(group.items[0].status).toBe('completed');
    expect(group.items[0].finishedAt).toBeGreaterThan(0);
    expect(group.items[1].toolName).toBe('delete_node');
    expect(group.items[1].status).toBe('completed');
  }
});

it('sets item status to error on JSON parse failure', async () => {
  const store = createAgentStore();
  const snapshot = createSnapshot(makeEditorState() as any);

  let callCount = 0;
  const provider: LLMProvider = {
    async *chat() {
      callCount++;
      if (callCount === 1) {
        yield {
          type: 'tool_call' as const,
          id: 'tc1',
          name: 'delete_node',
          arguments: '{bad json',
        };
        yield { type: 'done' as const };
      } else {
        yield { type: 'text' as const, text: 'Failed.' };
        yield { type: 'done' as const };
      }
    },
  };

  const executor = createAgentExecutor({
    provider,
    snapshot,
    store,
    tools: [],
    systemMessages: [{ role: 'system', content: 'Agent' }],
  });

  await executor.run({ role: 'user', content: 'Do it' }, { role: 'user', content: 'Doc' });

  const group = store.getState().bubbles.find((b) => b.type === 'tool_call_group');
  if (group?.type === 'tool_call_group') {
    expect(group.items[0].status).toBe('error');
    expect(group.items[0].error).toBeDefined();
  }
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run packages/rich-agent-core/tests/agent-executor.test.ts`
Expected: FAIL — no `tool_call_group` bubbles emitted (old executor emits flat `tool_call` bubbles).

- [ ] **Step 3: Rewrite executor tool call loop**

In `packages/rich-agent-core/src/agent-executor.ts`, replace the tool call section (after `if (toolCalls.length === 0) break;`).

Add a helper at the top of the file:

```typescript
function describeToolCall(
  tool: AgentToolConfig | undefined,
  params: Record<string, unknown>,
): string | undefined {
  if (tool?.describeCall) {
    try {
      return tool.describeCall(params);
    } catch {
      // fallback below
    }
  }
  const firstVal = Object.values(params)[0];
  return firstVal !== undefined ? String(firstVal).slice(0, 40) : undefined;
}

let groupCounter = 0;
function nextGroupId(): string {
  return `tcg-${++groupCounter}-${Date.now()}`;
}
```

Replace the tool execution block (lines ~113-137) with:

```typescript
turns.push({ role: 'assistant_tool_call', toolCalls });

setStatus('calling_tool');

// Build group items — all start as pending
const groupId = nextGroupId();
const items: Array<{
  id: string;
  toolName: string;
  description?: string;
  params: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: string;
  resultPreview?: string;
  error?: string;
  startedAt?: number;
  finishedAt?: number;
}> = [];

for (const tc of toolCalls) {
  let params: Record<string, unknown>;
  try {
    params = JSON.parse(tc.arguments);
  } catch {
    params = {};
  }
  items.push({
    id: tc.id,
    toolName: tc.name,
    description: describeToolCall(toolMap.get(tc.name), params),
    params,
    status: 'pending',
  });
}

addBubble({ type: 'tool_call_group', id: groupId, items });

// Execute each tool, updating item status in real-time
const { updateToolCallItem } = store.getState();

for (let i = 0; i < toolCalls.length; i++) {
  const tc = toolCalls[i];
  const item = items[i];

  updateToolCallItem(groupId, tc.id, {
    status: 'running',
    startedAt: Date.now(),
  });

  let result: AgentToolResult;
  let parsedParams: Record<string, unknown>;

  try {
    parsedParams = JSON.parse(tc.arguments);
  } catch (e) {
    updateToolCallItem(groupId, tc.id, {
      status: 'error',
      error: `JSON parse error: ${(e as Error).message}`,
      finishedAt: Date.now(),
    });
    turns.push({
      role: 'tool_result',
      toolCallId: tc.id,
      content: `JSON parse error: ${(e as Error).message}`,
      isError: true,
    });
    continue;
  }

  result = await executeTool(tc.name, tc.arguments);

  const content = result.ok ? result.content : JSON.stringify(result.error);

  updateToolCallItem(groupId, tc.id, {
    status: result.ok ? 'completed' : 'error',
    result: result.ok ? result.content : undefined,
    resultPreview: result.ok ? result.content.slice(0, 80) : undefined,
    error: !result.ok ? content : undefined,
    finishedAt: Date.now(),
  });

  turns.push({
    role: 'tool_result',
    toolCallId: tc.id,
    content,
    isError: !result.ok,
  });
}
```

- [ ] **Step 4: Rewrite thinking flow in executor**

In the same file, update the thinking handling. Replace the thinking chunk handler (around lines 79-83) and the surrounding logic.

Add a `splitSteps` helper at the top:

```typescript
function splitSteps(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
}

let thinkingCounter = 0;
function nextThinkingId(): string {
  return `th-${++thinkingCounter}-${Date.now()}`;
}
```

Replace the thinking chunk handler block:

```typescript
if (chunk.type === 'thinking') {
  thinkingAccum += chunk.text;
  if (!hasThinking) {
    hasThinking = true;
    thinkingId = nextThinkingId();
    // Replace the empty assistant bubble with a thinking bubble
    updateLastBubble({
      type: 'thinking',
      content: chunk.text,
      id: thinkingId,
      rawText: chunk.text,
      steps: [],
      isStreaming: true,
    });
  } else {
    updateLastBubble({
      type: 'thinking',
      content: thinkingAccum,
      id: thinkingId,
      rawText: thinkingAccum,
      steps: [],
      isStreaming: true,
    });
  }
  continue;
}
```

Declare `thinkingId` alongside other accumulators (near line 69):

```typescript
let thinkingId = '';
```

After the streaming loop ends, finalize thinking if it happened. Before the existing `updateLastBubble` for assistant text:

```typescript
if (hasThinking) {
  // Finalize the thinking bubble (it's the last bubble if no text followed)
  // If text did follow, the thinking bubble was already superseded by addBubble for assistant
  // Find and finalize the thinking bubble in the array
  const { bubbles } = store.getState();
  const thinkingIdx = bubbles.findIndex(
    (b) => b.type === 'thinking' && 'id' in b && b.id === thinkingId,
  );
  if (thinkingIdx !== -1) {
    const nextBubbles = [...bubbles];
    nextBubbles[thinkingIdx] = {
      type: 'thinking',
      content: thinkingAccum,
      id: thinkingId,
      rawText: thinkingAccum,
      steps: splitSteps(thinkingAccum),
      isStreaming: false,
    };
    store.setState({ bubbles: nextBubbles });
  }
}
```

- [ ] **Step 5: Run all executor tests**

Run: `npx vitest run packages/rich-agent-core/tests/agent-executor.test.ts`
Expected: All tests PASS, including old ones (text-only, abort) and new ones (group emission, JSON parse error).

- [ ] **Step 6: Run full store tests too**

Run: `npx vitest run packages/rich-agent-core/tests/store.test.ts`
Expected: All PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/rich-agent-core/src/agent-executor.ts packages/rich-agent-core/tests/agent-executor.test.ts
git commit -m "feat(agent-core): rewrite executor to emit tool_call_group with per-item updates"
```

---

### Task 5: CSS — Replace collapsedBar with row-based styles

**Files:**

- Modify: `packages/rich-agent-chat/src/styles.css.ts`

- [ ] **Step 1: Check which components use collapsedBar styles**

Search for imports of `collapsedBar` across the chat package. Expected consumers: `ToolCallBubble.tsx` and `ThinkingBlock.tsx` — both will be deleted. If any other file imports them, note it.

- [ ] **Step 2: Remove old styles and add new ones**

In `packages/rich-agent-chat/src/styles.css.ts`:

Remove these exports (lines ~54-119):

- `collapsedBar`
- `collapsedBarExpanded`
- `collapsedBarPanel`
- `collapsedBarSpinner`
- `collapsedBarArrow`
- `collapsedBarMeta`
- `collapsedBarDot`
- `thinkingContent`
- `toolCallRow` (old)
- `toolCallRetryButton`

Keep `spinAnimation` keyframe and `toolCallJson` (will be reused).

Add the following new styles at the location where the old ones were:

```typescript
// ── Tool Call Row System ──

export const toolCallRow = style({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  gap: 8,
  padding: '4px 0',
  fontSize: '13px',
  color: vars.color.textTertiary,
  cursor: 'default',
  transition: 'color 120ms ease',
  border: 'none',
  background: 'none',
  textAlign: 'left',
  fontFamily: 'inherit',
  lineHeight: 1.4,
  selectors: {
    '&[data-expandable="true"]': {
      cursor: 'pointer',
    },
    '&[data-expandable="true"]:hover': {
      color: vars.color.text,
    },
  },
});

export const toolCallStatusIcon = style({
  display: 'flex',
  width: 16,
  height: 16,
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

export const toolCallPendingDot = style({
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: vars.color.textQuaternary,
  opacity: 0.4,
});

export const toolCallName = style({
  fontFamily: vars.typography.fontMono,
  fontSize: '13px',
  flexShrink: 0,
});

export const toolCallDesc = style({
  color: vars.color.textQuaternary,
  fontSize: '13px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
  minWidth: 0,
});

export const toolCallDuration = style({
  fontFamily: vars.typography.fontMono,
  fontSize: '12px',
  color: vars.color.textQuaternary,
  opacity: 0.5,
  flexShrink: 0,
});

export const toolCallChevron = style({
  width: 12,
  height: 12,
  flexShrink: 0,
  color: vars.color.textQuaternary,
  opacity: 0.4,
  transition: 'transform 150ms ease',
  selectors: {
    '&[data-expanded="true"]': {
      transform: 'rotate(90deg)',
    },
  },
});

export const toolCallDetail = style({
  display: 'grid',
  transition: 'grid-template-rows 150ms ease',
  gridTemplateRows: '0fr',
  selectors: {
    '&[data-open="true"]': {
      gridTemplateRows: '1fr',
    },
  },
});

export const toolCallDetailInner = style({
  overflow: 'hidden',
});

export const toolCallDetailContent = style({
  paddingLeft: 24,
  paddingBottom: 8,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

export const toolCallResultPre = style({
  margin: 0,
  overflowX: 'auto',
  padding: 6,
  background: 'rgba(34, 197, 94, 0.05)',
  borderRadius: vars.borderRadius.sm,
  fontFamily: vars.typography.fontMono,
  fontSize: '11px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  color: '#22c55e',
});

export const toolCallErrorPre = style({
  margin: 0,
  overflowX: 'auto',
  padding: 6,
  background: 'rgba(239, 68, 68, 0.05)',
  borderRadius: vars.borderRadius.sm,
  fontFamily: vars.typography.fontMono,
  fontSize: '11px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  color: '#ef4444',
});

export const toolCallGroupItems = style({
  paddingLeft: 16,
  paddingTop: 2,
});

export const toolCallGroupCounter = style({
  fontFamily: vars.typography.fontMono,
  fontSize: '12px',
  color: vars.color.textQuaternary,
  opacity: 0.5,
});

// ── Thinking Chain ──

export const thinkingRow = style({
  'display': 'flex',
  'width': '100%',
  'alignItems': 'center',
  'gap': 8,
  'padding': '4px 0',
  'fontSize': '13px',
  'color': vars.color.textTertiary,
  'cursor': 'pointer',
  'transition': 'color 120ms ease',
  'border': 'none',
  'background': 'none',
  'textAlign': 'left',
  'fontFamily': 'inherit',
  'lineHeight': 1.4,
  ':hover': {
    color: vars.color.text,
  },
});

export const thinkingSteps = style({
  paddingLeft: 24,
  paddingTop: 4,
  paddingBottom: 8,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: '13px',
  color: vars.color.textTertiary,
  lineHeight: 1.6,
});

const bounceAnimation = keyframes({
  '0%, 100%': { transform: 'translateY(0)' },
  '50%': { transform: 'translateY(-3px)' },
});

export const bounceDot = style({
  width: 4,
  height: 4,
  borderRadius: '50%',
  background: vars.color.textTertiary,
  animation: `${bounceAnimation} 0.6s ease-in-out infinite`,
});

const pulseAnimation = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
});

export const thinkingSkeleton = style({
  height: 14,
  borderRadius: 4,
  background: vars.color.fillTertiary,
  animation: `${pulseAnimation} 1.5s ease-in-out infinite`,
});
```

- [ ] **Step 3: Lint the modified file**

Run: `npx eslint packages/rich-agent-chat/src/styles.css.ts --fix`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add packages/rich-agent-chat/src/styles.css.ts
git commit -m "refactor(agent-chat): replace collapsedBar with row-based tool call styles"
```

---

### Task 6: Component — Create `ToolCall.tsx`

**Files:**

- Create: `packages/rich-agent-chat/src/components/ToolCall.tsx`

- [ ] **Step 1: Create the ToolCall component**

Write `packages/rich-agent-chat/src/components/ToolCall.tsx`:

```tsx
import type { ToolCallGroupItem } from '@haklex/rich-agent-core';
import { Check, ChevronRight, Loader2, X } from 'lucide-react';
import type { ReactElement } from 'react';
import { useState } from 'react';

import {
  toolCallChevron,
  toolCallDesc,
  toolCallDetail,
  toolCallDetailContent,
  toolCallDetailInner,
  toolCallDuration,
  toolCallErrorPre,
  toolCallJson,
  toolCallName,
  toolCallPendingDot,
  toolCallResultPre,
  toolCallRow,
  toolCallStatusIcon,
} from '../styles.css';

interface ToolCallProps {
  item: ToolCallGroupItem;
  defaultExpanded?: boolean;
}

function StatusIcon({ status }: { status: ToolCallGroupItem['status'] }): ReactElement {
  return (
    <span className={toolCallStatusIcon}>
      {status === 'pending' && <span className={toolCallPendingDot} />}
      {status === 'running' && (
        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
      )}
      {status === 'completed' && <Check size={14} />}
      {status === 'error' && <X size={14} style={{ color: '#ef4444' }} />}
    </span>
  );
}

function formatDuration(item: ToolCallGroupItem): string | null {
  if (!item.startedAt || !item.finishedAt) return null;
  const ms = item.finishedAt - item.startedAt;
  return `${ms}ms`;
}

export function ToolCall({ item, defaultExpanded = false }: ToolCallProps): ReactElement {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasContent = Object.keys(item.params).length > 0 || item.result || item.error;
  const duration = formatDuration(item);

  const nameColor =
    item.status === 'error'
      ? '#ef4444'
      : item.status === 'running'
        ? undefined // inherits foreground
        : undefined; // muted handled by row default

  return (
    <div>
      <button
        className={toolCallRow}
        data-expandable={hasContent ? 'true' : 'false'}
        onClick={() => hasContent && setExpanded(!expanded)}
        type="button"
      >
        <StatusIcon status={item.status} />
        <span
          className={toolCallName}
          style={{
            color: nameColor,
            ...(item.status === 'running' ? { color: 'var(--hk-color-text)' } : {}),
          }}
        >
          {item.toolName}
        </span>
        {item.description && <span className={toolCallDesc}>{item.description}</span>}
        <span style={{ flex: 1, minWidth: 0 }} />
        {duration && <span className={toolCallDuration}>{duration}</span>}
        {hasContent && (
          <ChevronRight className={toolCallChevron} data-expanded={expanded} size={12} />
        )}
      </button>

      {hasContent && (
        <div className={toolCallDetail} data-open={expanded}>
          <div className={toolCallDetailInner}>
            <div className={toolCallDetailContent}>
              {Object.keys(item.params).length > 0 && (
                <pre className={toolCallJson}>{JSON.stringify(item.params, null, 2)}</pre>
              )}
              {item.result && <pre className={toolCallResultPre}>{item.result}</pre>}
              {item.error && <pre className={toolCallErrorPre}>{item.error}</pre>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npx eslint packages/rich-agent-chat/src/components/ToolCall.tsx --fix`
Expected: Clean.

- [ ] **Step 3: Commit**

```bash
git add packages/rich-agent-chat/src/components/ToolCall.tsx
git commit -m "feat(agent-chat): add ToolCall row component"
```

---

### Task 7: Component — Create `ToolCallGroup.tsx`

**Files:**

- Create: `packages/rich-agent-chat/src/components/ToolCallGroup.tsx`

- [ ] **Step 1: Create the ToolCallGroup component**

Write `packages/rich-agent-chat/src/components/ToolCallGroup.tsx`:

```tsx
import type { ToolCallGroupItem, ToolCallItemStatus } from '@haklex/rich-agent-core';
import { Check, ChevronRight, Loader2, X } from 'lucide-react';
import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';

import {
  toolCallChevron,
  toolCallGroupCounter,
  toolCallGroupItems,
  toolCallName,
  toolCallPendingDot,
  toolCallRow,
  toolCallStatusIcon,
} from '../styles.css';
import { ToolCall } from './ToolCall';

interface ToolCallGroupProps {
  id: string;
  items: ToolCallGroupItem[];
  defaultExpanded?: boolean;
}

function deriveGroupStatus(items: ToolCallGroupItem[]): ToolCallItemStatus {
  if (items.some((i) => i.status === 'error')) return 'error';
  if (items.some((i) => i.status === 'running')) return 'running';
  if (items.every((i) => i.status === 'completed')) return 'completed';
  if (items.some((i) => i.status === 'completed' || i.status === 'running')) return 'running';
  return 'pending';
}

function StatusIcon({ status }: { status: ToolCallItemStatus }): ReactElement {
  return (
    <span className={toolCallStatusIcon}>
      {status === 'pending' && <span className={toolCallPendingDot} />}
      {status === 'running' && (
        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
      )}
      {status === 'completed' && <Check size={14} />}
      {status === 'error' && <X size={14} style={{ color: '#ef4444' }} />}
    </span>
  );
}

export function ToolCallGroup({
  id,
  items,
  defaultExpanded = true,
}: ToolCallGroupProps): ReactElement {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const groupStatus = useMemo(() => deriveGroupStatus(items), [items]);
  const completedCount = items.filter((i) => i.status === 'completed').length;

  // Single item: render directly without nesting
  if (items.length === 1) {
    return <ToolCall item={items[0]} />;
  }

  const title =
    groupStatus === 'completed' ? `Executed ${items.length} tasks` : 'Executing parallel tasks';

  return (
    <div>
      <button
        className={toolCallRow}
        data-expandable="true"
        onClick={() => setExpanded(!expanded)}
        type="button"
      >
        <StatusIcon status={groupStatus} />
        <span
          className={toolCallName}
          style={groupStatus === 'running' ? { color: 'var(--hk-color-text)' } : undefined}
        >
          {title}
        </span>
        <span className={toolCallGroupCounter}>
          {completedCount}/{items.length}
        </span>
        <span style={{ flex: 1 }} />
        <ChevronRight className={toolCallChevron} data-expanded={expanded} size={12} />
      </button>

      {expanded && (
        <div className={toolCallGroupItems}>
          {items.map((item) => (
            <ToolCall item={item} key={item.id} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npx eslint packages/rich-agent-chat/src/components/ToolCallGroup.tsx --fix`
Expected: Clean.

- [ ] **Step 3: Commit**

```bash
git add packages/rich-agent-chat/src/components/ToolCallGroup.tsx
git commit -m "feat(agent-chat): add ToolCallGroup nested container component"
```

---

### Task 8: Component — Create `ThinkingChain.tsx`

**Files:**

- Create: `packages/rich-agent-chat/src/components/ThinkingChain.tsx`

- [ ] **Step 1: Create the ThinkingChain component**

Write `packages/rich-agent-chat/src/components/ThinkingChain.tsx`:

```tsx
import { ChevronRight, Sparkles } from 'lucide-react';
import type { ReactElement } from 'react';
import { useState } from 'react';

import {
  bounceDot,
  thinkingRow,
  thinkingSkeleton,
  thinkingSteps,
  toolCallChevron,
  toolCallDetail,
  toolCallDetailInner,
  toolCallGroupCounter,
  toolCallStatusIcon,
} from '../styles.css';

interface ThinkingChainProps {
  id: string;
  rawText: string;
  steps: string[];
  isStreaming: boolean;
  defaultExpanded?: boolean;
}

export function ThinkingChain({
  steps,
  isStreaming,
  defaultExpanded = false,
}: ThinkingChainProps): ReactElement {
  const [expanded, setExpanded] = useState(defaultExpanded || isStreaming);

  return (
    <div>
      <button className={thinkingRow} onClick={() => setExpanded(!expanded)} type="button">
        <span className={toolCallStatusIcon}>
          <Sparkles
            size={14}
            style={
              isStreaming ? { animation: 'pulse 1.5s ease-in-out infinite' } : { opacity: 0.5 }
            }
          />
        </span>
        <span style={isStreaming ? { color: 'var(--hk-color-text)' } : undefined}>Thinking</span>

        {isStreaming ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <span className={bounceDot} style={{ animationDelay: '-0.3s' }} />
            <span className={bounceDot} style={{ animationDelay: '-0.15s' }} />
            <span className={bounceDot} />
          </span>
        ) : (
          steps.length > 0 && <span className={toolCallGroupCounter}>{steps.length} steps</span>
        )}

        <span style={{ flex: 1 }} />
        <ChevronRight className={toolCallChevron} data-expanded={expanded} size={12} />
      </button>

      <div className={toolCallDetail} data-open={expanded}>
        <div className={toolCallDetailInner}>
          <div className={thinkingSteps}>
            {steps.map((step, i) => (
              <p key={i} style={{ margin: 0 }}>
                {step}
              </p>
            ))}

            {isStreaming && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className={thinkingSkeleton} style={{ width: 96 }} />
                <div className={thinkingSkeleton} style={{ width: 64, animationDelay: '0.15s' }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npx eslint packages/rich-agent-chat/src/components/ThinkingChain.tsx --fix`
Expected: Clean.

- [ ] **Step 3: Commit**

```bash
git add packages/rich-agent-chat/src/components/ThinkingChain.tsx
git commit -m "feat(agent-chat): add ThinkingChain component replacing ThinkingBlock"
```

---

### Task 9: Wire up — Update `ChatMessageList.tsx` and delete old components

**Files:**

- Modify: `packages/rich-agent-chat/src/ChatMessageList.tsx`
- Delete: `packages/rich-agent-chat/src/components/ToolCallBubble.tsx`
- Delete: `packages/rich-agent-chat/src/components/ThinkingBlock.tsx`

- [ ] **Step 1: Rewrite `ChatMessageList.tsx`**

Replace the full content of `packages/rich-agent-chat/src/ChatMessageList.tsx`:

```tsx
import type { ChatBubble, ReviewBatch, ToolCallGroupItem } from '@haklex/rich-agent-core';
import { ScrollArea } from '@haklex/rich-editor-ui';
import type { ReactElement } from 'react';
import { useRef } from 'react';

import { DiffReviewBubble } from './components/DiffReviewBubble';
import { ErrorBubble } from './components/ErrorBubble';
import { StreamdownBubble } from './components/StreamdownBubble';
import { ThinkingChain } from './components/ThinkingChain';
import { ToolCallGroup } from './components/ToolCallGroup';
import { bubbleTool, bubbleUser, messageList } from './styles.css';

interface ChatMessageListProps {
  bubbles: ChatBubble[];
  getBatch?: (batchId: string) => ReviewBatch | undefined;
  onAcceptBatch?: (batchId: string) => void;
  onRejectBatch?: (batchId: string) => void;
  onRetry?: () => void;
}

// Normalized shape for rendering
interface ToolCallGroupView {
  type: 'tool_call_group_view';
  id: string;
  items: ToolCallGroupItem[];
}

type MergedBubble = ChatBubble | ToolCallGroupView;

function mergeBubbles(bubbles: ChatBubble[]): MergedBubble[] {
  const result: MergedBubble[] = [];
  let legacyGroup: ToolCallGroupItem[] | null = null;
  let legacyGroupStartIdx = 0;

  function flushLegacy() {
    if (legacyGroup && legacyGroup.length > 0) {
      result.push({
        type: 'tool_call_group_view',
        id: `legacy-${legacyGroupStartIdx}`,
        items: legacyGroup,
      });
      legacyGroup = null;
    }
  }

  for (let i = 0; i < bubbles.length; i++) {
    const b = bubbles[i];

    // New canonical type — pass through
    if (b.type === 'tool_call_group') {
      flushLegacy();
      result.push({
        type: 'tool_call_group_view',
        id: b.id,
        items: b.items,
      });
      continue;
    }

    // Legacy: merge adjacent tool_call + tool_result
    if (b.type === 'tool_call') {
      if (!legacyGroup) {
        legacyGroup = [];
        legacyGroupStartIdx = i;
      }
      const next = bubbles[i + 1];
      if (next?.type === 'tool_result' && next.toolName === b.toolName) {
        legacyGroup.push({
          id: `fallback-${i}`,
          toolName: b.toolName,
          params: b.params,
          status: next.success ? 'completed' : 'error',
          result: next.success ? next.summary : undefined,
          resultPreview: next.success ? next.summary.slice(0, 80) : undefined,
          error: !next.success ? next.summary : undefined,
        });
        i++; // skip tool_result
      } else {
        legacyGroup.push({
          id: `fallback-${i}`,
          toolName: b.toolName,
          params: b.params,
          status: 'running',
        });
      }
      continue;
    }

    if (b.type === 'tool_result') {
      // orphaned tool_result
      flushLegacy();
      continue;
    }

    flushLegacy();
    result.push(b);
  }
  flushLegacy();
  return result;
}

export function ChatMessageList({
  bubbles,
  getBatch,
  onAcceptBatch,
  onRejectBatch,
  onRetry,
}: ChatMessageListProps): ReactElement {
  const scrollRef = useRef<HTMLDivElement>(null);
  const merged = mergeBubbles(bubbles);

  return (
    <ScrollArea autoScrollToBottom className={messageList} scrollRef={scrollRef}>
      {merged.map((item, i) => {
        switch (item.type) {
          case 'user':
            return (
              <div className={bubbleUser} key={i}>
                {item.content}
              </div>
            );

          case 'thinking': {
            // New enhanced thinking
            if ('id' in item && 'rawText' in item) {
              return (
                <ThinkingChain
                  id={item.id}
                  isStreaming={item.isStreaming}
                  key={i}
                  rawText={item.rawText}
                  steps={item.steps}
                />
              );
            }
            // Legacy thinking (content-only)
            return (
              <ThinkingChain
                id={`legacy-thinking-${i}`}
                isStreaming={false}
                key={i}
                rawText={item.content}
                steps={item.content ? item.content.split(/\n{2,}/).filter(Boolean) : []}
              />
            );
          }

          case 'assistant':
            return (
              <StreamdownBubble
                content={item.content}
                isStreaming={item.streaming ?? false}
                key={i}
              />
            );

          case 'tool_call_group_view':
            return <ToolCallGroup id={item.id} items={item.items} key={i} />;

          case 'error':
            return <ErrorBubble key={i} message={item.message} onRetry={onRetry} />;

          case 'diff_summary':
            return (
              <div className={bubbleTool} key={i}>
                Diff: {item.accepted} accepted, {item.rejected} rejected, {item.pending} pending
              </div>
            );

          case 'diff_review': {
            const batch = getBatch?.(item.batchId);
            if (!batch) return null;
            return (
              <DiffReviewBubble
                batch={batch}
                key={i}
                onAccept={onAcceptBatch}
                onReject={onRejectBatch}
              />
            );
          }

          default:
            return null;
        }
      })}
    </ScrollArea>
  );
}
```

- [ ] **Step 2: Delete old components**

```bash
rm packages/rich-agent-chat/src/components/ToolCallBubble.tsx
rm packages/rich-agent-chat/src/components/ThinkingBlock.tsx
```

- [ ] **Step 3: Remove `onRetryToolCall` prop from `ChatMessageList` consumers if needed**

The `onRetryToolCall` prop was removed from `ChatMessageListProps`. Check `ChatPanel.tsx` for usage and remove the prop pass-through if present.

Search for `onRetryToolCall` in `packages/rich-agent-chat/src/ChatPanel.tsx` and remove any reference to it.

- [ ] **Step 4: Lint all modified files**

Run: `npx eslint packages/rich-agent-chat/src/ChatMessageList.tsx packages/rich-agent-chat/src/ChatPanel.tsx --fix`
Expected: Clean.

- [ ] **Step 5: Commit**

```bash
git add packages/rich-agent-chat/src/ChatMessageList.tsx packages/rich-agent-chat/src/ChatPanel.tsx
git rm packages/rich-agent-chat/src/components/ToolCallBubble.tsx packages/rich-agent-chat/src/components/ThinkingBlock.tsx
git commit -m "refactor(agent-chat): wire ToolCallGroup and ThinkingChain, delete old components"
```

---

### Task 10: Visual verification and cleanup

**Files:**

- No new files — verification only.

- [ ] **Step 1: Build the chat package to check for compilation errors**

Run: `pnpm --filter @haklex/rich-agent-chat build`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Build the core package**

Run: `pnpm --filter @haklex/rich-agent-core build`
Expected: Build succeeds.

- [ ] **Step 3: Run all tests in both packages**

Run: `npx vitest run packages/rich-agent-core/tests/`
Expected: All PASS.

- [ ] **Step 4: Run the demo playground to visually verify**

Run: `pnpm dev` and navigate to the Agent page in the browser. Trigger an agent action and verify:

- Tool calls render as minimal rows (not cards)
- Status icons animate correctly (spinner → check)
- Duration appears after completion
- Expanding shows params/result
- Multi-tool-call turns show nested group with counter
- Thinking shows as chain with steps

- [ ] **Step 5: Clean up any unused style exports**

Search `packages/rich-agent-chat/src/` for imports of removed styles (`collapsedBar*`, `toolCallRetryButton`). Remove any remaining references.

- [ ] **Step 6: Final commit if cleanup was needed**

```bash
git add -A packages/rich-agent-chat/ packages/rich-agent-core/
git commit -m "chore(agent-chat): clean up unused styles and imports"
```
