# @haklex/rich-plugin-toolbar

Top toolbar plugin with formatting controls for the Haklex rich editor.

## Installation

```bash
pnpm add @haklex/rich-plugin-toolbar
```

## Peer Dependencies

| Package | Version |
| --- | --- |
| `@lexical/list` | `^0.41.0` |
| `@lexical/react` | `^0.41.0` |
| `@lexical/rich-text` | `^0.41.0` |
| `@lexical/selection` | `^0.41.0` |
| `@lexical/utils` | `^0.41.0` |
| `lexical` | `^0.41.0` |
| `lucide-react` | `^0.574.0` |
| `react` | `>= 19` |
| `react-dom` | `>= 19` |

## Usage

```tsx
import { ToolbarPlugin } from '@haklex/rich-plugin-toolbar'
import '@haklex/rich-plugin-toolbar/style.css'

function Editor() {
  return (
    <RichEditor>
      <ToolbarPlugin />
    </RichEditor>
  )
}
```

The toolbar renders at the top of the editor with controls for text formatting (bold, italic, underline, strikethrough, code), block type selection (paragraph, headings, quote, lists), text alignment, and undo/redo.

```tsx
import type { ToolbarPluginProps } from '@haklex/rich-plugin-toolbar'

const props: ToolbarPluginProps = {
  // ...
}
```

## Exports

| Export | Type | Description |
| --- | --- | --- |
| `ToolbarPlugin` | Component | Main toolbar component to render inside `RichEditor` |
| `ToolbarPluginProps` | TypeScript type | Props type for `ToolbarPlugin` |

## Sub-path Exports

| Path | Description |
| --- | --- |
| `@haklex/rich-plugin-toolbar` | Plugin component and types |
| `@haklex/rich-plugin-toolbar/style.css` | Stylesheet |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
