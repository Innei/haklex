# Diff Core Extraction & Character-Level Editor Diffs

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract Lexical diff engine into `@haklex/rich-diff-core` (zero React), then use it in `DiffReviewOverlayPlugin` for character-level diff rendering via `RichRenderer`.

**Architecture:** Move `compute-diff.ts` entirely into a new `@haklex/rich-diff-core` package. `@haklex/rich-diff` becomes a thin React shell that re-exports core APIs for backward compat. `DiffReviewOverlayPlugin` uses `diffModifiedNode` + `decorateSubtree` from core, rendered via `RichRenderer`.

**Tech Stack:** TypeScript, Vite 7, Lexical 0.42, React 19, `@haklex/rich-static-renderer`

**Spec:** `docs/superpowers/specs/2026-03-30-diff-core-extraction-design.md`

---

## File Structure

### New Files

| File                                                 | Responsibility                                     |
| ---------------------------------------------------- | -------------------------------------------------- |
| `packages/rich-diff-core/package.json`               | Package manifest — zero React, lexical peer dep    |
| `packages/rich-diff-core/tsconfig.json`              | TS config (no JSX needed)                          |
| `packages/rich-diff-core/vite.config.ts`             | Vite build using shared config, no Vanilla Extract |
| `packages/rich-diff-core/src/compute-diff.ts`        | Entire diff engine (moved from rich-diff)          |
| `packages/rich-diff-core/src/index.ts`               | Public exports                                     |
| `packages/rich-diff-core/tests/compute-diff.test.ts` | Tests for the moved code                           |

### Modified Files

| File                                                                 | Change                                                             |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `packages/rich-diff/package.json`                                    | Add `@haklex/rich-diff-core` dependency                            |
| `packages/rich-diff/src/compute-diff.ts`                             | DELETE — replaced by re-exports                                    |
| `packages/rich-diff/src/index.ts`                                    | Re-export from `rich-diff-core` for backward compat                |
| `packages/rich-diff/src/RichDiff.tsx`                                | Import from `@haklex/rich-diff-core` instead of local              |
| `packages/rich-ext-ai-agent/package.json`                            | Add `@haklex/rich-diff-core` + `@haklex/rich-static-renderer` deps |
| `packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx` | Use `diffModifiedNode`/`decorateSubtree` + `RichRenderer`          |
| `packages/rich-ext-ai-agent/src/plugins/diff-review-overlay.css.ts`  | Add styles for inline diff panel                                   |
| `packages/rich-agent-chat/package.json`                              | Change dep from `@haklex/rich-diff` to `@haklex/rich-diff-core`    |
| `packages/rich-agent-chat/src/components/DiffReviewBubble.tsx`       | Import `computeDiff` from `@haklex/rich-diff-core`                 |

---

### Task 1: Create `@haklex/rich-diff-core` Package Scaffold

**Files:**

- Create: `packages/rich-diff-core/package.json`
- Create: `packages/rich-diff-core/tsconfig.json`
- Create: `packages/rich-diff-core/vite.config.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "dependencies": {},
  "description": "Lexical diff engine — character-level and structural diff with node decoration",
  "devDependencies": {
    "lexical": "^0.42.0",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vite-plugin-dts": "^4.5.4"
  },
  "exports": {
    ".": "./src/index.ts"
  },
  "files": ["dist"],
  "license": "MIT",
  "main": "./src/index.ts",
  "name": "@haklex/rich-diff-core",
  "peerDependencies": {
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
    "directory": "packages/rich-diff-core"
  },
  "scripts": {
    "build": "vite build",
    "dev:build": "vite build --watch"
  },
  "type": "module",
  "version": "0.0.90"
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["esnext", "es2022"],
    "module": "esnext",
    "moduleResolution": "bundler",
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
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 3: Create vite.config.ts**

```typescript
import { createViteConfig } from '../vite.shared';

