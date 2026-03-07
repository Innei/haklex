# @haklex/rich-diff

Diff viewer for comparing two Lexical editor states side-by-side.

## Installation

```bash
pnpm add @haklex/rich-diff
```

## Peer Dependencies

| Package | Version |
| --- | --- |
| `react` | `>=19` |
| `react-dom` | `>=19` |

## Usage

```tsx
import { RichDiff } from '@haklex/rich-diff'
import '@haklex/rich-diff/style.css'

<RichDiff before={previousEditorState} after={currentEditorState} />
```

### Programmatic Diff

```ts
import { computeDiff } from '@haklex/rich-diff'

const hunks = computeDiff(beforeState, afterState)
// hunks: DiffHunk[] with op type (add, remove, equal) and content
```

## Exports

### Components

| Export | Description |
| --- | --- |
| `RichDiff` | Side-by-side diff viewer component |

### Functions

| Export | Description |
| --- | --- |
| `computeDiff(before, after)` | Compute diff hunks between two editor states |

### Types

| Export | Description |
| --- | --- |
| `RichDiffProps` | Props for `RichDiff` |
| `DiffHunk` | A single diff hunk with operation type and content |
| `DiffOpType` | Diff operation type (`'add'` / `'remove'` / `'equal'`) |

### Sub-path Exports

| Import Path | Description |
| --- | --- |
| `@haklex/rich-diff` | All components, functions, and types |
| `@haklex/rich-diff/style.css` | Compiled diff viewer stylesheet |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
