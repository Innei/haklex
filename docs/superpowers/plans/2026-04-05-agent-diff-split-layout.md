# Agent Diff Split Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change the AI Agent diff review overlay from inline merged diff to a Git-style split layout (delete above, insert below) with document-flow DOM injection.

**Architecture:** Replace portal-based absolute positioning with sibling container injection. Switch diff algorithm from `diffMergedNode` (single merged node) to `diffModifiedNode` (separate oldNode/newNode pair). Containers are `contenteditable="false"` siblings of Lexical block elements, fully torn down and rebuilt on each editor update.

**Tech Stack:** React 19, Lexical 0.42, Vanilla Extract CSS-in-TS, `@haklex/rich-diff-core`

**Spec:** `docs/superpowers/specs/2026-04-05-agent-diff-split-layout-design.md`

---

### Task 1: Update CSS — remove old styles, add new minimal styles

**Files:**

- Modify: `packages/rich-ext-ai-agent/src/plugins/diff-review-overlay.css.ts`

- [ ] **Step 1: Remove `overlayContainer` and `mergedBlock` styles, add `diffContainer` style**

Replace the entire file with updated styles. Remove `overlayContainer`, `mergedBlock`, all `borderRadius` values. Add `diffContainer` for the injected sibling. Update `batchPanel` to static flow positioning. Update `oldBlock`/`newBlock` to minimal spec. Update `batchHeader` to remove border-radius. Update `floatingBar` to `position: fixed`.

```typescript
import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const diffContainer = style({
  border: `1px solid color-mix(in srgb, ${vars.color.text} 10%, transparent)`,
});

export const batchPanel = style({
  overflow: 'hidden',
});

export const batchHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: '2px 10px',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '11px',
  background: `color-mix(in srgb, ${vars.color.text} 3%, ${vars.color.bg})`,
  borderBottom: `1px solid color-mix(in srgb, ${vars.color.text} 6%, transparent)`,
});

export const batchHeaderActions = style({
  display: 'flex',
  gap: '2px',
});

export const batchHeaderReject = style({
  all: 'unset',
  cursor: 'pointer',
  padding: '1px 6px',
  fontSize: '11px',
  color: vars.color.textTertiary,
  transition: 'color 100ms ease, background 100ms ease',
  selectors: {
    '&:hover': {
      color: vars.color.alertCaution,
      background: `color-mix(in srgb, ${vars.color.alertCaution} 10%, transparent)`,
    },
  },
});

export const batchHeaderAccept = style({
  all: 'unset',
  cursor: 'pointer',
  padding: '1px 6px',
  fontSize: '11px',
  color: vars.color.alertTip,
  transition: 'color 100ms ease, background 100ms ease',
  selectors: {
    '&:hover': {
      background: `color-mix(in srgb, ${vars.color.alertTip} 10%, transparent)`,
    },
  },
});

export const oldBlock = style({
  background: `color-mix(in srgb, ${vars.color.alertCaution} 5%, ${vars.color.bg})`,
  borderLeft: `2px solid ${vars.color.alertCaution}`,
  padding: '4px 10px',
  textDecoration: 'line-through',
  textDecorationColor: `color-mix(in srgb, ${vars.color.alertCaution} 35%, transparent)`,
  color: vars.color.textTertiary,
});

export const newBlock = style({
  background: `color-mix(in srgb, ${vars.color.alertTip} 5%, ${vars.color.bg})`,
  borderLeft: `2px solid ${vars.color.alertTip}`,
  padding: '4px 10px',
});

export const floatingBar = style({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '6px 16px',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '12px',
  background: `color-mix(in srgb, ${vars.color.text} 4%, ${vars.color.bg})`,
  borderTop: `1px solid color-mix(in srgb, ${vars.color.text} 8%, transparent)`,
  backdropFilter: 'blur(8px)',
  zIndex: 20,
});

export const floatingBarBtn = style({
  all: 'unset',
  cursor: 'pointer',
  padding: '3px 12px',
  fontSize: '12px',
  fontWeight: 500,
  transition: 'color 100ms ease, background 100ms ease',
});

export const floatingBarAccept = style([
  floatingBarBtn,
  {
    color: vars.color.alertTip,
    background: `color-mix(in srgb, ${vars.color.alertTip} 10%, transparent)`,
    selectors: {
      '&:hover': {
        background: `color-mix(in srgb, ${vars.color.alertTip} 18%, transparent)`,
      },
    },
  },
]);

export const floatingBarReject = style([
  floatingBarBtn,
  {
    color: vars.color.textTertiary,
    selectors: {
      '&:hover': {
        color: vars.color.alertCaution,
        background: `color-mix(in srgb, ${vars.color.alertCaution} 10%, transparent)`,
      },
    },
  },
]);

export const floatingBarLabel = style({
  color: vars.color.textTertiary,
  marginRight: '4px',
});

export const rendererFrame = style({
  overflow: 'hidden',
});

globalStyle(`${rendererFrame} > :first-child`, {
  marginTop: 0,
});

globalStyle(`${rendererFrame} > :last-child`, {
  marginBottom: 0,
});
```

