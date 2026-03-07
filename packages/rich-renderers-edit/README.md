# @haklex/rich-renderers-edit

Edit renderer aggregator that extends the static aggregator (`@haklex/rich-renderers`) with edit renderers and editor plugins.

## Installation

```bash
pnpm add @haklex/rich-renderers-edit
```

## Peer Dependencies

| Package | Version |
| --- | --- |
| `lexical` | `^0.41.0` |
| `@lexical/react` | `^0.41.0` |
| `react` | `>=19` |
| `react-dom` | `>=19` |

## Usage

```tsx
import { enhancedEditRendererConfig } from '@haklex/rich-renderers-edit'
import { RichEditor } from '@haklex/rich-editor'

import '@haklex/rich-editor/style.css'
import '@haklex/rich-renderers/style.css'

<RichEditor
  rendererConfig={enhancedEditRendererConfig}
  variant="article"
/>
```

This aggregator builds on `@haklex/rich-renderers` by replacing static renderers with their edit counterparts and adding editor-specific plugins (slash menu actions, toolbar integrations, etc.).

## Exports

### Configuration

- `enhancedEditRendererConfig` — Pre-configured renderer config with all edit renderers and editor plugins registered

### Sub-path Exports

| Path | Description |
| --- | --- |
| `@haklex/rich-renderers-edit` | Full exports with `enhancedEditRendererConfig` |
| `@haklex/rich-renderers-edit/alert` | Alert edit renderer |
| `@haklex/rich-renderers-edit/banner` | Banner edit renderer |
| `@haklex/rich-renderers-edit/codeblock` | CodeBlock edit renderer |
| `@haklex/rich-renderers-edit/config` | Base config utilities |
| `@haklex/rich-renderers-edit/mention` | Mention edit renderer |
| `@haklex/rich-renderers-edit/mermaid` | Mermaid edit renderer |
| `@haklex/rich-renderers-edit/ruby` | Ruby edit renderer |
| `@haklex/rich-renderers-edit/slash-menu` | Slash menu integration |
| `@haklex/rich-renderers-edit/code-snippet` | Code snippet edit renderer |
| `@haklex/rich-renderers-edit/embed` | Embed edit renderer |
| `@haklex/rich-renderers-edit/excalidraw` | Excalidraw edit renderer |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
