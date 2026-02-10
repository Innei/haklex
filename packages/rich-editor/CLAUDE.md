# @shiro/rich-editor

Lexical-based rich text editor/renderer package, completely independent from the main Shiroi project (`src/`).

## Tech Stack

- **Editor**: Lexical
- **Styling**: vanilla-extract (NOT Tailwind)
- **Build**: Vite (library mode)
- **Syntax Highlighting**: Shiki (optional peer dep)
- **Math**: KaTeX (optional peer dep)
- **Data Format**: Lexical SerializedEditorState JSON

## Architecture

```
src/
  components/       # RichEditor, RichRenderer, ContentEditable
    renderers/      # DecoratorNode renderers (CodeBlock, Image, KaTeX, Mention)
  nodes/            # Custom Lexical nodes
  plugins/          # Lexical editor plugins
  transformers/     # Markdown shortcut transformers
  styles/           # vanilla-extract CSS (.css.ts)
    nodes/          # Node-specific styles
dev/                # Development playground (vite dev server)
```

## Commands

```bash
pnpm dev       # Dev playground at localhost:5188
pnpm build     # Library build (BUILD_LIB=1 vite build)
pnpm dev:build # Watch mode library build
```

## Exports

- `.` - RichEditor + RichRenderer + all nodes/styles/types
- `./editor` - RichEditor only (tree-shake friendly)
- `./renderer` - RichRenderer only (tree-shake friendly)
- `./style.css` - Compiled CSS

## Conventions

- All CSS class names use `rich-` prefix (e.g., `rich-paragraph`, `rich-heading-h1`)
- Nodes: `$createXxxNode()` creator + `$isXxxNode()` type guard + getter/setter methods
- Plugins: Register commands via `COMMAND_PRIORITY_EDITOR`, export command constants
- Transformers: TextMatchTransformer with `importRegExp`, `regExp`, `trigger`
- No imports from main project `src/` - must remain fully independent

## Demo Update Protocol

**CRITICAL**: Every time you implement a new component, node, renderer, or transformer, you MUST update the demo site:

1. **Node samples** - Add to `packages/rich-editor-demo/src/fixtures/node-samples.ts` with example data
2. **Presets** - Update `packages/rich-editor-demo/src/fixtures/presets.ts` to include the new feature

This ensures all features are immediately visible and testable in the demo site.

## Two Variants

- **article** - Prose-style, `65ch` max-width, larger typography
- **comment** - Compact, tighter spacing, smaller fonts

## Migration Source Reference

本包的目标是将 Shiroi 主项目的 Markdown 渲染能力以 Lexical Block 形式重新实现。以下为主项目中需要迁移的源码位置索引。

### Core Markdown Renderer

- `apps/web/src/components/ui/markdown/Markdown.tsx` - 主渲染器，markdown-to-jsx + 全部自定义语法
- `apps/web/src/components/ui/markdown/index.ts` - 模块导出

### Parsers (Custom Syntax)

- `apps/web/src/components/ui/markdown/parsers/container.tsx` - `::: type` 容器语法 (gallery, carousel, banner, grid, masonry)
- `apps/web/src/components/ui/markdown/parsers/spoiler.tsx` - `||text||` 剧透语法
- `apps/web/src/components/ui/markdown/parsers/katex.tsx` - `$inline$` / `$$block$$` 数学公式
- `apps/web/src/components/ui/markdown/parsers/mention.tsx` - `{GH@user}` / `[Name]{GH@user}` 社交提及
- `apps/web/src/components/ui/markdown/parsers/ins.tsx` - `++text++` 插入/下划线语法

### Renderers (Element Overrides)

- `apps/web/src/components/ui/markdown/renderers/heading.tsx` - 标题 + 锚点链接
- `apps/web/src/components/ui/markdown/renderers/image.tsx` - 图片 (blurhash, lazy load, zoom, video detection)
- `apps/web/src/components/ui/markdown/renderers/tabs.tsx` - Tabs/Tab 选项卡容器
- `apps/web/src/components/ui/markdown/renderers/spoiler.tsx` - 剧透组件 (hover reveal)
- `apps/web/src/components/ui/markdown/renderers/video.tsx` - 视频播放器
- `apps/web/src/components/ui/markdown/renderers/paragraph.tsx` - 段落 (block link detection, image unwrap)
- `apps/web/src/components/ui/markdown/renderers/blockqoute.tsx` - 引用 + Git-style alerts (`> [!NOTE]`)
- `apps/web/src/components/ui/markdown/renderers/alert.tsx` - Alert 类型 (NOTE/IMPORTANT/WARNING/TIP/CAUTION) + icons
- `apps/web/src/components/ui/markdown/renderers/collapse.tsx` - `<details>` 折叠块
- `apps/web/src/components/ui/markdown/renderers/footnotes.tsx` - 脚注引用 + 回链
- `apps/web/src/components/ui/markdown/renderers/table.tsx` - 表格 (overflow scroll)
- `apps/web/src/components/ui/markdown/renderers/LinkRenderer.tsx` - 链接卡片 (GitHub/Tweet/Bilibili/YouTube/arxiv 等 20+ 平台)

