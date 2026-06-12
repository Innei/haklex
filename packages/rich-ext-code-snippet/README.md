# @haklex/rich-ext-code-snippet

Multi-file tabbed code snippet extension with drag-and-drop reordering.

## Installation

```bash
pnpm add @haklex/rich-ext-code-snippet
```

## Peer Dependencies

| Package   | Version   |
| --------- | --------- |
| `lexical` | `^0.45.0` |
| `react`   | `>= 19`   |

Key runtime dependencies include `@codemirror/*` (editor engine), `@dnd-kit/*` (drag-and-drop), and `shiki` (syntax highlighting).

## Usage

### Register nodes in your editor config

Edit (read + write):

```ts
import { codeSnippetEditNodes } from '@haklex/rich-ext-code-snippet/edit';

const editorConfig = { nodes: [...codeSnippetEditNodes] };
```

Static / read-only:

```ts
import { codeSnippetNodes } from '@haklex/rich-ext-code-snippet/node';

const staticConfig = { nodes: [...codeSnippetNodes] };
```

### Use renderers

```tsx
import { CodeSnippetEditRenderer } from '@haklex/rich-ext-code-snippet/edit';
import { CodeSnippetRenderer } from '@haklex/rich-ext-code-snippet/renderer';
```

### Markdown transformer

```ts
import { CODE_SNIPPET_BLOCK_TRANSFORMER } from '@haklex/rich-ext-code-snippet/node';

const transformers = [CODE_SNIPPET_BLOCK_TRANSFORMER];
```

### Tree-shake the default renderer

The default `CodeSnippetRenderer` is **not** statically imported by `CodeSnippetNode`. Register a custom renderer through `RendererConfig` to drop the heavy default chunk:

```ts
import { CODE_SNIPPET_NODE_KEY, codeSnippetNodes } from '@haklex/rich-ext-code-snippet/node';
import type { RichRendererModule } from '@haklex/rich-compose';

const lightModule: RichRendererModule = {
  name: 'code-snippet',
  nodes: codeSnippetNodes,
  renderers: { [CODE_SNIPPET_NODE_KEY]: MyLightCodeSnippet },
};
```

`@haklex/rich-compose`'s `codeSnippetModule` lazy-loads the default renderer via `lazyRenderers`; the override pattern above bypasses it entirely.

### Import styles

```ts
import '@haklex/rich-ext-code-snippet/style.css';
```

## Exports

### Nodes

- `CodeSnippetNode` -- static (read-only) node
- `CodeSnippetEditNode` -- edit node with interactive UI
- `$createCodeSnippetNode()` / `$isCodeSnippetNode()` -- Lexical helpers
- `codeSnippetNodes` -- array of static nodes for config registration
- `codeSnippetEditNodes` -- array of edit nodes for config registration

### Renderers

- `CodeSnippetRenderer` -- static renderer (no heavy UI deps)
- `CodeSnippetEditRenderer` -- edit renderer with CodeMirror, drag-and-drop tabs

### Slot Key

- `CODE_SNIPPET_NODE_KEY` -- `'CodeSnippet'` constant for `RendererConfig` slot lookup

### Transformers

- `CODE_SNIPPET_BLOCK_TRANSFORMER` -- Markdown block transformer

## Sub-path Exports

| Path                                      | Description                                               |
| ----------------------------------------- | --------------------------------------------------------- |
| `@haklex/rich-ext-code-snippet`           | Full exports (node + renderer + edit)                     |
| `@haklex/rich-ext-code-snippet/node`      | Lightweight node + slot key + types — no default renderer |
| `@haklex/rich-ext-code-snippet/renderer`  | Default `CodeSnippetRenderer` (heavy)                     |
| `@haklex/rich-ext-code-snippet/edit`      | Edit-mode node + `CodeSnippetEditRenderer`                |
| `@haklex/rich-ext-code-snippet/static`    | Convenience: node + renderer (SSR bundle)                 |
| `@haklex/rich-ext-code-snippet/style.css` | Stylesheet                                                |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
