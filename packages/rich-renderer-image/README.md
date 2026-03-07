# @haklex/rich-renderer-image

图片渲染器，支持 Thumbhash 模糊占位、灯箱预览和编辑器内图片管理。

## 安装

```bash
pnpm add @haklex/rich-renderer-image @haklex/rich-editor
```

## 导出

```ts
export { ImageRenderer } from './ImageRenderer'
export { ImageEditRenderer } from './ImageEditRenderer'
```

## 功能

- Thumbhash 模糊占位 + 渐显加载动画
- 图片灯箱（react-photo-view）
- 图片说明（caption）
- 加载 / 错误状态
- 编辑模式：替换、元信息编辑、复制、删除、下载

## 架构

```
ImageRenderer          — 静态渲染（灯箱 + thumbhash）
ImageEditRenderer      — 编辑模式入口，mode !== 'editor' 时回退到 ImageRenderer
├── ImageEditContext    — Jotai Provider，管理编辑状态 atoms
├── ImageEditToolbar   — 悬浮工具栏（元信息 / 替换 / 打开 / 复制 / 下载 / 删除）
├── EditMetaPopover    — 编辑 src / alt / caption
├── ReplacePopover     — 替换图片（上传 / URL）
├── ReplacePanel       — Upload / URL 切换面板
├── useImageActions    — 所有编辑操作 hooks
└── atoms              — Jotai atoms（src, loadState, hovering, replace 状态等）
```

## 使用

```tsx
import { ImageRenderer } from '@haklex/rich-renderer-image'
import type { RendererConfig } from '@haklex/rich-editor'

// 静态渲染
const config: RendererConfig = {
  Image: ImageRenderer,
}

// 编辑模式
import { ImageEditRenderer } from '@haklex/rich-renderer-image'

const editConfig: RendererConfig = {
  Image: ImageEditRenderer,
}
```

## 样式

Vanilla Extract CSS-in-TS。所有样式类通过 `semanticClassNames` 导出语义化 class 名，便于外部覆盖。

加载动画：img 初始 `opacity: 0`，加载完成后通过 `imageVisible` class 施加 `opacity: 1` + mask 渐显动画。

## 依赖

| 包 | 用途 |
|---|------|
| `@haklex/rich-editor` | 核心类型、节点操作、上传上下文 |
| `@haklex/rich-editor-ui` | Popover、SegmentedControl |
| `jotai` | 编辑状态管理 |
| `lucide-react` | 工具栏图标 |
| `react-photo-view` | 灯箱 |
| `thumbhash` | 模糊占位图解码 |

## License

MIT
