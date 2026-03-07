# @haklex/rich-plugin-table

Table editing plugin with cell resizing and row/column manipulation.

## Installation

```bash
pnpm add @haklex/rich-plugin-table
```

## Peer Dependencies

| Package | Version |
| --- | --- |
| `@lexical/react` | `^0.41.0` |
| `@lexical/table` | `^0.41.0` |
| `lexical` | `^0.41.0` |
| `lucide-react` | `^0.574.0` |
| `react` | `>= 19` |
| `react-dom` | `>= 19` |

## Usage

```tsx
import {
  TableCellResizerPlugin,
  TableRowColumnHandlesPlugin,
} from '@haklex/rich-plugin-table'
import '@haklex/rich-plugin-table/style.css'

function Editor() {
  return (
    <RichEditor>
      <TableCellResizerPlugin />
      <TableRowColumnHandlesPlugin />
    </RichEditor>
  )
}
```

This plugin provides two complementary components:

- **TableCellResizerPlugin** -- Allows users to resize table columns by dragging cell borders.
- **TableRowColumnHandlesPlugin** -- Renders handles for inserting, deleting, and reordering rows and columns.

## Exports

| Export | Type | Description |
| --- | --- | --- |
| `TableCellResizerPlugin` | Component | Cell border drag-to-resize plugin |
| `TableRowColumnHandlesPlugin` | Component | Row/column insert, delete, and reorder handles |

## Sub-path Exports

| Path | Description |
| --- | --- |
| `@haklex/rich-plugin-table` | Plugin components |
| `@haklex/rich-plugin-table/style.css` | Stylesheet |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
