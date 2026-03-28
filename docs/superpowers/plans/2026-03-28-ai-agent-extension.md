# AI Agent Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build three packages (`@haklex/rich-agent-core`, `@haklex/rich-ext-ai-agent`, `@haklex/rich-agent-chat`) that enable AI agents to operate on a Lexical editor via structured commands with inline diff preview.

**Architecture:** Command-driven — agent returns `AgentOperation[]` via LLM tool calling, diff engine generates preview, user accepts/rejects per-change. LLM provider injected by consumer (no SDK bundled). Vanilla pub/sub store for cross-component communication.

**Tech Stack:** TypeScript 5.9, Lexical 0.42, React 19, Vite 7, Vanilla Extract, vitest 4, nanoid 5.

**Spec:** `docs/superpowers/specs/2026-03-28-ai-agent-extension-design.md`

---

## File Map

### `packages/rich-agent-core/`

| File                           | Responsibility                                                                                  |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| `package.json`                 | Package manifest, peer deps on lexical + rich-editor                                            |
| `tsconfig.json`                | TS config, no JSX (headless)                                                                    |
| `vite.config.ts`               | Build config, no vanillaExtract                                                                 |
| `src/index.ts`                 | Barrel export                                                                                   |
| `src/types.ts`                 | `AgentOperation`, `NodePosition`, `DiffEntry`, `DiffState`, `SelectionSnapshot`, `AgentContext` |
| `src/protocol.ts`              | `ChatMessage`, `LLMProvider`, `LLMChunk`, `ToolSchema`, `ToolCall`, `MessagePipeline`           |
| `src/store.ts`                 | `createAgentStore`, `AgentStoreState`, `AgentStoreAction`, `ChatBubble`                         |
| `src/snapshot.ts`              | `createSnapshot`, `compareBlockContent`, conflict detection                                     |
| `src/diff-engine.ts`           | `createDiffEngine`, `acceptDiff`, `rejectDiff`, `acceptAllDiffs`, `rejectAllDiffs`              |
| `src/document-tools.ts`        | `createDocumentTools(editor, snapshot)` → 5 `AgentToolConfig` instances                         |
| `src/agent-executor.ts`        | `createAgentExecutor` — LLM loop, tool dispatch, operation accumulation                         |
| `src/pipeline.ts`              | `buildMessages`, `buildDocumentContext`, `DocumentContextOptions`                               |
| `tests/types.test.ts`          | Type guard tests                                                                                |
| `tests/diff-engine.test.ts`    | Diff engine unit tests                                                                          |
| `tests/snapshot.test.ts`       | Snapshot + conflict detection tests                                                             |
| `tests/document-tools.test.ts` | Document tools unit tests                                                                       |
| `tests/agent-executor.test.ts` | Executor integration test with mock LLMProvider                                                 |
| `tests/store.test.ts`          | Store pub/sub tests                                                                             |
| `tests/pipeline.test.ts`       | Message pipeline construction tests                                                             |

### `packages/rich-ext-ai-agent/`

| File                                      | Responsibility                                               |
| ----------------------------------------- | ------------------------------------------------------------ |
| `package.json`                            | Package manifest                                             |
| `tsconfig.json`                           | TS config with JSX                                           |
| `vite.config.ts`                          | Build config with vanillaExtract                             |
| `src/index.ts`                            | Barrel export (edit)                                         |
| `src/static.ts`                           | Barrel export (static)                                       |
| `src/styles.css.ts`                       | Vanilla Extract styles, CSS variables                        |
| `src/nodes/AgentDiffNode.ts`              | Static DecoratorNode for diff markers                        |
| `src/nodes/AgentDiffEditNode.ts`          | Edit variant with accept/reject                              |
| `src/renderers/AgentDiffRenderer.tsx`     | Static diff renderer                                         |
| `src/renderers/AgentDiffEditRenderer.tsx` | Edit diff renderer with buttons                              |
| `src/components/DiffOverlay.tsx`          | Inline diff overlay (insert/delete/replace visuals)          |
| `src/components/AgentActionBar.tsx`       | Accept All / Reject All floating bar                         |
| `src/plugins/AgentPanelPlugin.tsx`        | Plugin: loop lifecycle, diff injection, mutation prevention  |
| `src/hooks/useAgentLoop.ts`               | Hook: manages agent loop state, subscribes to store          |
| `src/registry.ts`                         | `AgentActionConfig`, `registerAgentAction`, built-in actions |

### `packages/rich-agent-chat/`

| File                      | Responsibility                            |
| ------------------------- | ----------------------------------------- |
| `package.json`            | Package manifest                          |
| `tsconfig.json`           | TS config with JSX                        |
| `vite.config.ts`          | Build config with vanillaExtract          |
| `src/index.ts`            | Barrel export                             |
| `src/types.ts`            | Re-export ChatBubble from core            |
| `src/styles.css.ts`       | Vanilla Extract styles                    |
| `src/ChatPanel.tsx`       | Panel container, subscribes to AgentStore |
| `src/ChatMessageList.tsx` | Scrollable message list                   |
| `src/ChatInput.tsx`       | Input box + send button                   |
| `src/context.ts`          | React context for store instance          |

---

## Task 1: Scaffold `@haklex/rich-agent-core` package

**Files:**

- Create: `packages/rich-agent-core/package.json`
- Create: `packages/rich-agent-core/tsconfig.json`
- Create: `packages/rich-agent-core/vite.config.ts`
- Create: `packages/rich-agent-core/src/index.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "dependencies": {
    "nanoid": "^5.1.6"
  },
  "description": "Headless AI agent protocol, diff engine, and store for Lexical editor",
  "devDependencies": {
    "@haklex/rich-editor": "workspace:*",
    "lexical": "^0.42.0",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vite-plugin-dts": "^4.5.4",
    "vitest": "^4.0.18"
  },
  "exports": {
    ".": "./src/index.ts"
  },
  "files": ["dist"],
  "license": "MIT",
  "main": "./src/index.ts",
  "name": "@haklex/rich-agent-core",
  "peerDependencies": {
    "@haklex/rich-editor": "workspace:*",
    "lexical": "^0.42.0"
  },
  "publishConfig": {
    "access": "public",
    "exports": {
      ".": {
        "import": "./dist/index.mjs",
        "types": "./dist/index.d.ts"
      }
    },
    "main": "./dist/index.mjs",
    "types": "./dist/index.d.ts"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/Innei/haklex.git",
    "directory": "packages/rich-agent-core"
  },
  "scripts": {
    "build": "vite build",
    "dev:build": "vite build --watch",
    "test": "vitest run"
  },
  "type": "module",
  "version": "0.0.90"
}
```

Write to `packages/rich-agent-core/package.json`.

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "lib": ["ES2021", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

Write to `packages/rich-agent-core/tsconfig.json`.

- [ ] **Step 3: Create vite.config.ts**

```typescript
import { createViteConfig } from '../vite.shared';

export default createViteConfig({
  vanillaExtract: false,
});
```

Write to `packages/rich-agent-core/vite.config.ts`.

- [ ] **Step 4: Create empty barrel export**

```typescript
// @haklex/rich-agent-core
// Headless AI agent protocol, diff engine, and store for Lexical editor.
```

Write to `packages/rich-agent-core/src/index.ts`.

- [ ] **Step 5: Install dependencies**

Run: `pnpm install`
Expected: lockfile updates, no errors.

- [ ] **Step 6: Verify build**

Run: `pnpm --filter @haklex/rich-agent-core build`
Expected: `dist/index.mjs` + `dist/index.d.ts` generated.

- [ ] **Step 7: Commit**

```bash
git add packages/rich-agent-core/
git commit -m "feat(rich-agent-core): scaffold package"
```

---

## Task 2: Core types — `types.ts` and `protocol.ts`

**Files:**

- Create: `packages/rich-agent-core/src/types.ts`
- Create: `packages/rich-agent-core/src/protocol.ts`
- Create: `packages/rich-agent-core/tests/types.test.ts`
- Modify: `packages/rich-agent-core/src/index.ts`

- [ ] **Step 1: Write the failing test for types**

```typescript
import { describe, expect, it } from 'vitest';

import type {
  AgentOperation,
  DiffEntry,
  DiffState,
  NodePosition,
  SelectionSnapshot,
} from '../src/types';

describe('types', () => {
  it('NodePosition discriminated union covers all cases', () => {
    const after: NodePosition = { type: 'after', blockId: 'abc' };
    const before: NodePosition = { type: 'before', blockId: 'def' };
    const root: NodePosition = { type: 'root', index: 0 };

    expect(after.type).toBe('after');
    expect(before.type).toBe('before');
    expect(root.type).toBe('root');
  });

  it('AgentOperation discriminated union covers all cases', () => {
    const insert: AgentOperation = {
      op: 'insert',
      position: { type: 'after', blockId: 'abc' },
      node: {
        type: 'paragraph',
        children: [],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
      },
    };
    const replace: AgentOperation = {
      op: 'replace',
      blockId: 'abc',
      node: {
        type: 'paragraph',
        children: [],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
      },
    };
    const del: AgentOperation = { op: 'delete', blockId: 'abc' };

    expect(insert.op).toBe('insert');
    expect(replace.op).toBe('replace');
    expect(del.op).toBe('delete');
  });

  it('SelectionSnapshot uses blockId addressing', () => {
    const snap: SelectionSnapshot = {
      text: 'hello',
      anchorBlockId: 'blk1',
      anchorOffset: 0,
      focusBlockId: 'blk2',
      focusOffset: 5,
    };
    expect(snap.anchorBlockId).toBe('blk1');
  });

  it('DiffEntry tracks status per operation', () => {
    const entry: DiffEntry = {
      id: 'e1',
      op: { op: 'delete', blockId: 'abc' },
      status: 'pending',
      originalNode: {
        type: 'paragraph',
        children: [],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
      },
    };
    expect(entry.status).toBe('pending');
  });
});
```

Write to `packages/rich-agent-core/tests/types.test.ts`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/rich-agent-core/tests/types.test.ts`
Expected: FAIL — module `../src/types` not found or types not exported.

- [ ] **Step 3: Write types.ts**

```typescript
import type { SerializedLexicalNode } from 'lexical';

export type NodePosition =
  | { type: 'after'; blockId: string }
  | { type: 'before'; blockId: string }
  | { type: 'root'; index?: number };

export type AgentOperation =
  | { op: 'insert'; position: NodePosition; node: SerializedLexicalNode }
  | { op: 'replace'; blockId: string; node: SerializedLexicalNode }
  | { op: 'delete'; blockId: string };

export type SelectionSnapshot = {
  text: string;
  anchorBlockId: string;
  anchorOffset: number;
  focusBlockId: string;
  focusOffset: number;
};

export type AgentContext = {
  selection: SelectionSnapshot | null;
  getBlockByBlockId: (blockId: string) => SerializedLexicalNode | null;
  getDocumentStructure: () => SerializedLexicalNode;
};

export type DiffEntry = {
  id: string;
  op: AgentOperation;
  status: 'pending' | 'accepted' | 'rejected';
  originalNode?: SerializedLexicalNode;
};

export type DiffState = {
  entries: DiffEntry[];
  getByBlockId: (blockId: string) => DiffEntry | undefined;
  getPending: () => DiffEntry[];
};
```

Write to `packages/rich-agent-core/src/types.ts`.

- [ ] **Step 4: Write protocol.ts**

```typescript
export type ChatMessage =
  | { role: 'system'; content: string; cacheBreakpoint?: boolean }
  | { role: 'user'; content: string; cacheBreakpoint?: boolean }
  | { role: 'assistant'; content: string }
  | { role: 'assistant_tool_call'; toolCalls: ToolCall[] }
  | { role: 'tool_result'; toolCallId: string; content: string; isError?: boolean };

export type ToolCall = {
  id: string;
  name: string;
  arguments: string;
};

export type ToolSchema = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export type LLMChunk =
  | { type: 'text'; text: string }
  | { type: 'tool_call'; id: string; name: string; arguments: string }
  | { type: 'done' };

export type LLMProvider = {
  chat: (messages: ChatMessage[], tools?: ToolSchema[]) => AsyncIterable<LLMChunk>;
};

export type AgentToolResult = { ok: true; content: string } | { ok: false; error: ToolError };

export type ToolError = {
  error: 'block_modified' | 'block_not_found' | string;
  blockId?: string;
  message: string;
  currentContent?: string;
};

export type AgentToolConfig = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (params: unknown) => Promise<AgentToolResult>;
};

