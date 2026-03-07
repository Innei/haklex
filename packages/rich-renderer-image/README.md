# @haklex/rich-renderer-image

Image renderer with blurhash placeholder support and lightbox zoom for full-size viewing.

## Installation

```bash
pnpm add @haklex/rich-renderer-image
```

## Peer Dependencies

| Package | Version |
| --- | --- |
| `lexical` | `^0.41.0` |
| `@lexical/react` | `^0.41.0` |
| `react` | `>=19` |
| `react-dom` | `>=19` |

## Usage

```tsx
import { ImageRenderer } from '@haklex/rich-renderer-image/static'

// Register in a static RendererConfig
const rendererConfig = {
  // ...other renderers
  Image: ImageRenderer,
}
```

For edit mode:

```tsx
import { ImageEditRenderer } from '@haklex/rich-renderer-image'

const editRendererConfig = {
  // ...other renderers
  Image: ImageEditRenderer,
}
```

## Exports

### Components

- `ImageRenderer` — Static (read-only) renderer with blurhash placeholder and lightbox zoom
- `ImageEditRenderer` — Edit (interactive) renderer with image controls

### Sub-path Exports

| Path | Description |
| --- | --- |
| `@haklex/rich-renderer-image` | Full exports (edit + static) |
| `@haklex/rich-renderer-image/static` | Static-only renderer |
| `@haklex/rich-renderer-image/style.css` | Stylesheet |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
