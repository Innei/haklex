Excalidraw whiteboard integration for the Haklex rich editor.

## Installation

```bash
pnpm add @haklex/rich-ext-whiteboard
```

## Peer Dependencies

| Package          | Version   |
| ---------------- | --------- |
| `@lexical/react` | `^0.45.0` |
| `lexical`        | `^0.45.0` |
| `lucide-react`   | `^1.0.0`  |
| `react`          | `>= 19`   |
| `react-dom`      | `>= 19`   |

## Usage

### Register nodes in your editor config

```ts
import { WhiteboardEditNode } from '@haklex/rich-ext-whiteboard';

const editorConfig = {
  nodes: [WhiteboardEditNode],
};
```

For static/read-only rendering:

```ts
import { WhiteboardNode } from '@haklex/rich-ext-whiteboard/static';

const staticConfig = {
  nodes: [WhiteboardNode],
};
```

### Use the Excalidraw plugin

```tsx
import { WhiteboardPlugin } from '@haklex/rich-ext-whiteboard';

function EditorPlugins() {
  return <WhiteboardPlugin />;
}
```

### Insert an Excalidraw block programmatically

```ts
import { INSERT_WHITEBOARD_COMMAND } from '@haklex/rich-ext-whiteboard';

editor.dispatchCommand(INSERT_WHITEBOARD_COMMAND, undefined);
```

### Configure Excalidraw behavior

```tsx
import { WhiteboardConfigProvider } from '@haklex/rich-ext-whiteboard';
import type { WhiteboardConfig } from '@haklex/rich-ext-whiteboard';

const config: WhiteboardConfig = {
  // your Excalidraw configuration
};

function App() {
  return (
    <WhiteboardConfigProvider value={config}>
      <Editor />
    </WhiteboardConfigProvider>
  );
}
```

### Use renderers

```tsx
import { WhiteboardEditRenderer } from '@haklex/rich-ext-whiteboard';
import {
  WhiteboardDisplayRenderer,
  WhiteboardSSRRenderer,
} from '@haklex/rich-ext-whiteboard/static';
```

### Snapshot utilities

```ts
import { parseSnapshot, serializeSnapshot } from '@haklex/rich-ext-whiteboard';
```

### Import styles

```ts
import '@haklex/rich-ext-whiteboard/style.css';
```

## Exports

### Nodes

- `WhiteboardNode` -- static (read-only) node
- `WhiteboardEditNode` -- edit node with full Excalidraw editor
- `$createExcalidrawNode()` / `$isExcalidrawNode()` -- Lexical helpers

### Renderers

- `WhiteboardDisplayRenderer` -- static display renderer
- `WhiteboardEditRenderer` -- interactive edit renderer
- `WhiteboardSSRRenderer` -- server-side rendering renderer

### Plugin

- `WhiteboardPlugin` -- editor plugin for Excalidraw block insertion
- `INSERT_WHITEBOARD_COMMAND` -- Lexical command for programmatic insertion

### Context

- `WhiteboardConfigProvider` -- context provider for Excalidraw configuration
- `useWhiteboardConfig` -- hook to access Excalidraw config context

### Utilities

- `parseSnapshot` -- deserialize an Excalidraw snapshot
- `serializeSnapshot` -- serialize an Excalidraw snapshot

### Types

- `WhiteboardConfig` -- configuration type
- `WhiteboardSnapshot` -- snapshot data type

### Sub-path Exports

| Path                                    | Description                             |
| --------------------------------------- | --------------------------------------- |
| `@haklex/rich-ext-whiteboard`           | Full exports (edit + static)            |
| `@haklex/rich-ext-whiteboard/static`    | Static-only (no Excalidraw editor deps) |
| `@haklex/rich-ext-whiteboard/style.css` | Stylesheet                              |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