### UI Components

- `apps/web/src/components/ui/gallery/Gallery.tsx` - 图片画廊 (carousel, responsive)
- `apps/web/src/components/ui/banner/Banner.tsx` - Banner/Callout (warning/error/success/info)
- `apps/web/src/components/ui/link-card/LinkCard.tsx` - 链接预览卡片
- `apps/web/src/components/ui/link-card/ShadowLinkCard.tsx` - Shadow DOM 隔离的链接卡片
- `apps/web/src/components/ui/link-card/plugins/` - 20+ 平台特定的 LinkCard 渲染插件
- `apps/web/src/components/ui/katex/index.tsx` - KaTeX 渲染组件
- `apps/web/src/components/ui/tabs/Tabs.tsx` - Radix UI Tabs
- `apps/web/src/components/ui/collapse/Collapse.tsx` - 折叠组件
- `apps/web/src/components/ui/media/VideoPlayer.tsx` - 视频播放器 (完整UI控制)
- `apps/web/src/components/modules/shared/CodeBlock.tsx` - 代码块 (Shiki + Mermaid + Excalidraw + line numbers + copy)

### Providers

- `apps/web/src/providers/article/MarkdownImageRecordProvider.tsx` - 图片元数据 (width/height/blurhash/accent)
- `apps/web/src/providers/shared/WrappedElementProvider.tsx` - 元素尺寸追踪

### Utilities

- `apps/web/src/components/ui/markdown/utils/parser.ts` - 解析器工具函数
- `apps/web/src/components/ui/markdown/utils/image.ts` - Markdown 图片提取
- `apps/web/src/components/ui/markdown/utils/get-id.ts` - 脚注 DOM ID 生成
- `apps/web/src/components/ui/markdown/utils/redHighlight.tsx` - 红色闪烁高亮动画

### Styles

- `apps/web/src/components/ui/markdown/markdown.css` - 核心 Markdown 样式
- `apps/web/src/components/ui/markdown/markdown-variants.css` - 变体样式
- `apps/web/src/components/ui/markdown/renderers/index.css` - 渲染器样式

### Variant Renderers

- `apps/web/src/components/modules/note/NoteTopicMarkdownRender.tsx` - 笔记话题简化渲染
- `apps/web/src/components/modules/comment/CommentMarkdown.tsx` - 评论受限渲染

---

# TODO

## Nodes - Missing

- [x] **FootnoteNode** - `[^1]` footnote references with popover preview
  - Ref: `src/components/ui/markdown/renderers/footnotes.tsx`
  - Ref: `src/components/ui/markdown/utils/get-id.ts`
- [x] **TaskListItemNode** - `- [ ]` / `- [x]` checkbox task lists (GFM)
- [x] **VideoNode** - Video embeds (DecoratorNode)
  - Ref: `src/components/ui/markdown/renderers/video.tsx`
- [x] **LinkCardNode** - Rich link preview cards (DecoratorNode)
  - Ref: `src/components/ui/link-card/LinkCard.tsx`
  - Ref: `src/components/ui/link-card/ShadowLinkCard.tsx`
  - Ref: `src/components/ui/link-card/plugins/` (20+ platform plugins)
  - Ref: `src/components/ui/markdown/renderers/LinkRenderer.tsx`
- [x] **TabsNode** - `<Tabs>` container for tabbed content
  - Ref: `src/components/ui/markdown/renderers/tabs.tsx`
  - Ref: `src/components/ui/tabs/Tabs.tsx`
- [x] **DetailsNode** - `<Details>` / `<summary>` collapsible blocks
  - Ref: `src/components/ui/markdown/renderers/collapse.tsx`
  - Ref: `src/components/ui/collapse/Collapse.tsx`
- [x] **GalleryNode** - Image gallery with masonry/grid layout
  - Ref: `src/components/ui/markdown/parsers/container.tsx` (`::: gallery`, `::: carousel`)
  - Ref: `src/components/ui/gallery/Gallery.tsx`
