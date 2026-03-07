# @haklex/rich-renderers

Static renderer aggregator that bundles all static (read-only) renderers and extension renderers into a single configuration.

## Installation

```bash
pnpm add @haklex/rich-renderers
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
import { enhancedRendererConfig } from '@haklex/rich-renderers'
import { RichRenderer } from '@haklex/rich-static-renderer'

import '@haklex/rich-editor/style.css'
import '@haklex/rich-renderers/style.css'

<RichRenderer
  value={value}
  rendererConfig={enhancedRendererConfig}
  variant="article"
/>
```

This aggregator re-exports all static renderers from individual renderer packages as well as extension static renderers, so you do not need to install or configure them individually.

The config can be extended or overridden:

```tsx
const rendererConfig = {
  ...enhancedRendererConfig,
  CodeBlock: MyCustomCodeBlockRenderer,
}
```

## Exports

### Configuration

- `enhancedRendererConfig` — Pre-configured renderer config with all static renderers registered

### Re-exports

All static renderers from individual packages, extension static renderers, and LinkCard plugins are re-exported for convenience.

### Sub-path Exports

| Path | Description |
| --- | --- |
| `@haklex/rich-renderers` | Full exports with `enhancedRendererConfig` |
| `@haklex/rich-renderers/alert` | Alert static renderer |
| `@haklex/rich-renderers/banner` | Banner static renderer |
| `@haklex/rich-renderers/codeblock` | CodeBlock static renderer |
| `@haklex/rich-renderers/image` | Image static renderer |
| `@haklex/rich-renderers/linkcard` | LinkCard static renderer + plugins |
| `@haklex/rich-renderers/mention` | Mention static renderer |
| `@haklex/rich-renderers/mermaid` | Mermaid static renderer |
| `@haklex/rich-renderers/ruby` | Ruby static renderer |
| `@haklex/rich-renderers/video` | Video static renderer |
| `@haklex/rich-renderers/code-snippet` | Code snippet extension renderer |
| `@haklex/rich-renderers/gallery` | Gallery extension renderer |
| `@haklex/rich-renderers/excalidraw` | Excalidraw extension renderer |
| `@haklex/rich-renderers/embed` | Embed extension renderer |
| `@haklex/rich-renderers/style.css` | Combined stylesheet |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