export type DocumentContextOptions = {
  mode: 'full' | 'structure' | 'selection-window';
  windowSize?: number;
};

export type MessagePipeline = {
  systemMessages: ChatMessage[];
  actionPrompt: ChatMessage;
  turns: ChatMessage[];
};
```

Write to `packages/rich-agent-core/src/protocol.ts`.

- [ ] **Step 5: Update barrel export**

```typescript
export type {
  AgentContext,
  AgentOperation,
  DiffEntry,
  DiffState,
  NodePosition,
  SelectionSnapshot,
} from './types';

export type {
  AgentToolConfig,
  AgentToolResult,
  ChatMessage,
  DocumentContextOptions,
  LLMChunk,
  LLMProvider,
  MessagePipeline,
  ToolCall,
  ToolError,
  ToolSchema,
} from './protocol';
```

Write to `packages/rich-agent-core/src/index.ts`.

- [ ] **Step 6: Run tests**

Run: `npx vitest run packages/rich-agent-core/tests/types.test.ts`
Expected: All 4 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/rich-agent-core/src/types.ts packages/rich-agent-core/src/protocol.ts packages/rich-agent-core/src/index.ts packages/rich-agent-core/tests/
git commit -m "feat(rich-agent-core): add core types and protocol"
```

---

## Task 3: AgentStore — vanilla pub/sub

**Files:**

- Create: `packages/rich-agent-core/src/store.ts`
- Create: `packages/rich-agent-core/tests/store.test.ts`
- Modify: `packages/rich-agent-core/src/index.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, expect, it, vi } from 'vitest';

import { createAgentStore } from '../src/store';

describe('createAgentStore', () => {
  it('initial state is idle with empty bubbles', () => {
    const store = createAgentStore();
    const state = store.getState();
    expect(state.status).toBe('idle');
    expect(state.bubbles).toEqual([]);
    expect(state.diffState).toBeNull();
  });

  it('dispatch updates state and notifies subscribers', () => {
    const store = createAgentStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.dispatch({ type: 'set_status', status: 'running' });

    expect(store.getState().status).toBe('running');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(store.getState());
  });

  it('add_bubble appends to bubbles array', () => {
    const store = createAgentStore();
    store.dispatch({
      type: 'add_bubble',
      bubble: { type: 'user', content: 'hello' },
    });
    expect(store.getState().bubbles).toHaveLength(1);
    expect(store.getState().bubbles[0]).toEqual({ type: 'user', content: 'hello' });
  });

  it('update_last_bubble modifies the last bubble', () => {
    const store = createAgentStore();
    store.dispatch({
      type: 'add_bubble',
      bubble: { type: 'assistant', content: 'hel', streaming: true },
    });
    store.dispatch({
      type: 'update_last_bubble',
      bubble: { type: 'assistant', content: 'hello world', streaming: false },
    });
    expect(store.getState().bubbles).toHaveLength(1);
    expect(store.getState().bubbles[0]).toEqual({
      type: 'assistant',
      content: 'hello world',
      streaming: false,
    });
  });

  it('set_diff_state replaces diff state', () => {
    const store = createAgentStore();
    const diff = {
      entries: [],
      getByBlockId: () => undefined,
      getPending: () => [],
    };
    store.dispatch({ type: 'set_diff_state', diffState: diff });
    expect(store.getState().diffState).toBe(diff);
  });

  it('reset clears everything', () => {
    const store = createAgentStore();
    store.dispatch({ type: 'set_status', status: 'running' });
    store.dispatch({
      type: 'add_bubble',
      bubble: { type: 'user', content: 'hi' },
    });
    store.dispatch({ type: 'reset' });

    const state = store.getState();
    expect(state.status).toBe('idle');
    expect(state.bubbles).toEqual([]);
    expect(state.diffState).toBeNull();
  });

  it('unsubscribe stops notifications', () => {
    const store = createAgentStore();
    const listener = vi.fn();
    const unsub = store.subscribe(listener);
    unsub();
    store.dispatch({ type: 'set_status', status: 'running' });
    expect(listener).not.toHaveBeenCalled();
  });
});
```

Write to `packages/rich-agent-core/tests/store.test.ts`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/rich-agent-core/tests/store.test.ts`
Expected: FAIL — `createAgentStore` not found.

- [ ] **Step 3: Write store.ts**

```typescript
import type { DiffState } from './types';

export type ChatBubble =
  | { type: 'user'; content: string }
  | { type: 'assistant'; content: string; streaming?: boolean }
  | { type: 'tool_call'; toolName: string; params: Record<string, unknown> }
  | { type: 'tool_result'; toolName: string; success: boolean; summary: string }
  | { type: 'error'; message: string }
  | { type: 'diff_summary'; accepted: number; rejected: number; pending: number };

export type AgentStoreState = {
  status: 'idle' | 'running' | 'done';
  bubbles: ChatBubble[];
  diffState: DiffState | null;
};

export type AgentStoreAction =
  | { type: 'set_status'; status: AgentStoreState['status'] }
  | { type: 'add_bubble'; bubble: ChatBubble }
  | { type: 'update_last_bubble'; bubble: ChatBubble }
  | { type: 'set_diff_state'; diffState: DiffState | null }
  | { type: 'reset' };

export type AgentStore = {
  getState: () => AgentStoreState;
  subscribe: (listener: (state: AgentStoreState) => void) => () => void;
  dispatch: (action: AgentStoreAction) => void;
};

function initialState(): AgentStoreState {
  return { status: 'idle', bubbles: [], diffState: null };
}

function reduce(state: AgentStoreState, action: AgentStoreAction): AgentStoreState {
  switch (action.type) {
    case 'set_status':
      return { ...state, status: action.status };
    case 'add_bubble':
      return { ...state, bubbles: [...state.bubbles, action.bubble] };
    case 'update_last_bubble': {
      if (state.bubbles.length === 0) return state;
      const bubbles = [...state.bubbles];
      bubbles[bubbles.length - 1] = action.bubble;
      return { ...state, bubbles };
    }
    case 'set_diff_state':
      return { ...state, diffState: action.diffState };
    case 'reset':
      return initialState();
  }
}

export function createAgentStore(): AgentStore {
  let state = initialState();
  const listeners = new Set<(state: AgentStoreState) => void>();

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispatch: (action) => {
      state = reduce(state, action);
      for (const listener of listeners) {
        listener(state);
      }
    },
  };
}
```

Write to `packages/rich-agent-core/src/store.ts`.

- [ ] **Step 4: Update barrel export**

Add to `packages/rich-agent-core/src/index.ts`:

```typescript
export { createAgentStore } from './store';
export type { AgentStore, AgentStoreAction, AgentStoreState, ChatBubble } from './store';
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run packages/rich-agent-core/tests/store.test.ts`
Expected: All 7 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/rich-agent-core/src/store.ts packages/rich-agent-core/src/index.ts packages/rich-agent-core/tests/store.test.ts
git commit -m "feat(rich-agent-core): add vanilla pub/sub store"
```

---

## Task 4: Snapshot and conflict detection

**Files:**

- Create: `packages/rich-agent-core/src/snapshot.ts`
- Create: `packages/rich-agent-core/tests/snapshot.test.ts`
- Modify: `packages/rich-agent-core/src/index.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, expect, it } from 'vitest';

import { compareBlockContent, createSnapshot, type EditorSnapshot } from '../src/snapshot';

// Minimal serialized editor state for testing
function makeEditorState(blocks: Array<{ blockId: string; type: string; text: string }>) {
  return {
    root: {
      type: 'root',
      children: blocks.map((b) => ({
        type: b.type,
        children: [
          {
            type: 'text',
            text: b.text,
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
        $: { blockId: b.blockId },
      })),
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    },
  };
}

describe('createSnapshot', () => {
  it('builds blockId to node index from serialized editor state', () => {
    const state = makeEditorState([
      { blockId: 'a1', type: 'paragraph', text: 'Hello' },
      { blockId: 'b2', type: 'heading', text: 'World' },
    ]);
    const snap = createSnapshot(state as any);

    expect(snap.getBlock('a1')).toBeDefined();
    expect(snap.getBlock('a1')!.type).toBe('paragraph');
    expect(snap.getBlock('b2')!.type).toBe('heading');
    expect(snap.getBlock('nonexistent')).toBeUndefined();
  });

  it('returns all block IDs in document order', () => {
    const state = makeEditorState([
      { blockId: 'x', type: 'paragraph', text: 'first' },
      { blockId: 'y', type: 'paragraph', text: 'second' },
      { blockId: 'z', type: 'paragraph', text: 'third' },
    ]);
    const snap = createSnapshot(state as any);
    expect(snap.blockIds).toEqual(['x', 'y', 'z']);
  });
});

describe('compareBlockContent', () => {
  it('returns true when content matches', () => {
    const node = {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          text: 'hello',
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          version: 1,
        },
      ],
      direction: null,
      format: '',
      indent: 0,
      version: 1,
      textFormat: 0,
      textStyle: '',
    };
    expect(compareBlockContent(node as any, node as any)).toBe(true);
  });

  it('returns false when content differs', () => {
    const original = {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          text: 'hello',
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          version: 1,
        },
      ],
      direction: null,
      format: '',
      indent: 0,
      version: 1,
      textFormat: 0,
      textStyle: '',
    };
    const modified = {
      ...original,
      children: [
        {
          type: 'text',
          text: 'changed',
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          version: 1,
        },
      ],
    };
    expect(compareBlockContent(original as any, modified as any)).toBe(false);
  });
});
```

