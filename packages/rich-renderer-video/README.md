# @haklex/rich-renderer-video

Video player renderer for embedded video content.

## Installation

```bash
pnpm add @haklex/rich-renderer-video
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
import { VideoRenderer } from '@haklex/rich-renderer-video/static'

// Register in a static RendererConfig
const rendererConfig = {
  // ...other renderers
  Video: VideoRenderer,
}
```

For edit mode:

```tsx
import { VideoEditRenderer } from '@haklex/rich-renderer-video'

const editRendererConfig = {
  // ...other renderers
  Video: VideoEditRenderer,
}
```

## Exports

### Components

- `VideoRenderer` — Static (read-only) video player renderer
- `VideoEditRenderer` — Edit (interactive) renderer with video controls

### Sub-path Exports

| Path | Description |
| --- | --- |
| `@haklex/rich-renderer-video` | Full exports (edit + static) |
| `@haklex/rich-renderer-video/static` | Static-only renderer |
| `@haklex/rich-renderer-video/style.css` | Stylesheet |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