- [x] **GridContainerNode** - `::: grid` layout container with cols/gap params
  - Ref: `src/components/ui/markdown/parsers/container.tsx` (`::: grid{cols=X,gap=Y}`, `::: masonry`)
- [x] **BannerNode** - Banner/callout with custom background, distinct from AlertQuote
  - Ref: `src/components/ui/banner/Banner.tsx`
  - Ref: `src/components/ui/markdown/parsers/container.tsx` (`::: banner`)

## Nodes - Fixes & Enhancements

- [x] **SpoilerNode** - Click-to-reveal toggle with keyboard accessibility (Enter/Space). Only active in renderer mode
  - Impl: `src/nodes/SpoilerNode.ts`, `src/styles/shared.css.ts` (`.rich-spoiler-revealed`)
- [x] **CodeBlockNode** - Shiki theme auto-switches via ColorSchemeContext (github-light/github-dark). Mermaid/Excalidraw support deferred
  - Impl: `src/components/renderers/CodeBlockRenderer.tsx`, `src/context/ColorSchemeContext.tsx`
- [x] **MentionNode** - Added TG (Telegram), `[DisplayName]{GH@user}` syntax with custom display names
  - Impl: `src/nodes/MentionNode.ts`, `src/components/renderers/MentionRenderer.tsx`, `src/transformers/mention.ts`
- [x] **ImageNode** - Added `blurhash`/`accent` fields, lazy load (`loading="lazy"`), accent color placeholder, fade-in, click-to-zoom overlay. URL validation rejects `javascript:`/`vbscript:`/`data:` non-image
  - Impl: `src/nodes/ImageNode.ts`, `src/components/renderers/ImageRenderer.tsx`, `src/styles/shared.css.ts`
- [x] **AlertQuoteNode** - Render alert icons per type. Support Git-style alert syntax (`> [!NOTE]`)
  - Impl: `src/nodes/AlertQuoteNode.ts` (SVG icons + colored header in createDOM)

## Transformers

- [x] **Container transformer** - `::: note`, `::: warning`, `::: tip` etc. block-level transformer
  - Impl: `src/transformers/container.ts`
- [x] **Insert text transformer** - `++inserted text++` underline/insert syntax
  - Impl: `src/transformers/insert.ts`
- [x] **Footnote transformer** - `[^1]` reference + `[^1]: definition` block
  - Impl: `src/transformers/footnote.ts`
- [x] **Task list transformer** - `- [ ]` / `- [x]` checkbox syntax
  - Impl: `src/transformers/tasklist.ts`
- [x] **Git alert transformer** - `> [!NOTE]`, `> [!WARNING]` etc. blockquote-based alert syntax
  - Impl: `src/transformers/alert.ts`

## Plugins - Missing

- [x] **DragDropPlugin** - Block-level drag handle + drop indicator for reordering. Opt-in (not auto-enabled)
  - Impl: `src/plugins/DragDropPlugin.tsx`, `src/styles/shared.css.ts`
- [x] **ImageUploadPlugin** - Handles paste/drop image files, calls user-provided `onUpload(file)` callback. Opt-in
  - Impl: `src/plugins/ImageUploadPlugin.tsx`
- [x] **AutoLinkPlugin** - Auto-detect URLs and emails, convert to AutoLinkNode. Custom matchers via `matchers` prop
  - Impl: `src/plugins/AutoLinkPlugin.tsx`
- [x] **FloatingToolbarPlugin** - Selection-based floating toolbar with Bold/Italic/Underline/Strikethrough/Code/Link. Portal-rendered, opt-in
  - Impl: `src/plugins/FloatingToolbarPlugin.tsx`, `src/styles/shared.css.ts`
- [x] **TabIndentPlugin** - Already using `TabIndentationPlugin` from `@lexical/react` in RichEditor
  - Impl: `src/components/RichEditor.tsx` (line 7, 85)

## Renderers - Implementation Status

### Basic Renderers (in rich-editor package)

- [x] **VideoRenderer** - Simple HTML5 video with controls ✅
  - Impl: `src/components/renderers/VideoRenderer.tsx`
- [x] **FootnoteRenderer** - Basic anchor link with `[n]` format ✅
  - Impl: `src/components/renderers/FootnoteRenderer.tsx`
- [x] **ImageRenderer** - Simple img with caption ✅
  - Impl: `src/components/renderers/ImageRenderer.tsx`
- [x] **CodeBlockRenderer** - Plain pre+code with Shiki ✅
  - Impl: `src/components/renderers/CodeBlockRenderer.tsx`
- [x] **LinkCardRenderer** (basic) - Simple card with title/desc/image ✅
  - Impl: `src/components/renderers/LinkCardRenderer.tsx`