Write to `packages/rich-agent-core/tests/snapshot.test.ts`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/rich-agent-core/tests/snapshot.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write snapshot.ts**

```typescript
import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';

export type EditorSnapshot = {
  raw: SerializedEditorState;
  blockIds: string[];
  getBlock: (blockId: string) => SerializedLexicalNode | undefined;
};

export function createSnapshot(editorState: SerializedEditorState): EditorSnapshot {
  const root = editorState.root as SerializedLexicalNode & { children?: SerializedLexicalNode[] };
  const children = root.children ?? [];

  const blockMap = new Map<string, SerializedLexicalNode>();
  const blockIds: string[] = [];

  for (const child of children) {
    const blockId = (child as any).$?.blockId as string | undefined;
    if (blockId) {
      blockMap.set(blockId, child);
      blockIds.push(blockId);
    }
  }

  return {
    raw: editorState,
    blockIds,
    getBlock: (blockId: string) => blockMap.get(blockId),
  };
}

export function compareBlockContent(a: SerializedLexicalNode, b: SerializedLexicalNode): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
```

Write to `packages/rich-agent-core/src/snapshot.ts`.

- [ ] **Step 4: Update barrel export**

Add to `packages/rich-agent-core/src/index.ts`:

```typescript
export { compareBlockContent, createSnapshot } from './snapshot';
export type { EditorSnapshot } from './snapshot';
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run packages/rich-agent-core/tests/snapshot.test.ts`
Expected: All 4 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/rich-agent-core/src/snapshot.ts packages/rich-agent-core/src/index.ts packages/rich-agent-core/tests/snapshot.test.ts
git commit -m "feat(rich-agent-core): add snapshot and conflict detection"
```

---

## Task 5: Diff engine

**Files:**

- Create: `packages/rich-agent-core/src/diff-engine.ts`
- Create: `packages/rich-agent-core/tests/diff-engine.test.ts`
- Modify: `packages/rich-agent-core/src/index.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, expect, it } from 'vitest';

import {
  acceptAllDiffs,
  acceptDiff,
  createDiffEngine,
  rejectAllDiffs,
  rejectDiff,
} from '../src/diff-engine';
import type { AgentOperation } from '../src/types';

const paragraph = (text: string, blockId?: string) => ({
  type: 'paragraph',
  children: [{ type: 'text', text, detail: 0, format: 0, mode: 'normal', style: '', version: 1 }],
  direction: null,
  format: '',
  indent: 0,
  version: 1,
  textFormat: 0,
  textStyle: '',
  ...(blockId ? { $: { blockId } } : {}),
});

const editorState = {
  root: {
    type: 'root',
    children: [paragraph('Hello', 'a1'), paragraph('World', 'b2')],
    direction: null,
    format: '',
    indent: 0,
    version: 1,
  },
};

describe('createDiffEngine', () => {
  it('creates DiffState from operations', () => {
    const ops: AgentOperation[] = [
      { op: 'insert', position: { type: 'after', blockId: 'a1' }, node: paragraph('New') as any },
      { op: 'replace', blockId: 'b2', node: paragraph('Updated') as any },
      { op: 'delete', blockId: 'a1' },
    ];
    const diff = createDiffEngine(ops, editorState as any);

    expect(diff.entries).toHaveLength(3);
    expect(diff.entries[0].status).toBe('pending');
    expect(diff.entries[1].op.op).toBe('replace');
    // replace should capture originalNode
    expect(diff.entries[1].originalNode).toBeDefined();
    expect(diff.entries[2].originalNode).toBeDefined();
  });

  it('getByBlockId finds entries', () => {
    const ops: AgentOperation[] = [
      { op: 'replace', blockId: 'b2', node: paragraph('Updated') as any },
    ];
    const diff = createDiffEngine(ops, editorState as any);
    expect(diff.getByBlockId('b2')).toBeDefined();
    expect(diff.getByBlockId('nonexistent')).toBeUndefined();
  });

  it('getPending returns only pending entries', () => {
    const ops: AgentOperation[] = [
      { op: 'delete', blockId: 'a1' },
      { op: 'delete', blockId: 'b2' },
    ];
    const diff = createDiffEngine(ops, editorState as any);
    expect(diff.getPending()).toHaveLength(2);
  });
});

describe('acceptDiff / rejectDiff', () => {
  it('acceptDiff marks entry as accepted', () => {
    const ops: AgentOperation[] = [{ op: 'delete', blockId: 'a1' }];
    const diff = createDiffEngine(ops, editorState as any);
    const entryId = diff.entries[0].id;

    const updated = acceptDiff(diff, entryId);
    expect(updated.entries[0].status).toBe('accepted');
    expect(updated.getPending()).toHaveLength(0);
  });

  it('rejectDiff marks entry as rejected', () => {
    const ops: AgentOperation[] = [{ op: 'delete', blockId: 'a1' }];
    const diff = createDiffEngine(ops, editorState as any);
    const entryId = diff.entries[0].id;

    const updated = rejectDiff(diff, entryId);
    expect(updated.entries[0].status).toBe('rejected');
  });

  it('acceptAllDiffs marks all as accepted', () => {
    const ops: AgentOperation[] = [
      { op: 'delete', blockId: 'a1' },
      { op: 'delete', blockId: 'b2' },
    ];
    const diff = createDiffEngine(ops, editorState as any);
    const updated = acceptAllDiffs(diff);
    expect(updated.getPending()).toHaveLength(0);
    expect(updated.entries.every((e) => e.status === 'accepted')).toBe(true);
  });

  it('rejectAllDiffs marks all as rejected', () => {
    const ops: AgentOperation[] = [
      { op: 'delete', blockId: 'a1' },
      { op: 'delete', blockId: 'b2' },
    ];
    const diff = createDiffEngine(ops, editorState as any);
    const updated = rejectAllDiffs(diff);
    expect(updated.entries.every((e) => e.status === 'rejected')).toBe(true);
  });
});
```

Write to `packages/rich-agent-core/tests/diff-engine.test.ts`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/rich-agent-core/tests/diff-engine.test.ts`
Expected: FAIL.

- [ ] **Step 3: Write diff-engine.ts**

```typescript
import { nanoid } from 'nanoid';
import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';

import type { AgentOperation, DiffEntry, DiffState } from './types';
import { createSnapshot } from './snapshot';

function makeDiffState(entries: DiffEntry[]): DiffState {
  return {
    entries,
    getByBlockId(blockId: string) {
      return entries.find((e) => {
        if (e.op.op === 'replace' || e.op.op === 'delete') return e.op.blockId === blockId;
        if (e.op.op === 'insert' && e.op.position.type !== 'root')
          return e.op.position.blockId === blockId;
        return false;
      });
    },
    getPending() {
      return entries.filter((e) => e.status === 'pending');
    },
  };
}

export function createDiffEngine(
  operations: AgentOperation[],
  editorState: SerializedEditorState,
): DiffState {
  const snap = createSnapshot(editorState);

  const entries: DiffEntry[] = operations.map((op) => {
    let originalNode: SerializedLexicalNode | undefined;
    if (op.op === 'replace' || op.op === 'delete') {
      originalNode = snap.getBlock(op.blockId);
    }
    return {
      id: nanoid(8),
      op,
      status: 'pending' as const,
      originalNode,
    };
  });

  return makeDiffState(entries);
}

function updateEntry(state: DiffState, entryId: string, status: DiffEntry['status']): DiffState {
  const entries = state.entries.map((e) => (e.id === entryId ? { ...e, status } : e));
  return makeDiffState(entries);
}

export function acceptDiff(state: DiffState, entryId: string): DiffState {
  return updateEntry(state, entryId, 'accepted');
}

export function rejectDiff(state: DiffState, entryId: string): DiffState {
  return updateEntry(state, entryId, 'rejected');
}

export function acceptAllDiffs(state: DiffState): DiffState {
  const entries = state.entries.map((e) =>
    e.status === 'pending' ? { ...e, status: 'accepted' as const } : e,
  );
  return makeDiffState(entries);
}

export function rejectAllDiffs(state: DiffState): DiffState {
  const entries = state.entries.map((e) =>
    e.status === 'pending' ? { ...e, status: 'rejected' as const } : e,
  );
  return makeDiffState(entries);
}
```

Write to `packages/rich-agent-core/src/diff-engine.ts`.

- [ ] **Step 4: Update barrel export**

Add to `packages/rich-agent-core/src/index.ts`:

```typescript
export {
  acceptAllDiffs,
  acceptDiff,
  createDiffEngine,
  rejectAllDiffs,
  rejectDiff,
} from './diff-engine';
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run packages/rich-agent-core/tests/diff-engine.test.ts`
Expected: All 7 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/rich-agent-core/src/diff-engine.ts packages/rich-agent-core/src/index.ts packages/rich-agent-core/tests/diff-engine.test.ts
git commit -m "feat(rich-agent-core): add diff engine"
```

---

## Task 6: Message pipeline

**Files:**

- Create: `packages/rich-agent-core/src/pipeline.ts`
- Create: `packages/rich-agent-core/tests/pipeline.test.ts`
- Modify: `packages/rich-agent-core/src/index.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, expect, it } from 'vitest';

import { buildDocumentContext, buildMessages } from '../src/pipeline';
import type { MessagePipeline } from '../src/protocol';

describe('buildMessages', () => {
  it('concatenates system + action + turns in order', () => {
    const pipeline: MessagePipeline = {
      systemMessages: [
        { role: 'system', content: 'You are an editor agent.', cacheBreakpoint: true },
      ],
      actionPrompt: { role: 'user', content: 'Edit the selection', cacheBreakpoint: true },
      turns: [{ role: 'user', content: '## Document\nhello world' }],
    };
    const messages = buildMessages(pipeline);
    expect(messages).toHaveLength(3);
    expect(messages[0].role).toBe('system');
    expect(messages[1].role).toBe('user');
    expect(messages[2].role).toBe('user');
  });
});

