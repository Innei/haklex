# @haklex/rich-compose

Compose primitives for haklex rich content — Gundam-style assembly of Lexical nodes, sync/lazy renderers, edit-side decorators, and Provider stacks. Powers both `composeRenderer` (read-only) and `composeEditor` (editable).

## Why

The legacy `@haklex/rich-kit-shiro/renderer` (now removed) shipped every default renderer eagerly: overriding `CodeBlock` or `LinkCard` left the original `shiki` and `LinkCardRenderer` chains in the bundle. `rich-compose` solves three problems at once:

1. **Subtractable** — drop a module by not importing it.
2. **Replaceable** — swap a default renderer with no leftover bytes.
3. **Extensible** — add new renderer slots (sync or lazy) without touching the package.

Tree-shake is enforced by physical subpath isolation (`./modules/<name>/node` separates Klasses from heavy renderer code; `./modules/<name>` vs `./modules/<name>/edit` separates static-only from editor-only chains) plus ESM-only emit.

## Installation

```bash
pnpm add @haklex/rich-compose
```

## Peer Dependencies

| Package                      | Version   |
| ---------------------------- | --------- |
| `react` / `react-dom`        | `>=19`    |
| `lexical` / `@lexical/react` | `^0.44.0` |
| `@haklex/rich-editor`        | workspace |

Per-module upstream packages (`@haklex/rich-ext-*`, `@haklex/rich-renderer-*`) are optional peers — install only those you compose.

## Quick start

### Read-only renderer

```tsx
import { composeRenderer } from '@haklex/rich-compose';
import { allRendererModules } from '@haklex/rich-compose/renderer';

const RichContent = composeRenderer({ modules: allRendererModules });

// Render
<RichContent value={editorState} theme="light" variant="article" />;
```

Or cherry-pick:

```tsx
import { composeRenderer } from '@haklex/rich-compose';
import { embedModule } from '@haklex/rich-compose/modules/embed';
import { codeBlockModule } from '@haklex/rich-compose/modules/code-block';

const RichContent = composeRenderer({ modules: [embedModule, codeBlockModule] });
```

### Editor

```tsx
import { composeEditor } from '@haklex/rich-compose';
import { allEditorModules } from '@haklex/rich-compose/editor';

const RichEditor = composeEditor({ modules: allEditorModules });

// Use like @haklex/rich-editor's RichEditor — accepts the same props plus children for plugins.
<RichEditor initialValue={state} onChange={setState} variant="article" />;
```

Both helpers return memoized React components. `composeEditor` internally wires `composeRenderer` for nested editor states.

## Three consumer modes

### Mode A — defaults

Import the module sugar. Klass + renderer + (optional) lazy/SSR fallback are wired automatically.

```tsx
import { embedModule } from '@haklex/rich-compose/modules/embed';
import { embedEditModule } from '@haklex/rich-compose/modules/embed/edit';
```

### Mode B — custom renderer (tree-shake the default)

Import the Klass from `/node`; supply your own renderer.

```tsx
import { GalleryNode } from '@haklex/rich-compose/modules/gallery/node';

const myGalleryModule: RichRendererModule = {
  name: 'gallery',
  nodes: [GalleryNode],
  renderers: { Gallery: MyGalleryRenderer },
};
```

For renderer-only modules (no custom Klass), construct with matching `name`:

```tsx
const myLinkCardModule: RichRendererModule = {
  name: 'link-card',
  renderers: { LinkCard: MyLinkCardRenderer },
};
```

### Mode C — wrap the default

Pull the default renderer from `/renderer` and wrap.

```tsx
import { LinkCardRenderer } from '@haklex/rich-compose/modules/link-card/renderer';

const wrappedModule: RichRendererModule = {
  name: 'link-card',
  renderers: {
    LinkCard: (props) => (
      <div className="extra-wrap">
        <LinkCardRenderer {...props} />
      </div>
    ),
  },
};
```

## Module shapes

`RichRendererModule` (read-only) and `RichEditorModule` (editor superset).

```ts
interface RichRendererModule {
  name: string; // dedup key
  nodes?: Klass<LexicalNode>[]; // base Klasses
  renderers?: Partial<RendererConfig>; // sync renderer map
  Provider?: ComponentType<{ children: ReactNode }>; // shared provider
  lazyRenderers?: Partial<{
    [K in RendererKey]: () => Promise<{ default: NonNullable<RendererConfig[K]> }>;
  }>;
  ssrFallback?: Partial<Record<RendererKey, ReactNode>>;
}

interface RichEditorModule extends RichRendererModule {
  editNodes?: Klass<LexicalNode>[]; // edit-side subclasses (override base by getType)
  editRenderers?: Partial<RendererConfig>; // override renderers in editor mode
  EditorProvider?: ComponentType<{ children: ReactNode }>; // editor-only provider
  plugins?: ReactNode; // module-owned editor plugins
  actions?: ReactNode; // module-owned action UI
}
```