- [ ] **Step 2: Verify the file builds**

Run: `npx eslint packages/rich-ext-ai-agent/src/plugins/diff-review-overlay.css.ts`
Expected: No errors (the `.tsx` file will have import errors — that's expected, fixed in Task 2)

- [ ] **Step 3: Commit**

```bash
git add packages/rich-ext-ai-agent/src/plugins/diff-review-overlay.css.ts
git commit -m "refactor(ai-agent): update diff overlay styles for split layout

Remove overlayContainer, mergedBlock, all borderRadius. Add diffContainer.
Update oldBlock/newBlock to minimal spec. FloatingBar to position: fixed."
```

---

### Task 2: Rewrite DiffReviewOverlayPlugin — data flow and OverlayEntry type

**Files:**

- Modify: `packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx`

This task changes the import, OverlayEntry type, and `computeOverlays` function. DOM injection is in Task 3.

- [ ] **Step 1: Update import — switch diffMergedNode to diffModifiedNode**

In `packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx`, change line 2:

Old:

```typescript
import { decorateSubtree, diffMergedNode } from '@haklex/rich-diff-core';
```

New:

```typescript
import { decorateSubtree, diffModifiedNode } from '@haklex/rich-diff-core';
```

- [ ] **Step 2: Update CSS imports — remove old, add new**

Old (lines 22-38):

```typescript
import {
  batchHeader,
  batchHeaderAccept,
  batchHeaderActions,
  batchHeaderLabel,
  batchHeaderReject,
  batchPanel,
  floatingBar,
  floatingBarAccept,
  floatingBarLabel,
  floatingBarReject,
  mergedBlock,
  newBlock,
  oldBlock,
  overlayContainer,
  rendererFrame,
} from './diff-review-overlay.css';
```

New:

```typescript
import {
  batchHeader,
  batchHeaderAccept,
  batchHeaderActions,
  batchHeaderReject,
  batchPanel,
  diffContainer,
  floatingBar,
  floatingBarAccept,
  floatingBarLabel,
  floatingBarReject,
  newBlock,
  oldBlock,
  rendererFrame,
} from './diff-review-overlay.css';
```

Removed: `batchHeaderLabel`, `mergedBlock`, `overlayContainer`. Added: `diffContainer`.

- [ ] **Step 3: Simplify OverlayEntry type**

Old (lines 83-95):

```typescript
type OverlayEntry = {
  id: string;
  batchId: string;
  type: 'insert' | 'delete' | 'replace';
  blockEl: HTMLElement | null;
  blockTop: number;
  blockHeight: number;
  previewTop?: number;
  oldNode?: SerializedLexicalNode;
  newNode?: SerializedLexicalNode;
  mergedNode?: SerializedLexicalNode;
  spacing: 'none' | 'before' | 'after' | 'overlay';
};
```

New:

```typescript
type OverlayEntry = {
  id: string;
  batchId: string;
  type: 'insert' | 'delete' | 'replace';
  blockEl: HTMLElement | null;
  oldNode?: SerializedLexicalNode;
  newNode?: SerializedLexicalNode;
  spacing: 'none' | 'before' | 'after';
};
```

- [ ] **Step 4: Update computeOverlays — replace branch uses diffModifiedNode**

Replace the `replace` section in `computeOverlays` (currently lines 497-511):

Old:

```typescript
const baseNode = blockMap.get(blockId);
if (!baseNode || !entry.op.node?.type) continue;
const merged = diffMergedNode(baseNode, entry.op.node);

entries.push({
  id: entry.id,
  batchId: batch.id,
  type: 'replace',
  blockEl: domEl,
  blockTop: rect.top - containerRect.top,
  blockHeight: rect.height,
  mergedNode: merged,
  previewTop: rect.top - containerRect.top,
  spacing: 'overlay',
});
```

New:

```typescript
const baseNode = blockMap.get(blockId);
if (!baseNode || !entry.op.node?.type) continue;
const modified = diffModifiedNode(baseNode, entry.op.node);

entries.push({
  id: entry.id,
  batchId: batch.id,
  type: 'replace',
  blockEl: domEl,
  oldNode: modified.oldNode,
  newNode: modified.newNode,
  spacing: 'none',
});
```

- [ ] **Step 5: Simplify insert entry creation — remove position fields**

For the `anchorBeforeId` insert path (currently lines 436-446), change to:

```typescript
entries.push({
  id: entry.id,
  batchId: batch.id,
  type: 'insert',
  blockEl: domEl,
  newNode: decorateSubtree(entry.op.node, 'insert'),
  spacing: 'after',
});
```

For the `anchorAfterId` insert path (currently lines 459-469), change to:

```typescript
entries.push({
  id: entry.id,
  batchId: batch.id,
  type: 'insert',
  blockEl: domEl,
  newNode: decorateSubtree(entry.op.node, 'insert'),
  spacing: 'before',
});
```

- [ ] **Step 6: Simplify delete entry creation — remove position fields**

For the delete path (currently lines 485-494), change to:

```typescript
entries.push({
  id: entry.id,
  batchId: batch.id,
  type: 'delete',
  blockEl: domEl,
  spacing: 'none',
});
```

- [ ] **Step 7: Remove `containerRect` computation**

In `computeOverlays`, remove these lines (currently 405-406):

```typescript
const container = rootEl.parentElement ?? rootEl;
const containerRect = container.getBoundingClientRect();
```

The `containerRect` was only used for absolute positioning calculations — no longer needed.

- [ ] **Step 8: Commit**

```bash
git add packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx
git commit -m "refactor(ai-agent): switch to diffModifiedNode and simplify OverlayEntry

Replace diffMergedNode with diffModifiedNode for split old/new rendering.
Remove mergedNode, previewTop, blockTop, blockHeight from OverlayEntry."
```

---

### Task 3: Rewrite DiffReviewOverlayPlugin — DOM injection and rendering

**Files:**

- Modify: `packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx`

This task replaces the portal-based absolute overlay system with sibling container injection.

- [ ] **Step 1: Remove old positioning/observer infrastructure**

Delete the following from `DiffReviewOverlayPlugin`:

1. `const [containerEl, setContainerEl] = useState<HTMLElement | null>(null);` (line 213)
2. `const previewRefs = useRef(...)` (line 219)
3. `const observerRef = useRef(...)` (line 220)
4. The entire `repositionPanels` callback (lines 319-360)
5. The `useLayoutEffect` for repositionPanels (lines 362-364)
6. The `useEffect` for ResizeObserver (lines 366-373)
7. The `previewRefCallback` (lines 375-385)
8. The `useEffect` that sets `containerEl` and `wrapper.style.position` (lines 534-543)

- [ ] **Step 2: Add sibling container injection effect**

Add a new `useEffect` that manages DOM sibling containers. Place it after the `computeOverlays` definition. This replaces all the old positioning logic.

```typescript
const containerRefs = useRef(new Map<string, HTMLDivElement>());

useEffect(() => {
  const prevContainers = containerRefs.current;
  const nextContainers = new Map<string, HTMLDivElement>();

  for (const entry of overlays) {
    if (entry.type === 'delete' || !entry.blockEl) continue;

    const existing = prevContainers.get(entry.id);
    if (existing && existing.parentNode) {
      nextContainers.set(entry.id, existing);
      prevContainers.delete(entry.id);
    } else {
      const container = document.createElement('div');
      container.setAttribute('contenteditable', 'false');
      container.className = diffContainer;
      container.dataset.diffEntryId = entry.id;

      if (entry.type === 'replace') {
        entry.blockEl.parentNode?.insertBefore(container, entry.blockEl);
        entry.blockEl.style.display = 'none';
      } else if (entry.spacing === 'after') {
        entry.blockEl.parentNode?.insertBefore(container, entry.blockEl.nextSibling);
      } else {
        entry.blockEl.parentNode?.insertBefore(container, entry.blockEl);
      }

      nextContainers.set(entry.id, container);
    }
  }

  for (const [id, container] of prevContainers) {
    const entry = overlays.find((e) => e.id === id);
    if (entry?.blockEl) {
      entry.blockEl.style.display = '';
    }
    container.remove();
  }

  containerRefs.current = nextContainers;

  return () => {
    for (const [id, container] of nextContainers) {
      const entry = overlays.find((e) => e.id === id);
      if (entry?.blockEl) {
        entry.blockEl.style.display = '';
      }
      container.remove();
    }
    containerRefs.current = new Map();
  };
}, [overlays]);
```

- [ ] **Step 3: Update resetBlockDecorations — add display reset**

In the `resetBlockDecorations` function, add `entry.blockEl.style.display = '';` so blocks hidden by replace entries are properly restored:

```typescript
function resetBlockDecorations(entry: OverlayEntry) {
  if (!entry.blockEl) return;
  entry.blockEl.style.background = '';
  entry.blockEl.style.borderLeft = '';
  entry.blockEl.style.textDecoration = '';
  entry.blockEl.style.textDecorationColor = '';
  entry.blockEl.style.opacity = '';
  entry.blockEl.style.display = '';
}
```

Remove `visibility` and `marginTop`/`marginBottom` resets — no longer used.

- [ ] **Step 4: Update InlineEntryPanel — remove merged branch, remove positioning props**

Rewrite `InlineEntryPanel`. Remove `mergedBlock` branch, remove `previewRefCallback`, remove `style={{ top: entry.previewTop }}`:

```typescript
function InlineEntryPanel({
  entry,
  batchId,
  extraNodes,
  rendererConfig,
  theme,
  variant,
  onAcceptEntry,
  onRejectEntry,
}: {
  entry: OverlayEntry;
  batchId: string;
  extraNodes: ReturnType<typeof useExtraNodes>;
  rendererConfig: ReturnType<typeof useRendererConfig>;
  theme: ReturnType<typeof useColorScheme>;
  variant: ReturnType<typeof useVariant>;
  onAcceptEntry: (batchId: string, entryId: string) => void;
  onRejectEntry: (batchId: string, entryId: string) => void;
}): ReactElement {
  return (
    <div className={batchPanel}>
      <div className={batchHeader}>
        <div className={batchHeaderActions}>
          <button
            className={batchHeaderReject}
            type="button"
            onClick={() => onRejectEntry(batchId, entry.id)}
          >
            Reject
          </button>
          <button
            className={batchHeaderAccept}
            type="button"
            onClick={() => onAcceptEntry(batchId, entry.id)}
          >
            Accept
          </button>
        </div>
      </div>
      {entry.oldNode && (
        <div className={oldBlock}>
          <div className={rendererFrame}>
            <RichRenderer
              extraNodes={extraNodes}
              rendererConfig={rendererConfig}
              theme={theme}
              value={wrapDoc([entry.oldNode])}
              variant={variant}
            />
          </div>
        </div>
      )}
      {entry.newNode && (
        <div className={newBlock}>
          <div className={rendererFrame}>
            <RichRenderer
              extraNodes={extraNodes}
              rendererConfig={rendererConfig}
              theme={theme}
              value={wrapDoc([entry.newNode])}
              variant={variant}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Rewrite render output — portal per-entry into sibling containers, FloatingBar to body**

Replace the entire return block of `DiffReviewOverlayPlugin` (currently lines 561-609):

```typescript
  const pendingCount = overlays.filter((e) => e.type !== 'delete').length;

  const portals: ReactElement[] = [];

  for (const entry of overlays) {
    if (entry.type === 'delete') continue;
    const container = containerRefs.current.get(entry.id);
    if (!container) continue;

    portals.push(
      createPortal(
        <InlineEntryPanel
          batchId={entry.batchId}
          entry={entry}
          extraNodes={extraNodes}
          key={entry.id}
          rendererConfig={rendererConfig}
          theme={theme}
          variant={variant}
          onAcceptEntry={handleAcceptEntry}
          onRejectEntry={handleRejectEntry}
        />,
        container,
      ),
    );
  }

  if (pendingCount > 1) {
    portals.push(
      createPortal(
        <div className={floatingBar} key="__floating-bar__">
          <span className={floatingBarLabel}>{overlays.length} changes</span>
          {Array.from(batchGroups.keys()).map((batchId) => (
            <span key={batchId}>
              <button
                className={floatingBarReject}
                type="button"
                onClick={() => handleRejectAllBatch(batchId)}
              >
                Reject All
              </button>
              <button
                className={floatingBarAccept}
                type="button"
                onClick={() => handleAcceptAllBatch(batchId)}
              >
                Accept All
              </button>
            </span>
          ))}
        </div>,
        document.body,
      ),
    );
  }

  if (portals.length === 0) return null;

  return <>{portals}</>;
```

- [ ] **Step 6: Remove unused imports**

Remove from React imports: `useLayoutEffect` (no longer used).
Remove `INSERT_GAP` constant (no longer used).
Remove the `useEffect` that sets `containerEl` (already removed in Step 1).

Verify final import list:

```typescript
import type { ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
```

- [ ] **Step 7: Lint and verify**

Run: `npx eslint packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx`
Expected: No errors

Run: `npx eslint packages/rich-ext-ai-agent/src/plugins/diff-review-overlay.css.ts`
Expected: No errors

- [ ] **Step 8: Commit**

```bash
git add packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx
git commit -m "refactor(ai-agent): replace absolute overlay with document-flow sibling containers

Inject contenteditable=false sibling containers before block elements.
Portal diff panels into containers. Full teardown/rebuild on each update.
Remove repositionPanels, ResizeObserver, overlayContainer."
```

---

### Task 4: Build verification

**Files:** None (verification only)

- [ ] **Step 1: Build the package**

Run: `pnpm --filter @haklex/rich-ext-ai-agent build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Build all packages (catch cross-package issues)**

Run: `pnpm build:packages`
Expected: All packages build successfully

- [ ] **Step 3: Lint all**

Run: `pnpm lint`
Expected: No lint errors

- [ ] **Step 4: Commit (if any auto-fixes applied)**

```bash
git add -A
git diff --cached --stat
# Only commit if there are changes
git commit -m "chore: apply lint/format fixes"
```