describe('buildDocumentContext', () => {
  const editorState = {
    root: {
      type: 'root',
      children: [
        { type: 'paragraph', children: [{ type: 'text', text: 'Block 0' }], $: { blockId: 'b0' } },
        { type: 'paragraph', children: [{ type: 'text', text: 'Block 1' }], $: { blockId: 'b1' } },
        { type: 'paragraph', children: [{ type: 'text', text: 'Block 2' }], $: { blockId: 'b2' } },
        { type: 'paragraph', children: [{ type: 'text', text: 'Block 3' }], $: { blockId: 'b3' } },
        { type: 'paragraph', children: [{ type: 'text', text: 'Block 4' }], $: { blockId: 'b4' } },
      ],
    },
  };

  it('full mode returns all blocks', () => {
    const ctx = buildDocumentContext(editorState as any, { mode: 'full' });
    expect(ctx).toContain('b0');
    expect(ctx).toContain('b4');
  });

  it('structure mode returns type + blockId only', () => {
    const ctx = buildDocumentContext(editorState as any, { mode: 'structure' });
    expect(ctx).toContain('b0');
    expect(ctx).toContain('paragraph');
    // Should not contain full text content in structure mode
    expect(ctx.length).toBeLessThan(
      buildDocumentContext(editorState as any, { mode: 'full' }).length,
    );
  });
});
```

Write to `packages/rich-agent-core/tests/pipeline.test.ts`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/rich-agent-core/tests/pipeline.test.ts`
Expected: FAIL.

- [ ] **Step 3: Write pipeline.ts**

```typescript
import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';

import type { ChatMessage, DocumentContextOptions, MessagePipeline } from './protocol';

export function buildMessages(pipeline: MessagePipeline): ChatMessage[] {
  return [...pipeline.systemMessages, pipeline.actionPrompt, ...pipeline.turns];
}

function extractText(node: SerializedLexicalNode): string {
  const n = node as any;
  if (n.text) return n.text;
  if (n.children) return n.children.map(extractText).join('');
  return '';
}

function formatBlock(node: SerializedLexicalNode, full: boolean): string {
  const n = node as any;
  const blockId = n.$?.blockId ?? 'unknown';
  const type = n.type ?? 'unknown';
  if (full) {
    const text = extractText(node);
    return `[${blockId}] (${type}) ${text}`;
  }
  return `[${blockId}] (${type})`;
}

export function buildDocumentContext(
  editorState: SerializedEditorState,
  options: DocumentContextOptions,
  anchorBlockId?: string,
): string {
  const root = editorState.root as any;
  const children: SerializedLexicalNode[] = root.children ?? [];

  if (options.mode === 'full') {
    return children.map((c) => formatBlock(c, true)).join('\n');
  }

  if (options.mode === 'structure') {
    return children.map((c) => formatBlock(c, false)).join('\n');
  }

  // selection-window mode
  const windowSize = options.windowSize ?? 5;
  const anchorIndex = anchorBlockId
    ? children.findIndex((c) => (c as any).$?.blockId === anchorBlockId)
    : 0;
  const center = anchorIndex >= 0 ? anchorIndex : 0;
  const start = Math.max(0, center - windowSize);
  const end = Math.min(children.length, center + windowSize + 1);

  return children
    .map((c, i) => {
      const inWindow = i >= start && i < end;
      return formatBlock(c, inWindow);
    })
    .join('\n');
}
```

Write to `packages/rich-agent-core/src/pipeline.ts`.

- [ ] **Step 4: Update barrel export**

Add to `packages/rich-agent-core/src/index.ts`:

```typescript
export { buildDocumentContext, buildMessages } from './pipeline';
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run packages/rich-agent-core/tests/pipeline.test.ts`
Expected: All 3 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/rich-agent-core/src/pipeline.ts packages/rich-agent-core/src/index.ts packages/rich-agent-core/tests/pipeline.test.ts
git commit -m "feat(rich-agent-core): add message pipeline builder"
```

---

## Task 7: Document tools

**Files:**

- Create: `packages/rich-agent-core/src/document-tools.ts`
- Create: `packages/rich-agent-core/tests/document-tools.test.ts`
- Modify: `packages/rich-agent-core/src/index.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, expect, it } from 'vitest';

import { createDocumentTools } from '../src/document-tools';
import type { EditorSnapshot } from '../src/snapshot';
import { createSnapshot } from '../src/snapshot';
import type { AgentOperation } from '../src/types';

function makeSnapshot(): { snapshot: EditorSnapshot; operations: AgentOperation[] } {
  const state = {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text: 'Hello world',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
          textFormat: 0,
          textStyle: '',
          $: { blockId: 'p1' },
        },
        {
          type: 'heading',
          children: [
            {
              type: 'text',
              text: 'Title',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
          textFormat: 0,
          textStyle: '',
          tag: 'h1',
          $: { blockId: 'h1' },
        },
      ],
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    },
  };
  return { snapshot: createSnapshot(state as any), operations: [] };
}

describe('createDocumentTools', () => {
  it('returns 5 tools', () => {
    const { snapshot, operations } = makeSnapshot();
    const tools = createDocumentTools(snapshot, operations);
    expect(tools).toHaveLength(5);
    expect(tools.map((t) => t.name)).toEqual([
      'read_selection',
      'insert_node',
      'replace_node',
      'delete_node',
      'search_document',
    ]);
  });

  it('insert_node adds operation to accumulator', async () => {
    const { snapshot, operations } = makeSnapshot();
    const tools = createDocumentTools(snapshot, operations);
    const insertTool = tools.find((t) => t.name === 'insert_node')!;

    const result = await insertTool.execute({
      position: { type: 'after', blockId: 'p1' },
      node: { type: 'paragraph', children: [] },
    });

    expect(result.ok).toBe(true);
    expect(operations).toHaveLength(1);
    expect(operations[0].op).toBe('insert');
  });

  it('delete_node with valid blockId adds operation', async () => {
    const { snapshot, operations } = makeSnapshot();
    const tools = createDocumentTools(snapshot, operations);
    const deleteTool = tools.find((t) => t.name === 'delete_node')!;

    const result = await deleteTool.execute({ blockId: 'p1' });
    expect(result.ok).toBe(true);
    expect(operations).toHaveLength(1);
    expect(operations[0].op).toBe('delete');
  });

  it('delete_node with unknown blockId returns error', async () => {
    const { snapshot, operations } = makeSnapshot();
    const tools = createDocumentTools(snapshot, operations);
    const deleteTool = tools.find((t) => t.name === 'delete_node')!;

    const result = await deleteTool.execute({ blockId: 'nonexistent' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.error).toBe('block_not_found');
    }
  });

  it('search_document finds blocks by text query', async () => {
    const { snapshot, operations } = makeSnapshot();
    const tools = createDocumentTools(snapshot, operations);
    const searchTool = tools.find((t) => t.name === 'search_document')!;

    const result = await searchTool.execute({ query: 'Hello' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.content).toContain('p1');
    }
  });

  it('search_document filters by blockType', async () => {
    const { snapshot, operations } = makeSnapshot();
    const tools = createDocumentTools(snapshot, operations);
    const searchTool = tools.find((t) => t.name === 'search_document')!;

    const result = await searchTool.execute({ query: '', blockType: 'heading' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.content).toContain('h1');
      expect(result.content).not.toContain('p1');
    }
  });
});
```

Write to `packages/rich-agent-core/tests/document-tools.test.ts`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/rich-agent-core/tests/document-tools.test.ts`
Expected: FAIL.

- [ ] **Step 3: Write document-tools.ts**

```typescript
import type { SerializedLexicalNode } from 'lexical';

import type { AgentToolConfig, AgentToolResult } from './protocol';
import type { EditorSnapshot } from './snapshot';
import type { AgentOperation } from './types';

function extractText(node: SerializedLexicalNode): string {
  const n = node as any;
  if (n.text) return n.text;
  if (n.children) return n.children.map(extractText).join('');
  return '';
}

export function createDocumentTools(
  snapshot: EditorSnapshot,
  operations: AgentOperation[],
  readSelection?: () => { text: string; anchorBlockId: string; focusBlockId: string } | null,
): AgentToolConfig[] {
  const readSelectionTool: AgentToolConfig = {
    name: 'read_selection',
    description: 'Read the current text selection and its block IDs',
    parameters: { type: 'object', properties: {} },
    execute: async (): Promise<AgentToolResult> => {
      const sel = readSelection?.();
      if (!sel) {
        return { ok: true, content: 'No selection active.' };
      }
      return {
        ok: true,
        content: JSON.stringify({
          text: sel.text,
          anchorBlockId: sel.anchorBlockId,
          focusBlockId: sel.focusBlockId,
        }),
      };
    },
  };

  const insertNodeTool: AgentToolConfig = {
    name: 'insert_node',
    description: 'Insert a new block node at a position relative to an existing block',
    parameters: {
      type: 'object',
      properties: {
        position: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['after', 'before', 'root'] },
            blockId: { type: 'string' },
            index: { type: 'number' },
          },
          required: ['type'],
        },
        node: { type: 'object' },
      },
      required: ['position', 'node'],
    },
    execute: async (params: unknown): Promise<AgentToolResult> => {
      const { position, node } = params as { position: any; node: SerializedLexicalNode };
      // Validate anchor exists if not root
      if (position.type !== 'root' && !snapshot.getBlock(position.blockId)) {
        return {
          ok: false,
          error: {
            error: 'block_not_found',
            blockId: position.blockId,
            message: `Block "${position.blockId}" not found in document.`,
          },
        };
      }
      const op: AgentOperation = { op: 'insert', position, node };
      operations.push(op);
      return {
        ok: true,
        content: `Inserted node ${position.type} block "${position.blockId ?? 'root'}"`,
      };
    },
  };

  const replaceNodeTool: AgentToolConfig = {
    name: 'replace_node',
    description: 'Replace an existing block node by its blockId',
    parameters: {
      type: 'object',
      properties: {
        blockId: { type: 'string' },
        node: { type: 'object' },
      },
      required: ['blockId', 'node'],
    },
    execute: async (params: unknown): Promise<AgentToolResult> => {
      const { blockId, node } = params as { blockId: string; node: SerializedLexicalNode };
      const existing = snapshot.getBlock(blockId);
      if (!existing) {
        return {
          ok: false,
          error: {
            error: 'block_not_found',
            blockId,
            message: `Block "${blockId}" not found in document.`,
          },
        };
      }
      const op: AgentOperation = { op: 'replace', blockId, node };
      operations.push(op);
      return { ok: true, content: `Replaced block "${blockId}"` };
    },
  };

  const deleteNodeTool: AgentToolConfig = {
    name: 'delete_node',
    description: 'Delete an existing block node by its blockId',
    parameters: {
      type: 'object',
      properties: {
        blockId: { type: 'string' },
      },
      required: ['blockId'],
    },
    execute: async (params: unknown): Promise<AgentToolResult> => {
      const { blockId } = params as { blockId: string };
      const existing = snapshot.getBlock(blockId);
      if (!existing) {
        return {
          ok: false,
          error: {
            error: 'block_not_found',
            blockId,
            message: `Block "${blockId}" not found in document.`,
          },
        };
      }
      const op: AgentOperation = { op: 'delete', blockId };
      operations.push(op);
      return { ok: true, content: `Deleted block "${blockId}"` };
    },
  };

  const searchDocumentTool: AgentToolConfig = {
    name: 'search_document',
    description: 'Search for blocks in the document by text content or block type',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        blockType: { type: 'string' },
      },
      required: ['query'],
    },
    execute: async (params: unknown): Promise<AgentToolResult> => {
      const { query, blockType } = params as { query: string; blockType?: string };
      const matches: Array<{ blockId: string; nodeType: string; textContent: string }> = [];

      for (const blockId of snapshot.blockIds) {
        const block = snapshot.getBlock(blockId)!;
        const nodeType = (block as any).type ?? 'unknown';
        if (blockType && nodeType !== blockType) continue;
        const text = extractText(block);
        if (query && !text.toLowerCase().includes(query.toLowerCase())) continue;
        matches.push({ blockId, nodeType, textContent: text });
      }

      return { ok: true, content: JSON.stringify(matches) };
    },
  };

  return [readSelectionTool, insertNodeTool, replaceNodeTool, deleteNodeTool, searchDocumentTool];
}
```

