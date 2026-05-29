# DiffNode UI Redesign — Cursor-style Inline Diff

**Date:** 2026-05-29
**Package:** `@haklex/rich-ext-ai-agent`
**Status:** Approved design, pending implementation plan

## Goal

Replace the current "boxed card" presentation of AI agent diff nodes with a
**Cursor-style inline diff**: full-bleed colored rows that sit in the document
flow, a compact floating Accept/Reject bar per change, and body text that keeps
its original block typography. No keyboard shortcuts.

## Why

The current `AgentDiffRenderer` / `AgentDiffEditRenderer` wrap each change in a
card with a border, header (`AI change` title + op badge), and `Original` /
`Proposed` section labels. Two problems:

1. **Heavy chrome.** The card frame, header row, and section labels add visual
   weight that breaks reading flow.
2. **Text does not align with the surrounding block.** The `diffCompact` style
   in `plugins/diff-review-overlay.css.ts` forces every element inside the diff
   (`p`, `h1-h6`, `li`, `pre`, `blockquote`, …) down to `13px` via a large set
   of `globalStyle` rules. A replaced heading no longer looks like a heading; a
   replaced paragraph no longer matches body text. This is the root cause of the
   "text must align to the block" requirement.

## Design

### Visual paradigm (chosen via mockup iteration)

- **No card frame, no header, no section labels.** The change is presented as
  one or more full-bleed colored rows in the document flow.
- **Full-bleed rows.** Colored background bleeds to the editor content edges
  (negative horizontal margin to cancel content padding), with a `3px` left
  color edge. Compact vertical padding.
- **Three op states:**
  - `insert` → single green row (proposed node).
  - `replace` → red struck-through row (original) stacked above a green row
    (proposed).
  - `delete` → single red struck-through row (original).
- **Floating Accept/Reject bar** anchored to the top-right of each pending hunk,
  always visible. Labels: `Reject` / `Accept` (text). No keyboard shortcut
  hints, no key bindings.
- **Body text keeps original block typography.** Drop the `diffCompact` font-size
  suppression entirely so `RichRenderer` renders each node at its normal variant
  typography (heading stays heading-sized, paragraph matches body, list stays a
  list). Color is an overlay only — it never alters font-size, line-height, or
  indentation.
- **Dual theme.** All colors route through `@haklex/rich-style-token` `vars`
  (e.g. `vars.color.alertTip` / `vars.color.alertCaution` and `color-mix`),
  replacing the hard-coded `rgba(34,197,94,…)` / `rgba(239,68,68,…)` literals in
  `styles.css.ts`. Green/red read brighter in dark mode through the token system.

### Global review bar (unchanged behavior)

Keep the existing bottom sticky global bar from `DiffReviewOverlayPlugin`
(`X pending changes` + `Reject all` / `Accept all`). Only restyle lightly so it
sits consistently with the new inline form. No logic change.

### Static vs edit split (preserved)

- `AgentDiffEditRenderer` (edit): renders the colored rows **plus** the floating
  Accept/Reject bar, wired to the existing `diff-node-controller`
  (`acceptNode` / `rejectNode`). No new controller surface needed.
- `AgentDiffRenderer` (static): renders the colored rows **only**, no bar. Used
  by read-only `RichRenderer`.

## Affected files

- `src/renderers/AgentDiffRenderer.tsx` — restructure to full-bleed rows, drop
  header/section labels, drop `diffCompact`.
- `src/renderers/AgentDiffEditRenderer.tsx` — same structure + floating bar with
  `Reject` / `Accept` text buttons; keep controller wiring.
- `src/styles.css.ts` — rewrite diff node styles: full-bleed row tones, left
  edge, floating bar; move color literals to `vars`; remove now-unused card /
  header / badge / section styles.
- `src/plugins/diff-review-overlay.css.ts` — remove the `diffCompact` font-size
  suppression block (the `globalStyle` rules that force `13px`); keep
  `rendererFrame` first/last-child margin reset. Audit other now-unused exports
  (`oldBlock`, `newBlock`, `batchPanel`, legacy `floatingBar*`) and remove dead
  ones.
- `tests/` — add coverage (see Testing).

## Testing

- Existing `tests/diff-node-state.test.ts` stays green.
- Add renderer/structure tests:
  - `insert` renders one green row, no original.
  - `replace` renders original (struck) + proposed rows.
  - `delete` renders one red row, no proposed.
  - Edit renderer shows the floating bar; clicking `Accept` / `Reject` calls the
    controller's `acceptNode` / `rejectNode` with the right `nodeKey`, `batchId`,
    `diffEntryId`.
  - Static renderer renders no bar.
- Manual: verify in `demo/` Agent page that a replaced heading keeps heading
  size and a replaced paragraph matches body text, in both light and dark.

## Out of scope

- Keyboard shortcuts (explicitly excluded).
- Word-level / intra-line diffing — changes remain block-level.
- Changes to the agent protocol, reconcile logic, or `diff-node-state.ts`
  projection.
- Per-line accept within a multi-line block.

```

```
