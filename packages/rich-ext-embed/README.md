# @haklex/rich-ext-embed

URL embed extension supporting Twitter, YouTube, Apple Music, Spotify, Bilibili, CodeSandbox, and GitHub Gist.

## Installation

```bash
pnpm add @haklex/rich-ext-embed
```

## Peer Dependencies

| Package          | Version   | Required |
| ---------------- | --------- | -------- |
| `@lexical/react` | `^0.45.0` | Yes      |
| `lexical`        | `^0.45.0` | Yes      |
| `react`          | `>= 19`   | Yes      |
| `react-dom`      | `>= 19`   | Yes      |
| `shiki`          | `>= 3`    | Optional |

## Usage

### Register nodes in your editor config

```ts
import { embedEditNodes } from '@haklex/rich-ext-embed';

const editorConfig = {
  nodes: [...embedEditNodes],
};
```

For static/read-only rendering:

```ts
import { embedNodes } from '@haklex/rich-ext-embed/static';

const staticConfig = {
  nodes: [...embedNodes],
};
```

### Use the embed plugin

```tsx
import { EmbedPlugin } from '@haklex/rich-ext-embed';

function EditorPlugins() {
  return <EmbedPlugin />;
}
```

### Insert embeds programmatically

```ts
import { INSERT_EMBED_COMMAND } from '@haklex/rich-ext-embed';

editor.dispatchCommand(INSERT_EMBED_COMMAND, { url: 'https://youtube.com/watch?v=...' });
```

### Use renderers

```tsx
import { EmbedLinkRenderer } from '@haklex/rich-ext-embed';
import { EmbedStaticRenderer } from '@haklex/rich-ext-embed/static';
```

### Provide custom embed renderers

```tsx
import { EmbedRendererProvider, useEmbedRenderers } from '@haklex/rich-ext-embed';

function App() {
  return (
    <EmbedRendererProvider>
      <Editor />
    </EmbedRendererProvider>
  );
}
```

### URL matching utilities

```ts
import {
  matchEmbedUrl,
  isTweetUrl,
  isYoutubeUrl,
  isAppleMusicUrl,
  isSpotifyUrl,
  isBilibiliVideoUrl,
  isCodesandboxUrl,
  isGistUrl,
  isGithubFilePreviewUrl,
  createSelfThinkingMatcher,
} from '@haklex/rich-ext-embed';
```

### Import styles

```ts
import '@haklex/rich-ext-embed/style.css';
```

## Exports

### Nodes

- `EmbedNode` -- static (read-only) node
- `EmbedEditNode` -- edit node with interactive UI
- `$createEmbedNode()` / `$isEmbedNode()` -- Lexical helpers
- `embedNodes` -- array of static nodes for config registration
- `embedEditNodes` -- array of edit nodes for config registration

### Renderers

- `EmbedStaticRenderer` -- static renderer
- `EmbedLinkRenderer` -- link-style embed renderer

### Plugin

- `EmbedPlugin` -- editor plugin for embed insertion
- `INSERT_EMBED_COMMAND` -- Lexical command for programmatic insertion

### Context

- `EmbedRendererProvider` -- context provider for custom embed renderers
- `useEmbedRenderers` -- hook to access embed renderer context

### URL Matchers

- `matchEmbedUrl` -- match a URL against all supported embed types
- `isTweetUrl`, `isYoutubeUrl`, `isAppleMusicUrl`, `isSpotifyUrl`, `isBilibiliVideoUrl`, `isCodesandboxUrl`, `isGistUrl`, `isGithubFilePreviewUrl` -- individual URL matchers
- `createSelfThinkingMatcher` -- factory for custom URL matchers

### Types

- `EmbedType` -- enum of supported embed types

### Sub-path Exports

| Path                               | Description                    |
| ---------------------------------- | ------------------------------ |
| `@haklex/rich-ext-embed`           | Full exports (edit + static)   |
| `@haklex/rich-ext-embed/static`    | Static-only (no heavy UI deps) |
| `@haklex/rich-ext-embed/style.css` | Stylesheet                     |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
