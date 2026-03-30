# Diff Review Overlay UI Refine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `DiffReviewOverlayPlugin` to render Cursor-style unified diff panels (old red + new green stacked) with per-batch header toolbars, replacing the current floating pill toolbar + separate preview panel design.

**Architecture:** Two files changed. CSS file is rewritten with new batch-oriented styles. TSX component replaces `InlineToolbar` + per-entry preview with `BatchPanel` component that groups entries by batch. Delete decorations unchanged; replace decorations move from editor DOM into the overlay panel.

**Tech Stack:** React, Vanilla Extract CSS-in-TS, Lexical, `@haklex/rich-diff-core`, `@haklex/rich-style-token`

---

### Task 1: Rewrite CSS — replace old styles with batch-oriented styles

**Files:**

- Modify: `packages/rich-ext-ai-agent/src/plugins/diff-review-overlay.css.ts`

- [ ] **Step 1: Replace the entire CSS file**

Replace the full contents of `diff-review-overlay.css.ts` with:

```typescript
import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const overlayContainer = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  zIndex: 10,
});

export const batchPanel = style({
  pointerEvents: 'auto',
  position: 'absolute',
  left: 0,
  right: 0,
  overflow: 'hidden',
  borderRadius: vars.borderRadius.md,
});

export const batchHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '3px 10px',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '11px',
  background: `color-mix(in srgb, ${vars.color.text} 3%, ${vars.color.bg})`,
  borderBottom: `1px solid color-mix(in srgb, ${vars.color.text} 6%, transparent)`,
  borderRadius: `${vars.borderRadius.md} ${vars.borderRadius.md} 0 0`,
});

export const batchHeaderLabel = style({
  color: vars.color.textTertiary,
});

export const batchHeaderActions = style({
  display: 'flex',
  gap: '4px',
});

export const batchHeaderReject = style({
  all: 'unset',
  cursor: 'pointer',
  padding: '1px 8px',
  borderRadius: '3px',
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
  padding: '1px 8px',
  borderRadius: '3px',
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
  background: `color-mix(in srgb, ${vars.color.alertCaution} 6%, ${vars.color.bg})`,
  borderLeft: `2px solid ${vars.color.alertCaution}`,
  padding: '6px 10px',
  textDecoration: 'line-through',
  textDecorationColor: `color-mix(in srgb, ${vars.color.alertCaution} 40%, transparent)`,
  color: vars.color.textTertiary,
});

export const newBlock = style({
  background: `color-mix(in srgb, ${vars.color.alertTip} 6%, ${vars.color.bg})`,
  borderLeft: `2px solid ${vars.color.alertTip}`,
  padding: '6px 10px',
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

- [ ] **Step 2: Verify no type errors in the CSS file**

Run: `npx tsc --noEmit packages/rich-ext-ai-agent/src/plugins/diff-review-overlay.css.ts 2>&1 | head -20`

This will show import errors from the TSX file (expected — we haven't updated it yet). The CSS file itself should have no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/rich-ext-ai-agent/src/plugins/diff-review-overlay.css.ts
git commit -m "refactor(agent-ext): rewrite diff overlay CSS with batch-oriented styles"
```

---

### Task 2: Update OverlayEntry type and computeOverlays logic

**Files:**

- Modify: `packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx`

- [ ] **Step 1: Update imports from CSS file**

Replace the CSS import block (lines 19-30):

```typescript
import {
  inlineAcceptButton,
  inlineActionButton,
  inlinePreview,
  inlinePreviewBody,
  inlinePreviewTone,
  inlineRejectButton,
  inlineRendererFrame,
  inlineToolbar,
  inlineToolbarLayer,
  overlayContainer,
} from './diff-review-overlay.css';
```

With:

```typescript
import {
  batchHeader,
  batchHeaderAccept,
  batchHeaderActions,
  batchHeaderLabel,
  batchHeaderReject,
  batchPanel,
  newBlock,
  oldBlock,
  overlayContainer,
  rendererFrame,
} from './diff-review-overlay.css';
```

- [ ] **Step 2: Remove unused imports**

Remove these imports that are no longer needed:

- `ActionButton` from `@haklex/rich-editor-ui` (line 10)
- `Check, X` from `lucide-react` (line 14)

