# @haklex/rich-diff-core

Headless Lexical diff engine providing character-level and structural diffing between two editor states, with node decoration for visual annotation. Zero UI dependencies — shared by the `@haklex/rich-diff` viewer and `@haklex/rich-agent-core` for AI edit review.

## Installation

```bash
pnpm add @haklex/rich-diff-core
```

## Peer Dependencies

| Package   | Version   |
| --------- | --------- |
| `lexical` | `^0.45.0` |

## Usage

### Compute a diff between two editor states

```ts
import { computeDiff } from '@haklex/rich-diff-core';

const hunks = computeDiff(beforeEditorState, afterEditorState);
// hunks: DiffHunk[] with op: 'add' | 'remove' | 'equal'
```

### Decorate nodes with diff annotations

```ts
import { decorateSubtree, diffMergedNode, diffModifiedNode } from '@haklex/rich-diff-core';

// Decorate a subtree to show additions/removals
const decorated = decorateSubtree(rootNode, hunks);

// Mark a single merged (modified) node
const merged = diffMergedNode(node);
```

### Compute and format diff statistics

```ts
import { computeDeltaStats, formatDeltaStats } from '@haklex/rich-diff-core';

const stats = computeDeltaStats(beforeState, afterState);
// { addedChars: 42, removedChars: 10, addedNodes: 3, removedNodes: 1 }

const summary = formatDeltaStats(stats);
// "+42 / -10 characters, +3 / -1 nodes"
```

## Exports

### Core Diff

| Export                       | Description                                              |
| ---------------------------- | -------------------------------------------------------- |
| `computeDiff(before, after)` | Compute diff hunks between two `EditorState` objects     |
| `DiffHunk`                   | A single diff hunk with `op` type and content            |
| `DiffOpType`                 | Diff operation type (`'add'` \| `'remove'` \| `'equal'`) |
| `MarkKind`                   | Mark decoration kind (`'add'` \| `'remove'`)             |

### Decoration

| Export                         | Description                                 |
| ------------------------------ | ------------------------------------------- |
| `decorateSubtree(node, hunks)` | Apply diff decorations to a node subtree    |
| `diffMergedNode(node)`         | Mark a node as modified (merged add/remove) |
| `diffModifiedNode(node)`       | Mark a node with inline modified marks      |

### Statistics

| Export                             | Description                                        |
| ---------------------------------- | -------------------------------------------------- |
| `computeDeltaStats(before, after)` | Compute character and node-level delta statistics  |
| `formatDeltaStats(stats)`          | Format delta stats as a human-readable string      |
| `DeltaStats`                       | Type for diff statistics (character + node counts) |

### Sub-path Exports

| Import Path              | Description                                            |
| ------------------------ | ------------------------------------------------------ |
| `@haklex/rich-diff-core` | Full exports — diff engine, decoration, and statistics |

---

> **Note:** This package is headless (no React, no DOM). For a React diff viewer component, see `@haklex/rich-diff`.

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
