# @haklex/rich-ext-gallery

Image gallery extension with grid and carousel layouts, drag-and-drop reordering.

## Installation

```bash
pnpm add @haklex/rich-ext-gallery
```

## Peer Dependencies

| Package | Version |
| --- | --- |
| `lexical` | `^0.41.0` |
| `lucide-react` | `^0.574.0` |
| `react` | `>= 19` |
| `react-dom` | `>= 19` |

## Usage

### Register nodes in your editor config

```ts
import { galleryEditNodes } from '@haklex/rich-ext-gallery'

const editorConfig = {
  nodes: [...galleryEditNodes],
}
```

For static/read-only rendering:

```ts
import { galleryNodes } from '@haklex/rich-ext-gallery/static'

const staticConfig = {
  nodes: [...galleryNodes],
}
```

### Use renderers

```tsx
import { GalleryEditRenderer } from '@haklex/rich-ext-gallery'
import { GalleryRenderer } from '@haklex/rich-ext-gallery/static'
```

### Import styles

```ts
import '@haklex/rich-ext-gallery/style.css'
```

## Exports

### Nodes

- `GalleryNode` -- static (read-only) node
- `GalleryEditNode` -- edit node with drag-and-drop image reordering
- `$createGalleryNode()` / `$isGalleryNode()` -- Lexical helpers
- `galleryNodes` -- array of static nodes for config registration
- `galleryEditNodes` -- array of edit nodes for config registration

### Renderers

- `GalleryRenderer` -- static renderer (grid/carousel display)
- `GalleryEditRenderer` -- edit renderer with drag-and-drop support

### Types

- `GalleryNodePayload` -- payload type for creating gallery nodes
- `SerializedGalleryNode` -- serialized gallery node type

### Sub-path Exports

| Path | Description |
| --- | --- |
| `@haklex/rich-ext-gallery` | Full exports (edit + static) |
| `@haklex/rich-ext-gallery/static` | Static-only (no drag-and-drop deps) |
| `@haklex/rich-ext-gallery/style.css` | Stylesheet |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