Write to `packages/rich-agent-core/src/document-tools.ts`.

- [ ] **Step 4: Update barrel export**

Add to `packages/rich-agent-core/src/index.ts`:

```typescript
export { createDocumentTools } from './document-tools';
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run packages/rich-agent-core/tests/document-tools.test.ts`
Expected: All 6 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/rich-agent-core/src/document-tools.ts packages/rich-agent-core/src/index.ts packages/rich-agent-core/tests/document-tools.test.ts
git commit -m "feat(rich-agent-core): add document tools"
```

---

## Task 8: Agent executor

**Files:**

- Create: `packages/rich-agent-core/src/agent-executor.ts`
- Create: `packages/rich-agent-core/tests/agent-executor.test.ts`
- Modify: `packages/rich-agent-core/src/index.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, expect, it } from 'vitest';

import { createAgentExecutor } from '../src/agent-executor';
import type { AgentToolConfig, LLMChunk, LLMProvider } from '../src/protocol';
import { createSnapshot } from '../src/snapshot';
import { createAgentStore } from '../src/store';

function makeEditorState() {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text: 'Hello',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
          textFormat: 0,
          textStyle: '',
          $: { blockId: 'p1' },
        },
      ],
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    },
  };
}

function mockProvider(chunks: LLMChunk[]): LLMProvider {
  return {
    async *chat() {
      for (const chunk of chunks) {
        yield chunk;
      }
    },
  };
}

describe('createAgentExecutor', () => {
  it('executes a simple text-only response', async () => {
    const store = createAgentStore();
    const snapshot = createSnapshot(makeEditorState() as any);
    const provider = mockProvider([{ type: 'text', text: 'I will help you.' }, { type: 'done' }]);

    const executor = createAgentExecutor({
      provider,
      snapshot,
      store,
      tools: [],
      systemMessages: [{ role: 'system', content: 'You are a helpful agent.' }],
    });

    const result = await executor.run(
      {
        role: 'user',
        content: 'Fix the text',
        cacheBreakpoint: true,
      },
      { role: 'user', content: 'Document: Hello' },
    );

    expect(result.operations).toHaveLength(0);
    expect(store.getState().bubbles.length).toBeGreaterThan(0);
  });

  it('executes tool calls and accumulates operations', async () => {
    const store = createAgentStore();
    const snapshot = createSnapshot(makeEditorState() as any);
    const provider = mockProvider([
      {
        type: 'tool_call',
        id: 'tc1',
        name: 'delete_node',
        arguments: JSON.stringify({ blockId: 'p1' }),
      },
      { type: 'done' },
      // After tool result, LLM responds with done
      { type: 'text', text: 'Deleted.' },
      { type: 'done' },
    ]);

    const executor = createAgentExecutor({
      provider,
      snapshot,
      store,
      tools: [],
      systemMessages: [{ role: 'system', content: 'You are a helpful agent.' }],
    });

    const result = await executor.run(
      {
        role: 'user',
        content: 'Delete the paragraph',
        cacheBreakpoint: true,
      },
      { role: 'user', content: 'Document: Hello' },
    );

    expect(result.operations).toHaveLength(1);
    expect(result.operations[0].op).toBe('delete');
  });

  it('supports abort via AbortController', async () => {
    const store = createAgentStore();
    const snapshot = createSnapshot(makeEditorState() as any);
    const controller = new AbortController();

    // Provider that never ends
    const provider: LLMProvider = {
      async *chat() {
        yield { type: 'text' as const, text: 'thinking...' };
        await new Promise((_, reject) => {
          controller.signal.addEventListener('abort', () => reject(new Error('aborted')));
        });
      },
    };

    const executor = createAgentExecutor({
      provider,
      snapshot,
      store,
      tools: [],
      systemMessages: [{ role: 'system', content: 'Agent' }],
      signal: controller.signal,
    });

    const promise = executor.run(
      { role: 'user', content: 'Do something' },
      { role: 'user', content: 'Doc' },
    );

    // Abort after a tick
    setTimeout(() => controller.abort(), 10);

    await expect(promise).rejects.toThrow();
  });
});
```

Write to `packages/rich-agent-core/tests/agent-executor.test.ts`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/rich-agent-core/tests/agent-executor.test.ts`
Expected: FAIL.

- [ ] **Step 3: Write agent-executor.ts**

```typescript
import type {
  AgentToolConfig,
  AgentToolResult,
  ChatMessage,
  LLMProvider,
  ToolSchema,
} from './protocol';
import { createDocumentTools } from './document-tools';
import type { EditorSnapshot } from './snapshot';
import type { AgentStore } from './store';
import type { AgentOperation } from './types';

export type AgentExecutorConfig = {
  provider: LLMProvider;
  snapshot: EditorSnapshot;
  store: AgentStore;
  tools: AgentToolConfig[];
  systemMessages: ChatMessage[];
  signal?: AbortSignal;
  readSelection?: () => { text: string; anchorBlockId: string; focusBlockId: string } | null;
};

export type AgentExecutorResult = {
  operations: AgentOperation[];
};

function toolConfigToSchema(tool: AgentToolConfig): ToolSchema {
  return {
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  };
}

export function createAgentExecutor(config: AgentExecutorConfig) {
  const { provider, snapshot, store, signal, readSelection } = config;
  const operations: AgentOperation[] = [];
  const documentTools = createDocumentTools(snapshot, operations, readSelection);
  const allTools = [...documentTools, ...config.tools];
  const toolMap = new Map(allTools.map((t) => [t.name, t]));
  const toolSchemas = allTools.map(toolConfigToSchema);

  async function executeTool(name: string, args: string): Promise<AgentToolResult> {
    const tool = toolMap.get(name);
    if (!tool) {
      return { ok: false, error: { error: 'unknown_tool', message: `Tool "${name}" not found` } };
    }
    const params = JSON.parse(args);
    return tool.execute(params);
  }

  async function run(
    actionPrompt: ChatMessage,
    documentMessage: ChatMessage,
  ): Promise<AgentExecutorResult> {
    store.dispatch({ type: 'set_status', status: 'running' });

    const turns: ChatMessage[] = [documentMessage];

    const maxTurns = 20;
    for (let turn = 0; turn < maxTurns; turn++) {
      signal?.throwIfAborted();

      const messages: ChatMessage[] = [...config.systemMessages, actionPrompt, ...turns];

      // Stream LLM response
      let textAccum = '';
      const toolCalls: Array<{ id: string; name: string; arguments: string }> = [];

      store.dispatch({
        type: 'add_bubble',
        bubble: { type: 'assistant', content: '', streaming: true },
      });

      for await (const chunk of provider.chat(messages, toolSchemas)) {
        signal?.throwIfAborted();

        if (chunk.type === 'text') {
          textAccum += chunk.text;
          store.dispatch({
            type: 'update_last_bubble',
            bubble: { type: 'assistant', content: textAccum, streaming: true },
          });
        } else if (chunk.type === 'tool_call') {
          toolCalls.push({ id: chunk.id, name: chunk.name, arguments: chunk.arguments });
        }
      }

      // Finalize assistant bubble
      store.dispatch({
        type: 'update_last_bubble',
        bubble: { type: 'assistant', content: textAccum, streaming: false },
      });

      // If no tool calls, we're done
      if (toolCalls.length === 0) break;

      // Record tool call message
      turns.push({ role: 'assistant_tool_call', toolCalls });

      // Execute tool calls
      for (const tc of toolCalls) {
        store.dispatch({
          type: 'add_bubble',
          bubble: { type: 'tool_call', toolName: tc.name, params: JSON.parse(tc.arguments) },
        });

        const result = await executeTool(tc.name, tc.arguments);

        const content = result.ok ? result.content : JSON.stringify(result.error);

        store.dispatch({
          type: 'add_bubble',
          bubble: { type: 'tool_result', toolName: tc.name, success: result.ok, summary: content },
        });

        turns.push({
          role: 'tool_result',
          toolCallId: tc.id,
          content,
          isError: !result.ok,
        });
      }
    }

    store.dispatch({ type: 'set_status', status: 'done' });
    return { operations };
  }

  return { run };
}
```

Write to `packages/rich-agent-core/src/agent-executor.ts`.

- [ ] **Step 4: Update barrel export**

Add to `packages/rich-agent-core/src/index.ts`:

```typescript
export { createAgentExecutor } from './agent-executor';
export type { AgentExecutorConfig, AgentExecutorResult } from './agent-executor';
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run packages/rich-agent-core/tests/agent-executor.test.ts`
Expected: All 3 tests PASS.

- [ ] **Step 6: Verify full core build**

