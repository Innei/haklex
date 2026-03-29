# Diff Review Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace auto-apply diff with a review workflow where agent changes are shown as a git-diff-style view in the chat panel and as editor overlays, applied only on user accept.

**Architecture:** Agent operations produce immutable `ReviewBatch` proposals with `baseSnapshot` and `previewSnapshot`. A `DiffReviewBubble` in the chat shows unified diff; a `DiffReviewOverlayPlugin` in the editor shows inline markers. The Lexical tree is mutated only on explicit accept. Conflict detection uses block fingerprints.

**Tech Stack:** TypeScript, Zustand vanilla store, Lexical 0.42, React 19, Vanilla Extract CSS, `@haklex/rich-diff` computeDiff algorithm.

**Spec:** `docs/superpowers/specs/2026-03-30-diff-review-workflow-design.md`

---

## File Structure

### New Files

| File                                                                 | Responsibility                                                      |
| -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `packages/rich-agent-core/src/review-types.ts`                       | ReviewState, ReviewBatch, ReviewHunk, ReviewEntry types             |
| `packages/rich-agent-core/src/review-engine.ts`                      | createReviewBatch, applyOpsToSnapshot, accept/reject/conflict logic |
| `packages/rich-agent-core/src/review-actions.ts`                     | Store action methods for review state                               |
| `packages/rich-agent-core/tests/review-engine.test.ts`               | Tests for review engine                                             |
| `packages/rich-agent-chat/src/components/DiffReviewBubble.tsx`       | Unified diff view in chat                                           |
| `packages/rich-agent-chat/src/components/diff-review-bubble.css.ts`  | Styles for diff review bubble                                       |
| `packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx` | Editor overlay markers                                              |
| `packages/rich-ext-ai-agent/src/components/GhostPreview.tsx`         | Ghost preview card for insert/replace                               |
| `packages/rich-ext-ai-agent/src/plugins/diff-review-overlay.css.ts`  | Overlay styles                                                      |

### Modified Files

| File                                                   | Change                                                  |
| ------------------------------------------------------ | ------------------------------------------------------- |
| `packages/rich-agent-core/src/initialState.ts`         | Replace `diffState` with `reviewState`                  |
| `packages/rich-agent-core/src/store-actions.ts`        | Add review actions, remove diff actions                 |
| `packages/rich-agent-core/src/selectors.ts`            | Add `reviewState` selector                              |
| `packages/rich-agent-core/src/index.ts`                | Export new review types and functions                   |
| `packages/rich-agent-chat/src/ChatMessageList.tsx`     | Render `DiffReviewBubble` for `diff_review` bubble type |
| `packages/rich-agent-chat/src/ChatPanel.tsx`           | Thread review callbacks                                 |
| `packages/rich-ext-ai-agent/src/hooks/useAgentLoop.ts` | Create ReviewBatch instead of DiffState                 |
| `packages/rich-ext-ai-agent/src/index.ts`              | Export new plugin                                       |
| `demo/src/pages/AgentPage.tsx`                         | Use DiffReviewOverlayPlugin, wire accept/reject         |

---

### Task 1: Review Types

**Files:**

- Create: `packages/rich-agent-core/src/review-types.ts`

- [ ] **Step 1: Create review types file**

```typescript
// packages/rich-agent-core/src/review-types.ts
import type { SerializedEditorState } from 'lexical';

import type { AgentOperation } from './types';

export type ReviewEntryStatus = 'pending' | 'accepted' | 'rejected' | 'conflicted';
export type ReviewBatchStatus = 'pending' | 'accepted' | 'rejected' | 'conflicted';

export type ReviewEntry = {
  id: string;
  op: AgentOperation;
  targetBlockId?: string;
  originalFingerprint: string;
  status: ReviewEntryStatus;
};

export type ReviewBatch = {
  id: string;
  baseRevision: number;
  baseSnapshot: SerializedEditorState;
  previewSnapshot: SerializedEditorState;
  status: ReviewBatchStatus;
  entries: ReviewEntry[];
  touchedBlockIds: string[];
};

export type ReviewState = {
  documentRevision: number;
  batches: ReviewBatch[];
};
```

- [ ] **Step 2: Commit**