- [ ] **Step 3: Update OverlayEntry type**

Replace the `OverlayEntry` type (lines 66-76):

```typescript
type OverlayEntry = {
  id: string;
  batchId: string;
  type: 'insert' | 'delete' | 'replace';
  blockEl: HTMLElement | null;
  blockTop: number;
  blockHeight: number;
  previewTop?: number;
  previewNode?: SerializedLexicalNode;
  spacing: 'none' | 'before' | 'after';
};
```

With:

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
  spacing: 'none' | 'before' | 'after';
};
```

- [ ] **Step 4: Remove `applyReplaceDecorations` function**

Delete the `applyReplaceDecorations` function (lines 87-94):

```typescript
function applyReplaceDecorations(entry: OverlayEntry) {
  if (!entry.blockEl) return;
  entry.blockEl.style.background = REPLACE_BG;
  entry.blockEl.style.borderLeft = REPLACE_BORDER;
  entry.blockEl.style.textDecoration = 'line-through';
  entry.blockEl.style.textDecorationColor = 'var(--rc-alert-caution)';
  entry.blockEl.style.opacity = '0.7';
}
```

Also remove the now-unused constants `REPLACE_BG` and `REPLACE_BORDER` (lines 36-37).

- [ ] **Step 5: Update computeOverlays — replace entries**

In the `computeOverlays` callback, find the replace entry creation block (around lines 378-394). Replace:

```typescript
const oldNode = blockMap.get(blockId);
if (!oldNode || !entry.op.node?.type) continue;
const { newNode } = diffModifiedNode(oldNode, entry.op.node);

entries.push({
  id: entry.id,
  batchId: batch.id,
  type: 'replace',
  blockEl: domEl,
  blockTop: rect.top - containerRect.top,
  blockHeight: rect.height,
  previewNode: newNode,
  previewTop: rect.bottom - containerRect.top + INSERT_GAP,
  spacing: 'after',
});
```

With:

```typescript
const baseNode = blockMap.get(blockId);
if (!baseNode || !entry.op.node?.type) continue;
const diffResult = diffModifiedNode(baseNode, entry.op.node);