export default createViteConfig({ vanillaExtract: false });
```

- [ ] **Step 4: Run pnpm install**

Run: `pnpm install --no-frozen-lockfile`
Expected: Success — new workspace package registered

- [ ] **Step 5: Commit**

```bash
git add packages/rich-diff-core/package.json packages/rich-diff-core/tsconfig.json packages/rich-diff-core/vite.config.ts pnpm-lock.yaml
git commit -m "chore: scaffold @haklex/rich-diff-core package"
```

---

### Task 2: Move `compute-diff.ts` Into Core

**Files:**

- Create: `packages/rich-diff-core/src/compute-diff.ts`
- Create: `packages/rich-diff-core/src/index.ts`

- [ ] **Step 1: Copy compute-diff.ts to rich-diff-core**

Copy `packages/rich-diff/src/compute-diff.ts` to `packages/rich-diff-core/src/compute-diff.ts` verbatim. The file is 552 lines, pure TypeScript, zero React. No changes needed to the code itself.

- [ ] **Step 2: Create index.ts with public exports**

```typescript
// packages/rich-diff-core/src/index.ts
export type { DiffHunk, DiffOpType } from './compute-diff';
export { computeDiff, decorateSubtree, diffModifiedNode } from './compute-diff';
```

Note: `decorateSubtree` and `diffModifiedNode` are not currently exported from `compute-diff.ts`. Add `export` keyword to their declarations:

In `packages/rich-diff-core/src/compute-diff.ts`, change:

```typescript
// Line 97: add export
export function decorateSubtree(node: SerializedLexicalNode, kind: MarkKind): SerializedLexicalNode {
```

```typescript
// Line 486: add export
export function diffModifiedNode(
```

Also export the types needed by consumers:

```typescript
// Add to top of compute-diff.ts, after existing exports:
export type { MarkKind };
// MarkKind is defined as: type MarkKind = 'insert' | 'delete';
// Change from `type` to `export type`:
export type MarkKind = 'insert' | 'delete';
```

Update `index.ts` to include all public API:

```typescript
// packages/rich-diff-core/src/index.ts
export type { DiffHunk, DiffOpType, MarkKind } from './compute-diff';
export { computeDiff, decorateSubtree, diffModifiedNode } from './compute-diff';
```

- [ ] **Step 3: Verify build**

Run: `pnpm --filter @haklex/rich-diff-core build`
Expected: Success — produces `dist/index.mjs` + `dist/index.d.ts`

- [ ] **Step 4: Commit**

```bash
git add packages/rich-diff-core/src/
git commit -m "feat(diff-core): move Lexical diff engine into @haklex/rich-diff-core"
```

---

### Task 3: Tests for `@haklex/rich-diff-core`

**Files:**

- Create: `packages/rich-diff-core/tests/compute-diff.test.ts`

- [ ] **Step 1: Write tests**

```typescript
// packages/rich-diff-core/tests/compute-diff.test.ts
import { describe, expect, it } from 'vitest';

import { computeDiff, decorateSubtree, diffModifiedNode } from '../src';

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

function makeParagraph(text: string) {
  return {
    type: 'paragraph',
    children: [{ type: 'text', text, detail: 0, format: 0, mode: 'normal', style: '', version: 1 }],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    textFormat: 0,
    textStyle: '',
  };
}

describe('computeDiff', () => {
  it('returns empty for identical documents', () => {
    const doc = makeDoc([makeParagraph('Hello')]);
    const hunks = computeDiff(doc, doc);
    expect(hunks).toHaveLength(1);
    expect(hunks[0].type).toBe('equal');
  });

  it('detects an inserted node', () => {
    const old = makeDoc([makeParagraph('Hello')]);
    const next = makeDoc([makeParagraph('Hello'), makeParagraph('World')]);
    const hunks = computeDiff(old, next);
    const insertHunks = hunks.filter((h) => h.type === 'insert');
    expect(insertHunks.length).toBeGreaterThan(0);
  });

  it('detects a deleted node', () => {
    const old = makeDoc([makeParagraph('Hello'), makeParagraph('World')]);
    const next = makeDoc([makeParagraph('Hello')]);
    const hunks = computeDiff(old, next);
    const deleteHunks = hunks.filter((h) => h.type === 'delete');
    expect(deleteHunks.length).toBeGreaterThan(0);
  });

  it('detects a modified node as delete+insert pair', () => {
    const old = makeDoc([makeParagraph('Hello')]);
    const next = makeDoc([makeParagraph('Hello World')]);
    const hunks = computeDiff(old, next);
    expect(hunks.some((h) => h.type === 'delete')).toBe(true);
    expect(hunks.some((h) => h.type === 'insert')).toBe(true);
  });
});

describe('decorateSubtree', () => {
  it('adds delete mark style to text nodes', () => {
    const node = {
      type: 'text',
      text: 'Hello',
      style: '',
      detail: 0,
      format: 0,
      mode: 'normal',
      version: 1,
    } as any;
    const decorated = decorateSubtree(node, 'delete') as any;
    expect(decorated.style).toContain('line-through');
  });

  it('adds insert mark style to text nodes', () => {
    const node = {
      type: 'text',
      text: 'Hello',
      style: '',
      detail: 0,
      format: 0,
      mode: 'normal',
      version: 1,
    } as any;
    const decorated = decorateSubtree(node, 'insert') as any;
    expect(decorated.style).toContain('background-color');
    expect(decorated.style).not.toContain('line-through');
  });
});

describe('diffModifiedNode', () => {
  it('produces char-level diff for text changes', () => {
    const old = makeParagraph('Hello');
    const next = makeParagraph('Hello World');
    const result = diffModifiedNode(old as any, next as any);
    const oldText = (result.oldNode as any).children.map((c: any) => c.text).join('');
    const newText = (result.newNode as any).children.map((c: any) => c.text).join('');
    expect(oldText).toBe('Hello');
    expect(newText).toBe('Hello World');
  });
});
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run packages/rich-diff-core/tests/`
Expected: PASS — all tests green

- [ ] **Step 3: Commit**

```bash
git add packages/rich-diff-core/tests/
git commit -m "test(diff-core): add tests for computeDiff, decorateSubtree, diffModifiedNode"
```

---

### Task 4: Rewire `@haklex/rich-diff` to Use Core

**Files:**

- Modify: `packages/rich-diff/package.json`
- Delete: `packages/rich-diff/src/compute-diff.ts`
- Modify: `packages/rich-diff/src/index.ts`
- Modify: `packages/rich-diff/src/RichDiff.tsx`

- [ ] **Step 1: Add `@haklex/rich-diff-core` dependency**

In `packages/rich-diff/package.json`, add to `dependencies`:

```json
"@haklex/rich-diff-core": "workspace:*",
```

Run: `pnpm install --no-frozen-lockfile`

- [ ] **Step 2: Replace `compute-diff.ts` with re-export shim**

Delete `packages/rich-diff/src/compute-diff.ts` (552 lines). Create a new file at the same path:

```typescript
// packages/rich-diff/src/compute-diff.ts
// Re-export from @haklex/rich-diff-core for backward compatibility
export type { DiffHunk, DiffOpType, MarkKind } from '@haklex/rich-diff-core';
export { computeDiff, decorateSubtree, diffModifiedNode } from '@haklex/rich-diff-core';
```

- [ ] **Step 3: Update index.ts**

```typescript
// packages/rich-diff/src/index.ts
import './style.css.ts';

export type { DiffHunk, DiffOpType } from '@haklex/rich-diff-core';
export { computeDiff } from '@haklex/rich-diff-core';
export type { RichDiffProps } from './RichDiff';
export { RichDiff } from './RichDiff';
```

- [ ] **Step 4: Update RichDiff.tsx imports**

In `packages/rich-diff/src/RichDiff.tsx`, change lines 8-9:

```typescript
// Replace:
import type { DiffHunk } from './compute-diff';
import { computeDiff } from './compute-diff';

// With:
import type { DiffHunk } from '@haklex/rich-diff-core';
import { computeDiff } from '@haklex/rich-diff-core';
```

- [ ] **Step 5: Lint and verify**

Run: `npx eslint packages/rich-diff/src/ --fix`
Run: `pnpm --filter @haklex/rich-diff build`
Expected: Both clean

- [ ] **Step 6: Commit**

```bash
git add packages/rich-diff/
git commit -m "refactor(diff): rewire @haklex/rich-diff to import from rich-diff-core"
```

---

### Task 5: Update `DiffReviewBubble` to Import from Core

**Files:**

- Modify: `packages/rich-agent-chat/package.json`
- Modify: `packages/rich-agent-chat/src/components/DiffReviewBubble.tsx`

- [ ] **Step 1: Switch dependency**

In `packages/rich-agent-chat/package.json`, replace:

```json
"@haklex/rich-diff": "workspace:*",
```

With:

```json
"@haklex/rich-diff-core": "workspace:*",
```

Run: `pnpm install --no-frozen-lockfile`

- [ ] **Step 2: Update import in DiffReviewBubble.tsx**

Change line 2:

```typescript
// Replace:
import { computeDiff } from '@haklex/rich-diff';
// With:
import { computeDiff } from '@haklex/rich-diff-core';
```

- [ ] **Step 3: Lint**

Run: `npx eslint packages/rich-agent-chat/src/components/DiffReviewBubble.tsx`
Expected: Clean

- [ ] **Step 4: Commit**

```bash
git add packages/rich-agent-chat/
git commit -m "refactor(agent-chat): import computeDiff from @haklex/rich-diff-core"
```

---

### Task 6: Character-Level Diffs in DiffReviewOverlayPlugin

**Files:**

- Modify: `packages/rich-ext-ai-agent/package.json`
- Modify: `packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx`
- Modify: `packages/rich-ext-ai-agent/src/plugins/diff-review-overlay.css.ts`

- [ ] **Step 1: Add dependencies**

In `packages/rich-ext-ai-agent/package.json`, add to `dependencies`:

```json
"@haklex/rich-diff-core": "workspace:*",
"@haklex/rich-static-renderer": "workspace:*",
```

Run: `pnpm install --no-frozen-lockfile`

- [ ] **Step 2: Add diff panel styles**

In `packages/rich-ext-ai-agent/src/plugins/diff-review-overlay.css.ts`, replace the existing `ghostPreview` style and add a `diffPanel` style:

```typescript
// Replace existing ghostPreview with:
export const diffPanel = style({
  position: 'absolute',
  left: 0,
  right: 0,
  pointerEvents: 'none',
  overflow: 'hidden',
  borderLeft: '3px solid rgb(34, 197, 94)',
  background: 'rgba(34, 197, 94, 0.04)',
});

export const diffPanelDelete = style({
  position: 'absolute',
  left: 0,
  right: 0,
  pointerEvents: 'none',
  overflow: 'hidden',
});
```

- [ ] **Step 3: Rewrite DiffReviewOverlayPlugin to use char-level diffs**

```typescript
// packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx
import type { AgentStore, ReviewEntry } from '@haklex/rich-agent-core';
import { decorateSubtree, diffModifiedNode } from '@haklex/rich-diff-core';
import { blockIdState } from '@haklex/rich-editor/plugins';
import { RichRenderer } from '@haklex/rich-static-renderer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getState, type SerializedLexicalNode } from 'lexical';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  deleteOverlay,
  diffPanel,
  diffPanelDelete,
  insertMarker,
  overlayContainer,
  replaceOverlay,
} from './diff-review-overlay.css';

function getBlockId(node: SerializedLexicalNode): string | undefined {
  return (node as any).$?.blockId as string | undefined;
}

function wrapDoc(nodes: SerializedLexicalNode[]) {
  return {
    root: {
      children: nodes,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      type: 'root',
      version: 1,
    },
  };
}

type OverlayEntry = {
  id: string;
  type: 'insert' | 'delete' | 'replace';
  top: number;
  height: number;
  oldNode?: SerializedLexicalNode;
  newNode?: SerializedLexicalNode;
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
        // Build block map from base snapshot for looking up old nodes
        const baseChildren = (batch.baseSnapshot.root as any).children as SerializedLexicalNode[];
        const blockMap = new Map<string, SerializedLexicalNode>();
        for (const c of baseChildren) {
          const bid = getBlockId(c);
          if (bid) blockMap.set(bid, c);
        }

        for (const entry of batch.entries) {
          const blockId = entry.targetBlockId;
          if (!blockId) continue;

          const child = children.find((c) => $getState(c, blockIdState) === blockId);
          if (!child) continue;

          const key = child.getKey();
          const domEl = editor.getElementByKey(key);
          if (!domEl) continue;

          const rect = domEl.getBoundingClientRect();
          const oldNode = blockMap.get(blockId);

          let newNode: SerializedLexicalNode | undefined;
          if (entry.op.op === 'insert' || entry.op.op === 'replace') {
            newNode = entry.op.node;
          }

          entries.push({
            id: entry.id,
            type: entry.op.op as 'insert' | 'delete' | 'replace',
            top: rect.top - rootRect.top,
            height: rect.height,
            oldNode,
            newNode,
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
        if (o.type === 'delete' && o.oldNode) {
          const decorated = decorateSubtree(o.oldNode, 'delete');
          return (
            <div key={o.id}>
              <div className={deleteOverlay} style={{ top: o.top, height: o.height }} />
              <div className={diffPanelDelete} style={{ top: o.top, height: o.height }}>
                <RichRenderer value={wrapDoc([decorated])} />
              </div>
            </div>
          );
        }

        if (o.type === 'insert' && o.newNode) {
          const decorated = decorateSubtree(o.newNode, 'insert');
          return (
            <div key={o.id}>
              <div className={insertMarker} style={{ top: o.top, height: 3 }} />
              <div className={diffPanel} style={{ top: o.top + 3 }}>
                <RichRenderer value={wrapDoc([decorated])} />
              </div>
            </div>
          );
        }

        if (o.type === 'replace' && o.oldNode && o.newNode) {
          const { oldNode: decoratedOld, newNode: decoratedNew } = diffModifiedNode(o.oldNode, o.newNode);
          return (
            <div key={o.id}>
              <div className={replaceOverlay} style={{ top: o.top, height: o.height }} />
              <div className={diffPanelDelete} style={{ top: o.top, height: o.height }}>
                <RichRenderer value={wrapDoc([decoratedOld])} />
              </div>
              <div className={diffPanel} style={{ top: o.top + o.height }}>
                <RichRenderer value={wrapDoc([decoratedNew])} />
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>,
    containerEl,
  );
}
```

- [ ] **Step 4: Lint**

Run: `npx eslint packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx packages/rich-ext-ai-agent/src/plugins/diff-review-overlay.css.ts --fix`

- [ ] **Step 5: Commit**

```bash
git add packages/rich-ext-ai-agent/
git commit -m "feat(agent-ext): character-level diffs in editor overlay via RichRenderer"
```

---

### Task 7: Final Verification

**Files:**

- No new files

- [ ] **Step 1: Run all tests**

Run: `npx vitest run packages/rich-diff-core/tests/ packages/rich-agent-core/tests/`
Expected: All PASS

- [ ] **Step 2: Lint all modified packages**

Run: `npx eslint packages/rich-diff-core/src/ packages/rich-diff/src/ packages/rich-agent-chat/src/components/DiffReviewBubble.tsx packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx packages/rich-ext-ai-agent/src/plugins/diff-review-overlay.css.ts`
Expected: Clean

- [ ] **Step 3: Build all affected packages**

Run: `pnpm --filter @haklex/rich-diff-core build && pnpm --filter @haklex/rich-diff build`
Expected: Both succeed

- [ ] **Step 4: Manual browser test**

Open `http://localhost:5188/agent` and:

1. Send "Replace the title with Smart Writing Assistant" — verify char-level diff (old text with strikethrough, new text with highlight) appears in both chat panel and editor overlay
2. Send "Delete the second paragraph" — verify deleted text shows with strikethrough in editor overlay
3. Accept/reject both — verify correct behavior

---

## Notes for Implementer

- `compute-diff.ts` is 552 lines of pure TypeScript. It has ZERO React imports. The only dependency is `lexical` types (`SerializedEditorState`, `SerializedLexicalNode`).
- `decorateSubtree` and `diffModifiedNode` are currently not exported. You must add `export` keyword to their function declarations in the core copy.
- `MarkKind` is currently a private type alias (`type MarkKind = 'insert' | 'delete'`). Must be exported for `decorateSubtree`'s signature.
- The `RichRenderer` component from `@haklex/rich-static-renderer` takes `{ value: SerializedEditorState }`. Wrap nodes in a minimal root using `wrapDoc()`.
- Decorated nodes use inline CSS styles (via `node.style` property) — `RichRenderer` renders these automatically as Lexical text node styles.
- The `DELETE_MARK_STYLE` uses `var(--rc-alert-caution)` and `INSERT_MARK_STYLE` uses `var(--rc-alert-tip)` — these CSS variables come from `@haklex/rich-style-token` and are available wherever the theme provider wraps the content.
