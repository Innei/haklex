# @haklex/rich-renderers-edit

编辑态增强聚合包。  
在 `@haklex/rich-renderers` 静态能力上，补齐 edit renderer、edit node、扩展插件与 slash 菜单能力。

## 包定位

- 产出 `enhancedEditRendererConfig`
- 导出编辑态扩展节点（`embedEditNodes`、`codeSnippetEditNodes`、`katexEditNodes`、`linkCardEditNodes`）
- 导出常用插件（`SlashMenuPlugin`、`EmbedPlugin`、`TldrawPlugin`、`PasteLinkCardPlugin`、`BlockHandlePlugin`）

如果你想“一键接全套”，可直接用 `@haklex/rich-kit-shiro`。

## 安装

```bash
pnpm add @haklex/rich-renderers-edit @haklex/rich-renderers @haklex/rich-editor
```

## 快速开始（手动装配）

```tsx
import { RichEditor } from '@haklex/rich-editor'
import { galleryEditNodes } from '@haklex/rich-renderers'
import {
  BlockHandlePlugin,
  codeSnippetEditNodes,
  embedEditNodes,
  enhancedEditRendererConfig,
  katexEditNodes,
  linkCardEditNodes,
  PasteLinkCardPlugin,
  SlashMenuPlugin,
  TldrawEditNode,
  TldrawPlugin,
  EmbedPlugin,
} from '@haklex/rich-renderers-edit'

import '@haklex/rich-editor/style.css'
import '@haklex/rich-editor-ui/style.css'
import '@haklex/rich-renderers/style.css'
import '@haklex/rich-ext-code-snippet/style.css'
import '@haklex/rich-ext-embed/style.css'
import '@haklex/rich-plugin-slash-menu/style.css'
import '@haklex/rich-plugin-block-handle/style.css'
import 'katex/dist/katex.min.css'
import 'tldraw/tldraw.css'

const extraNodes = [
  TldrawEditNode,
  ...embedEditNodes,
  ...linkCardEditNodes,
  ...katexEditNodes,
  ...galleryEditNodes,
  ...codeSnippetEditNodes,
]

<RichEditor
  rendererConfig={enhancedEditRendererConfig}
  extraNodes={extraNodes}
  actions={<SlashMenuPlugin />}
>
  <BlockHandlePlugin />
  <TldrawPlugin />
  <EmbedPlugin />
  <PasteLinkCardPlugin />
</RichEditor>
```

## `enhancedEditRendererConfig` 说明

`enhancedEditRendererConfig` 基于 `enhancedRendererConfig` 构建，并覆写为编辑态组件：

- `Alert -> AlertEditRenderer`
- `Banner -> BannerEditRenderer`
- `CodeBlock -> CodeBlockEditRenderer`
- `Footnote -> FootnoteRenderer`
- `Gallery -> GalleryEditRenderer`
- `Image -> ImageEditRenderer`
- `Mention -> MentionEditRenderer`
- `Mermaid -> MermaidEditRenderer`
- `Video -> VideoEditRenderer`
- `CodeSnippet -> CodeSnippetEditRenderer`

注意：它只负责“如何渲染”，不负责“节点是否注册”“插件是否挂载”。

## 核心导出

### 1) 预置配置

```ts
enhancedEditRendererConfig
```

### 2) Edit Renderer

```ts
AlertEditRenderer
BannerEditRenderer
CodeBlockEditRenderer
ImageEditRenderer
MentionEditRenderer
MermaidEditRenderer
VideoEditRenderer
CodeSnippetEditRenderer
TldrawEditRenderer
```

### 3) Edit Node

```ts
codeSnippetEditNodes
embedEditNodes
linkCardEditNodes
katexEditNodes
TldrawEditNode
```

### 4) 插件与命令

```ts
SlashMenuPlugin
collectNodeSlashItems
getBuiltinItems
EmbedPlugin
INSERT_EMBED_COMMAND
TldrawPlugin
INSERT_TLDRAW_COMMAND
PasteLinkCardPlugin
BlockHandlePlugin
```

## 设计模式

### 1) 静态渲染器复用 + 编辑态覆盖

编辑配置通过：

```ts
{
  ...enhancedRendererConfig,
  CodeBlock: CodeBlockEditRenderer,
  ...
}
```

实现最大复用，最小维护面。

### 2) Edit Node 继承 Static Node

推荐让编辑节点继承静态节点，仅覆盖 `decorate()`（必要时再覆盖 `importJSON/clone`），保证 JSON 协议一致。

### 3) Slash 菜单自动发现

节点可在类上声明：

```ts
static slashMenuItems: SlashMenuItemConfig[]
```

`SlashMenuPlugin` 会通过 `collectNodeSlashItems(editor)` 自动收集并合并到菜单。

### 4) 命令驱动扩展

扩展插入行为统一封装成 `INSERT_XXX_COMMAND`，菜单/按钮/快捷键都 dispatch 命令，避免 UI 与节点逻辑耦合。

## 扩展编写与接入建议

新增扩展（例如 `Foo`）时，建议按以下顺序：

1. 在扩展包实现 `FooNode`（静态）与可选 `FooEditNode`
2. 实现 `FooRenderer` 与可选 `FooEditRenderer`
3. 提供 `fooNodes/fooEditNodes` 导出
4. 如需插入能力，实现 `FooPlugin + INSERT_FOO_COMMAND`
5. 在 `@haklex/rich-renderers` 注册静态侧导出
6. 在 `@haklex/rich-renderers-edit` 注册编辑侧导出与配置覆盖
7. 补充 README 的节点注册、插件挂载、样式引入说明

## License

MIT
