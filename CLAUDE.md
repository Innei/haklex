# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Lexical-based rich editor ecosystem. Modular packages: core editor, UI primitives, content renderers, plugins, extensions, and integration bundles.

**Build**: Vite 7 + Vanilla Extract CSS-in-TS. ESM only (`.mjs`). TypeScript 5.9. Lexical 0.41.

## Terminology: Static / Edit Split

The editor ecosystem splits both **nodes** and **renderers** into static (read-only) and edit (editor-only) variants for bundle optimization.

### Four Concepts

| Term | Layer | Purpose | Example |
|------|-------|---------|---------|
| **Static Node** | Lexical node class | Deserialize JSON + `decorate()` returns `RendererWrapper`. No edit UI imports. | `CodeBlockNode`, `AlertQuoteNode` |
| **Edit Node** | Lexical node class | Extends static node, overrides `decorate()` to use edit decorator with heavy deps (Popover, NestedComposer, etc.) | `CodeBlockEditNode`, `AlertQuoteEditNode` |
| **Static Renderer** | React component | Display-only rendering. No `@haklex/rich-editor-ui` or `lucide-react` imports. | `AlertRenderer`, `MermaidRenderer` |
| **Edit Renderer** | React component | Adds edit UI (DropdownMenu, Popover, presentDialog). Imports `@haklex/rich-editor-ui`. | `AlertEditRenderer`, `MermaidEditRenderer` |

### Bundle Optimization Strategy

```
RichRenderer (read-only display)          RichEditor (full editing)
├── Static Nodes (config.ts)              ├── Edit Nodes (config-edit.ts)
├── Static Renderers                      ├── Edit Renderers
│   (enhancedRendererConfig)              │   (enhancedEditRendererConfig)
└── Zero edit UI deps                     └── Full edit UI deps
```

**Key principle**: `RichRenderer` entry imports only static nodes + static renderers, so bundlers tree-shake all edit UI deps (`@haklex/rich-editor-ui`, `lucide-react`, `LexicalNestedComposer`). `RichEditor` entry imports edit nodes + edit renderers that bring in these deps.

