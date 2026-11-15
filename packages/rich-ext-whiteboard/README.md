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

### Embed the editor on its own

`@haklex/rich-ext-whiteboard/editor` is the whiteboard without the article block around it. The host owns the store and decides which built-in chrome shows.

```tsx
import {
  convertSkeletons,
  createWhiteboardStore,
  exportToBlob,
  focusElements,
  WhiteboardEditor,
} from '@haklex/rich-ext-whiteboard/editor';

const store = createWhiteboardStore({ elements, files }, { sync: true });

<WhiteboardEditor
  store={store}
  theme="light"
  chrome={{ toolbar: false, stylePanel: false, zoom: false, mobileDock: false }}
  tools={['selection', 'rectangle', 'arrow', 'text', 'card']}
  contextMenuItems={({ selected, scenePoint }) => [
    { key: 'comment', label: 'Comment', onSelect: () => openComment(selected, scenePoint) },
  ]}
/>;
```

- `chrome` switches the toolbar, style panel, zoom controls, mobile dock and context menu off one by one; all are on by default.
- `tools` limits the tools the toolbar and keyboard shortcuts offer.
- `contextMenuItems` appends host items to the right-click menu.
- `handFontOverride` draws handwritten text with another font stack without changing the stored `fontFamily`.
- With `{ sync: true }` every local change, undo and redo included, raises the changed elements' `version`, deleted elements stay as `isDeleted` tombstones, and `store.applyRemote({ elements, files })` merges elements from elsewhere: the higher `version` wins, and elements the user is drawing or typing in are held back until they finish.
- `store.subscribe` reports changes; `store.getState()` holds `elements`, `files`, `selectedIds` and `viewport` (`screen = (scene + scroll) * zoom`).
- `convertSkeletons` completes short element descriptions, see [the scene format](./docs/scene-format.md#skeleton-shorthand). `focusElements` moves the viewport to elements or a box.
- `exportToSvg` and `exportToBlob` draw a scene without a mounted editor. `richtext` cards are drawn as plain SVG text, and the fonts in use are embedded.

`@haklex/rich-ext-whiteboard/scene` holds the read-only side: `Scene`, `SceneContent`, `InteractiveScene` (pan, zoom, `onViewportChange`, a `focus` handle), the font stacks and the same export functions. It never loads the editor.

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

| Path                                    | Description                                  |
| --------------------------------------- | -------------------------------------------- |
| `@haklex/rich-ext-whiteboard`           | Full exports (edit + static)                 |
| `@haklex/rich-ext-whiteboard/static`    | Static-only (no Excalidraw editor deps)      |
| `@haklex/rich-ext-whiteboard/editor`    | The editor on its own, without Lexical nodes |
| `@haklex/rich-ext-whiteboard/scene`     | Read-only scene, viewport control and export |
| `@haklex/rich-ext-whiteboard/style.css` | Stylesheet                                   |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
