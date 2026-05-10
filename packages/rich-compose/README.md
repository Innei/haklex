# @haklex/rich-compose

Compose primitives for haklex rich content renderers — Gundam-style assembly of Lexical nodes, sync/lazy renderers, and Provider stacks.

## Why

The legacy `@haklex/rich-kit-shiro/renderer` (now removed) shipped every default renderer eagerly: even when a consumer overrode `CodeBlock` or `LinkCard`, the upstream `shiki` and `LinkCardRenderer` chains stayed in the production bundle. `rich-compose` solves three problems at once:

1. **Subtractable** — drop a module by not importing it.
2. **Replaceable** — swap a default renderer with no leftover bytes from the original.
3. **Extensible** — add new renderer slots (sync or lazy) without touching the package.

Tree-shake is enforced by physical subpath isolation (`./modules/<name>/node` separates Klasses from heavy renderer code) plus ESM-only emit.

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

Per-module upstream packages (`@haklex/rich-ext-*`, `@haklex/rich-renderer-*`) are optional peers — install only those you compose into your renderer.

## Quick start

```tsx
import { composeRenderer } from '@haklex/rich-compose'
import { embedModule } from '@haklex/rich-compose/modules/embed'
import { codeBlockModule } from '@haklex/rich-compose/modules/code-block'
import { linkCardModule } from '@haklex/rich-compose/modules/link-card'
// import any modules you need...

const RichContent = composeRenderer({
  modules: [embedModule, codeBlockModule, linkCardModule],
})

// Render
<RichContent value={editorState} theme="light" variant="article" />
```

`composeRenderer` returns a memoized React component compatible with `<RichRenderer>`'s prop surface (theme, variant, value, className, style, …).

## Three consumer modes

### Mode A — defaults

Import the module sugar. Klass + renderer + (optional) lazy/SSR fallback are wired automatically.

```tsx
import { embedModule } from '@haklex/rich-compose/modules/embed';
```

### Mode B — custom renderer (tree-shake the default)

Import the Klass from the `/node` subpath; supply your own renderer. The default renderer's chunk never enters the bundle.

```tsx
import { GalleryNode } from '@haklex/rich-compose/modules/gallery/node';

const myGalleryModule: RichRendererModule = {
  name: 'gallery',
  nodes: [GalleryNode],
  renderers: { Gallery: MyGalleryRenderer },
};
```

For modules with no custom Klass (most of the renderer-only modules), simply construct a module with the same `name` and your renderer:

```tsx
const myLinkCardModule: RichRendererModule = {
  name: 'link-card',
  renderers: { LinkCard: MyLinkCardRenderer },
};
```

### Mode C — wrap the default

Pull the default renderer from `/renderer` and wrap it.

```tsx
import { LinkCardNode } from '@haklex/rich-compose/modules/link-card/node'; // when applicable
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

## `RichRendererModule` shape

```ts
interface RichRendererModule {
  name: string; // dedup key
  nodes?: Klass<LexicalNode>[]; // optional — omit for builtin types
  renderers?: Partial<RendererConfig>; // sync renderer map
  Provider?: ComponentType<{ children: ReactNode }>; // optional internal provider
  lazyRenderers?: Partial<{
    // code-split renderers
    [K in RendererKey]: () => Promise<{ default: NonNullable<RendererConfig[K]> }>;
  }>;
  ssrFallback?: Partial<Record<RendererKey, ReactNode>>; // deterministic fallback
}
```

`composeRenderer` merges modules, dedups Klasses, wraps lazy loaders in `React.lazy` (factory built once per compose), stacks Providers, and always sets `NestedContentRendererProvider` to a recursive closure for nested editor states.

## Lazy modules

`code-block` and `mermaid` ship lazy by default with deterministic `ssrFallback`s. The `excalidraw` Klass renders through its own upstream `decorate()` which code-splits internally.

To override a lazy renderer (e.g., for a sync, pre-tokenized code block on SSR), pass an entry in `overrides`:

```ts
composeRenderer({
  modules: [
    /* ... */
  ],
  overrides: { CodeBlock: PreTokenizedCodeBlock },
});
```

The lazy chunk is still emitted but never fetched at runtime.

## Dedup rules

```
modules:
  reference seen   → skip silently
  same name        → warn (dev), replace previous module entirely
  else             → append

nodes:
  reference seen          → skip
  same getType collision  → throw at compose time
                            (multiple Klass instances break instanceof)
```

## Module catalog

| Module         | Klass             | Renderer mode                   | Source                    |
| -------------- | ----------------- | ------------------------------- | ------------------------- |
| `alert`        | builtin           | sync                            | `rich-renderer-alert`     |
| `banner`       | builtin           | sync                            | `rich-renderer-banner`    |
| `chat`         | `ChatNode`        | sync                            | `rich-ext-chat`           |
| `code-block`   | builtin           | lazy + ssr fallback             | `rich-renderer-codeblock` |
| `code-snippet` | `CodeSnippetNode` | sync                            | `rich-ext-code-snippet`   |
| `embed`        | `EmbedNode`       | sync (via node decorate)        | `rich-ext-embed`          |
| `excalidraw`   | `ExcalidrawNode`  | via node decorate               | `rich-ext-excalidraw`     |
| `gallery`      | `GalleryNode`     | sync                            | `rich-ext-gallery`        |
| `image`        | builtin           | sync                            | `rich-renderer-image`     |
| `link-card`    | builtin           | sync                            | `rich-renderer-linkcard`  |
| `mention`      | builtin           | sync                            | `rich-renderer-mention`   |
| `mermaid`      | builtin           | lazy + ssr fallback             | `rich-renderer-mermaid`   |
| `nested-doc`   | `NestedDocNode`   | recursive (via composeRenderer) | `rich-ext-nested-doc`     |
| `ruby`         | builtin           | sync                            | `rich-renderer-ruby`      |
| `video`        | builtin           | sync                            | `rich-renderer-video`     |

Not shipped (handled by `@haklex/rich-editor`'s default renderers via Klass `decorate()`): `katex`, `poll`, `tag`, `footnote`. To override these, pass `overrides` to `composeRenderer`:

```ts
composeRenderer({
  modules: [
    /* ... */
  ],
  overrides: { KaTeX: MyKaTeXRenderer, Poll: MyPollRenderer },
});
```

> **Note**: `@haklex/rich-editor` registers a wide set of custom Klasses in `customNodes` (LinkCard, Mention, Image, Video, KaTeX, Mermaid, Alert, Banner, Ruby, Tag, Poll, CodeBlock, Footnote, etc.). Modules for these contribute only renderer mappings — there is no Klass to register, hence no `node.ts` and no `/node` subpath.

## Sub-path exports

| Path                                           | Description                             |
| ---------------------------------------------- | --------------------------------------- |
| `@haklex/rich-compose`                         | core: `composeRenderer`, types, helpers |
| `@haklex/rich-compose/modules/<name>`          | full module barrel                      |
| `@haklex/rich-compose/modules/<name>/node`     | Klass(es) only (when applicable)        |
| `@haklex/rich-compose/modules/<name>/renderer` | default renderer only                   |
| `@haklex/rich-compose/style.css`               | core styles (skeletons, layout shell)   |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
