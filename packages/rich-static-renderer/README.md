# @haklex/rich-static-renderer

SSR-ready renderer engine for Lexical rich content. Renders Lexical editor state JSON to React without loading the full editor runtime.

## Installation

```bash
pnpm add @haklex/rich-static-renderer
```

## Peer Dependencies

| Package | Version |
| --- | --- |
| `@lexical/code` | `^0.41.0` |
| `@lexical/extension` | `^0.41.0` |
| `@lexical/link` | `^0.41.0` |
| `@lexical/list` | `^0.41.0` |
| `@lexical/rich-text` | `^0.41.0` |
| `@lexical/table` | `^0.41.0` |
| `lexical` | `^0.41.0` |
| `react` | `>=19` |
| `react-dom` | `>=19` |

## Usage

```tsx
import { RichRenderer } from '@haklex/rich-static-renderer'
import '@haklex/rich-editor/style.css'

<RichRenderer value={editorState} variant="article" theme="light" />
```

The `value` prop accepts a Lexical `SerializedEditorState` JSON object. The renderer parses it into React elements without instantiating a Lexical editor, making it suitable for SSR and static rendering.

## Exports

### Components

| Export | Description |
| --- | --- |
| `RichRenderer` | Main static renderer component |

### Types

| Export | Description |
| --- | --- |
| `RichRendererProps` | Props for `RichRenderer` |
| `BuiltinNodeRenderer` | Type for builtin node renderer functions |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