entries.push({
  id: entry.id,
  batchId: batch.id,
  type: 'replace',
  blockEl: domEl,
  blockTop: rect.top - containerRect.top,
  blockHeight: rect.height,
  oldNode: diffResult.oldNode,
  newNode: diffResult.newNode,
  previewTop: rect.bottom - containerRect.top + INSERT_GAP,
  spacing: 'after',
});
```

- [ ] **Step 6: Update computeOverlays — insert entries**

For insert entries with `anchorBeforeId` (around lines 317-328), replace:

```typescript
entries.push({
  id: entry.id,
  batchId: batch.id,
  type: 'insert',
  blockEl: domEl,
  blockTop: rect.bottom - containerRect.top,
  blockHeight: rect.height,
  previewNode: decorateSubtree(entry.op.node, 'insert'),
  previewTop: rect.bottom - containerRect.top + INSERT_GAP,
  spacing: 'after',
});
```

With:

```typescript
entries.push({
  id: entry.id,
  batchId: batch.id,
  type: 'insert',
  blockEl: domEl,
  blockTop: rect.bottom - containerRect.top,
  blockHeight: rect.height,
  newNode: decorateSubtree(entry.op.node, 'insert'),
  previewTop: rect.bottom - containerRect.top + INSERT_GAP,
  spacing: 'after',
});
```

For insert entries with `anchorAfterId` (around lines 339-349), replace:

```typescript
entries.push({
  id: entry.id,
  batchId: batch.id,
  type: 'insert',
  blockEl: domEl,
  blockTop: rect.top - containerRect.top,
  blockHeight: rect.height,
  previewNode: decorateSubtree(entry.op.node, 'insert'),
  previewTop: rect.top - containerRect.top,
  spacing: 'before',
});
```

With:

```typescript
entries.push({
  id: entry.id,
  batchId: batch.id,
  type: 'insert',
  blockEl: domEl,
  blockTop: rect.top - containerRect.top,
  blockHeight: rect.height,
  newNode: decorateSubtree(entry.op.node, 'insert'),
  previewTop: rect.top - containerRect.top,
  spacing: 'before',
});
```

- [ ] **Step 7: Update decoration effect — remove replace branch**

In the `useEffect` that applies decorations (around lines 400-417), replace:

```typescript
useEffect(() => {
  for (const overlay of overlays) {
    resetBlockDecorations(overlay);
    if (overlay.type === 'delete') {
      applyDeleteDecorations(overlay);
    } else if (overlay.type === 'replace') {
      applyReplaceDecorations(overlay);
    }
  }

  syncSpacing();

  return () => {
    for (const overlay of overlays) {
      resetBlockDecorations(overlay);
    }
  };
}, [overlays, syncSpacing]);
```

With:

```typescript
useEffect(() => {
  for (const overlay of overlays) {
    resetBlockDecorations(overlay);
    if (overlay.type === 'delete') {
      applyDeleteDecorations(overlay);
    }
  }

  syncSpacing();

  return () => {
    for (const overlay of overlays) {
      resetBlockDecorations(overlay);
    }
  };
}, [overlays, syncSpacing]);
```

- [ ] **Step 8: Update syncSpacing — check newNode instead of previewNode**

In the `previewRefCallback` function, no change needed (it uses entry `id`).

In the `syncSpacing` callback, no change needed (it uses `previewRefs` map by `id`).

- [ ] **Step 9: Commit**

```bash
git add packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx
git commit -m "refactor(agent-ext): update OverlayEntry type and computeOverlays for batch panels"
```

---

### Task 3: Replace InlineToolbar and render with BatchPanel component

**Files:**

- Modify: `packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx`

- [ ] **Step 1: Remove InlineToolbar component**

Delete the entire `InlineToolbar` function (lines 107-146):

```typescript
function InlineToolbar({
  batchId,
  top,
  onAccept,
  onReject,
}: {
  batchId: string;
  onAccept: (batchId: string) => void;
  onReject: (batchId: string) => void;
  top: number;
}): ReactElement {
  // ... entire component
}
```

- [ ] **Step 2: Remove the `renderNode` callback**

Delete the `renderNode` callback (around lines 160-171):

```typescript
  const renderNode = useCallback(
    (node: SerializedLexicalNode) => (
      <RichRenderer
        extraNodes={extraNodes}
        rendererConfig={rendererConfig}
        theme={theme}
        value={wrapDoc([node])}
        variant={variant}
      />
    ),
    [extraNodes, rendererConfig, theme, variant],
  );
