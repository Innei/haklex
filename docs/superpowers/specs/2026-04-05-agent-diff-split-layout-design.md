# AI Agent Diff View: Split Layout Design

**Date**: 2026-04-05
**Scope**: `@haklex/rich-ext-ai-agent` — `DiffReviewOverlayPlugin`
**Status**: Draft

## Problem

The current AI Agent diff review overlay renders `replace` operations as a single merged inline block — deletions (strikethrough + red) and insertions (green) interleaved on the same line, like VS Code's inline diff. When changes are extensive, it's hard to quickly distinguish what was removed vs what was added.

## Goal

Change `replace` operations from inline merged diff to a Git-style unified split layout: **delete line above, insert line below**, with character-level word highlights on changed segments.

## Scope

- **In scope**: `DiffReviewOverlayPlugin` in `packages/rich-ext-ai-agent/src/plugins/`
- **Out of scope**: `DiffReviewBubble` (chat bubble), standalone `RichDiff` component

## Design Decisions

### 1. Split rendering for replace operations

**Current**: `diffMergedNode(baseNode, newNode)` → single `mergedNode` with interleaved delete/insert marks → rendered in one `mergedBlock`.

**New**: `diffModifiedNode(baseNode, newNode)` → separate `{ oldNode, newNode }` pair, each with character-level highlights → rendered as two stacked blocks (delete above, insert below).

`diffModifiedNode` already exists in `@haklex/rich-diff-core` and produces exactly the paired output needed. It delegates to `diffNodeInline` for char-level diff with `diffTextByChar`, then decorates changed text segments with `DELETE_MARK_STYLE` / `INSERT_MARK_STYLE`.

### 2. Document-flow DOM injection (sibling container)

**Current**: All overlay panels use `position: absolute` inside a portal container, with `repositionPanels()` + `ResizeObserver` manually calculating positions and adding margin compensation.

**New**: For `replace` entries, inject a **sibling container** before the block element. The block element is **not reparented** — it stays as a direct child of the Lexical root to preserve Lexical's DOM ownership.

