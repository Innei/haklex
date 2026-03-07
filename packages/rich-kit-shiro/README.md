# @haklex/rich-kit-shiro

Pre-configured integration bundle for Shiroi (Next.js blog). Provides `ShiroEditor` and `ShiroRenderer` with all plugins, extensions, and renderers pre-loaded.

## Installation

```bash
pnpm add @haklex/rich-kit-shiro
```

## Peer Dependencies

| Package | Version |
| --- | --- |
| `@lexical/react` | `^0.41.0` |
| `lexical` | `^0.41.0` |
| `react` | `>=19` |
| `react-dom` | `>=19` |

## Usage

### Editor

```tsx
import { ShiroEditor } from '@haklex/rich-kit-shiro/editor'
import '@haklex/rich-kit-shiro/style.css'

<ShiroEditor
  initialValue={savedState}
  onChange={(value) => save(value)}
  variant="article"
/>
```

### Renderer

```tsx
import { ShiroRenderer } from '@haklex/rich-kit-shiro/renderer'
import '@haklex/rich-kit-shiro/style-renderer.css'

<ShiroRenderer value={editorState} variant="article" theme="light" />
```

## Exports

### Components

| Export | Description |
| --- | --- |
| `ShiroEditor` | Fully configured editor with all plugins and extensions |
| `ShiroRenderer` | Fully configured static renderer with all renderers |

### Types

| Export | Description |
| --- | --- |
| `ShiroEditorProps` | Props for `ShiroEditor` |
| `ShiroRendererProps` | Props for `ShiroRenderer` |

### Sub-path Exports

| Import Path | Description |
| --- | --- |
| `@haklex/rich-kit-shiro` | Main entry (ShiroEditor + ShiroRenderer + all re-exports) |
| `@haklex/rich-kit-shiro/editor` | Editor component only |
| `@haklex/rich-kit-shiro/editor-core` | Core editor re-exports |
| `@haklex/rich-kit-shiro/excalidraw` | Excalidraw extension re-exports |
| `@haklex/rich-kit-shiro/markdown` | Markdown conversion utilities |
| `@haklex/rich-kit-shiro/nodes` | All node classes |
| `@haklex/rich-kit-shiro/plugins` | All plugin re-exports |
| `@haklex/rich-kit-shiro/renderer` | Renderer component only |
| `@haklex/rich-kit-shiro/renderers` | Static renderer configs |
| `@haklex/rich-kit-shiro/renderers-edit` | Edit-mode renderer configs |
| `@haklex/rich-kit-shiro/style` | Style/theme utilities |
| `@haklex/rich-kit-shiro/style.css` | Compiled editor stylesheet |
| `@haklex/rich-kit-shiro/style-renderer.css` | Compiled renderer stylesheet |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