```bash
git add packages/rich-agent-core/src/review-types.ts
git commit -m "feat(agent-core): add ReviewState types for diff review workflow"
```

---

### Task 2: Pure applyOpsToSnapshot Function

**Files:**

- Create: `packages/rich-agent-core/src/review-engine.ts`
- Create: `packages/rich-agent-core/tests/review-engine.test.ts`

- [ ] **Step 1: Write failing tests for applyOpsToSnapshot**

```typescript
// packages/rich-agent-core/tests/review-engine.test.ts
import { describe, expect, it } from 'vitest';

import { applyOpsToSnapshot } from '../src/review-engine';
import type { AgentOperation } from '../src/types';

function makeDoc(children: any[]) {
  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  };
}

function makeParagraph(text: string, blockId: string) {
  return {
    type: 'paragraph',
    children: [{ type: 'text', text, detail: 0, format: 0, mode: 'normal', style: '', version: 1 }],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    textFormat: 0,
    textStyle: '',
    $: { blockId },
  };
}

describe('applyOpsToSnapshot', () => {
  const base = makeDoc([makeParagraph('Hello', 'b1'), makeParagraph('World', 'b2')]);

  it('inserts a node after a block', () => {
    const ops: AgentOperation[] = [
      {
        op: 'insert',
        position: { type: 'after', blockId: 'b1' },
        node: makeParagraph('Middle', 'new1') as any,
      },
    ];
    const result = applyOpsToSnapshot(base, ops);
    const children = (result.root as any).children;
    expect(children).toHaveLength(3);
    expect(children[1].children[0].text).toBe('Middle');
  });

  it('replaces a block', () => {
    const ops: AgentOperation[] = [
      {
        op: 'replace',
        blockId: 'b1',
        node: makeParagraph('Replaced', 'b1') as any,
      },
    ];
    const result = applyOpsToSnapshot(base, ops);
    const children = (result.root as any).children;
    expect(children).toHaveLength(2);
    expect(children[0].children[0].text).toBe('Replaced');
  });

  it('deletes a block', () => {
    const ops: AgentOperation[] = [{ op: 'delete', blockId: 'b1' }];
    const result = applyOpsToSnapshot(base, ops);
    const children = (result.root as any).children;
    expect(children).toHaveLength(1);
    expect(children[0].children[0].text).toBe('World');
  });

  it('handles multiple ops sequentially', () => {
    const ops: AgentOperation[] = [
      { op: 'delete', blockId: 'b1' },
      {
        op: 'insert',
        position: { type: 'after', blockId: 'b2' },
        node: makeParagraph('New', 'b3') as any,
      },
    ];
    const result = applyOpsToSnapshot(base, ops);
    const children = (result.root as any).children;
    expect(children).toHaveLength(2);
    expect(children[0].children[0].text).toBe('World');
    expect(children[1].children[0].text).toBe('New');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run packages/rich-agent-core/tests/review-engine.test.ts`
Expected: FAIL — `applyOpsToSnapshot` not found

- [ ] **Step 3: Implement applyOpsToSnapshot**