1. Find `blockEl` (the original Lexical block DOM element)
2. Create a container div via `document.createElement`, mark it `contenteditable="false"`
3. `blockEl.parentNode.insertBefore(container, blockEl)` — insert container as sibling before blockEl
4. Render diff panel (header + oldBlock + newBlock) into the container via `createPortal`
5. Hide blockEl: `display: none` (Lexical still owns it in the DOM tree — it's just not visible)
6. On review completion: remove the container, restore blockEl visibility

**Why not reparent blockEl into a wrapper?** Lexical expects to own the DOM tree under `contentEditable`. Moving a block element to a foreign parent breaks Lexical's reconciliation — it may recreate the node, corrupt selection, or fight the wrapper during the next `editor.update()`. By keeping blockEl in place (just hidden) and inserting a non-editable sibling, we avoid all of these risks.

**Benefits**:

- Panel height naturally participates in document flow — no manual position calculation
- No risk of overlapping subsequent content
- No `ResizeObserver` or `repositionPanels` needed for replace entries
- Lexical's DOM ownership preserved — no reconciliation conflicts

### 3. Insert entries — also document-flow

Insert entries follow the same pattern: create a container div (marked `contenteditable="false"`), insert it as a sibling before/after the anchor block, and portal the new block preview into it. No absolute positioning.

### 4. Delete entries — unchanged

Delete entries keep the current behavior: direct DOM decoration on the existing block element (red background, left border, strikethrough, reduced opacity). No wrapper needed.

### 5. FloatingBar positioning

The floating "Accept All / Reject All" bar is currently rendered inside `overlayContainer`. With the container removed, the FloatingBar needs a new home. It should be rendered as a `position: fixed` element (bottom of viewport) or portaled to `document.body`, since it's not tied to any specific block. Its show/hide logic (appears when `pendingCount > 1`) remains unchanged.

### 6. Undo/redo safety

Injected sibling containers hold refs to `blockEl`. If the user triggers undo/redo, Lexical may replace or remove block DOM elements. The `computeOverlays` function is already called on every `editor.registerUpdateListener` callback — on each update, all injected containers are torn down and rebuilt from the current DOM state. This "full teardown + rebuild" approach guarantees no stale refs survive an undo/redo cycle.

Additionally, the `oldBlock` row's line-through style is applied by the CSS class on the container, **not** as an inline style on serialized text nodes. This avoids double-strikethrough with the char-level `DELETE_MARK_STYLE` from `compute-diff.ts`. The char-level marks only add background-color highlighting; the row-level container adds the strikethrough.

### 7. Code to remove

- `repositionPanels()` function — no longer needed
- `overlayContainer` absolute-positioned portal container — no longer needed
- `ResizeObserver` setup/teardown — no longer needed
- `mergedBlock` CSS class — replaced by the existing `oldBlock` / `newBlock` classes
- `spacing` / `previewTop` / `blockTop` / `blockHeight` fields on `OverlayEntry` — no longer needed

### 8. Visual style

- **No border-radius** — all sharp corners
- **Minimal header** — right-aligned Reject / Accept buttons only, thin bottom border separator
- **Delete row**: light red background (`color-mix(in srgb, var(--rc-alert-caution) 5%, transparent)`), 2px solid left border in caution color, line-through, muted text color, char-level changed words get deeper red highlight
- **Insert row**: light green background (`color-mix(in srgb, var(--rc-alert-tip) 5%, transparent)`), 2px solid left border in tip color, char-level changed words get deeper green highlight
- **Outer wrapper**: 1px solid border (using `vars.color.text` at 10% mix)
- **Compact padding**: 4px vertical, 10px horizontal on content rows; 2px vertical on header

## Files to Modify

| File                                                                 | Change                                                                                                                                                                                                                 |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx` | Replace portal-based absolute overlay with document-flow wrapper injection; switch from `diffMergedNode` to `diffModifiedNode`; remove `repositionPanels`, `ResizeObserver`, `overlayContainer`                        |
| `packages/rich-ext-ai-agent/src/plugins/diff-review-overlay.css.ts`  | Remove `overlayContainer`, `mergedBlock`; update `batchPanel` to flow layout (no `position: absolute`); update `oldBlock` / `newBlock` to new minimal style; remove `borderRadius` from all classes; add wrapper style |

## Data Structure Changes

```typescript
// OverlayEntry — simplified
type OverlayEntry = {
  id: string;
  batchId: string;
  type: 'insert' | 'delete' | 'replace';
  blockEl: HTMLElement | null;
  oldNode?: SerializedLexicalNode; // for replace: char-highlighted old
  newNode?: SerializedLexicalNode; // for replace + insert: char-highlighted new
  spacing: 'none' | 'before' | 'after'; // simplified, no 'overlay'
};
// mergedNode, previewTop, blockTop, blockHeight removed
```

## Component Structure

```
DiffReviewOverlayPlugin
├── useEffect: computeOverlays (store + editor subscription)
│   └── replace → diffModifiedNode → { oldNode, newNode }
│   └── insert → decorateSubtree → { newNode }
│   └── delete → { blockEl only }
├── useEffect: DOM sibling injection / cleanup (full teardown + rebuild on each update)
│   └── replace: insert sibling container before blockEl, hide blockEl (display: none), portal diff panel
│   └── insert: insert sibling container before/after anchor block, portal new block preview
│   └── delete: applyDeleteDecorations (unchanged)
│   └── cleanup: remove all injected containers, restore blockEl visibility
├── InlineEntryPanel (rendered into sibling container via portal)
│   ├── header (Reject / Accept) — contenteditable="false"
│   ├── oldBlock (RichRenderer with oldNode) — line-through via CSS class, char highlights via inline style
│   └── newBlock (RichRenderer with newNode) — char highlights via inline style
└── FloatingBar (Accept All / Reject All — position: fixed or portal to body)
```

## Lifecycle

1. Agent produces operations → review state populated
2. `computeOverlays` reads review state, computes `OverlayEntry[]` with diffed nodes
3. DOM effect tears down any previous containers, then creates new sibling containers before each target blockEl, hides blockEls, portals panels
4. On editor update (including undo/redo): full teardown + rebuild from step 2
5. User clicks Accept → `applyEntryOp` applies the op to Lexical state, store updated, containers rebuilt on next cycle
6. User clicks Reject → store updated, containers rebuilt on next cycle (blockEl restored)
7. All entries resolved → all containers removed, floating bar disappears
