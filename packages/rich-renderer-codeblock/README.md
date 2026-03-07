# @haklex/rich-renderer-codeblock

Code block renderer with Shiki syntax highlighting for static display and CodeMirror for interactive editing.

## Installation

```bash
pnpm add @haklex/rich-renderer-codeblock
```

## Peer Dependencies

| Package | Version |
| --- | --- |
| `react` | `>=19` |
| `react-dom` | `>=19` |

## Usage

```tsx
import { CodeBlockRenderer } from '@haklex/rich-renderer-codeblock/static'

// Register in a static RendererConfig
const rendererConfig = {
  // ...other renderers
  CodeBlock: CodeBlockRenderer,
}
```

For edit mode:

```tsx
import { CodeBlockEditRenderer } from '@haklex/rich-renderer-codeblock'

const editRendererConfig = {
  // ...other renderers
  CodeBlock: CodeBlockEditRenderer,
}
```

## Exports

### Components

- `CodeBlockRenderer` — Static (read-only) renderer with Shiki syntax highlighting
- `CodeBlockEditRenderer` — Edit (interactive) renderer with CodeMirror editor

### Sub-path Exports

| Path | Description |
| --- | --- |
| `@haklex/rich-renderer-codeblock` | Full exports (edit + static) |
| `@haklex/rich-renderer-codeblock/static` | Static-only renderer |
| `@haklex/rich-renderer-codeblock/shiki` | Shiki highlighting utilities |
| `@haklex/rich-renderer-codeblock/constants` | Language and theme constants |
| `@haklex/rich-renderer-codeblock/icons` | Language icons |
| `@haklex/rich-renderer-codeblock/style.css` | Stylesheet |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
