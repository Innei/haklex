# @haklex/rich-renderer-linkcard

链接卡片渲染器，支持多平台元数据获取。

## 安装

```bash
pnpm add @haklex/rich-renderer-linkcard @haklex/rich-editor
```

## 导出

```ts
// 渲染器
export { LinkCardRenderer } from './LinkCardRenderer'
export { LinkCardEditNode, linkCardEditNodes } from './LinkCardEditNode'
export { LinkCardSkeleton } from './LinkCardSkeleton'

// Hooks
export { useUrlMatcher } from './hooks/useUrlMatcher'

// 插件
export { plugins, pluginMap, getPluginByName } from './plugins'
export { 
  githubRepoPlugin, githubPrPlugin, githubIssuePlugin,
  githubCommitPlugin, githubDiscussionPlugin,
  arxivPlugin, tmdbPlugin, bangumiPlugin,
  leetcodePlugin, mxSpacePlugin, createMxSpacePlugin,
  neteaseMusicPlugin, qqMusicPlugin 
} from './plugins'

// 工具
export { 
  fetchGitHubApi, fetchJsonWithContext,
  camelcaseKeys, generateColor, LanguageToColorMap 
} from './utils'

// 类型
export type { 
  LinkCardData, LinkCardPlugin, LinkCardTypeClass,
  LinkCardApiAdapter, LinkCardFetchContext,
  PluginRegistry, UrlMatchResult, UrlMatchInfo,
  EnhancedLinkCardProps, MxSpacePluginConfig 
} from './types'
```

## 内置插件

- GitHub: repo, pr, issue, commit, discussion
- 学术: arxiv, leetcode
- 媒体: tmdb, bangumi, netease-music, qq-music
- 自定义: mx-space

## 使用

```tsx
import { LinkCardRenderer } from '@haklex/rich-renderer-linkcard'
import type { RendererConfig } from '@haklex/rich-editor'

const config: RendererConfig = {
  LinkCard: LinkCardRenderer,
}
```

## License

MIT
