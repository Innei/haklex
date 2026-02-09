# @shiro/rich-renderer-linkcard

Enhanced LinkCard renderer for `@shiro/rich-editor` with plugin-based dynamic fetching and spotlight effects.

## Features

- 🔌 **Plugin System** - Extensible architecture for supporting multiple link types
- ✨ **Spotlight Effect** - Dynamic hover spotlight with accent colors
- 🎨 **Type Classes** - Themed styles for different link types (GitHub, Media, Academic)
- 🔄 **Lazy Loading** - Fetch card data only when visible
- 📦 **12 Built-in Plugins** (TODO: migrate from main project)

## Installation

```bash
pnpm add @shiro/rich-renderer-linkcard
```

## Usage

### With RendererConfig

```tsx
import { RichEditor } from '@shiro/rich-editor'
import { LinkCardRenderer } from '@shiro/rich-renderer-linkcard'
import '@shiro/rich-renderer-linkcard/style.css'

<RichEditor
  rendererConfig={{
    LinkCard: LinkCardRenderer,
  }}
/>
```

### Plugin-based Dynamic Fetch

```tsx
import { LinkCardRenderer } from '@shiro/rich-renderer-linkcard'

// Auto-detect GitHub repo and fetch metadata
<LinkCardRenderer
  url="https://github.com/facebook/react"
  source="github-repo"
  id="facebook/react"
/>
```

### Static Props

```tsx
<LinkCardRenderer
  url="https://example.com"
  title="Example Site"
  description="A great example website"
  image="https://example.com/og-image.jpg"
  favicon="https://example.com/favicon.ico"
/>
```

## Available Plugins

Currently implemented:
- ✅ **github-repo** - GitHub repositories

TODO (migrate from main project):
- [ ] **github-commit** - GitHub commits
- [ ] **github-pr** - GitHub pull requests
- [ ] **github-issue** - GitHub issues
- [ ] **github-discussion** - GitHub discussions
- [ ] **arxiv** - arXiv papers
- [ ] **tmdb** - TMDB movies/TV shows
- [ ] **bangumi** - Bangumi anime/manga
- [ ] **qq-music** - QQ Music songs
- [ ] **netease-music** - NetEase Cloud Music
- [ ] **leetcode** - LeetCode problems
- [ ] **mx-space** - MX-Space internal links

## Creating Custom Plugins

```ts
import type { LinkCardPlugin } from '@shiro/rich-renderer-linkcard'

export const myPlugin: LinkCardPlugin = {
  name: 'my-plugin',
  displayName: 'My Custom Plugin',
  priority: 50,
  typeClass: 'media',

  matchUrl(url: URL) {
    if (url.hostname !== 'example.com') return null
    return { id: url.pathname, fullUrl: url.href }
  },

  isValidId(id: string) {
    return id.length > 0
  },

  async fetch(id: string) {
    const response = await fetch(`https://api.example.com${id}`)
    const data = await response.json()

    return {
      title: data.title,
      desc: data.description,
      image: data.thumbnail,
      color: '#3b82f6',
    }
  },
}
```

## License

MIT