Run: `pnpm --filter @haklex/rich-agent-core build`
Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add packages/rich-agent-core/src/agent-executor.ts packages/rich-agent-core/src/index.ts packages/rich-agent-core/tests/agent-executor.test.ts
git commit -m "feat(rich-agent-core): add agent executor with LLM loop"
```

---

## Task 9: Scaffold `@haklex/rich-ext-ai-agent` package

**Files:**

- Create: `packages/rich-ext-ai-agent/package.json`
- Create: `packages/rich-ext-ai-agent/tsconfig.json`
- Create: `packages/rich-ext-ai-agent/vite.config.ts`
- Create: `packages/rich-ext-ai-agent/src/index.ts`
- Create: `packages/rich-ext-ai-agent/src/static.ts`
- Create: `packages/rich-ext-ai-agent/src/styles.css.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "dependencies": {
    "@haklex/rich-agent-core": "workspace:*",
    "@haklex/rich-editor": "workspace:*",
    "@haklex/rich-editor-ui": "workspace:*",
    "@haklex/rich-style-token": "workspace:*",
    "lucide-react": "^1.0.0"
  },
  "description": "AI agent editor integration: diff UI, action registry, agent panel plugin",
  "devDependencies": {
    "@lexical/react": "^0.42.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vanilla-extract/css": "^1.18.0",
    "@vanilla-extract/vite-plugin": "^5.1.4",
    "lexical": "^0.42.0",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vite-plugin-dts": "^4.5.4"
  },
  "exports": {
    ".": "./src/index.ts",
    "./static": "./src/static.ts",
    "./style.css": "./dist/rich-ext-ai-agent.css"
  },
  "files": ["dist"],
  "license": "MIT",
  "main": "./src/index.ts",
  "name": "@haklex/rich-ext-ai-agent",
  "peerDependencies": {
    "@lexical/react": "^0.42.0",
    "lexical": "^0.42.0",
    "react": ">=19",
    "react-dom": ">=19"
  },
  "publishConfig": {
    "access": "public",
    "exports": {
      ".": {
        "import": "./dist/index.mjs",
        "types": "./dist/index.d.ts"
      },
      "./static": {
        "import": "./dist/static.mjs",
        "types": "./dist/static.d.ts"
      },
      "./style.css": "./dist/rich-ext-ai-agent.css"
    },
    "main": "./dist/index.mjs",
    "types": "./dist/index.d.ts"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/Innei/haklex.git",
    "directory": "packages/rich-ext-ai-agent"
  },
  "scripts": {
    "build": "vite build",
    "dev:build": "vite build --watch"
  },
  "type": "module",
  "version": "0.0.90"
}
```

Write to `packages/rich-ext-ai-agent/package.json`.

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "baseUrl": "./src"
  },
  "exclude": ["node_modules", "dist"],
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

Write to `packages/rich-ext-ai-agent/tsconfig.json`.

- [ ] **Step 3: Create vite.config.ts**

```typescript
import { createViteConfig } from '../vite.shared';

export default createViteConfig({
  vanillaExtract: true,
  entry: {
    index: 'src/index.ts',
    static: 'src/static.ts',
  },
});
```

Write to `packages/rich-ext-ai-agent/vite.config.ts`.

- [ ] **Step 4: Create styles.css.ts**

```typescript
import { createVar, style } from '@vanilla-extract/css';

export const diffInsertBg = createVar();
export const diffDeleteBg = createVar();

export const diffVars = style({
  vars: {
    [diffInsertBg]: 'rgba(34, 197, 94, 0.15)',
    [diffDeleteBg]: 'rgba(239, 68, 68, 0.15)',
  },
});

export const diffInsertBlock = style({
  background: diffInsertBg,
  borderLeft: '3px solid rgb(34, 197, 94)',
  position: 'relative',
});

export const diffDeleteBlock = style({
  background: diffDeleteBg,
  borderLeft: '3px solid rgb(239, 68, 68)',
  textDecoration: 'line-through',
  opacity: 0.6,
  position: 'relative',
});

export const diffReplaceOriginal = style({
  background: diffDeleteBg,
  borderLeft: '3px solid rgb(239, 68, 68)',
  textDecoration: 'line-through',
  opacity: 0.6,
});

export const diffReplaceNew = style({
  background: diffInsertBg,
  borderLeft: '3px solid rgb(34, 197, 94)',
});

export const diffActions = style({
  position: 'absolute',
  top: '4px',
  right: '4px',
  display: 'flex',
  gap: '4px',
});

export const actionBar = style({
  display: 'flex',
  gap: '8px',
  padding: '8px 12px',
  borderBottom: '1px solid #e5e5e5',
  alignItems: 'center',
  fontSize: '13px',
});
```

Write to `packages/rich-ext-ai-agent/src/styles.css.ts`.

- [ ] **Step 5: Create barrel exports**

```typescript
// src/index.ts — edit entry
export { AgentPanelPlugin } from './plugins/AgentPanelPlugin';
export { AgentDiffEditNode } from './nodes/AgentDiffEditNode';
export { AgentActionBar } from './components/AgentActionBar';
export { registerAgentAction } from './registry';
export type { AgentActionConfig } from './registry';
```

Write to `packages/rich-ext-ai-agent/src/index.ts`.

```typescript
// src/static.ts — static/read-only entry
export { AgentDiffNode } from './nodes/AgentDiffNode';
```

Write to `packages/rich-ext-ai-agent/src/static.ts`.

- [ ] **Step 6: Install dependencies**

Run: `pnpm install`
Expected: lockfile updates.

- [ ] **Step 7: Commit**

```bash
git add packages/rich-ext-ai-agent/
git commit -m "feat(rich-ext-ai-agent): scaffold package with styles"
```

---

## Task 10: Diff nodes and renderers

**Files:**

- Create: `packages/rich-ext-ai-agent/src/nodes/AgentDiffNode.ts`
- Create: `packages/rich-ext-ai-agent/src/nodes/AgentDiffEditNode.ts`
- Create: `packages/rich-ext-ai-agent/src/renderers/AgentDiffRenderer.tsx`
- Create: `packages/rich-ext-ai-agent/src/renderers/AgentDiffEditRenderer.tsx`
- Create: `packages/rich-ext-ai-agent/src/components/DiffOverlay.tsx`
- Create: `packages/rich-ext-ai-agent/src/components/AgentActionBar.tsx`

This task builds the diff visualization components. Since these are React/Lexical UI components that depend on runtime editor context, they are implementation-only (no unit tests — tested via the demo playground in a later task).

- [ ] **Step 1: Create AgentDiffNode (static)**

Refer to existing `BannerNode.ts` pattern. This is a DecoratorNode that wraps a diff entry's visual.

```typescript
import type { DiffEntry } from '@haklex/rich-agent-core';
import type { EditorConfig, LexicalEditor, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import { DecoratorNode } from 'lexical';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { AgentDiffRenderer } from '../renderers/AgentDiffRenderer';

export type SerializedAgentDiffNode = Spread<
  { diffEntryId: string; opType: 'insert' | 'replace' | 'delete' },
  SerializedLexicalNode
>;

export class AgentDiffNode extends DecoratorNode<ReactElement> {
  __diffEntryId: string;
  __opType: 'insert' | 'replace' | 'delete';

  static getType(): string {
    return 'agent-diff';
  }

  static clone(node: AgentDiffNode): AgentDiffNode {
    return new AgentDiffNode(node.__diffEntryId, node.__opType, node.__key);
  }

  constructor(diffEntryId: string, opType: 'insert' | 'replace' | 'delete', key?: NodeKey) {
    super(key);
    this.__diffEntryId = diffEntryId;
    this.__opType = opType;
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.setAttribute('data-agent-diff', this.__opType);
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  static importJSON(json: SerializedAgentDiffNode): AgentDiffNode {
    return new AgentDiffNode(json.diffEntryId, json.opType);
  }

  exportJSON(): SerializedAgentDiffNode {
    return {
      ...super.exportJSON(),
      diffEntryId: this.__diffEntryId,
      opType: this.__opType,
      type: 'agent-diff',
      version: 1,
    };
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(AgentDiffRenderer, {
      diffEntryId: this.__diffEntryId,
      opType: this.__opType,
    });
  }
}

export function $createAgentDiffNode(
  diffEntryId: string,
  opType: 'insert' | 'replace' | 'delete',
): AgentDiffNode {
  return new AgentDiffNode(diffEntryId, opType);
}

export function $isAgentDiffNode(node: unknown): node is AgentDiffNode {
  return node instanceof AgentDiffNode;
}
```

Write to `packages/rich-ext-ai-agent/src/nodes/AgentDiffNode.ts`.

- [ ] **Step 2: Create AgentDiffEditNode**

```typescript
import type { EditorConfig, LexicalEditor } from 'lexical';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { AgentDiffEditRenderer } from '../renderers/AgentDiffEditRenderer';
import { AgentDiffNode, type SerializedAgentDiffNode } from './AgentDiffNode';

export class AgentDiffEditNode extends AgentDiffNode {
  static getType(): string {
    return 'agent-diff';
  }

  static clone(node: AgentDiffEditNode): AgentDiffEditNode {
    return new AgentDiffEditNode(node.__diffEntryId, node.__opType, node.__key);
  }

  static importJSON(json: SerializedAgentDiffNode): AgentDiffEditNode {
    return new AgentDiffEditNode(json.diffEntryId, json.opType);
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(AgentDiffEditRenderer, {
      nodeKey: this.__key,
      diffEntryId: this.__diffEntryId,
      opType: this.__opType,
    });
  }
}

export function $createAgentDiffEditNode(
  diffEntryId: string,
  opType: 'insert' | 'replace' | 'delete',
): AgentDiffEditNode {
  return new AgentDiffEditNode(diffEntryId, opType);
}
```

Write to `packages/rich-ext-ai-agent/src/nodes/AgentDiffEditNode.ts`.

- [ ] **Step 3: Create AgentDiffRenderer (static)**

```typescript
import type { ReactElement } from 'react'

import { diffDeleteBlock, diffInsertBlock, diffReplaceNew, diffReplaceOriginal } from '../styles.css'

interface AgentDiffRendererProps {
  diffEntryId: string
  opType: 'insert' | 'replace' | 'delete'
}

export function AgentDiffRenderer({ opType }: AgentDiffRendererProps): ReactElement {
  const className =
    opType === 'insert'
      ? diffInsertBlock
      : opType === 'delete'
        ? diffDeleteBlock
        : diffReplaceOriginal

  const marker = opType === 'insert' ? '+' : opType === 'delete' ? '-' : '~'

  return (
    <div className={className}>
      <span style={{ position: 'absolute', left: '-20px', fontWeight: 'bold', color: '#737373' }}>
        {marker}
      </span>
    </div>
  )
}
```

Write to `packages/rich-ext-ai-agent/src/renderers/AgentDiffRenderer.tsx`.

- [ ] **Step 4: Create AgentDiffEditRenderer**

```typescript
import { ActionButton } from '@haklex/rich-editor-ui'
import { Check, X } from 'lucide-react'
import type { ReactElement } from 'react'

import { diffActions, diffDeleteBlock, diffInsertBlock, diffReplaceNew, diffReplaceOriginal } from '../styles.css'

interface AgentDiffEditRendererProps {
  nodeKey: string
  diffEntryId: string
  opType: 'insert' | 'replace' | 'delete'
  onAccept?: (entryId: string) => void
  onReject?: (entryId: string) => void
}

export function AgentDiffEditRenderer({
  diffEntryId,
  opType,
  onAccept,
  onReject,
}: AgentDiffEditRendererProps): ReactElement {
  const className =
    opType === 'insert'
      ? diffInsertBlock
      : opType === 'delete'
        ? diffDeleteBlock
        : diffReplaceOriginal

  const marker = opType === 'insert' ? '+' : opType === 'delete' ? '-' : '~'

  return (
    <div className={className} style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: '-20px', fontWeight: 'bold', color: '#737373' }}>
        {marker}
      </span>
      <div className={diffActions}>
        <ActionButton onClick={() => onAccept?.(diffEntryId)} title="Accept">
          <Check size={14} />
        </ActionButton>
        <ActionButton onClick={() => onReject?.(diffEntryId)} title="Reject">
          <X size={14} />
        </ActionButton>
      </div>
    </div>
  )
}
```

Write to `packages/rich-ext-ai-agent/src/renderers/AgentDiffEditRenderer.tsx`.

- [ ] **Step 5: Create DiffOverlay**

```typescript
import type { ReactElement } from 'react'

