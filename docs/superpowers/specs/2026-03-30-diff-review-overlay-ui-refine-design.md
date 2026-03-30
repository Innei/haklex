# Diff Review Overlay UI Refine

Refine `DiffReviewOverlayPlugin` UI to adopt Cursor-style unified diff presentation: old (red) and new (green) blocks stacked vertically in overlay panels, with per-batch header toolbars. Minimal & transparent visual style suited to rich text editing context.

## Reference

- Cursor composer inline diff (unified mode)
- Current implementation: `packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx`
- CSS: `packages/rich-ext-ai-agent/src/plugins/diff-review-overlay.css.ts`

## Operation Rendering

### Delete

No overlay panel. Decorate the original block in-place:

- Background: `color-mix(in srgb, alertCaution 7%, transparent)`
- Left border: `2px solid alertCaution`
- Text: `line-through`, decoration color `alertCaution`
- Opacity: `0.72`

No change from current implementation.

### Replace

Overlay panel positioned below the original block. Panel contains old block (red) stacked above new block (green):

- **Old block**: red background 6% + left border 2px red + `line-through`. Rendered via `RichRenderer` with `decorateSubtree(oldNode, 'delete')` for character-level deletion marks.
- **New block**: green background 6% + left border 2px green. Rendered via `RichRenderer` with `decorateSubtree(newNode, 'insert')` for character-level insertion highlights.
- Original block in editor: **no decoration** (the old block inside the panel replaces that role).

### Insert

Overlay panel positioned at anchor point (before/after anchor block). Panel contains only the new block (green):

- Green background 6% + left border 2px green
- Rendered via `RichRenderer` with `decorateSubtree(node, 'insert')`

## Batch Header Toolbar

Each overlay panel has a header bar at its top:

- **Left**: change count text (e.g., "1 change", "2 insertions")
- **Right**: "Reject" and "Accept" text buttons (not icons)
  - Reject: muted color (`#999`), hover highlights with `alertCaution` tint
  - Accept: `alertTip` color, hover highlights with `alertTip` tint
- **Style**: background `rgba(255,255,255, 0.03)` (dark theme adaptive via `color-mix`), no outer border, bottom separator line only. Font: `system-ui`, 11px. `border-radius` top corners match panel radius.

## Component Structure

### Before (current)

```
overlayContainer (absolute, pointer-events: none)
  ├── InlineToolbar × N  (one per entry, floating pill)
  └── inlinePreview × N  (one per entry, preview panel)
```

### After

```
overlayContainer (absolute, pointer-events: none)
  └── BatchPanel × N  (one per pending batch, pointer-events: auto)
       ├── BatchHeader        (count label + reject/accept buttons)
       ├── OldBlock?          (replace only: rendered old node, red style)
       └── NewBlock           (replace + insert: rendered new node, green style)
```

- `InlineToolbar` component removed entirely
- New `BatchPanel` component encapsulates header + diff blocks
- Delete entries have no panel; decorations applied directly to editor DOM elements (unchanged)

## CSS Changes

### Remove

- `inlineToolbar`, `inlineToolbarLayer` — replaced by `batchHeader`
- `inlineActionButton`, `inlineAcceptButton`, `inlineRejectButton` — replaced by text buttons in header
- `inlinePreview`, `inlinePreviewTone`, `inlinePreviewBody` — replaced by `batchPanel`, `oldBlock`, `newBlock`

### Add

- `batchPanel` — absolute positioned container, `border-radius: md`, overflow hidden
- `batchHeader` — flex row, slim padding (3px 10px), bottom border separator, system-ui font
- `batchHeaderAction` — text button base style, with `reject` and `accept` variants
- `oldBlock` — red background 6%, left border 2px red, line-through text
- `newBlock` — green background 6%, left border 2px green

### Keep

- `overlayContainer` — unchanged
- `inlineRendererFrame` → rename to `rendererFrame` — overflow hidden, margin reset globalStyles

## Color Tokens

All colors use existing `@haklex/rich-style-token` vars:

| Role             | Token                                                           | Usage                 |
| ---------------- | --------------------------------------------------------------- | --------------------- |
| Red background   | `color-mix(in srgb, vars.color.alertCaution 6%, vars.color.bg)` | Old block bg          |
| Red border       | `vars.color.alertCaution`                                       | Old block left border |
| Green background | `color-mix(in srgb, vars.color.alertTip 6%, vars.color.bg)`     | New block bg          |
| Green border     | `vars.color.alertTip`                                           | New block left border |
| Header bg        | `color-mix(in srgb, vars.color.text 3%, vars.color.bg)`         | Batch header          |
| Header separator | `color-mix(in srgb, vars.color.text 6%, transparent)`           | Bottom border         |

## Positioning Logic

- **Replace**: `previewTop = blockEl.bottom - containerRect.top + INSERT_GAP`. Original block gets no inline style decorations (removed from `applyReplaceDecorations`).
- **Insert (anchorBefore)**: `previewTop = anchorEl.bottom - containerRect.top + INSERT_GAP`, spacing `after`.
- **Insert (anchorAfter)**: `previewTop = anchorEl.top - containerRect.top`, spacing `before`.
- **Delete**: no panel, decorations on `blockEl` via `applyDeleteDecorations` (unchanged).

Spacing sync via `ResizeObserver` remains: panel height determines margin on anchor block to prevent overlap.

## Overlay Grouping

Current implementation creates one overlay entry per `ReviewEntry`. The new design groups entries by `batchId`:

1. `computeOverlays` collects entries as before
2. Rendering groups entries by `batchId` into `BatchPanel` components
3. Each `BatchPanel` renders its batch header once, then iterates its entries to render old/new blocks
4. `handleAcceptBatch` and `handleRejectBatch` remain batch-level (unchanged)

## Scope

Files modified:

- `packages/rich-ext-ai-agent/src/plugins/DiffReviewOverlayPlugin.tsx` — component restructure
- `packages/rich-ext-ai-agent/src/plugins/diff-review-overlay.css.ts` — style overhaul
