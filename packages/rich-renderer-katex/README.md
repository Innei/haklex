# @haklex/rich-renderer-katex

KaTeX math expression edit nodes for inline and block-level mathematical typesetting.

> **Note:** This package only provides edit nodes. Static rendering of KaTeX expressions is built into `@haklex/rich-editor` directly.

## Installation

```bash
pnpm add @haklex/rich-renderer-katex
```

## Peer Dependencies

| Package          | Version               |
| ---------------- | --------------------- |
| `lexical`        | `^0.45.0`             |
| `@lexical/react` | `^0.45.0`             |
| `react`          | `>=19`                |
| `react-dom`      | `>=19`                |
| `katex`          | `>=0.16.0` (optional) |

## Usage

```tsx
import { katexEditNodes } from '@haklex/rich-renderer-katex';

// Register edit nodes in your editor config
const editorConfig = {
  nodes: [
    ...katexEditNodes,
    // ...other nodes
  ],
};
```

## Exports

### Nodes and Decorators

- `KaTeXBlockEditNode` — Edit node for block-level math expressions
- `KaTeXInlineEditNode` — Edit node for inline math expressions
- `KaTeXEditDecorator` — Shared edit decorator for KaTeX rendering
- `katexEditNodes` — Array of all KaTeX edit nodes for convenient registration

### Sub-path Exports

| Path                                    | Description  |
| --------------------------------------- | ------------ |
| `@haklex/rich-renderer-katex`           | Full exports |
| `@haklex/rich-renderer-katex/style.css` | Stylesheet   |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