```typescript
// packages/rich-agent-core/src/review-engine.ts
import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';
import { nanoid } from 'nanoid';

import type { ReviewBatch, ReviewEntry, ReviewState } from './review-types';
import type { AgentOperation } from './types';

function getBlockId(node: SerializedLexicalNode): string | undefined {
  return (node as any).$?.blockId as string | undefined;
}

function cloneChildren(root: SerializedLexicalNode): SerializedLexicalNode[] {
  return [...((root as any).children ?? [])].map((c: any) => ({ ...c }));
}

export function applyOpsToSnapshot(
  base: SerializedEditorState,
  ops: AgentOperation[],
): SerializedEditorState {
  let children = cloneChildren(base.root as unknown as SerializedLexicalNode);

  for (const op of ops) {
    if (op.op === 'insert') {
      if (!op.node?.type) continue;
      const pos = op.position;
      if (pos.type === 'root') {
        const idx = pos.index ?? children.length;
        children.splice(idx, 0, op.node);
      } else {
        const idx = children.findIndex((c) => getBlockId(c) === pos.blockId);
        if (idx === -1) continue;
        const insertIdx = pos.type === 'after' ? idx + 1 : idx;
        children.splice(insertIdx, 0, op.node);
      }
    } else if (op.op === 'replace') {
      if (!op.node?.type) continue;
      const idx = children.findIndex((c) => getBlockId(c) === op.blockId);
      if (idx === -1) continue;
      children[idx] = op.node;
    } else if (op.op === 'delete') {
      children = children.filter((c) => getBlockId(c) !== op.blockId);
    }
  }

  return {
    root: { ...base.root, children } as any,
  };
}

function fingerprint(node: SerializedLexicalNode): string {
  return JSON.stringify(node);
}

function extractTouchedBlockIds(ops: AgentOperation[]): string[] {
  const ids = new Set<string>();
  for (const op of ops) {
    if (op.op === 'replace' || op.op === 'delete') ids.add(op.blockId);
    if (op.op === 'insert' && op.position.type !== 'root') ids.add(op.position.blockId);
  }
  return [...ids];
}

export function createReviewBatch(
  ops: AgentOperation[],
  baseSnapshot: SerializedEditorState,
  baseRevision: number,
): ReviewBatch {
  const previewSnapshot = applyOpsToSnapshot(baseSnapshot, ops);
  const root = baseSnapshot.root as unknown as SerializedLexicalNode & {
    children?: SerializedLexicalNode[];
  };
  const blockMap = new Map<string, SerializedLexicalNode>();
  for (const child of root.children ?? []) {
    const id = getBlockId(child);
    if (id) blockMap.set(id, child);
  }

  const entries: ReviewEntry[] = ops
    .filter((op) => {
      if (op.op === 'insert' || op.op === 'replace') return !!op.node?.type;
      return true;
    })
    .map((op) => {
      let targetBlockId: string | undefined;
      let fp = '';
      if (op.op === 'replace' || op.op === 'delete') {
        targetBlockId = op.blockId;
        const orig = blockMap.get(op.blockId);
        if (orig) fp = fingerprint(orig);
      } else if (op.op === 'insert' && op.position.type !== 'root') {
        targetBlockId = op.position.blockId;
      }
      return {
        id: nanoid(8),
        op,
        targetBlockId,
        originalFingerprint: fp,
        status: 'pending' as const,
      };
    });

  return {
    id: nanoid(8),
    baseRevision,
    baseSnapshot,
    previewSnapshot,
    status: 'pending',
    entries,
    touchedBlockIds: extractTouchedBlockIds(ops),
  };
}

export function acceptBatch(state: ReviewState, batchId: string): ReviewState {
  return {
    ...state,
    batches: state.batches.map((b) =>
      b.id === batchId
        ? {
            ...b,
            status: 'accepted' as const,
            entries: b.entries.map((e) => ({ ...e, status: 'accepted' as const })),
          }
        : b,
    ),
  };
}

export function rejectBatch(state: ReviewState, batchId: string): ReviewState {
  return {
    ...state,
    batches: state.batches.map((b) =>
      b.id === batchId
        ? {
            ...b,
            status: 'rejected' as const,
            entries: b.entries.map((e) => ({ ...e, status: 'rejected' as const })),
          }
        : b,
    ),
  };
}

export function detectConflicts(state: ReviewState): ReviewState {
  const pendingBatches = state.batches.filter((b) => b.status === 'pending');
  if (pendingBatches.length < 2) return state;

  const seen = new Map<string, string>(); // blockId -> first batchId
  const conflictedBatchIds = new Set<string>();

  for (const batch of pendingBatches) {
    for (const blockId of batch.touchedBlockIds) {
      const existing = seen.get(blockId);
      if (existing && existing !== batch.id) {
        conflictedBatchIds.add(existing);
        conflictedBatchIds.add(batch.id);
      } else {
        seen.set(blockId, batch.id);
      }
    }
  }

  if (conflictedBatchIds.size === 0) return state;

  return {
    ...state,
    batches: state.batches.map((b) =>
      conflictedBatchIds.has(b.id) && b.status === 'pending'
        ? { ...b, status: 'conflicted' as const }
        : b,
    ),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run packages/rich-agent-core/tests/review-engine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/rich-agent-core/src/review-engine.ts packages/rich-agent-core/tests/review-engine.test.ts
git commit -m "feat(agent-core): add applyOpsToSnapshot and createReviewBatch"
```

