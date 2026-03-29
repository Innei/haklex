# Diff Core Extraction & Character-Level Editor Diffs

## Goal

Extract the Lexical diff engine from `@haklex/rich-diff` into `@haklex/rich-diff-core` (zero React dependency), then use it in `DiffReviewOverlayPlugin` to render character-level diffs in the editor overlay via `RichRenderer`.

## Package Boundary

```
@haklex/rich-diff-core (NEW)
  ├── compute-diff.ts content (moved from rich-diff)
  │   ├── diffTextByChar, diffMiddleChars     ← character-level algorithm
  │   ├── alignNodes, nodesEqual              ← structural alignment (LCS)
  │   ├── decorateSubtree, cloneTextNode      ← Lexical node decoration
  │   ├── splitTextNodeByCharDiff             ← text node splitting
  │   ├── diffModifiedNode, diffNodeInline    ← inline diff helpers
  │   └── computeDiff → DiffHunk[]            ← top-level API
  ├── Types: DiffHunk, DiffOpType, TextDiffOp
  └── Style constants: DELETE_MARK_STYLE, INSERT_MARK_STYLE

@haklex/rich-diff (MODIFIED)
  ├── RichDiff.tsx (React component, imports computeDiff from rich-diff-core)
  ├── style.css.ts (Vanilla Extract styles)
  └── index.ts: re-exports computeDiff, DiffHunk, DiffOpType from rich-diff-core for backward compat

@haklex/rich-ext-ai-agent (MODIFIED)
  └── DiffReviewOverlayPlugin.tsx: uses diffModifiedNode + RichRenderer for char-level diffs
```

## Public API Surface (`@haklex/rich-diff-core`)

| Level | Export                                              | Purpose                                     |
| ----- | --------------------------------------------------- | ------------------------------------------- |
| High  | `computeDiff(old, new) → DiffHunk[]`                | Full document diff                          |
| Mid   | `diffModifiedNode(old, new) → { oldNode, newNode }` | Single node char-level diff with decoration |
| Mid   | `decorateSubtree(node, kind) → node`                | Apply insert/delete marks to entire subtree |
| Low   | `diffTextByChar(old, new) → TextDiffOp[]`           | Pure character diff                         |
| Low   | `alignNodes(old[], new[]) → AlignOp[]`              | Structural LCS alignment                    |
| Type  | `DiffHunk`, `DiffOpType`, `TextDiffOp`, `AlignOp`   | Shared types                                |
| Const | `DELETE_MARK_STYLE`, `INSERT_MARK_STYLE`            | CSS style strings                           |

Internal helpers (`reverseText`, `mergeTextOps`, `cloneNodeWithChildren`, `appendStyle`, `cloneTextNode`) remain unexported.

## Dependencies

```
@haklex/rich-diff-core
  └── lexical (peer: types only — SerializedEditorState, SerializedLexicalNode)

@haklex/rich-diff
  ├── @haklex/rich-diff-core (workspace:*)
  ├── @haklex/rich-static-renderer (existing)
  └── @haklex/rich-style-token (existing)

@haklex/rich-ext-ai-agent
  ├── @haklex/rich-diff-core (workspace:*) ← NEW
  ├── @haklex/rich-static-renderer (workspace:*) ← NEW (for RichRenderer)
  └── existing deps unchanged

@haklex/rich-agent-chat
  └── @haklex/rich-diff-core (workspace:*) ← CHANGE from @haklex/rich-diff
      (DiffReviewBubble only needs computeDiff, not RichDiff component)
```

## Editor Overlay — Character-Level Diff Rendering

### Current behavior

- Delete/replace: red background overlay on the block
- Insert: green marker line + ghost text preview
- Replace: red overlay + ghost text preview (plain text only)

### New behavior

- Delete: red background overlay + `RichRenderer` rendering the deleted node with `decorateSubtree(node, 'delete')` — shows character-level strikethrough
- Replace: red background overlay on old block + below it, a diff panel rendered with `RichRenderer` showing both `diffModifiedNode` results: old node (char-level strikethrough) → new node (char-level highlight)
- Insert: green marker + `RichRenderer` rendering the new node with `decorateSubtree(node, 'insert')` — shows character-level highlight

### Implementation approach

The `DiffReviewOverlayPlugin` will:

1. For each pending entry, call `diffModifiedNode(oldNode, newNode)` (for replace) or `decorateSubtree(node, kind)` (for insert/delete) using data from `ReviewBatch.baseSnapshot`
2. Render decorated nodes via `RichRenderer` in absolutely positioned containers
3. Old decorated nodes rendered in the overlay area (over/near the original block)
4. New decorated nodes rendered in the ghost preview area below

The plugin needs access to the base snapshot's serialized nodes to compute diffs. These are already available in `ReviewBatch.baseSnapshot`.

## Backward Compatibility

`@haklex/rich-diff` re-exports `computeDiff`, `DiffHunk`, and `DiffOpType` from `rich-diff-core`. Existing consumers (`DiffReviewBubble`, any external code) continue to work without changes. Migration to direct `rich-diff-core` imports is optional.

## Package Setup (`@haklex/rich-diff-core`)

- ESM only (`.mjs` output)
- Vite build using shared `createViteConfig()`
- TypeScript declarations (`.d.ts`)
- Zero runtime dependencies (lexical as peerDependency for types)
- No React, no Vanilla Extract, no CSS
