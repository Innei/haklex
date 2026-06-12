# @haklex/rich-plugin-block-handle

Block handle plugin with drag handle, add button, and context menu for the Haklex rich editor.

## Installation

```bash
pnpm add @haklex/rich-plugin-block-handle
```

## Peer Dependencies

This plugin depends on `@lexical/code-core` (Lexical 0.44+). Add `@lexical/code-core` yourself only if your app imports it directly.

| Package              | Version   |
| -------------------- | --------- |
| `@lexical/list`      | `^0.45.0` |
| `@lexical/react`     | `^0.45.0` |
| `@lexical/rich-text` | `^0.45.0` |
| `@lexical/selection` | `^0.45.0` |
| `lexical`            | `^0.45.0` |
| `lucide-react`       | `^1.0.0`  |
| `react`              | `>= 19`   |
| `react-dom`          | `>= 19`   |

## Usage

```tsx
import { BlockHandlePlugin } from '@haklex/rich-plugin-block-handle';
import '@haklex/rich-plugin-block-handle/style.css';

function Editor() {
  return (
    <RichEditor>
      <BlockHandlePlugin />
    </RichEditor>
  );
}
```

The plugin renders a drag handle and an add button on the left side of each block. Hovering over a block reveals the handle, which supports:

- **Drag and drop** to reorder blocks
- **Add button** to insert a new block above or below
- **Context menu** with block-level actions (duplicate, delete, change type, etc.)

## Exports

| Export              | Type      | Description                                         |
| ------------------- | --------- | --------------------------------------------------- |
| `BlockHandlePlugin` | Component | Main plugin component to render inside `RichEditor` |

## Sub-path Exports

| Path                                         | Description      |
| -------------------------------------------- | ---------------- |
| `@haklex/rich-plugin-block-handle`           | Plugin component |
| `@haklex/rich-plugin-block-handle/style.css` | Stylesheet       |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