---

### Task 3: Store Migration — Replace diffState with reviewState

**Files:**

- Modify: `packages/rich-agent-core/src/initialState.ts`
- Modify: `packages/rich-agent-core/src/store-actions.ts`
- Modify: `packages/rich-agent-core/src/selectors.ts`
- Modify: `packages/rich-agent-core/src/index.ts`

- [ ] **Step 1: Add `diff_review` bubble type and `reviewState` to initialState**

In `packages/rich-agent-core/src/initialState.ts`, replace the `DiffState` import and add `ReviewState`:

```typescript
// packages/rich-agent-core/src/initialState.ts
import type { DiffState } from './types';
import type { ReviewState } from './review-types';

export type ChatBubble =
  | { type: 'user'; content: string }
  | { type: 'assistant'; content: string; streaming?: boolean }
  | { type: 'tool_call'; toolName: string; params: Record<string, unknown> }
  | { type: 'tool_result'; toolName: string; success: boolean; summary: string }
  | { type: 'thinking'; content: string }
  | { type: 'error'; message: string }
  | { type: 'diff_summary'; accepted: number; rejected: number; pending: number }
  | { type: 'diff_review'; batchId: string };

// ... keep AgentStoreStatus unchanged ...

export type AgentStoreState = {
  status: AgentStoreStatus;
  bubbles: ChatBubble[];
  diffState: DiffState | null; // keep for backward compat during migration
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

- [ ] **Step 2: Add review actions to store-actions.ts**

Add to `packages/rich-agent-core/src/store-actions.ts` — add these imports and methods to `AgentStoreActionImpl`:

```typescript
// Add import at top:
import type { ReviewBatch, ReviewState } from './review-types';
import {
  acceptBatch as acceptBatchFn,
  rejectBatch as rejectBatchFn,
  detectConflicts,
} from './review-engine';

// Add to AgentStoreShape type:
// reviewState: ReviewState | null;

// Add to AgentStoreActionMethods type:
// addReviewBatch: (batch: ReviewBatch) => void;
// acceptReviewBatch: (batchId: string) => void;
// rejectReviewBatch: (batchId: string) => void;
// setReviewState: (state: ReviewState | null) => void;

// Add methods to AgentStoreActionImpl class:

addReviewBatch = (batch: ReviewBatch) => {
  this.#set((state) => {
    const current = state.reviewState ?? { documentRevision: 0, batches: [] };
    const next: ReviewState = {
      ...current,
      batches: [...current.batches, batch],
    };
    return { reviewState: detectConflicts(next) };
  });
};

acceptReviewBatch = (batchId: string) => {
  this.#set((state) => {
    if (!state.reviewState) return {};
    return { reviewState: acceptBatchFn(state.reviewState, batchId) };
  });
};

rejectReviewBatch = (batchId: string) => {
  this.#set((state) => {
    if (!state.reviewState) return {};
    return { reviewState: rejectBatchFn(state.reviewState, batchId) };
  });
};

setReviewState = (reviewState: ReviewState | null) => {
  this.#set({ reviewState });
};
```

- [ ] **Step 3: Update selectors**

In `packages/rich-agent-core/src/selectors.ts`:

```typescript
export const agentStoreSelectors = {
  bubbles: (state: AgentStoreState) => state.bubbles,
  diffState: (state: AgentStoreState) => state.diffState,
  reviewState: (state: AgentStoreState) => state.reviewState,
  status: (state: AgentStoreState) => state.status,
};
```

- [ ] **Step 4: Update index.ts exports**

In `packages/rich-agent-core/src/index.ts`, add:

```typescript
export type {
  ReviewBatch,
  ReviewEntry,
  ReviewEntryStatus,
  ReviewBatchStatus,
  ReviewState,
} from './review-types';
export {
  applyOpsToSnapshot,
  createReviewBatch,
  acceptBatch,
  rejectBatch,
  detectConflicts,
} from './review-engine';
```

- [ ] **Step 5: Run existing tests**

Run: `npx vitest run packages/rich-agent-core/tests/`
Expected: PASS (existing tests should not break since diffState is kept)

- [ ] **Step 6: Commit**

```bash
git add packages/rich-agent-core/src/
git commit -m "feat(agent-core): add reviewState to store with batch accept/reject actions"
```

---

### Task 4: Wire useAgentLoop to Create ReviewBatch

**Files:**

- Modify: `packages/rich-ext-ai-agent/src/hooks/useAgentLoop.ts`

- [ ] **Step 1: Update useAgentLoop to produce ReviewBatch instead of DiffState**

Replace the post-execution diff logic (lines 73-76) in `useAgentLoop.ts`:

```typescript
// Replace:
//   if (result.operations.length > 0) {
//     const diffState = createDiffEngine(result.operations, serialized);
//     options.store.getState().setDiffState(diffState);
//   }

