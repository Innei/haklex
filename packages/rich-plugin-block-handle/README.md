# @haklex/rich-plugin-block-handle

Block handle plugin with drag handle, add button, and context menu for the Haklex rich editor.

## Installation

```bash
pnpm add @haklex/rich-plugin-block-handle
```

## Peer Dependencies

`@lexical/code` is provided transitively via `lexical-code-no-prism`. Install it separately only if your app imports `@lexical/code` directly.

| Package | Version |
| --- | --- |
| `@lexical/list` | `^0.41.0` |
| `@lexical/react` | `^0.41.0` |
| `@lexical/rich-text` | `^0.41.0` |
| `@lexical/selection` | `^0.41.0` |
| `lexical` | `^0.41.0` |
| `lucide-react` | `^0.574.0` |
| `react` | `>= 19` |
| `react-dom` | `>= 19` |

## Usage

```tsx
import { BlockHandlePlugin } from '@haklex/rich-plugin-block-handle'
import '@haklex/rich-plugin-block-handle/style.css'

function Editor() {
  return (
    <RichEditor>
      <BlockHandlePlugin />
    </RichEditor>
  )
}
```

The plugin renders a drag handle and an add button on the left side of each block. Hovering over a block reveals the handle, which supports:

- **Drag and drop** to reorder blocks
- **Add button** to insert a new block above or below
- **Context menu** with block-level actions (duplicate, delete, change type, etc.)

## Exports

| Export | Type | Description |
| --- | --- | --- |
| `BlockHandlePlugin` | Component | Main plugin component to render inside `RichEditor` |

## Sub-path Exports

| Path | Description |
| --- | --- |
| `@haklex/rich-plugin-block-handle` | Plugin component |
| `@haklex/rich-plugin-block-handle/style.css` | Stylesheet |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