```

- [ ] **Step 3: Add `useMemo` to imports and add batch grouping**

Add `useMemo` to the React import:

```typescript
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
```

Inside `DiffReviewOverlayPlugin`, after the `overlays` state, add the batch grouping memo:

```typescript
const batchGroups = useMemo(() => {
  const groups = new Map<string, OverlayEntry[]>();
  for (const entry of overlays) {
    if (entry.type === 'delete') continue;
    const list = groups.get(entry.batchId) ?? [];
    list.push(entry);
    groups.set(entry.batchId, list);
  }
  return groups;
}, [overlays]);
```

- [ ] **Step 4: Add the BatchPanel component**

Add this component above the `DiffReviewOverlayPlugin` function (after the helper functions, before the main export):

```typescript
function BatchPanel({
  batchId,
  entries,
  top,
  extraNodes,
  rendererConfig,
  theme,
  variant,
  onAccept,
  onReject,
  previewRefCallback,
}: {
  batchId: string;
  entries: OverlayEntry[];
  top: number;
  extraNodes: ReturnType<typeof useExtraNodes>;
  rendererConfig: ReturnType<typeof useRendererConfig>;
  theme: ReturnType<typeof useColorScheme>;
  variant: ReturnType<typeof useVariant>;
  onAccept: (batchId: string) => void;
  onReject: (batchId: string) => void;
  previewRefCallback: (id: string) => (el: HTMLDivElement | null) => void;
}): ReactElement {
  const insertCount = entries.filter((e) => e.type === 'insert').length;
  const replaceCount = entries.filter((e) => e.type === 'replace').length;
  const parts: string[] = [];
  if (replaceCount > 0) parts.push(`${replaceCount} change${replaceCount > 1 ? 's' : ''}`);
  if (insertCount > 0) parts.push(`${insertCount} insertion${insertCount > 1 ? 's' : ''}`);
  const label = parts.join(', ');

  return (
    <div className={batchPanel} ref={previewRefCallback(entries[0].id)} style={{ top }}>
      <div className={batchHeader}>
        <span className={batchHeaderLabel}>{label}</span>
        <div className={batchHeaderActions}>
          <button
            className={batchHeaderReject}
            type="button"
            onClick={() => onReject(batchId)}
          >
            Reject
          </button>
          <button
            className={batchHeaderAccept}
            type="button"
            onClick={() => onAccept(batchId)}
          >
            Accept
          </button>
        </div>
      </div>
      {entries.map((entry) => (
        <div key={entry.id}>
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
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Replace the createPortal render**

Replace the entire `createPortal` return block (lines 443-474):

```typescript
  return createPortal(
    <div className={overlayContainer}>
      {overlays.map((overlay) => (
        <InlineToolbar
          batchId={overlay.batchId}
          key={`${overlay.id}:toolbar`}
          top={overlay.blockTop + TOOLBAR_OFFSET}
          onAccept={handleAcceptBatch}
          onReject={handleRejectBatch}
        />
      ))}

      {overlays.map((overlay) => {
        if (!overlay.previewNode || overlay.previewTop == null) return null;

        const tone = overlay.type === 'replace' ? 'replace' : 'insert';
        return (
          <div
            className={`${inlinePreview} ${inlinePreviewTone[tone]}`}
            key={`${overlay.id}:preview`}
            ref={previewRefCallback(overlay.id)}
            style={{ top: overlay.previewTop }}
          >
            <div className={inlinePreviewBody}>
              <div className={inlineRendererFrame}>{renderNode(overlay.previewNode)}</div>
            </div>
          </div>
        );
      })}
    </div>,
    containerEl,
  );
```

With:

```typescript
  return createPortal(
    <div className={overlayContainer}>
      {Array.from(batchGroups.entries()).map(([batchId, entries]) => {
        const firstEntry = entries[0];
        if (firstEntry.previewTop == null) return null;

        return (
          <BatchPanel
            key={batchId}
            batchId={batchId}
            entries={entries}
            extraNodes={extraNodes}
            previewRefCallback={previewRefCallback}
            rendererConfig={rendererConfig}
            theme={theme}
            top={firstEntry.previewTop}
            variant={variant}
            onAccept={handleAcceptBatch}
            onReject={handleRejectBatch}
          />
        );
      })}
    </div>,
    containerEl,
  );
```

- [ ] **Step 6: Remove unused constant `TOOLBAR_OFFSET`**

Delete line: `const TOOLBAR_OFFSET = 4;`

- [ ] **Step 7: Commit**

```bash
git add packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx
git commit -m "refactor(agent-ext): replace InlineToolbar with BatchPanel component"
```

---

### Task 4: Lint, type-check, and verify

**Files:**

- Verify: `packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx`
- Verify: `packages/rich-ext-ai-agent/src/plugins/diff-review-overlay.css.ts`

- [ ] **Step 1: Run ESLint on both files**

Run: `npx eslint packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx packages/rich-ext-ai-agent/src/plugins/diff-review-overlay.css.ts`

Fix any errors reported.

- [ ] **Step 2: Run TypeScript type-check**

Run: `pnpm --filter @haklex/rich-ext-ai-agent exec tsc --noEmit`

Fix any type errors.

- [ ] **Step 3: Build the package**

Run: `pnpm --filter @haklex/rich-ext-ai-agent build`

Verify build succeeds with no errors.

- [ ] **Step 4: Verify no stale CSS exports are referenced elsewhere**

Run: `grep -r "inlineToolbar\|inlinePreview\|inlineActionButton\|inlineAcceptButton\|inlineRejectButton\|inlinePreviewTone\|inlinePreviewBody" packages/rich-ext-ai-agent/src/`

Expected: no matches (all old CSS class references should be gone).

- [ ] **Step 5: Commit any lint/type fixes if needed**

```bash
git add packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx packages/rich-ext-ai-agent/src/plugins/diff-review-overlay.css.ts
git commit -m "fix(agent-ext): lint and type fixes for diff overlay refactor"
```
