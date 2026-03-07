# Haklex

A modular rich text editor ecosystem built on [Lexical](https://lexical.dev/). Designed for content-heavy applications with full support for editing, static rendering, and server-side parsing — all from a single schema.

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Package Overview](#package-overview)
- [Variant System](#variant-system)
- [Usage](#usage)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Key Features

- **Rich Block Types** — Images, videos, code blocks, Mermaid diagrams, KaTeX math, Excalidraw whiteboards, embeds (YouTube, Twitter, Bilibili), galleries, link cards, mentions, and more
- **Static / Edit Split** — Separate node and renderer trees for read-only display vs. full editing, enabling aggressive tree-shaking
- **SSR-Ready** — `RichRenderer` renders Lexical JSON to React without loading the editor runtime
- **Server-Side Parsing** — `@haklex/rich-headless` provides a zero-React node registry for backend use (Lexical JSON → Markdown)
- **Variant Theming** — Three typographic presets (`article`, `note`, `comment`) with light/dark color scheme support
- **Zero-Runtime CSS** — All styles authored in Vanilla Extract (CSS-in-TS), compiled to static CSS at build time
- **Plugin Architecture** — Slash menu, floating toolbar, block handle, table controls, mention typeahead, link editor, and top toolbar — all composable
- **Diff Viewer** — `@haklex/rich-diff` renders side-by-side diffs of two editor states

## Tech Stack

| Category | Technology |
| --- | --- |
| **Language** | TypeScript 5.9 |
| **Editor Core** | Lexical 0.41 |
| **UI Framework** | React 19 |
| **UI Primitives** | Base UI (`@base-ui/react`) |
| **Build** | Vite 7, Turbo |
| **Styling** | Vanilla Extract (CSS-in-TS) |
| **Code Highlighting** | Shiki 4, CodeMirror 6 |
| **Package Manager** | pnpm 10 |
| **Module Format** | ESM only (`.mjs`) |

## Prerequisites

- **Node.js** 20 or higher
- **pnpm** 10 (install via `corepack enable && corepack prepare pnpm@latest --activate`)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/innei-template/haklex.git
cd haklex
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start the Development Playground

```bash
pnpm dev
```

This launches the demo app from `demo/` at [http://localhost:5188](http://localhost:5188) with all editor features, plugins, and extensions loaded. Hot module replacement is enabled across all workspace packages — edits to any `@haklex/*` source file reflect immediately.

### 4. Build All Packages

```bash
pnpm build
```

Turbo runs builds in dependency order. Each package outputs ESM (`.mjs`) and TypeScript declarations (`.d.ts`) to its `dist/` directory.

## Architecture

### Static / Edit Split

The ecosystem splits nodes and renderers into **static** (read-only) and **edit** (editor-only) variants for tree-shaking:

- **Static Node/Renderer** — Display-only. No `@haklex/rich-editor-ui` or `lucide-react` imports. Used by `RichRenderer`.
- **Edit Node/Renderer** — Extends the static variant. Adds heavy deps (Popover, DropdownMenu, NestedComposer). Used by `RichEditor`.

Only split when the edit path introduces heavy imports absent from the static path.

### Directory Structure

```
haklex/
├── demo/                        # Development playground
├── packages/
│   ├── rich-editor/              # Core editor (nodes, plugins, styles, contexts)
│   ├── rich-editor-ui/           # UI primitives (Dialog, Dropdown, Popover, Combobox)
│   ├── rich-headless/            # Server-side node registry (zero React)
│   ├── rich-style-token/         # Theme tokens, CSS variables, variant presets
│   ├── rich-static-renderer/     # SSR engine (RichRenderer component)
│   ├── rich-renderers/           # Static renderer aggregator
│   ├── rich-renderers-edit/      # Edit renderer aggregator
│   ├── rich-renderer-*/          # Individual renderers (alert, banner, codeblock, image, ...)
│   ├── rich-plugin-*/            # Editor plugins (toolbar, slash-menu, block-handle, ...)
│   ├── rich-ext-*/               # Heavy extensions (code-snippet, embed, excalidraw, gallery, nested-doc)
│   ├── rich-kit-shiro/           # Integration bundle for Shiroi (ShiroEditor + ShiroRenderer)
│   ├── rich-diff/                # Diff viewer
│   └── cm-editor/                # Shared CodeMirror 6 utilities
├── vite.shared.ts                # Shared Vite config factory
├── turbo.json                    # Build orchestration
├── bump.config.ts                # Version sync (bumpp)
└── eslint.config.mjs             # Lint config (eslint-config-hyoban)
```

### Dependency Graph

```
@haklex/rich-kit-shiro (integration bundle)
├── @haklex/rich-editor (core)
│   ├── @haklex/rich-editor-ui
│   ├── @haklex/rich-headless
│   └── @haklex/rich-style-token
├── @haklex/rich-static-renderer
├── @haklex/rich-renderers
├── @haklex/rich-renderers-edit
├── @haklex/rich-ext-{code-snippet, embed, excalidraw, gallery, nested-doc}
├── @haklex/rich-plugin-{block-handle, floating-toolbar, link-edit, mention, slash-menu, table, toolbar}
└── @haklex/rich-renderer-katex

@haklex/rich-diff (standalone)
```

## Package Overview

### Core

| Package | Description |
| --- | --- |
| `@haklex/rich-editor` | Core editor component, all builtin + custom Lexical nodes, built-in plugins, editor contexts |
| `@haklex/rich-editor-ui` | Headless UI primitives — Dialog, Dropdown, Popover, Combobox, Tooltip, ColorPicker, AnimatedTabs |
| `@haklex/rich-headless` | Zero-React node registry for server-side Lexical JSON → Markdown conversion |
| `@haklex/rich-style-token` | Design tokens, CSS variables, and variant presets |
| `@haklex/rich-static-renderer` | `RichRenderer` — renders Lexical JSON to React without loading the editor |

### Renderers

Each renderer has a **static** variant (display-only) and an **edit** variant (interactive controls):

| Package | What it renders |
| --- | --- |
| `rich-renderer-alert` | Alert / callout blocks (note, tip, important, warning, caution) |
| `rich-renderer-banner` | Banner blocks (info, success, warning, error) |
| `rich-renderer-codeblock` | Syntax-highlighted code with Shiki |
| `rich-renderer-image` | Images with blurhash placeholder and lightbox |
| `rich-renderer-video` | Video player |
| `rich-renderer-linkcard` | Rich link previews with metadata |
| `rich-renderer-mention` | Social mention badges with platform icons |
| `rich-renderer-mermaid` | Mermaid diagrams with zoom/pan |
| `rich-renderer-ruby` | Ruby annotations for CJK text |
| `rich-renderer-katex` | KaTeX math (inline and block) |

Aggregated by `@haklex/rich-renderers` (static) and `@haklex/rich-renderers-edit` (edit).

### Plugins

| Package | Description |
| --- | --- |
| `rich-plugin-block-handle` | Drag handle with add button and context menu |
| `rich-plugin-floating-toolbar` | Selection-based floating formatting toolbar |
| `rich-plugin-link-edit` | Link editing popover |
| `rich-plugin-mention` | @mention typeahead with platform support (GitHub, Twitter, etc.) |
| `rich-plugin-slash-menu` | `/` command menu for content insertion |
| `rich-plugin-table` | Table row/column resize and manipulation |
| `rich-plugin-toolbar` | Top toolbar for formatting controls |

### Extensions

| Package | Description |
| --- | --- |
| `rich-ext-code-snippet` | Multi-file tabbed code display with drag-and-drop |
| `rich-ext-embed` | URL embeds — YouTube, Twitter, Bilibili, CodeSandbox, GitHub Gist |
| `rich-ext-excalidraw` | Excalidraw whiteboard integration |
| `rich-ext-gallery` | Image gallery with grid and carousel layouts |
| `rich-ext-nested-doc` | Nested document / card content blocks |

### Integration & Utilities

| Package | Description |
| --- | --- |
| `@haklex/rich-kit-shiro` | Pre-configured bundle — `ShiroEditor` and `ShiroRenderer` with all plugins and extensions |
| `@haklex/rich-diff` | Diff viewer for comparing two editor states |
| `@haklex/cm-editor` | Shared CodeMirror 6 editor utilities |

## Variant System

Three typographic presets control font family, size, and spacing:

| Variant | Font | Base Size | Use Case |
| --- | --- | --- | --- |
| `article` | Sans-serif | 16px | Blog posts, documentation |
| `note` | CJK serif | 16px | Personal notes, journals |
| `comment` | Sans-serif | 14px | Comments, compact content |

Set via the `variant` prop on `RichEditor` or `RichRenderer`. Color scheme (light/dark) is managed through `ColorSchemeContext`.

## Usage

### Editor (Full Editing Experience)

```tsx
import { RichEditor } from '@haklex/rich-editor'
import '@haklex/rich-editor/style.css'

function MyEditor() {
  return (
    <RichEditor
      variant="article"
      initialValue={savedEditorState}
      onChange={(value) => save(value)}
      imageUpload={uploadHandler}
      placeholder="Start writing..."
    />
  )
}
```

### Static Renderer (Read-Only Display)

```tsx
import { RichRenderer } from '@haklex/rich-static-renderer'
import '@haklex/rich-editor/style.css'

function MyArticle({ content }) {
  return (
    <RichRenderer
      value={content}
      variant="article"
      theme="light"
    />
  )
}
```

### Server-Side Parsing (Lexical JSON → Markdown)

```ts
import { createHeadlessEditor } from '@lexical/headless'
import { allHeadlessNodes, $toMarkdown } from '@haklex/rich-headless'

const editor = createHeadlessEditor({ nodes: allHeadlessNodes })

editor.setEditorState(editor.parseEditorState(lexicalJsonString))
editor.read(() => {
  const markdown = $toMarkdown()
  console.log(markdown)
})
```

### Integration Bundle (Shiroi)

```tsx
import { ShiroEditor, ShiroRenderer } from '@haklex/rich-kit-shiro'
import '@haklex/rich-kit-shiro/style.css'

// Editor with all plugins and extensions pre-configured
<ShiroEditor variant="article" onChange={handleChange} />

// Renderer with all renderers pre-configured
<ShiroRenderer value={editorState} variant="article" />
```

## Available Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start development playground on port 5188 |
| `pnpm build` | Build all packages (Turbo, dependency-ordered) |
| `pnpm build:packages` | Build all workspace packages under `packages/` |
| `pnpm --filter @haklex/rich-editor build` | Build a single package |
| `pnpm --filter @haklex/rich-editor dev:build` | Watch mode for a single package |
| `pnpm lint` | Lint all packages |
| `npx eslint path/to/file.ts` | Lint a single file |
| `npx prettier --write path/to/file.ts` | Format a single file |
| `npx vitest run packages/rich-renderer-katex/tests/` | Run tests for a specific package |
| `pnpm release:rich` | Bump version, build, and publish all `@haklex/*` to npm |

## Testing

Tests use [Vitest](https://vitest.dev/). Run specific package tests:

```bash
npx vitest run packages/rich-renderer-katex/tests/
```

## Downstream Consumers

| Project | Stack | Package | Integration |
| --- | --- | --- | --- |
| **Shiroi** | Next.js | `@haklex/rich-kit-shiro` | Native React |
| **admin-vue3** | Vue 3 | Multiple `@haklex/*` | React-in-Vue bridge (`createRoot()` inside Vue `defineComponent`) |
| **mx-core** | NestJS | `@haklex/rich-headless` | Server-side Lexical JSON → Markdown |

## Contributing

All `@haklex/*` packages share a single version number (currently managed by [bumpp](https://github.com/antfu-collective/bumpp)). The version source of truth is `packages/rich-editor/package.json`.

Key conventions:

- **React 19**: Use `use(Context)` instead of `useContext()` (enforced by ESLint rule `react/no-use-context`)
- **Styling**: Vanilla Extract (`.css.ts`) only — no Tailwind in editor packages
- **Neutral colors**: `#737373` / `#a3a3a3` (neutral-500/400) for muted text and borders
- **Context stability**: Never pass object literals as context `value` — primitives OK, objects must be `useMemo`'d
- **Pre-commit**: `simple-git-hooks` + `lint-staged` runs Prettier and ESLint on staged files

## License

MIT