import { diffReplaceNew, diffReplaceOriginal } from '../styles.css'

interface DiffOverlayProps {
  opType: 'insert' | 'replace' | 'delete'
  originalText?: string
  newText?: string
}

export function DiffOverlay({ opType, originalText, newText }: DiffOverlayProps): ReactElement {
  if (opType === 'replace') {
    return (
      <div>
        {originalText && <div className={diffReplaceOriginal}>{originalText}</div>}
        {newText && <div className={diffReplaceNew}>{newText}</div>}
      </div>
    )
  }
  return <></>
}
```

Write to `packages/rich-ext-ai-agent/src/components/DiffOverlay.tsx`.

- [ ] **Step 6: Create AgentActionBar**

```typescript
import { ActionButton } from '@haklex/rich-editor-ui'
import { Check, X } from 'lucide-react'
import type { ReactElement } from 'react'

import { actionBar } from '../styles.css'

interface AgentActionBarProps {
  pendingCount: number
  onAcceptAll: () => void
  onRejectAll: () => void
}

export function AgentActionBar({ pendingCount, onAcceptAll, onRejectAll }: AgentActionBarProps): ReactElement {
  if (pendingCount === 0) return <></>

  return (
    <div className={actionBar}>
      <span>{pendingCount} pending change{pendingCount !== 1 ? 's' : ''}</span>
      <ActionButton onClick={onAcceptAll}>
        <Check size={14} /> Accept All
      </ActionButton>
      <ActionButton onClick={onRejectAll}>
        <X size={14} /> Reject All
      </ActionButton>
    </div>
  )
}
```

Write to `packages/rich-ext-ai-agent/src/components/AgentActionBar.tsx`.

- [ ] **Step 7: Verify build**

Run: `pnpm --filter @haklex/rich-ext-ai-agent build`
Expected: Build succeeds (or expected errors from missing plugin/hook files — create stubs if needed).

- [ ] **Step 8: Commit**

```bash
git add packages/rich-ext-ai-agent/src/
git commit -m "feat(rich-ext-ai-agent): add diff nodes, renderers, and action bar"
```

---

## Task 11: Agent action registry and panel plugin

**Files:**

- Create: `packages/rich-ext-ai-agent/src/registry.ts`
- Create: `packages/rich-ext-ai-agent/src/hooks/useAgentLoop.ts`
- Create: `packages/rich-ext-ai-agent/src/plugins/AgentPanelPlugin.tsx`
- Modify: `packages/rich-ext-ai-agent/src/index.ts`

- [ ] **Step 1: Create registry.ts**

```typescript
import type { AgentContext } from '@haklex/rich-agent-core';
import type { ReactNode } from 'react';

export type AgentActionConfig = {
  name: string;
  description: string;
  icon?: ReactNode;
  placement?: ('toolbar' | 'floating' | 'slash')[];
  when?: 'always' | 'selection';
  prompt: string | ((context: AgentContext) => string);
};

export function registerAgentAction(
  actions: AgentActionConfig[],
  config: AgentActionConfig,
): () => void {
  actions.push(config);
  return () => {
    const idx = actions.indexOf(config);
    if (idx >= 0) actions.splice(idx, 1);
  };
}

export const builtInActions: AgentActionConfig[] = [
  {
    name: 'edit-selection',
    description: 'Edit the selected text with AI',
    placement: ['floating'],
    when: 'selection',
    prompt: (ctx) =>
      `Edit the following selected text as instructed by the user. Selection:\n${ctx.selection?.text ?? ''}`,
  },
  {
    name: 'insert-below',
    description: 'Insert AI-generated content below',
    placement: ['slash'],
    when: 'always',
    prompt: 'Insert new content below the current block as instructed by the user.',
  },
];
```

Write to `packages/rich-ext-ai-agent/src/registry.ts`.

- [ ] **Step 2: Create useAgentLoop hook**

```typescript
import {
  type AgentStore,
  type AgentToolConfig,
  type ChatMessage,
  createAgentExecutor,
  createDiffEngine,
  createSnapshot,
  type LLMProvider,
} from '@haklex/rich-agent-core';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { SerializedEditorState } from 'lexical';
import { useCallback, useRef } from 'react';

import type { AgentActionConfig } from '../registry';

export type UseAgentLoopOptions = {
  provider: LLMProvider;
  store: AgentStore;
  tools?: AgentToolConfig[];
  systemMessages?: ChatMessage[];
};

export function useAgentLoop(options: UseAgentLoopOptions) {
  const [editor] = useLexicalComposerContext();
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (action: AgentActionConfig, userInput: string) => {
      // Abort any running loop
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Capture snapshot
      const serialized = editor.getEditorState().toJSON() as SerializedEditorState;
      const snapshot = createSnapshot(serialized);

      // Build action prompt
      const prompt =
        typeof action.prompt === 'function'
          ? action.prompt({
              selection: null, // TODO: read from editor
              getBlockByBlockId: (id) => snapshot.getBlock(id) ?? null,
              getDocumentStructure: () => serialized.root as any,
            })
          : action.prompt;

      const actionPrompt: ChatMessage = {
        role: 'user',
        content: `${prompt}\n\nUser instruction: ${userInput}`,
        cacheBreakpoint: true,
      };

      const documentMessage: ChatMessage = {
        role: 'user',
        content: `## Document\n${JSON.stringify(serialized)}`,
      };

      const executor = createAgentExecutor({
        provider: options.provider,
        snapshot,
        store: options.store,
        tools: options.tools ?? [],
        systemMessages: options.systemMessages ?? [
          {
            role: 'system',
            content: 'You are an AI editor agent. Use the provided tools to modify the document.',
            cacheBreakpoint: true,
          },
        ],
        signal: controller.signal,
      });

      const result = await executor.run(actionPrompt, documentMessage);

      // Generate diff state
      if (result.operations.length > 0) {
        const diffState = createDiffEngine(result.operations, serialized);
        options.store.dispatch({ type: 'set_diff_state', diffState });
      }

      return result;
    },
    [editor, options],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { run, abort };
}
```

Write to `packages/rich-ext-ai-agent/src/hooks/useAgentLoop.ts`.

- [ ] **Step 3: Create AgentPanelPlugin**

```typescript
import type {
  AgentStore,
  AgentToolConfig,
  ChatMessage,
  LLMProvider,
} from '@haklex/rich-agent-core';
import type { ReactElement } from 'react';

import { useAgentLoop } from '../hooks/useAgentLoop';
import type { AgentActionConfig } from '../registry';

export interface AgentPanelPluginProps {
  provider: LLMProvider;
  store: AgentStore;
  actions?: AgentActionConfig[];
  tools?: AgentToolConfig[];
  systemMessages?: ChatMessage[];
}

export function AgentPanelPlugin({
  provider,
  store,
  tools,
  systemMessages,
}: AgentPanelPluginProps): ReactElement | null {
  // Initialize the agent loop — this makes it available
  // for other components to trigger via the store
  useAgentLoop({ provider, store, tools, systemMessages });

  // This plugin has no visual output — it provides the loop lifecycle.
  // UI is handled by ChatPanel (sibling) and diff nodes (injected into editor).
  return null;
}
```

Write to `packages/rich-ext-ai-agent/src/plugins/AgentPanelPlugin.tsx`.

- [ ] **Step 4: Update barrel export**

Ensure `packages/rich-ext-ai-agent/src/index.ts` matches:

```typescript
export { AgentActionBar } from './components/AgentActionBar';
export { useAgentLoop } from './hooks/useAgentLoop';
export { AgentDiffEditNode } from './nodes/AgentDiffEditNode';
export { AgentPanelPlugin } from './plugins/AgentPanelPlugin';
export type { AgentActionConfig } from './registry';
export { builtInActions, registerAgentAction } from './registry';
```

Write to `packages/rich-ext-ai-agent/src/index.ts`.

- [ ] **Step 5: Verify build**

Run: `pnpm --filter @haklex/rich-ext-ai-agent build`
Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add packages/rich-ext-ai-agent/src/
git commit -m "feat(rich-ext-ai-agent): add registry, useAgentLoop hook, and panel plugin"
```

---

## Task 12: Scaffold `@haklex/rich-agent-chat` package

**Files:**

- Create: `packages/rich-agent-chat/package.json`
- Create: `packages/rich-agent-chat/tsconfig.json`
- Create: `packages/rich-agent-chat/vite.config.ts`
- Create: `packages/rich-agent-chat/src/index.ts`
- Create: `packages/rich-agent-chat/src/types.ts`
- Create: `packages/rich-agent-chat/src/styles.css.ts`
- Create: `packages/rich-agent-chat/src/context.ts`
- Create: `packages/rich-agent-chat/src/ChatPanel.tsx`
- Create: `packages/rich-agent-chat/src/ChatMessageList.tsx`
- Create: `packages/rich-agent-chat/src/ChatInput.tsx`

- [ ] **Step 1: Create package.json**