- [x] **GalleryRenderer** (basic) - CSS grid/masonry layout ✅
  - Impl: `src/components/renderers/GalleryRenderer.tsx`

### Enhanced Renderers (standalone packages)

- [x] **@shiro/rich-renderer-linkcard** - 完整 LinkCard + plugin system ✅
  - Location: `packages/rich-renderer-linkcard/`
  - Features: 12 plugins, spotlight effect, dynamic fetch, lazy loading
  - Status: 基础架构完成，GitHub repo plugin 实现，其余 11 个 plugins 待迁移
  - See: `packages/RENDERER_PACKAGES.md`

- [x] **@shiro/rich-renderer-gallery** - 完整 Gallery with carousel & autoplay ✅
  - Location: `packages/rich-renderer-gallery/`
  - Features: Carousel mode, autoplay, photo-view zoom, 3 layouts
  - Status: 完成
  - See: `packages/RENDERER_PACKAGES.md`

### Main Project Adapters

- [x] **apps/web 适配层** ✅
  - Location: `apps/web/src/lib/rich-editor-renderers.tsx`
  - 将主项目组件适配为 RendererConfig 接口
  - VideoPlayer, LinkCard, Gallery

**所有 renderer 已实现简易版本，通过 RendererConfig 可覆写。**
**复杂实现已单列为独立子包：`@shiro/rich-renderer-*`。**

## Styling

- [x] **Dark theme** - Added `darkArticleVariant`, `darkCommentVariant` with shared base class pattern. ColorSchemeContext propagates to renderers
  - Impl: `src/styles/vars.css.ts`, `src/styles/article.css.ts`, `src/styles/comment.css.ts`, `src/context/ColorSchemeContext.tsx`
- [x] **Remove dead vanilla-extract style exports** - Deleted all unused `style()` exports from `src/styles/nodes/*.css.ts` (15 files) and `src/styles/editor.css.ts`. Components use plain string class names styled via `globalStyle()` in `shared.css.ts` and variant files. Cleaned `styles/index.ts` barrel export
- [x] **Alert icons** - SVG octicons rendered in AlertQuoteNode createDOM, colored per type
  - Impl: `src/nodes/AlertQuoteNode.ts`, `src/styles/shared.css.ts`
- [x] **Spoiler reveal animation** - CSS transition for click-to-reveal toggle
  - Impl: `src/styles/shared.css.ts` (`.rich-spoiler-revealed`)
- [x] **Code block line numbers** - Optional `showLineNumbers` prop on CodeBlockRenderer. CSS counter on `.line` spans (Shiki + fallback)
  - Impl: `src/components/renderers/CodeBlockRenderer.tsx`, `src/styles/shared.css.ts`
- [x] **Code block header** - Language label and copy button in code block header
  - Impl: `src/components/renderers/CodeBlockRenderer.tsx`, `src/styles/shared.css.ts`
- [x] **Heading anchor links** - Clickable `#` anchor on heading hover via HeadingAnchorPlugin
  - Impl: `src/plugins/HeadingAnchorPlugin.tsx`, `src/styles/shared.css.ts`

## Dev Playground

- [x] **Populate initial content** - Editor loads sample document with headings, alerts, code block, lists, tasks, math, image, tabs, details, link card
  - Impl: `packages/rich-editor-demo/src/fixtures/initial-content.ts`, `packages/rich-editor-demo/src/pages/EditorPage.tsx`
- [x] **Theme switcher** - Light/dark mode toggle with `colorScheme` prop. Dark CSS overrides in demo.css
  - Impl: `packages/rich-editor-demo/src/pages/EditorPage.tsx`, `packages/rich-editor-demo/src/demo.css`
- [x] **Import/export** - JSON import panel with textarea + Load button. JSON export already available via JSON view + Copy
  - Impl: `packages/rich-editor-demo/src/pages/EditorPage.tsx`

## Performance

- [x] **OnChangePlugin debounce** - Added `debounceMs` prop with proper cleanup
  - Impl: `src/plugins/OnChangePlugin.tsx`
- [x] **EditorRefPlugin** - Stabilized `onEditorReady` with internal `useRef` pattern, no longer requires stable callback
  - Impl: `src/plugins/EditorRefPlugin.tsx`

## Known Issues

- `$isXxxNode()` type guards use `instanceof` which can fail across module boundaries. Consider migrating to `$isNodeOfType()` from Lexical
- `dangerouslySetInnerHTML` in CodeBlockRenderer and KaTeXRenderer - Shiki and KaTeX outputs are trusted, but should be documented for security awareness
