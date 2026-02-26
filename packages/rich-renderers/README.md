# @haklex/rich-renderers

静态渲染器聚合包。  
为 `@haklex/rich-renderer` 提供一套增强版 `rendererConfig`，并统一导出常见扩展节点与工具。

## 包定位

- 面向只读渲染场景（文章页、SSR、预览页）
- 聚合多个 feature 包（codeblock/image/video/linkcard/...）
- 不负责编辑器插件挂载（编辑态请看 `@haklex/rich-renderers-edit`）

## 安装

```bash
pnpm add @haklex/rich-renderers @haklex/rich-renderer @haklex/rich-editor
```

## 快速开始

```tsx
import { RichRenderer } from '@haklex/rich-static-renderer'
import {
  codeSnippetNodes,
  embedNodes,
  enhancedRendererConfig,
  galleryNodes,
  TldrawNode,
} from '@haklex/rich-renderers'

import '@haklex/rich-editor/style.css'
import '@haklex/rich-renderers/style.css'
import '@haklex/rich-ext-code-snippet/style.css'
import '@haklex/rich-ext-embed/style.css'
import 'katex/dist/katex.min.css'
import 'tldraw/tldraw.css'

const extraNodes = [
  TldrawNode,
  ...embedNodes,
  ...galleryNodes,
  ...codeSnippetNodes,
]

export function Article({ value }) {
  return (
    <RichRenderer
      value={value}
      rendererConfig={enhancedRendererConfig}
      extraNodes={extraNodes}
      variant="article"
    />
  )
}
```

## `enhancedRendererConfig` 包含项

| key | renderer |
| --- | --- |
| `Alert` | `AlertRenderer` |
| `Banner` | `BannerRenderer` |
| `CodeBlock` | `CodeBlockRenderer` |
| `Image` | `ImageRenderer` |
| `LinkCard` | `LinkCardRenderer` |
| `Mention` | `MentionRenderer` |
| `Gallery` | `GalleryRenderer` |
| `Mermaid` | `MermaidRenderer` |
| `Video` | `VideoRenderer` |
| `CodeSnippet` | `CodeSnippetRenderer` |

## 样式引入策略

`@haklex/rich-renderers/style.css` 已包含：

- alert/banner/codeblock/gallery/image/linkcard/mention/mermaid/video/tldraw 扩展样式

仍需按需额外引入：

- `@haklex/rich-ext-code-snippet/style.css`（CodeSnippet）
- `@haklex/rich-ext-embed/style.css`（Embed）
- `katex/dist/katex.min.css`（KaTeX）
- `tldraw/tldraw.css`（Tldraw 内核）

## 核心导出

### 1) 预置配置

```ts
enhancedRendererConfig
```

### 2) 扩展节点

```ts
// gallery
galleryNodes
GalleryNode
GalleryEditNode

// code-snippet
codeSnippetNodes
CodeSnippetNode

// embed
embedNodes
EmbedNode

// tldraw
TldrawNode
```

### 3) 各功能渲染器

```ts
AlertRenderer
BannerRenderer
CodeBlockRenderer
ImageRenderer
LinkCardRenderer
MentionRenderer
MermaidRenderer
VideoRenderer
GalleryRenderer
CodeSnippetRenderer
EmbedStaticRenderer
EmbedLinkRenderer
TldrawStaticRenderer
```

### 4) LinkCard 插件体系

```ts
plugins
pluginMap
getPluginByName
githubRepoPlugin
githubPrPlugin
githubIssuePlugin
githubCommitPlugin
githubDiscussionPlugin
arxivPlugin
tmdbPlugin
bangumiPlugin
qqMusicPlugin
neteaseMusicPlugin
leetcodePlugin
```

## 子路径按需引入

可用子路径（对应 `package.json exports`）：

- `@haklex/rich-renderers/alert`
- `@haklex/rich-renderers/banner`
- `@haklex/rich-renderers/codeblock`
- `@haklex/rich-renderers/code-snippet`
- `@haklex/rich-renderers/image`
- `@haklex/rich-renderers/linkcard`
- `@haklex/rich-renderers/mention`
- `@haklex/rich-renderers/mermaid`
- `@haklex/rich-renderers/video`
- `@haklex/rich-renderers/gallery`
- `@haklex/rich-renderers/embed`
- `@haklex/rich-renderers/tldraw`
- `@haklex/rich-renderers/style.css`

## 设计模式

### 1) 配置聚合模式

把复杂渲染能力汇总为单个对象 `enhancedRendererConfig`，业务只需要：

- 注入这一个 config
- 注册扩展节点（`extraNodes`）
- 引入对应样式

### 2) 静态与编辑分层

本包只关注静态渲染，不在这里装配编辑插件。  
编辑行为统一在 `@haklex/rich-renderers-edit` 处理，保持 bundle 边界清晰。

### 3) 可覆写不 fork

你可以基于预置配置增量覆写：

```tsx
const rendererConfig = {
  ...enhancedRendererConfig,
  CodeBlock: MyCodeBlockRenderer,
}
```

## 扩展接入建议

新增扩展时，建议同步维护：

1. 扩展包内导出 `nodes` 数组（静态）
2. 在本包 `config.ts` 注册静态 renderer（如适配 `RendererConfig` key）
3. 在本包 `index.ts` 与必要的子路径导出 API

对应编辑态扩展再接入 `@haklex/rich-renderers-edit`。

## License

MIT
