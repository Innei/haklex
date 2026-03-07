# @haklex/rich-renderer-alert

Alert/callout block renderer supporting five severity levels: note, tip, important, warning, and caution.

## Installation

```bash
pnpm add @haklex/rich-renderer-alert
```

## Peer Dependencies

| Package | Version |
| --- | --- |
| `react` | `>=19` |
| `react-dom` | `>=19` |

## Usage

```tsx
import { AlertRenderer } from '@haklex/rich-renderer-alert/static'

// Register in a static RendererConfig
const rendererConfig = {
  // ...other renderers
  Alert: AlertRenderer,
}
```

For edit mode:

```tsx
import { AlertEditRenderer } from '@haklex/rich-renderer-alert'

const editRendererConfig = {
  // ...other renderers
  Alert: AlertEditRenderer,
}
```

## Exports

### Components

- `AlertRenderer` — Static (read-only) renderer for alert/callout blocks
- `AlertEditRenderer` — Edit (interactive) renderer with severity selection

### Sub-path Exports

| Path | Description |
| --- | --- |
| `@haklex/rich-renderer-alert` | Full exports (edit + static) |
| `@haklex/rich-renderer-alert/static` | Static-only renderer |
| `@haklex/rich-renderer-alert/style.css` | Stylesheet |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
