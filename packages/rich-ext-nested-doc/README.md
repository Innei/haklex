# @haklex/rich-ext-nested-doc

Nested document extension for embedding sub-documents as card blocks.

## Installation

```bash
pnpm add @haklex/rich-ext-nested-doc
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
import { nestedDocEditNodes } from '@haklex/rich-ext-nested-doc';

const editorConfig = {
  nodes: [...nestedDocEditNodes],
};
```

For static/read-only rendering:

```ts
import { nestedDocNodes } from '@haklex/rich-ext-nested-doc/static';

const staticConfig = {
  nodes: [...nestedDocNodes],
};
```

### Use the nested doc plugin

```tsx
import { NestedDocPlugin } from '@haklex/rich-ext-nested-doc';

function EditorPlugins() {
  return <NestedDocPlugin />;
}
```

### Insert a nested document programmatically

```ts
import { INSERT_NESTED_DOC_COMMAND } from '@haklex/rich-ext-nested-doc';

editor.dispatchCommand(INSERT_NESTED_DOC_COMMAND, { docId: '...' });
```

### Provide the dialog editor context

```tsx
import {
  NestedDocDialogEditorProvider,
  useNestedDocDialogEditor,
} from '@haklex/rich-ext-nested-doc';

function App() {
  return (
    <NestedDocDialogEditorProvider>
      <Editor />
    </NestedDocDialogEditorProvider>
  );
}
```

### Use renderers and decorators

```tsx
import { NestedDocEditDecorator } from '@haklex/rich-ext-nested-doc';
import { NestedDocRenderer, NestedDocStaticDecorator } from '@haklex/rich-ext-nested-doc/static';
```

### Override the renderer

`NestedDocStaticDecorator` resolves through `RendererWrapper`, so downstream apps can replace the entire static UI by registering a component under the `NESTED_DOC_NODE_KEY` slot:

```tsx
import {
  NESTED_DOC_NODE_KEY,
  type NestedDocRendererProps,
} from '@haklex/rich-ext-nested-doc/static';

const MyNestedDocRenderer = ({ contentState }: NestedDocRendererProps) => {
  // custom preview / card / drawer UI
  return <div>{/* ... */}</div>;
};

const rendererConfig = {
  [NESTED_DOC_NODE_KEY]: MyNestedDocRenderer,
};
```

When no override is supplied the default decorator UI (preview frame + dialog open) is used as-is.

### Markdown transformer

```ts
import { NESTED_DOC_BLOCK_TRANSFORMER } from '@haklex/rich-ext-nested-doc';

const transformers = [NESTED_DOC_BLOCK_TRANSFORMER];
```

### Import styles

```ts
import '@haklex/rich-ext-nested-doc/style.css';
```

## Exports

### Nodes

- `NestedDocNode` -- static (read-only) node
- `NestedDocEditNode` -- edit node with interactive UI
- `$createNestedDocNode()` / `$isNestedDocNode()` -- Lexical helpers
- `nestedDocNodes` -- array of static nodes for config registration
- `nestedDocEditNodes` -- array of edit nodes for config registration

### Renderers / Decorators

- `NestedDocRenderer` -- static renderer
- `NestedDocEditDecorator` -- edit-mode decorator
- `NestedDocStaticDecorator` -- static-mode decorator (resolves overrides via `RendererWrapper`)
- `NESTED_DOC_NODE_KEY` -- `'NestedDoc'` constant for `RendererConfig` slot lookup
- `NestedDocRendererProps` -- props shape for custom renderers registered against the slot

### Plugin

- `NestedDocPlugin` -- editor plugin for nested doc insertion
- `INSERT_NESTED_DOC_COMMAND` -- Lexical command for programmatic insertion

### Context

- `NestedDocDialogEditorProvider` -- context provider for nested doc dialog editor
- `useNestedDocDialogEditor` -- hook to access nested doc dialog editor context

### Transformers

- `NESTED_DOC_BLOCK_TRANSFORMER` -- Markdown block transformer

### Types

- Serialized node types and payload interfaces are exported for type-safe usage.

### Sub-path Exports

| Path                                    | Description                    |
| --------------------------------------- | ------------------------------ |
| `@haklex/rich-ext-nested-doc`           | Full exports (edit + static)   |
| `@haklex/rich-ext-nested-doc/static`    | Static-only (no heavy UI deps) |
| `@haklex/rich-ext-nested-doc/style.css` | Stylesheet                     |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