`composeRenderer` consumes `RichRendererModule[]`; `composeEditor` consumes `RichEditorModule[]`. Each editor module spreads its renderer-only counterpart, so `allEditorModules` is a strict superset of `allRendererModules`.

## Dedup rules

```
modules:
  reference seen   → skip silently
  same name        → warn (dev), replace previous module entirely
  else             → append

nodes:
  reference seen          → skip
  subclass override       → edit Klass replaces base Klass (same getType, A extends B)
  unrelated collision     → throw at compose time
                            (would break instanceof across module boundaries)
```

## Lazy modules

`code-block` and `mermaid` ship lazy by default with deterministic `ssrFallback`s. `excalidraw`'s Klass code-splits internally via its own `decorate()`.

To override a lazy renderer (e.g., pre-tokenized code block for SSR), pass `overrides`:

```ts
composeRenderer({
  modules: allRendererModules,
  overrides: { CodeBlock: PreTokenizedCodeBlock },
});
```

The lazy chunk is still emitted but never fetched at runtime.

## Module catalog

| Module         | Base Klass        | Edit Klass            | Mode                            | Source                    |
| -------------- | ----------------- | --------------------- | ------------------------------- | ------------------------- |
| `alert`        | builtin           | —                     | sync                            | `rich-renderer-alert`     |
| `banner`       | builtin           | —                     | sync                            | `rich-renderer-banner`    |
| `chat`         | `ChatNode`        | `ChatEditNode`        | sync                            | `rich-ext-chat`           |
| `code-block`   | builtin           | —                     | lazy + ssr fallback             | `rich-renderer-codeblock` |
| `code-snippet` | `CodeSnippetNode` | `CodeSnippetEditNode` | sync                            | `rich-ext-code-snippet`   |
| `embed`        | `EmbedNode`       | `EmbedEditNode`       | sync (via node decorate)        | `rich-ext-embed`          |
| `excalidraw`   | `ExcalidrawNode`  | `ExcalidrawEditNode`  | via node decorate               | `rich-ext-excalidraw`     |
| `gallery`      | `GalleryNode`     | `GalleryEditNode`     | sync                            | `rich-ext-gallery`        |
| `image`        | builtin           | —                     | sync                            | `rich-renderer-image`     |
| `katex`        | —                 | builtin               | edit-only (no static renderer)  | `rich-renderer-katex`     |
| `link-card`    | builtin           | —                     | sync                            | `rich-renderer-linkcard`  |
| `mention`      | builtin           | —                     | sync                            | `rich-renderer-mention`   |
| `mermaid`      | builtin           | —                     | lazy + ssr fallback             | `rich-renderer-mermaid`   |
| `nested-doc`   | `NestedDocNode`   | `NestedDocEditNode`   | recursive (via composeRenderer) | `rich-ext-nested-doc`     |
| `poll`         | `PollNode`        | `PollEditNode`        | sync                            | `rich-ext-poll`           |
| `ruby`         | builtin           | —                     | sync                            | `rich-renderer-ruby`      |
| `video`        | builtin           | —                     | sync                            | `rich-renderer-video`     |

`katex` ships only an edit module — KaTeX rendering for the read-only side is wired by the host renderer via `decorate()`.

## Sub-path exports

| Path                                           | Description                                                     |
| ---------------------------------------------- | --------------------------------------------------------------- |
| `@haklex/rich-compose`                         | core: `composeRenderer`, `composeEditor`, types, helpers        |
| `@haklex/rich-compose/renderer`                | aggregate barrel — every renderer module + `allRendererModules` |
| `@haklex/rich-compose/editor`                  | aggregate barrel — every editor module + `allEditorModules`     |
| `@haklex/rich-compose/modules/<name>`          | renderer-side module barrel                                     |
| `@haklex/rich-compose/modules/<name>/edit`     | editor-side module (extends the renderer module)                |
| `@haklex/rich-compose/modules/<name>/node`     | Klass(es) only (when applicable)                                |
| `@haklex/rich-compose/modules/<name>/renderer` | default renderer only                                           |
| `@haklex/rich-compose/style.css`               | core styles (skeletons, layout shell)                           |

Aggregate barrels are convenient defaults; the fine-grained `/modules/<name>` and `/modules/<name>/edit` subpaths stay available for dynamic-import and selective inclusion.

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
