# Text Selection Overlay Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace browser-native text selection as the business-layer source of truth inside the editor with a shared snapshot-plus-overlay implementation.

**Architecture:** Add shared text-selection utilities in `@haklex/rich-editor` that capture Lexical range selections as `(blockId, offset)` snapshots, rebuild DOM ranges from those snapshots, and optionally restore the Lexical selection. Mount a default editor plugin that paints the active selection through CSS Custom Highlight while suppressing the native blue fill only when the custom highlight API is available. Migrate editor consumers such as the floating toolbar and AI selection capture to the shared utilities so browser `Selection` is no longer the authoritative model.

**Tech Stack:** React 19, Lexical 0.42, TypeScript 5.9, Vanilla Extract, Vitest

---

## Chunk 1: Core Text Selection Utilities

**Files:**

- Create: `packages/rich-editor/src/utils/text-selection.ts`
- Modify: `packages/rich-editor/src/index.ts`

- [ ] Add shared text-selection snapshot types and capture helpers.
- [ ] Add Lexical offset-to-point resolution for restoring selections.
- [ ] Add DOM point/range reconstruction helpers keyed by `data-block-id`.
- [ ] Export the new utilities from the editor package entrypoint.

## Chunk 2: Default Selection Overlay Plugin

**Files:**

- Create: `packages/rich-editor/src/plugins/TextSelectionPlugin.tsx`
- Create: `packages/rich-editor/src/plugins/text-selection.css.ts`
- Modify: `packages/rich-editor/src/components/RichEditor.tsx`
- Modify: `packages/rich-editor/src/plugins-entry.ts`

- [ ] Register a core plugin that mirrors the active text selection into CSS Custom Highlight.
- [ ] Hide native `::selection` styling only while the custom highlight is active.
- [ ] Clear stale highlights on non-range selections, nested editor focus, and unmount.

## Chunk 3: Consumer Migration

**Files:**

- Modify: `packages/rich-plugin-floating-toolbar/src/FloatingToolbarPlugin.tsx`
- Modify: `packages/rich-ext-ai-agent/src/captureSelection.ts`
- Optional: `demo/src/components/comments/{SelectionCommentPopup.tsx,CommentHighlightPlugin.tsx}`

- [ ] Make the floating toolbar position from editor-backed selection snapshots instead of `window.getSelection()`.
- [ ] Reuse the shared capture helper in AI selection capture.
- [ ] Reuse generic DOM offset helpers in the demo comments surface if the abstraction remains renderer-safe.

## Chunk 4: Verification

**Files:**

- Create: `packages/rich-editor/tests/text-selection.test.ts`

- [ ] Add behavior-oriented tests for snapshot capture, restore, and DOM offset resolution.
- [ ] Run focused Vitest coverage for the new utilities.
- [ ] Run a package type/build validation for the touched packages.