// With:
import { createReviewBatch } from '@haklex/rich-agent-core';

// Inside run(), after executor.run():
if (result.operations.length > 0) {
  const revision = options.store.getState().reviewState?.documentRevision ?? 0;
  const batch = createReviewBatch(result.operations, serialized, revision);
  options.store.getState().addReviewBatch(batch);
  options.store.getState().addBubble({ type: 'diff_review', batchId: batch.id });
}
```

- [ ] **Step 2: Verify demo still builds**

Run: `npx eslint packages/rich-ext-ai-agent/src/hooks/useAgentLoop.ts`
Expected: Clean or only import-sort auto-fixable

- [ ] **Step 3: Commit**

```bash
git add packages/rich-ext-ai-agent/src/hooks/useAgentLoop.ts
git commit -m "feat(agent-ext): useAgentLoop creates ReviewBatch instead of DiffState"
```

---

### Task 5: DiffReviewBubble — Unified Diff in Chat

**Files:**

- Create: `packages/rich-agent-chat/src/components/DiffReviewBubble.tsx`
- Create: `packages/rich-agent-chat/src/components/diff-review-bubble.css.ts`
- Modify: `packages/rich-agent-chat/src/ChatMessageList.tsx`
- Modify: `packages/rich-agent-chat/src/ChatPanel.tsx`

- [ ] **Step 1: Create diff review bubble styles**

```typescript
// packages/rich-agent-chat/src/components/diff-review-bubble.css.ts
import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const diffReviewRoot = style({
  margin: '8px 0',
  border: `1px solid ${vars.color.border}`,
  borderRadius: 8,
  overflow: 'hidden',
  fontSize: '13px',
});

export const diffReviewHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px',
  background: vars.color.fillTertiary,
  borderBottom: `1px solid ${vars.color.border}`,
  fontSize: '12px',
  color: vars.color.textTertiary,
});

export const diffReviewActions = style({
  display: 'flex',
  gap: 6,
});

export const diffReviewActionBtn = style({
  'padding': '3px 10px',
  'border': `1px solid ${vars.color.border}`,
  'borderRadius': 4,
  'background': 'transparent',
  'color': vars.color.textSecondary,
  'fontSize': '11px',
  'cursor': 'pointer',
  'transition': 'background 120ms ease',
  ':hover': {
    background: vars.color.fillSecondary,
  },
});

export const diffReviewAcceptBtn = style([
  diffReviewActionBtn,
  {
    'borderColor': 'rgb(34, 197, 94)',
    'color': 'rgb(34, 197, 94)',
    ':hover': {
      background: 'rgba(34, 197, 94, 0.1)',
    },
  },
]);

export const diffReviewRejectBtn = style([
  diffReviewActionBtn,
  {
    'borderColor': 'rgb(239, 68, 68)',
    'color': 'rgb(239, 68, 68)',
    ':hover': {
      background: 'rgba(239, 68, 68, 0.1)',
    },
  },
]);

export const diffHunkRow = style({
  padding: '4px 12px',
  lineHeight: 1.6,
  fontFamily: vars.typography.fontMono,
  fontSize: '12px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
});

export const diffHunkInsert = style({
  background: 'rgba(34, 197, 94, 0.12)',
  color: vars.color.text,
});

export const diffHunkDelete = style({
  background: 'rgba(239, 68, 68, 0.12)',
  color: vars.color.text,
  textDecoration: 'line-through',
  opacity: 0.7,
});

export const diffHunkEqual = style({
  color: vars.color.textTertiary,
});