```json
{
  "dependencies": {
    "@haklex/rich-agent-core": "workspace:*",
    "@haklex/rich-style-token": "workspace:*"
  },
  "description": "Chat panel UI for AI agent interaction",
  "devDependencies": {
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vanilla-extract/css": "^1.18.0",
    "@vanilla-extract/vite-plugin": "^5.1.4",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vite-plugin-dts": "^4.5.4"
  },
  "exports": {
    ".": "./src/index.ts",
    "./style.css": "./dist/rich-agent-chat.css"
  },
  "files": ["dist"],
  "license": "MIT",
  "main": "./src/index.ts",
  "name": "@haklex/rich-agent-chat",
  "peerDependencies": {
    "react": ">=19",
    "react-dom": ">=19"
  },
  "publishConfig": {
    "access": "public",
    "exports": {
      ".": {
        "import": "./dist/index.mjs",
        "types": "./dist/index.d.ts"
      },
      "./style.css": "./dist/rich-agent-chat.css"
    },
    "main": "./dist/index.mjs",
    "types": "./dist/index.d.ts"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/Innei/haklex.git",
    "directory": "packages/rich-agent-chat"
  },
  "scripts": {
    "build": "vite build",
    "dev:build": "vite build --watch"
  },
  "type": "module",
  "version": "0.0.90"
}
```

Write to `packages/rich-agent-chat/package.json`.

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "baseUrl": "./src"
  },
  "exclude": ["node_modules", "dist"],
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

Write to `packages/rich-agent-chat/tsconfig.json`.

- [ ] **Step 3: Create vite.config.ts**

```typescript
import { createViteConfig } from '../vite.shared';

export default createViteConfig({
  vanillaExtract: true,
});
```

Write to `packages/rich-agent-chat/vite.config.ts`.

- [ ] **Step 4: Create styles.css.ts**

```typescript
import { style } from '@vanilla-extract/css';

export const chatPanel = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  borderLeft: '1px solid #e5e5e5',
  fontSize: '14px',
});

export const messageList = style({
  flex: 1,
  overflowY: 'auto',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const bubbleUser = style({
  alignSelf: 'flex-end',
  background: '#f3f3f3',
  borderRadius: '12px 12px 2px 12px',
  padding: '8px 12px',
  maxWidth: '80%',
});

export const bubbleAssistant = style({
  alignSelf: 'flex-start',
  background: '#fff',
  border: '1px solid #e5e5e5',
  borderRadius: '12px 12px 12px 2px',
  padding: '8px 12px',
  maxWidth: '80%',
});

export const bubbleTool = style({
  alignSelf: 'flex-start',
  background: '#f9f9f9',
  border: '1px solid #e5e5e5',
  borderRadius: '8px',
  padding: '6px 10px',
  fontSize: '12px',
  color: '#737373',
  maxWidth: '80%',
});

export const bubbleError = style({
  alignSelf: 'center',
  background: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  borderRadius: '8px',
  padding: '6px 10px',
  fontSize: '12px',
  color: 'rgb(239, 68, 68)',
});

export const inputContainer = style({
  display: 'flex',
  padding: '8px 12px',
  borderTop: '1px solid #e5e5e5',
  gap: '8px',
});

export const inputField = style({
  'flex': 1,
  'border': '1px solid #e5e5e5',
  'borderRadius': '8px',
  'padding': '8px 12px',
  'fontSize': '14px',
  'outline': 'none',
  ':focus': {
    borderColor: '#a3a3a3',
  },
});

export const sendButton = style({
  'padding': '8px 16px',
  'background': '#171717',
  'color': '#fff',
  'border': 'none',
  'borderRadius': '8px',
  'cursor': 'pointer',
  'fontSize': '14px',
  ':hover': {
    background: '#404040',
  },
  ':disabled': {
    background: '#a3a3a3',
    cursor: 'not-allowed',
  },
});
```

Write to `packages/rich-agent-chat/src/styles.css.ts`.

- [ ] **Step 5: Create types.ts**

```typescript
export type { ChatBubble } from '@haklex/rich-agent-core';
```

Write to `packages/rich-agent-chat/src/types.ts`.

- [ ] **Step 6: Create context.ts**

```typescript
import type { AgentStore } from '@haklex/rich-agent-core';
import { createContext, use } from 'react';

const AgentStoreContext = createContext<AgentStore | null>(null);

export const AgentStoreProvider = AgentStoreContext.Provider;

export function useAgentStore(): AgentStore {
  const store = use(AgentStoreContext);
  if (!store) throw new Error('useAgentStore must be used within AgentStoreProvider');
  return store;
}
```

Write to `packages/rich-agent-chat/src/context.ts`.

- [ ] **Step 7: Create ChatMessageList.tsx**

```typescript
import type { ChatBubble } from '@haklex/rich-agent-core'
import type { ReactElement } from 'react'
import { useEffect, useRef } from 'react'

import {
  bubbleAssistant,
  bubbleError,
  bubbleTool,
  bubbleUser,
  messageList,
} from './styles.css'

interface ChatMessageListProps {
  bubbles: ChatBubble[]
}

export function ChatMessageList({ bubbles }: ChatMessageListProps): ReactElement {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [bubbles.length])

  return (
    <div ref={listRef} className={messageList}>
      {bubbles.map((bubble, i) => {
        switch (bubble.type) {
          case 'user':
            return (
              <div key={i} className={bubbleUser}>
                {bubble.content}
              </div>
            )
          case 'assistant':
            return (
              <div key={i} className={bubbleAssistant}>
                {bubble.content}
                {bubble.streaming && <span style={{ opacity: 0.5 }}> ...</span>}
              </div>
            )
          case 'tool_call':
            return (
              <div key={i} className={bubbleTool}>
                Tool: {bubble.toolName}
              </div>
            )
          case 'tool_result':
            return (
              <div key={i} className={bubbleTool}>
                {bubble.success ? 'OK' : 'Error'}: {bubble.summary}
              </div>
            )
          case 'error':
            return (
              <div key={i} className={bubbleError}>
                {bubble.message}
              </div>
            )
          case 'diff_summary':
            return (
              <div key={i} className={bubbleTool}>
                Diff: {bubble.accepted} accepted, {bubble.rejected} rejected, {bubble.pending} pending
              </div>
            )
        }
      })}
    </div>
  )
}
```

Write to `packages/rich-agent-chat/src/ChatMessageList.tsx`.

- [ ] **Step 8: Create ChatInput.tsx**

```typescript
import type { ReactElement } from 'react'
import { useCallback, useState } from 'react'

import { inputContainer, inputField, sendButton } from './styles.css'

interface ChatInputProps {
  disabled?: boolean
  onSend: (message: string) => void
}

export function ChatInput({ disabled, onSend }: ChatInputProps): ReactElement {
  const [value, setValue] = useState('')

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue('')
  }, [value, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  return (
    <div className={inputContainer}>
      <input
        className={inputField}
        placeholder="Ask AI to edit..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button className={sendButton} onClick={handleSend} disabled={disabled || !value.trim()}>
        Send
      </button>
    </div>
  )
}
```

Write to `packages/rich-agent-chat/src/ChatInput.tsx`.

- [ ] **Step 9: Create ChatPanel.tsx**

```typescript
import type { AgentStore, AgentStoreState } from '@haklex/rich-agent-core'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useState } from 'react'

import { ChatInput } from './ChatInput'
import { ChatMessageList } from './ChatMessageList'
import { chatPanel } from './styles.css'

interface ChatPanelProps {
  store: AgentStore
  onSend?: (message: string) => void
}

export function ChatPanel({ store, onSend }: ChatPanelProps): ReactElement {
  const [state, setState] = useState<AgentStoreState>(store.getState)

  useEffect(() => store.subscribe(setState), [store])

  const handleSend = useCallback(
    (message: string) => {
      store.dispatch({ type: 'add_bubble', bubble: { type: 'user', content: message } })
      onSend?.(message)
    },
    [store, onSend],
  )

  return (
    <div className={chatPanel}>
      <ChatMessageList bubbles={state.bubbles} />
      <ChatInput disabled={state.status === 'running'} onSend={handleSend} />
    </div>
  )
}
```

Write to `packages/rich-agent-chat/src/ChatPanel.tsx`.

- [ ] **Step 10: Create barrel export**

```typescript
export { ChatPanel } from './ChatPanel';
export { AgentStoreProvider, useAgentStore } from './context';
export type { ChatBubble } from './types';
```

Write to `packages/rich-agent-chat/src/index.ts`.

- [ ] **Step 11: Install and build**

Run: `pnpm install && pnpm --filter @haklex/rich-agent-chat build`
Expected: Build succeeds.

- [ ] **Step 12: Commit**

```bash
git add packages/rich-agent-chat/
git commit -m "feat(rich-agent-chat): scaffold chat panel with message list and input"
```

---

## Task 13: Full build verification and lint

**Files:**

- No new files.

- [ ] **Step 1: Run all core tests**

Run: `npx vitest run packages/rich-agent-core/tests/`
Expected: All tests pass.

- [ ] **Step 2: Build all three packages**

Run: `pnpm --filter @haklex/rich-agent-core --filter @haklex/rich-ext-ai-agent --filter @haklex/rich-agent-chat build`
Expected: All three builds succeed.

- [ ] **Step 3: Lint changed files**

Run: `npx eslint packages/rich-agent-core/src/ packages/rich-ext-ai-agent/src/ packages/rich-agent-chat/src/ --fix`
Expected: No errors (warnings acceptable).

- [ ] **Step 4: Fix any lint issues and commit**

```bash
git add packages/rich-agent-core/ packages/rich-ext-ai-agent/ packages/rich-agent-chat/
git commit -m "chore: lint fixes across agent packages"
```

---

## Task 14: Full build and turbo integration

**Files:**

- No new files.

- [ ] **Step 1: Run turbo build for all packages**

Run: `pnpm build:packages`
Expected: All packages including the three new ones build successfully. Turbo resolves the dependency graph correctly (`rich-agent-core` builds before `rich-ext-ai-agent` and `rich-agent-chat`).

- [ ] **Step 2: Verify dist output**

Run: `ls packages/rich-agent-core/dist/ packages/rich-ext-ai-agent/dist/ packages/rich-agent-chat/dist/`
Expected:

- `rich-agent-core/dist/`: `index.mjs`, `index.d.ts`
- `rich-ext-ai-agent/dist/`: `index.mjs`, `static.mjs`, `index.d.ts`, `static.d.ts`, CSS file
- `rich-agent-chat/dist/`: `index.mjs`, `index.d.ts`, CSS file

- [ ] **Step 3: Commit if any changes**

```bash
git add -A
git commit -m "chore: verify turbo build integration for agent packages"
```
