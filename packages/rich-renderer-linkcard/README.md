# @haklex/rich-renderer-linkcard

Rich link preview card renderer with metadata display and an extensible plugin system for URL-specific cards.

Includes pre-built plugins for GitHub repos/PRs/issues, ArXiv papers, Bangumi entries, LeetCode problems, TMDB media, NetEase Music, and QQ Music.

## Installation

```bash
pnpm add @haklex/rich-renderer-linkcard
```

## Peer Dependencies

| Package          | Version   |
| ---------------- | --------- |
| `lexical`        | `^0.45.0` |
| `@lexical/react` | `^0.45.0` |
| `@lexical/link`  | `^0.45.0` |
| `react`          | `>=19`    |
| `react-dom`      | `>=19`    |

## Usage

```tsx
import { LinkCardRenderer } from '@haklex/rich-renderer-linkcard/static';

// Register in a static RendererConfig
const rendererConfig = {
  // ...other renderers
  LinkCard: LinkCardRenderer,
};
```

For edit mode with link card conversion and paste support:

```tsx
import {
  LinkCardEditNode,
  linkCardEditNodes,
  ConvertToLinkCardAction,
  PasteLinkCardPlugin,
  LinkCardFetchProvider,
} from '@haklex/rich-renderer-linkcard';

// Wrap editor with fetch provider for metadata resolution
<LinkCardFetchProvider>
  <Editor nodes={linkCardEditNodes} plugins={[<PasteLinkCardPlugin />]} />
</LinkCardFetchProvider>;
```

### Using URL-specific plugins

```tsx
import { githubRepoPlugin, githubPrPlugin } from '@haklex/rich-renderer-linkcard';

// Plugins are auto-registered; use matchUrl to detect supported URLs
import { matchUrl } from '@haklex/rich-renderer-linkcard';
const matched = matchUrl('https://github.com/user/repo');
```

## Exports

### Components

- `LinkCardRenderer` — Static (read-only) renderer for link preview cards
- `LinkCardSkeleton` — Loading skeleton placeholder

### Nodes and Plugins

- `LinkCardEditNode` — Edit node for link cards
- `linkCardEditNodes` — Array of link card edit nodes for registration
- `ConvertToLinkCardAction` — Action to convert a link to a link card
- `PasteLinkCardPlugin` — Editor plugin for paste-to-card conversion

### Context

- `LinkCardFetchProvider` — Provider for link metadata fetching
- `useLinkCardFetchContext` — Hook to access fetch context

### Plugin Registry

- `getPluginByName` — Retrieve a plugin by name
- `pluginMap` — Map of all registered plugins
- `plugins` — Array of all registered plugins

### Pre-built Plugins

- `githubRepoPlugin` — GitHub repository cards
- `githubPrPlugin` — GitHub PR/issue cards
- ArXiv, Bangumi, LeetCode, TMDB, NetEase Music, QQ Music plugins

### URL Matching

- `useUrlMatcher` — Hook for matching URLs to plugins
- `matchUrl` — Utility to match a URL against registered plugins

### Sub-path Exports

| Path                                       | Description                            |
| ------------------------------------------ | -------------------------------------- |
| `@haklex/rich-renderer-linkcard`           | Full exports (edit + static + plugins) |
| `@haklex/rich-renderer-linkcard/static`    | Static-only renderer                   |
| `@haklex/rich-renderer-linkcard/style.css` | Stylesheet                             |

## Part of Haklex

This package is part of the [Haklex](../../README.md) rich editor ecosystem.

## License

MIT
