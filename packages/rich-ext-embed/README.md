# @haklex/rich-ext-embed

嵌入内容扩展（Twitter、YouTube、Bilibili 等）。

## 安装

```bash
pnpm add @haklex/rich-ext-embed @haklex/rich-editor
```

## 导出

```ts
// 节点
export { EmbedNode } from './nodes/EmbedNode'
export { $createEmbedNode, $isEmbedNode } from './nodes/EmbedNode'
export type { SerializedEmbedNode } from './nodes/EmbedNode'

export { EmbedEditNode } from './nodes/EmbedEditNode'
export { $createEmbedEditNode, $isEmbedEditNode } from './nodes/EmbedEditNode'

export { embedNodes, embedEditNodes } from './nodes'

// 插件
export { EmbedPlugin, INSERT_EMBED_COMMAND } from './EmbedPlugin'
export type { EmbedPluginProps } from './EmbedPlugin'

// 渲染器
export { EmbedStaticRenderer } from './renderers/EmbedStaticRenderer'
export type { EmbedStaticRendererProps } from './renderers/EmbedStaticRenderer'
export { EmbedLinkRenderer } from './renderers/EmbedLinkRenderer'
export type { EmbedLinkRendererProps } from './renderers/EmbedLinkRenderer'

// 上下文
export { EmbedRendererProvider, useEmbedRenderers } from './context/EmbedRendererContext'
export type { EmbedRendererComponent, EmbedRendererMap } from './context/EmbedRendererContext'

// URL 匹配器
export type { EmbedType } from './url-matchers'
export { 
  matchEmbedUrl, isTweetUrl, isYoutubeUrl, 
  isBilibiliVideoUrl, isGistUrl, isCodesandboxUrl,
  isGithubFilePreviewUrl, createSelfThinkingMatcher 
} from './url-matchers'
```

## 使用

```tsx
import { EmbedPlugin, embedEditNodes } from '@haklex/rich-ext-embed'
import { RichEditor } from '@haklex/rich-editor'

<RichEditor extraNodes={[...embedEditNodes]}>
  <EmbedPlugin />
</RichEditor>
```

## License

MIT
