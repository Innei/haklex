# @haklex/rich-ext-code-snippet

Multi-file tabbed code snippet extension with drag-and-drop reordering.

## Installation

```bash
pnpm add @haklex/rich-ext-code-snippet
```

## Peer Dependencies

| Package | Version |
| --- | --- |
| `lexical` | `^0.41.0` |
| `react` | `>= 19` |

Key runtime dependencies include `@codemirror/*` (editor engine), `@dnd-kit/*` (drag-and-drop), and `shiki` (syntax highlighting).

## Usage

### Register nodes in your editor config

```ts
import { codeSnippetEditNodes } from '@haklex/rich-ext-code-snippet'

// Add to your Lexical editor node list
const editorConfig = {
  nodes: [...codeSnippetEditNodes],
}
```

For static/read-only rendering:

```ts
import { codeSnippetNodes } from '@haklex/rich-ext-code-snippet/static'

const staticConfig = {
  nodes: [...codeSnippetNodes],
}
```

### Use renderers

```tsx
import { CodeSnippetEditRenderer } from '@haklex/rich-ext-code-snippet'
import { CodeSnippetRenderer } from '@haklex/rich-ext-code-snippet/static'
```

### Markdown transformer

```ts
import { CODE_SNIPPET_BLOCK_TRANSFORMER } from '@haklex/rich-ext-code-snippet'

// Add to your Lexical markdown transformers array
const transformers = [CODE_SNIPPET_BLOCK_TRANSFORMER]
```

### Import styles

```ts
import '@haklex/rich-ext-code-snippet/style.css'
```

## Exports

### Nodes

- `CodeSnippetNode` -- static (read-only) node
- `CodeSnippetEditNode` -- edit node with interactive UI
- `$createCodeSnippetNode()` / `$isCodeSnippetNode()` -- Lexical helpers
- `codeSnippetNodes` -- array of static nodes for config registration
- `codeSnippetEditNodes` -- array of edit nodes for config registration

### Renderers

- `CodeSnippetRenderer` -- static renderer (no heavy UI deps)
- `CodeSnippetEditRenderer` -- edit renderer with CodeMirror, drag-and-drop tabs

### Transformers

- `CODE_SNIPPET_BLOCK_TRANSFORMER` -- Markdown block transformer

### Sub-path Exports

| Path | Description |
| --- | --- |
| `@haklex/rich-ext-code-snippet` | Full exports (edit + static) |
| `@haklex/rich-ext-code-snippet/static` | Static-only (no CodeMirror/dnd-kit deps) |
| `@haklex/rich-ext-code-snippet/style.css` | Stylesheet |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
