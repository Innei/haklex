# @haklex/rich-editor

基于 [Lexical](https://lexical.dev/) 的富文本编辑器核心包。  
负责 `编辑态` 运行时、节点注册、插件装配、Markdown 快捷键与主题系统。

## 包定位

- `@haklex/rich-editor`：编辑器核心（`RichEditor`）
- `@haklex/rich-static-renderer`：只读渲染引擎（`RichRenderer`）
- `@haklex/rich-renderers`：静态增强渲染器聚合（codeblock、image、video、mermaid...）
- `@haklex/rich-renderers-edit`：编辑增强渲染器与扩展插件聚合
- `@haklex/rich-kit-shiro`：一站式生产组合（编辑 + 渲染 + 常用扩展）

## 安装

```bash
pnpm add @haklex/rich-editor lexical @lexical/react react react-dom
```

可选依赖（按功能开启）：

- `katex`：数学公式渲染
- `shiki`：代码高亮

## 快速开始

```tsx
import { RichEditor } from '@haklex/rich-editor'
import type { SerializedEditorState } from 'lexical'
import { useState } from 'react'
import '@haklex/rich-editor/style.css'

export function DemoEditor() {
  const [value, setValue] = useState<SerializedEditorState | undefined>()

  return (
    <RichEditor
      initialValue={value}
      onChange={setValue}
      variant="article"
      theme="light"
      placeholder="Write something..."
      onSubmit={() => {
        // Cmd/Ctrl + Enter
      }}
    />
  )
}
```

如果要渲染只读内容：

```tsx
import { RichRenderer } from '@haklex/rich-static-renderer'

<RichRenderer value={value} />
```

## 数据格式

`onChange` 返回的是 `SerializedEditorState`（Lexical JSON），推荐直接落库。  
`initialValue` 直接喂回这个 JSON，可以做到无损回显。

## 导出入口

| 入口 | 说明 |
| --- | --- |
| `@haklex/rich-editor` | 完整导出（组件、节点、插件命令、上下文、类型） |
| `@haklex/rich-editor/editor` | 轻入口：`RichEditor` + 节点配置 |
| `@haklex/rich-editor/static` | 渲染/SSR 相关静态工具（供 `@haklex/rich-static-renderer` 与扩展包使用） |
| `@haklex/rich-editor/styles` | 仅样式变量/variant class 导出（不含 Lexical theme 对象） |
| `@haklex/rich-editor/style.css` | 打包后的编辑器样式 |

## RichEditor API

```ts
type RichEditorVariant = 'article' | 'comment' | 'note'

interface RichEditorProps {
  initialValue?: SerializedEditorState
  onChange?: (value: SerializedEditorState) => void
  variant?: RichEditorVariant
  theme?: 'light' | 'dark'
  placeholder?: string
  onSubmit?: () => void
  autoFocus?: boolean
  className?: string
  contentClassName?: string
  style?: React.CSSProperties
  actions?: ReactNode
  onEditorReady?: (editor: LexicalEditor | null) => void
  extraNodes?: Array<Klass<LexicalNode>>
  rendererConfig?: RendererConfig
  imageUpload?: ImageUploadFn
  debounceMs?: number
  children?: ReactNode
}
```

关键字段说明：

- `extraNodes`：注册你自己的 Lexical 节点（扩展节点必配）
- `rendererConfig`：覆写默认渲染器（如 Image/CodeBlock/LinkCard）
- `actions`：插在编辑器底部 actions 区域（常用于 Slash 菜单）
- `children`：插件插槽（如 `EmbedPlugin`、`TldrawPlugin`）
- `imageUpload`：替换默认图片上传逻辑
- `debounceMs`：`onChange` 的防抖间隔（毫秒）

## RendererConfig API

```ts
interface RendererConfig {
  Alert?: ComponentType<AlertRendererProps>
  Banner?: ComponentType<BannerRendererProps>
  CodeBlock?: ComponentType<CodeBlockRendererProps>
  CodeSnippet?: ComponentType<CodeSnippetRendererProps>
  Footnote?: ComponentType<FootnoteRendererProps>
  FootnoteSection?: ComponentType<FootnoteSectionRendererProps>
  Gallery?: ComponentType<GalleryRendererProps>
  Image?: ComponentType<ImageRendererProps>
  KaTeX?: ComponentType<KaTeXRendererProps>
  LinkCard?: ComponentType<LinkCardRendererProps>
  Mermaid?: ComponentType<MermaidRendererProps>
  Mention?: ComponentType<MentionRendererProps>
  Video?: ComponentType<VideoRendererProps>
}
```

示例：覆写图片与代码块渲染器

```tsx
import type { RendererConfig } from '@haklex/rich-editor'

const rendererConfig: RendererConfig = {
  Image: MyImageRenderer,
  CodeBlock: MyCodeBlockRenderer,
}

<RichEditor rendererConfig={rendererConfig} />
```

## 内置节点与插件

默认内置节点（`config.ts` / `config-edit.ts`）：

- 内置 Lexical 节点：Heading、Quote、List、Link、Table、Code、HorizontalRule...
- 自定义节点：Spoiler、Mention、KaTeXInline、KaTeXBlock、Image、Alert、CodeBlock、Footnote、FootnoteSection、Video、LinkCard、Details、Grid、Banner、Mermaid

`RichEditor` 默认挂载插件：

- 历史/列表/链接/表格：`HistoryPlugin`、`ListPlugin`、`LinkPlugin`、`TablePlugin`
- 编辑增强：`MarkdownShortcutsPlugin`、`CheckListPlugin`、`AutoLinkPlugin`
- 内容能力：`ImagePlugin`、`ImageUploadPlugin`、`KaTeXPlugin`、`AlertPlugin`、`MermaidPlugin`、`HorizontalRulePlugin`
- 生命周期：`OnChangePlugin`、`EditorRefPlugin`、`SubmitShortcutPlugin`（Cmd/Ctrl+Enter）、`AutoFocusPlugin`

## 常用命令导出

```ts
INSERT_ALERT_COMMAND
INSERT_IMAGE_COMMAND
OPEN_IMAGE_UPLOAD_DIALOG_COMMAND
INSERT_KATEX_INLINE_COMMAND
INSERT_KATEX_BLOCK_COMMAND
INSERT_MERMAID_COMMAND
```

可在自定义插件中 `editor.dispatchCommand(...)` 触发。

## Markdown Transformer

导出：`ALL_TRANSFORMERS`（`src/transformers`）

覆盖能力包括：

- Inline：Spoiler、Mention、Footnote、`++underline++`、上/下标、KaTeX inline
- Block：FootnoteSection、Container(Banner/Details)、Git Alert、KaTeX block、Image/Video/CodeBlock/LinkCard/Mermaid/Grid/Table/HR + Lexical 默认 transformers

参考：`docs/export-format-summary.md`

## 设计模式

### 1) Static / Edit 节点分离

对“编辑态很重”的节点采用双类拆分：

- 静态节点：用于只读渲染，依赖轻
- 编辑节点：继承静态节点，覆盖 `decorate()` 挂重 UI（Popover、Dialog、Nested editor 等）

典型：`AlertQuoteNode` / `AlertQuoteEditNode`、`CodeBlockNode` / `CodeBlockEditNode`。

### 2) RendererWrapper 注入模式

节点内部通过 `createRendererDecoration(...)` 把渲染职责交给 `RendererConfig`，实现：

- 默认渲染器可直接用
- 业务侧可按 key 定向覆写
- 保持节点协议不变

### 3) Command + Plugin 模式

扩展插入动作统一走 `createCommand` + `registerCommand`，避免 UI 与文档结构硬耦合。

## 扩展编写与接入

下面是可直接复用的扩展落地流程。

### 步骤 1：定义 Node（静态）

```tsx
import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import { DecoratorNode } from 'lexical'
import type { ReactElement } from 'react'
import { createElement } from 'react'

import { PollRenderer } from './PollRenderer'

type SerializedPollNode = Spread<
  { question: string },
  SerializedLexicalNode
>

export class PollNode extends DecoratorNode<ReactElement> {
  __question: string

  static getType() {
    return 'poll'
  }

  static clone(node: PollNode) {
    return new PollNode(node.__question, node.__key)
  }

  constructor(question: string, key?: NodeKey) {
    super(key)
    this.__question = question
  }

  createDOM(_config: EditorConfig) {
    const el = document.createElement('div')
    el.className = 'rich-poll-wrapper'
    return el
  }

  updateDOM() {
    return false
  }

  isInline() {
    return false
  }

  static importJSON(json: SerializedPollNode) {
    return new PollNode(json.question)
  }

  exportJSON(): SerializedPollNode {
    return {
      ...super.exportJSON(),
      type: 'poll',
      question: this.__question,
      version: 1,
    }
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(PollRenderer, {
      question: this.__question,
    })
  }
}

export function $isPollNode(
  node: LexicalNode | null | undefined,
): node is PollNode {
  return node instanceof PollNode
}
```

说明：`RendererConfig` 只能覆写预定义 key。  
像 `Poll` 这种全新节点，一般采用“节点内直接渲染组件”或自定义 context 的方式。

### 步骤 2：可选编辑态 Node

如果编辑态需要重 UI，可以 `class PollEditNode extends PollNode` 并覆写 `decorate()`。

还可以定义 slash 菜单项：

```ts
static slashMenuItems = [
  {
    title: 'Poll',
    description: 'Insert a poll block',
    section: 'MEDIA',
    onSelect: (editor) => { ... },
  },
]
```

### 步骤 3：注册到编辑器与渲染器

```tsx
import { RichEditor } from '@haklex/rich-editor'
import { RichRenderer } from '@haklex/rich-static-renderer'

<RichEditor extraNodes={[PollEditNode]}>{/* <PollPlugin /> */}</RichEditor>

<RichRenderer value={value} extraNodes={[PollNode]} />
```

### 步骤 4：插件化插入命令（推荐）

```ts
import { createCommand } from 'lexical'

export const INSERT_POLL_COMMAND = createCommand<{ question: string }>()
```

在插件中注册命令，所有 UI（按钮、slash、快捷键）统一 dispatch 该命令。

## 与聚合包配合

- 只想增强只读渲染：`@haklex/rich-renderers`
- 要增强编辑态：`@haklex/rich-renderers-edit`
- 想直接开箱即用：`@haklex/rich-kit-shiro`

## License

MIT
