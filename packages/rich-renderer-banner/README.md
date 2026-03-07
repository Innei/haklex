# @haklex/rich-renderer-banner

Banner block renderer supporting info, success, warning, and error variants.

## Installation

```bash
pnpm add @haklex/rich-renderer-banner
```

## Peer Dependencies

| Package | Version |
| --- | --- |
| `react` | `>=19` |
| `react-dom` | `>=19` |

## Usage

```tsx
import { BannerRenderer } from '@haklex/rich-renderer-banner/static'

// Register in a static RendererConfig
const rendererConfig = {
  // ...other renderers
  Banner: BannerRenderer,
}
```

For edit mode:

```tsx
import { BannerEditRenderer } from '@haklex/rich-renderer-banner'

const editRendererConfig = {
  // ...other renderers
  Banner: BannerEditRenderer,
}
```

## Exports

### Components

- `BannerRenderer` — Static (read-only) renderer for banner blocks
- `BannerEditRenderer` — Edit (interactive) renderer with variant selection

### Sub-path Exports

| Path | Description |
| --- | --- |
| `@haklex/rich-renderer-banner` | Full exports (edit + static) |
| `@haklex/rich-renderer-banner/static` | Static-only renderer |
| `@haklex/rich-renderer-banner/style.css` | Stylesheet |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
