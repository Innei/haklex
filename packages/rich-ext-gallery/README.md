# @haklex/rich-ext-gallery

Image gallery extension with grid and carousel layouts, drag-and-drop reordering.

## Installation

```bash
pnpm add @haklex/rich-ext-gallery
```

## Peer Dependencies

| Package        | Version   |
| -------------- | --------- |
| `lexical`      | `^0.45.0` |
| `lucide-react` | `^1.0.0`  |
| `react`        | `>= 19`   |
| `react-dom`    | `>= 19`   |

## Usage

### Register nodes

Edit (read + write):

```ts
import { galleryEditNodes } from '@haklex/rich-ext-gallery/edit';

const editorConfig = { nodes: [...galleryEditNodes] };
```

Static / read-only:

```ts
import { galleryNodes } from '@haklex/rich-ext-gallery/node';

const staticConfig = { nodes: [...galleryNodes] };
```

### Use renderers

```tsx
import { GalleryEditRenderer } from '@haklex/rich-ext-gallery/edit';
import { GalleryRenderer } from '@haklex/rich-ext-gallery/renderer';
```

### Tree-shake the default renderer

```ts
import { GALLERY_NODE_KEY, galleryNodes } from '@haklex/rich-ext-gallery/node';
import type { RichRendererModule } from '@haklex/rich-compose';

const lightModule: RichRendererModule = {
  name: 'gallery',
  nodes: galleryNodes,
  renderers: { [GALLERY_NODE_KEY]: MyLightGallery },
};
```

### Import styles

```ts
import '@haklex/rich-ext-gallery/style.css';
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

### Slot Key

- `GALLERY_NODE_KEY` -- `'Gallery'` constant for `RendererConfig` slot lookup

### Types

- `GalleryNodePayload` -- payload type for creating gallery nodes
- `SerializedGalleryNode` -- serialized gallery node type
- `GalleryRendererProps` -- renderer props (also flowed into `RendererConfig.Gallery` via module augmentation)

## Sub-path Exports

| Path                                 | Description                                               |
| ------------------------------------ | --------------------------------------------------------- |
| `@haklex/rich-ext-gallery`           | Full exports (node + renderer + edit)                     |
| `@haklex/rich-ext-gallery/node`      | Lightweight node + slot key + types — no default renderer |
| `@haklex/rich-ext-gallery/renderer`  | Default `GalleryRenderer` (heavy)                         |
| `@haklex/rich-ext-gallery/edit`      | Edit-mode node + `GalleryEditRenderer`                    |
| `@haklex/rich-ext-gallery/static`    | Convenience: node + renderer (SSR bundle)                 |
| `@haklex/rich-ext-gallery/style.css` | Stylesheet                                                |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
