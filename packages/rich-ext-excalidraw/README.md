# @haklex/rich-ext-excalidraw

Excalidraw whiteboard integration for the Haklex rich editor.

## Installation

```bash
pnpm add @haklex/rich-ext-excalidraw
```

## Peer Dependencies

| Package | Version |
| --- | --- |
| `@lexical/react` | `^0.41.0` |
| `lexical` | `^0.41.0` |
| `lucide-react` | `^0.574.0` |
| `react` | `>= 19` |
| `react-dom` | `>= 19` |

## Usage

### Register nodes in your editor config

```ts
import { ExcalidrawEditNode } from '@haklex/rich-ext-excalidraw'

const editorConfig = {
  nodes: [ExcalidrawEditNode],
}
```

For static/read-only rendering:

```ts
import { ExcalidrawNode } from '@haklex/rich-ext-excalidraw/static'

const staticConfig = {
  nodes: [ExcalidrawNode],
}
```

### Use the Excalidraw plugin

```tsx
import { ExcalidrawPlugin } from '@haklex/rich-ext-excalidraw'

function EditorPlugins() {
  return <ExcalidrawPlugin />
}
```

### Insert an Excalidraw block programmatically

```ts
import { INSERT_EXCALIDRAW_COMMAND } from '@haklex/rich-ext-excalidraw'

editor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, undefined)
```

### Configure Excalidraw behavior

```tsx
import { ExcalidrawConfigProvider } from '@haklex/rich-ext-excalidraw'
import type { ExcalidrawConfig } from '@haklex/rich-ext-excalidraw'

const config: ExcalidrawConfig = {
  // your Excalidraw configuration
}

function App() {
  return (
    <ExcalidrawConfigProvider value={config}>
      <Editor />
    </ExcalidrawConfigProvider>
  )
}
```

### Use renderers

```tsx
import { ExcalidrawEditRenderer } from '@haklex/rich-ext-excalidraw'
import { ExcalidrawDisplayRenderer, ExcalidrawSSRRenderer } from '@haklex/rich-ext-excalidraw/static'
```

### Snapshot utilities

```ts
import { parseSnapshot, serializeSnapshot } from '@haklex/rich-ext-excalidraw'
```

### Import styles

```ts
import '@haklex/rich-ext-excalidraw/style.css'
```

## Exports

### Nodes

- `ExcalidrawNode` -- static (read-only) node
- `ExcalidrawEditNode` -- edit node with full Excalidraw editor
- `$createExcalidrawNode()` / `$isExcalidrawNode()` -- Lexical helpers

### Renderers

- `ExcalidrawDisplayRenderer` -- static display renderer
- `ExcalidrawEditRenderer` -- interactive edit renderer
- `ExcalidrawSSRRenderer` -- server-side rendering renderer

### Plugin

- `ExcalidrawPlugin` -- editor plugin for Excalidraw block insertion
- `INSERT_EXCALIDRAW_COMMAND` -- Lexical command for programmatic insertion

### Context

- `ExcalidrawConfigProvider` -- context provider for Excalidraw configuration
- `useExcalidrawConfig` -- hook to access Excalidraw config context

### Utilities

- `parseSnapshot` -- deserialize an Excalidraw snapshot
- `serializeSnapshot` -- serialize an Excalidraw snapshot

### Types

- `ExcalidrawConfig` -- configuration type
- `ExcalidrawSnapshot` -- snapshot data type

### Sub-path Exports

| Path | Description |
| --- | --- |
| `@haklex/rich-ext-excalidraw` | Full exports (edit + static) |
| `@haklex/rich-ext-excalidraw/static` | Static-only (no Excalidraw editor deps) |
| `@haklex/rich-ext-excalidraw/style.css` | Stylesheet |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