export const diffStatusBadge = style({
  padding: '2px 8px',
  borderRadius: 4,
  fontSize: '11px',
  fontWeight: 500,
});
```

- [ ] **Step 2: Create DiffReviewBubble component**

```typescript
// packages/rich-agent-chat/src/components/DiffReviewBubble.tsx
import type { ReviewBatch } from '@haklex/rich-agent-core';
import { computeDiff } from '@haklex/rich-diff';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import * as css from './diff-review-bubble.css';

function extractText(node: any): string {
  if (node.text) return node.text;
  if (node.children) return node.children.map(extractText).join('');
  return '';
}

interface DiffReviewBubbleProps {
  batch: ReviewBatch;
  onAccept?: (batchId: string) => void;
  onReject?: (batchId: string) => void;
}

export function DiffReviewBubble({
  batch,
  onAccept,
  onReject,
}: DiffReviewBubbleProps): ReactElement {
  const hunks = useMemo(
    () => computeDiff(batch.baseSnapshot, batch.previewSnapshot),
    [batch.baseSnapshot, batch.previewSnapshot],
  );

  const isPending = batch.status === 'pending';
  const statusLabel =
    batch.status === 'accepted'
      ? 'Accepted'
      : batch.status === 'rejected'
        ? 'Rejected'
        : batch.status === 'conflicted'
          ? 'Conflicted'
          : `${batch.entries.length} change${batch.entries.length > 1 ? 's' : ''}`;

  return (
    <div className={css.diffReviewRoot}>
      <div className={css.diffReviewHeader}>
        <span className={css.diffStatusBadge}>{statusLabel}</span>
        {isPending && (
          <div className={css.diffReviewActions}>
            <button
              className={css.diffReviewAcceptBtn}
              type="button"
              onClick={() => onAccept?.(batch.id)}
            >
              Accept
            </button>
            <button
              className={css.diffReviewRejectBtn}
              type="button"
              onClick={() => onReject?.(batch.id)}
            >
              Reject
            </button>
          </div>
        )}
      </div>
      {hunks.map((hunk, i) => {
        if (hunk.type === 'equal') return null;
        const text = hunk.nodes.map(extractText).join('\n');
        if (!text.trim()) return null;
        const rowClass =
          hunk.type === 'insert'
            ? `${css.diffHunkRow} ${css.diffHunkInsert}`
            : `${css.diffHunkRow} ${css.diffHunkDelete}`;
        const prefix = hunk.type === 'insert' ? '+ ' : '- ';
        return (
          <div className={rowClass} key={i}>
            {prefix}
            {text}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Wire DiffReviewBubble into ChatMessageList**

In `packages/rich-agent-chat/src/ChatMessageList.tsx`, add the import and case:

```typescript
// Add import:
import { DiffReviewBubble } from './components/DiffReviewBubble';

// Add to ChatMessageListProps:
// onAcceptBatch?: (batchId: string) => void;
// onRejectBatch?: (batchId: string) => void;
// getBatch?: (batchId: string) => ReviewBatch | undefined;

// Add case in the switch after 'diff_summary':
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
```

- [ ] **Step 4: Thread callbacks through ChatPanel**

In `packages/rich-agent-chat/src/ChatPanel.tsx`, add props:

```typescript
// Add to ChatPanelProps:
// onAcceptBatch?: (batchId: string) => void;
// onRejectBatch?: (batchId: string) => void;

// Destructure in component, pass to ChatMessageList.
// For getBatch, derive from store:
const reviewState = useStore(store, agentStoreSelectors.reviewState);
const getBatch = useCallback(
  (batchId: string) => reviewState?.batches.find((b) => b.id === batchId),
  [reviewState],
);
```

- [ ] **Step 5: Lint and verify**

Run: `npx eslint packages/rich-agent-chat/src/`
Expected: Clean (auto-fix imports if needed)

- [ ] **Step 6: Commit**

```bash
git add packages/rich-agent-chat/src/
git commit -m "feat(agent-chat): add DiffReviewBubble with unified diff and accept/reject"
```

---

### Task 6: DiffReviewOverlayPlugin — Editor Markers

**Files:**

- Create: `packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx`
- Create: `packages/rich-ext-ai-agent/src/plugins/diff-review-overlay.css.ts`
- Modify: `packages/rich-ext-ai-agent/src/index.ts`

- [ ] **Step 1: Create overlay styles**

```typescript
// packages/rich-ext-ai-agent/src/plugins/diff-review-overlay.css.ts
import { style } from '@vanilla-extract/css';

export const overlayContainer = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  zIndex: 10,
});

export const deleteOverlay = style({
  position: 'absolute',
  left: 0,
  right: 0,
  background: 'rgba(239, 68, 68, 0.08)',
  borderLeft: '3px solid rgb(239, 68, 68)',
  pointerEvents: 'none',
});

export const insertMarker = style({
  position: 'absolute',
  left: 0,
  right: 0,
  height: 3,
  background: 'rgb(34, 197, 94)',
  pointerEvents: 'none',
  borderRadius: 1,
});

export const replaceOverlay = style({
  position: 'absolute',
  left: 0,
  right: 0,
  background: 'rgba(239, 68, 68, 0.08)',
  borderLeft: '3px solid rgb(239, 68, 68)',
  pointerEvents: 'none',
});
```

- [ ] **Step 2: Create DiffReviewOverlayPlugin**

```typescript
// packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx
import type { AgentStore } from '@haklex/rich-agent-core';
import { blockIdState } from '@haklex/rich-editor/plugins';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getState } from 'lexical';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { deleteOverlay, insertMarker, overlayContainer, replaceOverlay } from './diff-review-overlay.css';

type OverlayEntry = {
  id: string;
  type: 'insert' | 'delete' | 'replace';
  top: number;
  height: number;
};

export function DiffReviewOverlayPlugin({ store }: { store: AgentStore }): ReactElement | null {
  const [editor] = useLexicalComposerContext();
  const [overlays, setOverlays] = useState<OverlayEntry[]>([]);
  const [containerEl, setContainerEl] = useState<HTMLElement | null>(null);

  const computeOverlays = useCallback(() => {
    const reviewState = store.getState().reviewState;
    if (!reviewState) {
      setOverlays([]);
      return;
    }

    const pendingBatches = reviewState.batches.filter((b) => b.status === 'pending');
    if (pendingBatches.length === 0) {
      setOverlays([]);
      return;
    }

    const rootEl = editor.getRootElement();
    if (!rootEl) return;

    const rootRect = rootEl.getBoundingClientRect();
    const entries: OverlayEntry[] = [];

    editor.getEditorState().read(() => {
      const root = $getRoot();
      const children = root.getChildren();

      for (const batch of pendingBatches) {
        for (const entry of batch.entries) {
          const blockId = entry.targetBlockId;
          if (!blockId) continue;

          const child = children.find((c) => $getState(c, blockIdState) === blockId);
          if (!child) continue;

          const key = child.getKey();
          const domEl = editor.getElementByKey(key);
          if (!domEl) continue;

          const rect = domEl.getBoundingClientRect();
          entries.push({
            id: entry.id,
            type: entry.op.op as 'insert' | 'delete' | 'replace',
            top: rect.top - rootRect.top,
            height: rect.height,
          });
        }
      }
    });

    setOverlays(entries);
  }, [editor, store]);

  useEffect(() => {
    const rootEl = editor.getRootElement();
    if (rootEl) {
      const wrapper = rootEl.parentElement;
      if (wrapper) {
        wrapper.style.position = 'relative';
        setContainerEl(wrapper);
      }
    }
  }, [editor]);

  useEffect(() => {
    const unsub = store.subscribe(() => computeOverlays());
    return unsub;
  }, [store, computeOverlays]);

  useEffect(() => {
    return editor.registerUpdateListener(() => computeOverlays());
  }, [editor, computeOverlays]);

  if (!containerEl || overlays.length === 0) return null;

  return createPortal(
    <div className={overlayContainer}>
      {overlays.map((o) => {
        const cls =
          o.type === 'delete'
            ? deleteOverlay
            : o.type === 'insert'
              ? insertMarker
              : replaceOverlay;
        return (
          <div
            className={cls}
            key={o.id}
            style={{
              top: o.top,
              height: o.type === 'insert' ? 3 : o.height,
            }}
          />
        );
      })}
    </div>,
    containerEl,
  );
}
```

- [ ] **Step 3: Export from index.ts**

In `packages/rich-ext-ai-agent/src/index.ts`, add:

```typescript
export { DiffReviewOverlayPlugin } from './plugins/DiffReviewOverlayPlugin';
```

- [ ] **Step 4: Lint**

Run: `npx eslint packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx`

- [ ] **Step 5: Commit**

```bash
git add packages/rich-ext-ai-agent/src/
git commit -m "feat(agent-ext): add DiffReviewOverlayPlugin for editor diff markers"
```

---

### Task 7: Wire Demo AgentPage

**Files:**

- Modify: `demo/src/pages/AgentPage.tsx`

- [ ] **Step 1: Replace DiffApplyPlugin with DiffReviewOverlayPlugin**

In `demo/src/pages/AgentPage.tsx`:

1. Replace `DiffApplyPlugin` import with `DiffReviewOverlayPlugin`
2. Replace `<DiffApplyPlugin store={store} />` with `<DiffReviewOverlayPlugin store={store} />`
3. Add `onAcceptBatch` and `onRejectBatch` handlers:

```typescript
const handleAcceptBatch = useCallback(
  (batchId: string) => {
    store.getState().acceptReviewBatch(batchId);
    // Apply the accepted batch to the editor
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
```

Note: `$findBlockByBlockId` helper needs to be imported or inlined — same logic as DiffApplyPlugin used. Import `blockIdState` from `@haklex/rich-editor/plugins` and `$getRoot, $getState, $parseSerializedNode` from `lexical`.

4. Pass callbacks to ChatPanel:

```tsx
<ChatPanel
  ...
  onAcceptBatch={handleAcceptBatch}
  onRejectBatch={handleRejectBatch}
/>
```

- [ ] **Step 2: Remove old DiffApplyPlugin and handleRetryToolCall's DiffState usage**

Update `handleRetryToolCall` to use `createReviewBatch` + `addReviewBatch` instead of `createDiffEngine` + `setDiffState`.

- [ ] **Step 3: Lint and test in browser**

Run: `npx eslint demo/src/pages/AgentPage.tsx`
Manual test: Open http://localhost:5188/agent, send a message, verify diff review bubble appears in chat with Accept/Reject buttons.

- [ ] **Step 4: Commit**

```bash
git add demo/src/pages/AgentPage.tsx
git commit -m "feat(demo): wire AgentPage to review workflow with accept/reject"
```

---

### Task 8: Cleanup — Deprecate Old Diff Path

**Files:**

- Modify: `packages/rich-agent-core/src/index.ts`
- Keep: `packages/rich-ext-ai-agent/src/plugins/DiffApplyPlugin.tsx` (keep but stop using)

- [ ] **Step 1: Mark old exports as deprecated in index.ts**

Keep old exports for backward compatibility but add the new ones prominently. The old `DiffState`, `DiffEntry`, `createDiffEngine` remain exported but are no longer used in the primary flow.

- [ ] **Step 2: Final lint pass on all modified packages**

Run: `npx eslint packages/rich-agent-core/src/ packages/rich-agent-chat/src/ packages/rich-ext-ai-agent/src/ demo/src/pages/AgentPage.tsx`

- [ ] **Step 3: Run all tests**

Run: `npx vitest run packages/rich-agent-core/tests/`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: finalize review workflow migration, deprecate old diff path"
```

---

## Notes for Implementer

- `@haklex/rich-diff`'s `computeDiff(oldValue, newValue)` takes two `SerializedEditorState` and returns `DiffHunk[]` with `type: 'equal' | 'insert' | 'delete'` and `nodes: SerializedLexicalNode[]`.
- Block IDs are stored in serialized nodes as `node.$.blockId` — see `packages/rich-agent-core/src/snapshot.ts:18`.
- The Zustand store is a vanilla store (not React) — use `store.subscribe(listener)` for subscriptions, `store.getState()` for reads.
- Lexical `$parseSerializedNode()` requires the node to have a `type` field matching a registered node class.
- Always guard `op.node?.type` before calling `$parseSerializedNode` — the LLM sometimes omits the `node` parameter.
