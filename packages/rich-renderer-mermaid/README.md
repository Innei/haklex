# @haklex/rich-renderer-mermaid

Mermaid diagram renderer with interactive zoom and pan controls.

## Installation

```bash
pnpm add @haklex/rich-renderer-mermaid
```

## Peer Dependencies

| Package | Version |
| --- | --- |
| `react` | `>=19` |
| `react-dom` | `>=19` |

## Usage

```tsx
import { MermaidRenderer } from '@haklex/rich-renderer-mermaid/static'

// Register in a static RendererConfig
const rendererConfig = {
  // ...other renderers
  Mermaid: MermaidRenderer,
}
```

For edit mode:

```tsx
import { MermaidEditRenderer } from '@haklex/rich-renderer-mermaid'

const editRendererConfig = {
  // ...other renderers
  Mermaid: MermaidEditRenderer,
}
```

## Exports

### Components

- `MermaidRenderer` — Static (read-only) renderer with zoom and pan
- `MermaidEditRenderer` — Edit (interactive) renderer

### Sub-path Exports

| Path | Description |
| --- | --- |
| `@haklex/rich-renderer-mermaid` | Full exports (edit + static) |
| `@haklex/rich-renderer-mermaid/static` | Static-only renderer |
| `@haklex/rich-renderer-mermaid/utils` | Mermaid utility functions |
| `@haklex/rich-renderer-mermaid/style.css` | Stylesheet |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
