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

### 2. Document-flow DOM injection (replace wrapper)

**Current**: All overlay panels use `position: absolute` inside a portal container, with `repositionPanels()` + `ResizeObserver` manually calculating positions and adding margin compensation.

**New**: For `replace` entries, inject a **wrapper div** into the DOM that participates in document flow:

1. Find `blockEl` (the original Lexical block DOM element)
2. Create a wrapper div via `document.createElement`
3. `blockEl.parentNode.insertBefore(wrapper, blockEl)` — insert wrapper before blockEl
4. `wrapper.appendChild(blockEl)` — move blockEl inside wrapper
5. Render diff panel (header + oldBlock + newBlock) into wrapper via `createPortal`, before blockEl
6. Hide blockEl: `height: 0; overflow: hidden; visibility: hidden`
7. On review completion: move blockEl back to its original position, remove wrapper

**Benefits**:

- Panel height naturally participates in document flow — no manual position calculation
- No risk of overlapping subsequent content
- No `ResizeObserver` or `repositionPanels` needed for replace entries

### 3. Insert entries — also document-flow

Insert entries follow the same pattern: create a container div, insert it as a sibling before/after the anchor block, and portal the new block preview into it. No absolute positioning.

### 4. Delete entries — unchanged

Delete entries keep the current behavior: direct DOM decoration on the existing block element (red background, left border, strikethrough, reduced opacity). No wrapper needed.

### 5. FloatingBar positioning

The floating "Accept All / Reject All" bar is currently rendered inside `overlayContainer`. With the container removed, the FloatingBar needs a new home. It should be rendered as a `position: fixed` element (bottom of viewport) or portaled to `document.body`, since it's not tied to any specific block. Its show/hide logic (appears when `pendingCount > 1`) remains unchanged.

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
├── useEffect: DOM wrapper injection / cleanup
│   └── replace: wrap blockEl, hide it, portal diff panel
│   └── insert: insert sibling container, portal new block
│   └── delete: applyDeleteDecorations (unchanged)
├── InlineEntryPanel (rendered into wrapper via portal)
│   ├── header (Reject / Accept)
│   ├── oldBlock (RichRenderer with oldNode)
│   └── newBlock (RichRenderer with newNode)
└── FloatingBar (Accept All / Reject All — sticky bottom, unchanged)
```

## Lifecycle

1. Agent produces operations → review state populated
2. `computeOverlays` reads review state, computes `OverlayEntry[]` with diffed nodes
3. DOM effect creates wrappers, hides original blocks, portals panels
4. User clicks Accept → `applyEntryOp` applies the op to Lexical state, wrapper removed
5. User clicks Reject → wrapper removed, original block restored
6. All entries resolved → floating bar disappears