**Split criteria**: Only split when the edit path introduces heavy imports absent from the static path. If edit logic is just a boolean prop with no extra imports (e.g. CodeBlock's `editable`), no split needed.

### Registration

| Config file | Contains | Used by |
|-------------|----------|---------|
| `@haklex/rich-editor` `src/config.ts` | `customNodes` / `allNodes` (16 static nodes) | `RichRenderer` |
| `@haklex/rich-editor` `src/config-edit.ts` | `customEditNodes` / `allEditNodes` (edit variants) | `RichEditor` |
| `@haklex/rich-renderers` `src/config.ts` | `enhancedRendererConfig` (11 static renderers) | `ShiroRenderer` |
| `@haklex/rich-renderers-edit` `src/config.ts` | `enhancedEditRendererConfig` (12 edit renderers) | `ShiroEditor` |

## Package Dependency Graph

```
@haklex/rich-kit-shiro (integration bundle for web app)
├── @haklex/rich-editor (core: editor + renderer + nodes + plugins + styles)
│   ├── @haklex/rich-editor-ui (headless Dialog, Dropdown, Popover via @base-ui/react)
│   ├── @haklex/rich-headless (server-side Lexical node registry, zero React)
│   └── @haklex/rich-style-token (theme tokens, CSS variables, variant presets)
├── @haklex/rich-static-renderer (headless SSR engine, RichRenderer component)
├── @haklex/rich-renderers (static-only renderer aggregator)
│   └── @haklex/rich-renderer-{alert,banner,codeblock,image,linkcard,mention,mermaid,ruby,video}
├── @haklex/rich-renderers-edit (edit-only renderer aggregator, depends on rich-renderers)
│   └── edit renderers + edit nodes + FootnoteRenderer
├── @haklex/rich-ext-code-snippet (multi-file code snippet, CodeMirror + @dnd-kit)
│   └── @haklex/cm-editor (CodeMirror 6 base theme/language utilities)
├── @haklex/rich-ext-embed (URL embeds: Twitter, YouTube, Bilibili, Codesandbox, Gist, GitHub)
├── @haklex/rich-ext-excalidraw (Excalidraw whiteboard extension)
├── @haklex/rich-ext-gallery (image gallery with drag-reorder and lightbox)
├── @haklex/rich-plugin-block-handle (block add button + context menu)
├── @haklex/rich-plugin-floating-toolbar (text formatting toolbar)
├── @haklex/rich-plugin-link-edit (inline link editing popover)
├── @haklex/rich-plugin-mention (@ mention typeahead with platform selection)
├── @haklex/rich-plugin-slash-menu (typeahead slash commands)
├── @haklex/rich-plugin-table (cell resizing + row/column handles)
├── @haklex/rich-plugin-toolbar (top toolbar with formatting buttons)
└── @haklex/rich-renderer-katex (KaTeX edit nodes: KaTeXBlockEditNode, KaTeXInlineEditNode)

@haklex/rich-diff (standalone diff viewer, depends on core)
@haklex/rich-editor-demo (dev playground, depends on all)
```

## Commands

```bash
# Build
pnpm --filter @haklex/rich-editor build            # BUILD_LIB=1 vite build
pnpm --filter @haklex/rich-static-renderer build
pnpm --filter @haklex/rich-kit-shiro build
pnpm --filter @haklex/rich-renderers build
pnpm --filter @haklex/rich-renderers-edit build     # depends on rich-renderers

# Dev playground (hot reload, all features)
pnpm --filter @haklex/rich-editor-demo dev

# Watch mode for core iteration
pnpm --filter @haklex/rich-editor dev:build
```

## Foundation Packages

### @haklex/rich-style-token

Centralized theme tokens and CSS variables. Provides `createThemeStyle()`, variant presets (`articleTheme`, `noteTheme`, `commentTheme`), color constants (`darkColors`, `lightArticleColors`), layout constants, and `PortalThemeProvider` for shadow DOM theming. Used by nearly all packages.

### @haklex/rich-headless

Server-side Lexical node registry with zero React dependency. Exports `allHeadlessNodes` (20 node classes for JSON parsing), `allHeadlessTransformers`, and `$toMarkdown()`. Two entry points: `./` (nodes) and `./transformers` (markdown conversion).

### @haklex/cm-editor

Shared CodeMirror 6 utilities: `baseTheme`, `getThemeExtensions()`, `loadLanguageExtension()`. Used by `rich-ext-code-snippet` and `rich-renderer-codeblock` for code editing.

## Core: @haklex/rich-editor

Four entry points: `./` (all), `./editor` (RichEditor), `./static` (RichRenderer), `./styles` (CSS variables only).

### Directory Layout

- `src/nodes/` — 16 custom `DecoratorNode` types (Spoiler, Mention, KaTeXInline, KaTeXBlock, Image, AlertQuote, CodeBlock, Footnote, FootnoteSection, Video, LinkCard, Details, GridContainer, Banner, Mermaid, Ruby) + 5 edit variants (AlertQuoteEdit, BannerEdit, CodeBlockEdit, FootnoteSectionEdit, GridEdit)
- `src/plugins/` — 18 Lexical plugins (Alert, AutoFocus, AutoLink, BlockExit, BlockId, DragDrop, EditorRef, Footnote, HorizontalRule, Image, ImageUpload, KaTeX, MarkdownShortcuts, Mermaid, OnChange, SubmitShortcut)
- `src/styles/` — Vanilla Extract: 3 variants × 2 color schemes = 6 theme classes
- `src/transformers/` — 14 Markdown shortcut transformers (alert `>[!NOTE]`, KaTeX `$$`, mention `@`, spoiler `||`, footnote `[^1]`, ruby, container, grid, quote, superscript/subscript, insert, rich-blocks, code-block)
- `src/context/` — 5 contexts: `ColorSchemeContext` (light/dark), `RendererConfigContext` (custom renderer injection), `ImageUploadContext` (upload function injection), `FootnoteDefinitionsContext`, `NestedContentRendererContext`
- `src/components/renderers/` — built-in default renderers (Alert, Banner, CodeBlock, Footnote, FootnoteSection, Grid, Image, KaTeX, LinkCard, Mention, Mermaid, Ruby, Video) + static decorators (Alert, Banner, Grid)
- `src/components/decorators/` — edit decorators (Alert, Banner, CodeBlock, Grid)

**Context Provider value stability**: Never pass object literals as context provider `value`. Primitives (string, function) can be passed directly (e.g. `ColorSchemeContext`, `ImageUploadContext`). Objects must be wrapped in `useMemo` (e.g. `RendererConfigContext`).

### Custom Node Pattern

All custom content nodes extend `DecoratorNode<ReactElement>`:

```typescript
class FooNode extends DecoratorNode<ReactElement> {
  static importJSON(serialized) / exportJSON()
  decorate() → <RendererWrapper type="Foo" props={...} />
}
export function $createFooNode(payload): FooNode
export function $isFooNode(node): node is FooNode
```

`RendererWrapper` delegates to custom renderer (via `RendererConfig`) or falls back to built-in default.

### Node: Edit / Render Split

Nodes with heavy edit UI are split into two classes for tree-shaking:

| Base Node (render-only) | Edit Node (editor-only) | Edit Dependency |
|------------------------|------------------------|-----------------|
| `AlertQuoteNode` | `AlertQuoteEditNode` | `AlertEditDecorator` + LexicalNestedComposer |
| `BannerNode` | `BannerEditNode` | `BannerEditDecorator` + LexicalNestedComposer |
| `CodeBlockNode` | `CodeBlockEditNode` | `CodeBlockEditDecorator` |
| `FootnoteSectionNode` | `FootnoteSectionEditNode` | `FootnoteSectionEditRenderer` |
| `GridContainerNode` | `GridEditNode` | `GridEditDecorator` |
| `KaTeXBlockNode` | `KaTeXBlockEditNode`* | `KaTeXEditDecorator` + Popover |
| `KaTeXInlineNode` | `KaTeXInlineEditNode`* | `KaTeXEditDecorator` + Popover |

*KaTeX edit nodes live in `@haklex/rich-renderer-katex`, not in `rich-editor`.

**Base node** `decorate()` returns `RendererWrapper` (or lightweight read-only decorator). No edit UI imports.

**Edit node** extends base node, overrides `clone()` / `importJSON()` / `decorate()` to use the full edit decorator with heavy deps.

Config files:
- `src/config.ts` — `customNodes` / `allNodes` (render-only, used by `RichRenderer`)
- `src/config-edit.ts` — `customEditNodes` / `allEditNodes` (edit nodes, used by `RichEditor`)

**Adding a new node with edit UI**: Create base node with `RendererWrapper` in `decorate()`, then create `FooEditNode extends FooNode` overriding `decorate()` with edit decorator. Register base in `config.ts`, edit in `config-edit.ts`.

### Plugin Pattern

```typescript
export const INSERT_FOO_COMMAND = createCommand<Payload>('INSERT_FOO_COMMAND')
export function FooPlugin() {
  const [editor] = useLexicalComposerContext()
  useEffect(() => editor.registerCommand(INSERT_FOO_COMMAND, handler, COMMAND_PRIORITY_EDITOR), [editor])
  return null
}
```

## External Plugin Packages

Plugins extracted into separate packages for independent versioning and tree-shaking:

| Package | Key Export | Purpose |
|---------|-----------|---------|
| `@haklex/rich-plugin-block-handle` | `BlockHandlePlugin` | Block add button + context menu |
| `@haklex/rich-plugin-floating-toolbar` | `FloatingToolbarPlugin` | Text formatting floating toolbar |
| `@haklex/rich-plugin-link-edit` | `FloatingLinkEditorPlugin` | Inline link editing popover |
| `@haklex/rich-plugin-mention` | `MentionMenuPlugin` | @ mention typeahead with platform selection |
| `@haklex/rich-plugin-slash-menu` | `SlashMenuPlugin` | Typeahead slash commands for block insertion |
| `@haklex/rich-plugin-table` | `TableCellResizerPlugin`, `TableRowColumnHandlesPlugin` | Table cell resizing + row/column handles |
| `@haklex/rich-plugin-toolbar` | `ToolbarPlugin` | Top toolbar with formatting buttons, dropdowns, separators |

All plugin packages depend on `@haklex/rich-style-token` for theming and export `./style.css`.

## Extension Packages

Extensions add complete features (nodes + renderers + plugins) with heavy isolated dependencies:

| Package | Purpose | Key Deps |
|---------|---------|----------|
| `@haklex/rich-ext-code-snippet` | Multi-file code snippet with drag-reorder | `@haklex/cm-editor`, `@dnd-kit/*`, `shiki` |
| `@haklex/rich-ext-embed` | URL embeds (Twitter, YouTube, Bilibili, Codesandbox, Gist, GitHub) | `react-tweet`, `lucide-react` |
| `@haklex/rich-ext-excalidraw` | Excalidraw whiteboard (scene JSON + diff via jsondiffpatch) | `@excalidraw/excalidraw`, `jsondiffpatch` |
| `@haklex/rich-ext-gallery` | Image gallery with drag-reorder and lightbox | `@dnd-kit/*`, `react-photo-view`, `thumbhash` |

Extensions with static/edit split export dual entries: `./` (edit) and `./static` (render-only).

## Variant System

Controlled by `variant` prop + `ColorSchemeContext`. Theme CSS variables in `@haklex/rich-style-token` via `createThemeStyle()`.

| Variant | Font | Size | Line-height | Max-width | Use case |
|---------|------|------|-------------|-----------|----------|
| article | system sans-serif | 16px | 1.75 | 65ch | Blog posts |
| note | CJK serif (Noto Serif CJK SC) | 16px | 1.8 | 65ch | Personal notes |
| comment | system sans-serif | 14px | 1.5 | none | Inline comments |

## Renderer Config (Custom Renderer Injection)

```typescript
interface RendererConfig {
  Alert?, Banner?, CodeBlock?, CodeSnippet?, Component?, Footnote?,
  Gallery?, Image?, KaTeX?, LinkCard?, Mermaid?, Mention?,
  Ruby?, Tabs?, Video?
}
<RichEditor rendererConfig={...} />
<RichRenderer rendererConfig={...} />
```

## Individual Renderer Packages

`@haklex/rich-renderer-*` packages provide feature-specific renderers with heavy dependencies isolated:
- `alert` — GitHub-style alerts (info/warning/tip/caution/important)
- `banner` — Colored banner container with nested content
- `codeblock` — Shiki syntax highlighting
- `image` — Blurhash/thumbhash, captions, accent colors
- `katex` — KaTeX math equations (edit nodes only: `KaTeXBlockEditNode`, `KaTeXInlineEditNode`)
- `linkcard` — Link preview cards
- `mention` — Social platform mention badges
- `mermaid` — Mermaid diagram rendering
- `ruby` — Ruby annotation (furigana for Japanese text)
- `video` — Responsive video players

`@haklex/rich-renderers` aggregates all, with sub-path exports: `./codeblock`, `./mermaid`, etc.

### Renderer: Edit / Static Split

Renderer components with edit-only heavy deps are split into static and edit variants:

| Package | Static (display-only) | Edit (with edit UI) | Edit Dependency |
|---------|----------------------|---------------------|-----------------|
| `rich-renderer-alert` | `AlertRenderer` | `AlertEditRenderer` | DropdownMenu (`@haklex/rich-editor-ui`) |
| `rich-renderer-banner` | `BannerRenderer` | `BannerEditRenderer` | DropdownMenu + Popover (`@haklex/rich-editor-ui`) |
| `rich-renderer-codeblock` | `CodeBlockRenderer` | `CodeBlockEditRenderer` | CodeMirror edit overlay |
| `rich-renderer-image` | `ImageRenderer` | `ImageEditRenderer` | Upload/edit UI |
| `rich-renderer-mention` | `MentionRenderer` | `MentionEditRenderer` | Popover (`@haklex/rich-editor-ui`) + lucide-react |
| `rich-renderer-mermaid` | `MermaidRenderer` | `MermaidEditRenderer` | presentDialog (`@haklex/rich-editor-ui`) |
| `rich-renderer-ruby` | `RubyRenderer` | `RubyEditRenderer` | Edit markup UI |
| `rich-renderer-video` | `VideoRenderer` | `VideoEditRenderer` | Edit URL UI |
| `rich-ext-code-snippet` | `CodeSnippetRenderer` | `CodeSnippetEditRenderer` | CodeMirror + @dnd-kit |
| `rich-ext-excalidraw` | `ExcalidrawRenderer` | `ExcalidrawEditRenderer` | @excalidraw/excalidraw |
| `rich-ext-gallery` | `GalleryRenderer` | `GalleryEditRenderer` | @dnd-kit + upload UI |

Aggregator packages:
- `@haklex/rich-renderers` — static-only. `enhancedRendererConfig` (`src/config.ts`), for `RichRenderer`. No edit deps.
- `@haklex/rich-renderers-edit` — edit-only. `enhancedEditRendererConfig` (`src/config.ts`), for `RichEditor`. Spreads `enhancedRendererConfig` and overrides with edit variants. Also re-exports `FootnoteRenderer`.

**Split criteria**: Only split when the edit path imports heavy deps (`@haklex/rich-editor-ui` components, `lucide-react` icons) absent from the static path. If edit logic is just a boolean flag with no extra imports, splitting adds complexity with no bundle benefit.

**Adding a new renderer with edit UI**: Create `FooRenderer` (static) and `FooEditRenderer` (edit) in the same package. Export static from `./static` entry, edit from `./` entry. Add static to `enhancedRendererConfig` in `@haklex/rich-renderers`, edit to `enhancedEditRendererConfig` in `@haklex/rich-renderers-edit`.

## Integration: @haklex/rich-kit-shiro

Production bundle for the web app. Combines core + all renderers + all plugins + extensions.

```typescript
import '@haklex/rich-kit-shiro/style.css'
import { RichEditor } from '@haklex/rich-kit-shiro/editor'       // → enhancedEditRendererConfig
import { RichRenderer } from '@haklex/rich-kit-shiro/renderer'   // → enhancedRendererConfig

// Additional entry points:
import '@haklex/rich-kit-shiro/editor-core'     // core editor without renderers
import '@haklex/rich-kit-shiro/excalidraw'      // Excalidraw extension
import '@haklex/rich-kit-shiro/markdown'        // markdown conversion utilities
import '@haklex/rich-kit-shiro/nodes'           // all node classes
import '@haklex/rich-kit-shiro/plugins'         // all plugins
import '@haklex/rich-kit-shiro/renderers'       // static renderer config
import '@haklex/rich-kit-shiro/renderers-edit'  // edit renderer config
import '@haklex/rich-kit-shiro/style'           // style utilities
```

`ShiroEditor` uses `enhancedEditRendererConfig` (edit renderers). `ShiroRenderer` uses `enhancedRendererConfig` (static renderers). This ensures the renderer entry tree-shakes all edit UI deps (DropdownMenu, Popover, presentDialog, lucide-react edit icons).

## Diff Viewer (@haklex/rich-diff)

```typescript
<RichDiff oldValue={...} newValue={...} variant="article" />
```

Compares two `SerializedEditorState` at node level. Side-by-side layout with insert/delete highlighting.

## Build Configuration

Shared Vite config factory in `haklex/vite.shared.ts` (`createViteConfig()`). Each package's `vite.config.ts` calls it with package-specific options (entry points, vanillaExtract toggle).

- Auto-externalizes all `dependencies` + `peerDependencies` from each package's `package.json`
- Vanilla Extract plugin for CSS-in-TS → static CSS (zero runtime)
- Output: ESM `.mjs` + `.d.ts` declarations (via `vite-plugin-dts`)
- Target: ES2020, no minification for JS, CSS minified

## Styling

Vanilla Extract (`*.css.ts` files) throughout. No Tailwind in editor packages. Theme contract defines CSS variables for colors, spacing, typography, and border-radius. Each variant+colorScheme combination produces a class name applied to the editor root.

### Neutral colors

Use a **neutral** (gray) color palette for secondary/muted text, borders, section labels, and descriptions—e.g. `#737373` / `#a3a3a3` (Tailwind neutral-500/400). Avoid tinted grays (slate, zinc, blue-gray) unless a design explicitly requires them. This keeps UI elements like slash menu sections and descriptions hue-neutral.
