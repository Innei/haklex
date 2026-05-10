<div align="center">
  <img src="assets/logo.svg" alt="Haklex" width="80" height="80" />
  <h1>Haklex</h1>
  <p>An AI-agent-native rich text editor ecosystem built on <a href="https://lexical.dev/">Lexical</a>.</p>
  <p>AI writing assistance, structured editing, static rendering, and server-side parsing — all from a single schema.</p>
</div>

---

## What's New in 0.5.0

- **Sub-path split for `@haklex/rich-ext-{chat,code-snippet,gallery,poll}`** — each ext now exposes `/node` (light), `/renderer` (heavy default), `/edit`, `/static`, and `/` (full) entries. Default renderers are no longer statically imported by their nodes, so consumers can drop them via custom `RendererConfig` overrides.
- **Slot key constants** — every renderer slot now ships an `XXX_NODE_KEY` constant (e.g. `IMAGE_NODE_KEY`, `POLL_NODE_KEY`) from each owning package. Use these in `createRendererDecoration` and `RichRendererModule.renderers` instead of bare string literals.
- **`RendererConfig` decoupling** — `@haklex/rich-editor` no longer carries ext type definitions. Each ext package reverse-augments `RendererConfig` via `declare module '@haklex/rich-editor'`. Downstream apps follow the same pattern to add bespoke slots.
- **Lazy module renderers** — `@haklex/rich-compose` modules register heavy defaults via `lazyRenderers: { Key: () => import('@haklex/rich-ext-X/renderer') }`, enabling chunk-splitting out of the box.

### Breaking Changes

- `@haklex/rich-editor` no longer re-exports ext renderer prop types. Move imports as follows:
  - `PollRendererProps`, `PollDataAdapter`, etc. → `@haklex/rich-ext-poll/node`
  - `ChatRendererProps`, `ChatMessage`, etc. → `@haklex/rich-ext-chat/node`
  - `CodeFile`, `CodeSnippetRendererProps` → `@haklex/rich-ext-code-snippet/node`
  - `GalleryImage`, `GalleryRendererProps` → `@haklex/rich-ext-gallery/node`
- `RichRendererModule.renderers` keys still type-check against `keyof RendererConfig`; use the new slot-key constants for safer call sites.

## Key Features

- **AI Agent Integration** — Built-in AI writing agent with LiteXML serialization, diff review overlay, selection-aware context capture, and streaming document edits — the editor is designed as a human–AI collaborative surface
- **LiteXML Bridge** — Bidirectional Lexical JSON ↔ XML serialization (`@haklex/rich-litexml`) enables LLMs to read and write structured documents through a compact, token-efficient XML format
- **Rich Block Types** — Images, videos, code blocks, Mermaid diagrams, KaTeX math, Excalidraw whiteboards, embeds, galleries, link cards, mentions, and more
- **Static / Edit Split** — Separate node and renderer trees for read-only display vs. full editing, enabling aggressive tree-shaking
- **SSR-Ready** — `RichRenderer` renders Lexical JSON to React without loading the editor runtime
- **Server-Side Parsing** — `@haklex/rich-headless` provides a zero-React node registry for backend use (Lexical JSON → Markdown)
- **Variant Theming** — Three typographic presets (`article`, `note`, `comment`) with light/dark color scheme support
- **Zero-Runtime CSS** — Vanilla Extract (CSS-in-TS), compiled to static CSS at build time
- **Plugin Architecture** — Slash menu, floating toolbar, block handle, table controls, mention typeahead, link editor, and top toolbar — all composable
- **Diff Viewer** — `@haklex/rich-diff` renders side-by-side diffs of two editor states

## Tech Stack

| Category              | Technology                    |
| --------------------- | ----------------------------- |
| **Language**          | TypeScript 5.9                |
| **Editor Core**       | Lexical 0.44                  |
| **UI Framework**      | React 19                      |
| **UI Primitives**     | Base UI 1 (`@base-ui/react`)  |
| **Build**             | Vite 8, Turbo 2               |
| **Styling**           | Vanilla Extract 1 (CSS-in-TS) |
| **Code Highlighting** | Shiki 4, CodeMirror 6         |
| **Package Manager**   | pnpm 10                       |
| **Module Format**     | ESM only (`.mjs`)             |

Lexical stays on **0.x** releases: the **minor** (e.g. **0.44**) is what must align across `lexical` and `@lexical/*`, not the patch number.

## Prerequisites

- **Node.js** 20 or higher
- **pnpm** 10 (`corepack enable && corepack prepare pnpm@latest --activate`, or match `packageManager` in the repo root)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Innei/haklex.git
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
│   ├── rich-litexml/              # Lexical JSON ↔ XML serialization (LLM bridge)
│   ├── rich-agent-core/           # Headless AI agent protocol, diff orchestration, document store
│   ├── rich-agent-chat/           # Chat panel UI for AI interaction (used by demo / integrations)
│   ├── rich-diff-core/            # Lexical diff engine (structural + decoration; shared by agent + diff UI)
│   ├── rich-ext-*/               # Heavy extensions (ai-agent, chat snapshots, code-snippet, embed, excalidraw, gallery, nested-doc)
│   ├── rich-kit-shiro/           # Integration bundle for Shiroi (ShiroEditor + ShiroRenderer)
│   ├── rich-diff/                # Diff viewer
│   └── cm-editor/                # Shared CodeMirror 6 utilities
├── vite.shared.ts                # Shared Vite config factory
├── turbo.json                    # Build orchestration
├── bump.config.ts                # Version sync (bumpp)
└── eslint.config.mjs             # Lint config (@lobehub/eslint-config)
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
├── @haklex/rich-ext-ai-agent (AI writing agent + diff review UI)
│   ├── @haklex/rich-agent-core → @haklex/rich-litexml
│   └── @haklex/rich-diff-core
├── @haklex/rich-agent-chat → @haklex/rich-agent-core, @haklex/rich-diff-core (chat UI; optional integration)
├── @haklex/rich-ext-{chat, code-snippet, embed, excalidraw, gallery, nested-doc}
├── @haklex/rich-plugin-{block-handle, floating-toolbar, link-edit, mention, slash-menu, table, toolbar}
└── @haklex/rich-renderer-katex

@haklex/rich-litexml (standalone; consumed by @haklex/rich-agent-core and others)
@haklex/rich-diff → @haklex/rich-diff-core (standalone diff viewer)
```

## Package Overview

### Core

| Package                        | Description                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| `@haklex/rich-editor`          | Core editor component, all builtin + custom Lexical nodes, built-in plugins, editor contexts     |
| `@haklex/rich-editor-ui`       | Headless UI primitives — Dialog, Dropdown, Popover, Combobox, Tooltip, ColorPicker, AnimatedTabs |
| `@haklex/rich-headless`        | Zero-React node registry for server-side Lexical JSON → Markdown conversion                      |
| `@haklex/rich-style-token`     | Design tokens, CSS variables, and variant presets                                                |
| `@haklex/rich-static-renderer` | `RichRenderer` — renders Lexical JSON to React without loading the editor                        |

### Renderers

Each renderer has a **static** variant (display-only) and an **edit** variant (interactive controls):

| Package                   | What it renders                                                 |
| ------------------------- | --------------------------------------------------------------- |
| `rich-renderer-alert`     | Alert / callout blocks (note, tip, important, warning, caution) |
| `rich-renderer-banner`    | Banner blocks (info, success, warning, error)                   |
| `rich-renderer-codeblock` | Syntax-highlighted code with Shiki                              |
| `rich-renderer-image`     | Images with blurhash placeholder and lightbox                   |
| `rich-renderer-video`     | Video player                                                    |
| `rich-renderer-linkcard`  | Rich link previews with metadata                                |
| `rich-renderer-mention`   | Social mention badges with platform icons                       |
| `rich-renderer-mermaid`   | Mermaid diagrams with zoom/pan                                  |
| `rich-renderer-ruby`      | Ruby annotations for CJK text                                   |
| `rich-renderer-katex`     | KaTeX math (inline and block)                                   |

Aggregated by `@haklex/rich-renderers` (static) and `@haklex/rich-renderers-edit` (edit).

### Plugins

| Package                        | Description                                                      |
| ------------------------------ | ---------------------------------------------------------------- |
| `rich-plugin-block-handle`     | Drag handle with add button and context menu                     |
| `rich-plugin-floating-toolbar` | Selection-based floating formatting toolbar                      |
| `rich-plugin-link-edit`        | Link editing popover                                             |
| `rich-plugin-mention`          | @mention typeahead with platform support (GitHub, Twitter, etc.) |
| `rich-plugin-slash-menu`       | `/` command menu for content insertion                           |
| `rich-plugin-table`            | Table row/column resize and manipulation                         |
| `rich-plugin-toolbar`          | Top toolbar for formatting controls                              |

### Extensions

| Package                 | Description                                                                 |
| ----------------------- | --------------------------------------------------------------------------- |
| `rich-ext-ai-agent`     | AI writing agent — diff review overlay, action registry, editor integration |
| `rich-ext-chat`         | Static chat-snapshot blocks for assistant / conversation transcripts        |
| `rich-ext-code-snippet` | Multi-file tabbed code display with drag-and-drop                           |
| `rich-ext-embed`        | URL embeds — YouTube, Twitter, Bilibili, CodeSandbox, GitHub Gist           |
| `rich-ext-excalidraw`   | Excalidraw whiteboard integration                                           |
| `rich-ext-gallery`      | Image gallery with grid and carousel layouts                                |
| `rich-ext-nested-doc`   | Nested document / card content blocks                                       |

### Integration & Utilities

| Package                   | Description                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| `@haklex/rich-kit-shiro`  | Pre-configured bundle — `ShiroEditor` and `ShiroRenderer` with all plugins and extensions |
| `@haklex/rich-litexml`    | Bidirectional Lexical JSON ↔ XML serialization for LLM-friendly document I/O              |
| `@haklex/rich-agent-core` | Headless AI agent protocol, LiteXML-backed edits, and document/session state              |
| `@haklex/rich-agent-chat` | Chat panel UI (tool calls, streaming) built on `rich-agent-core`                          |
| `@haklex/rich-diff-core`  | Core Lexical diff engine — character-level and structural diff with node decoration       |
| `@haklex/rich-diff`       | Diff viewer for comparing two editor states (uses `rich-diff-core`)                       |
| `@haklex/cm-editor`       | Shared CodeMirror 6 editor utilities                                                      |

## Variant System

Three typographic presets control font family, size, and spacing:

| Variant   | Font       | Base Size | Use Case                  |
| --------- | ---------- | --------- | ------------------------- |
| `article` | Sans-serif | 16px      | Blog posts, documentation |
| `note`    | CJK serif  | 16px      | Personal notes, journals  |
| `comment` | Sans-serif | 14px      | Comments, compact content |

Set via the `variant` prop on `RichEditor` or `RichRenderer`. Color scheme (light/dark) is managed through `ColorSchemeContext`.

## Usage

### Editor (Full Editing Experience)

```tsx
import { RichEditor } from '@haklex/rich-editor';
import '@haklex/rich-editor/style.css';

function MyEditor() {
  return (
    <RichEditor
      variant="article"
      initialValue={savedEditorState}
      onChange={(value) => save(value)}
      imageUpload={uploadHandler}
      placeholder="Start writing..."
    />
  );
}
```

### Static Renderer (Read-Only Display)

```tsx
import { RichRenderer } from '@haklex/rich-static-renderer';
import '@haklex/rich-editor/style.css';

function MyArticle({ content }) {
  return <RichRenderer value={content} variant="article" theme="light" />;
}
```

### Server-Side Parsing (Lexical JSON → Markdown)

```ts
import { createHeadlessEditor } from '@lexical/headless';
import { allHeadlessNodes, $toMarkdown } from '@haklex/rich-headless';

const editor = createHeadlessEditor({ nodes: allHeadlessNodes });

editor.setEditorState(editor.parseEditorState(lexicalJsonString));
editor.read(() => {
  const markdown = $toMarkdown();
  console.log(markdown);
});
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

| Command                                              | Description                                             |
| ---------------------------------------------------- | ------------------------------------------------------- |
| `pnpm dev`                                           | Start development playground on port 5188               |
| `pnpm build`                                         | Build all packages (Turbo, dependency-ordered)          |
| `pnpm build:packages`                                | Build all workspace packages under `packages/`          |
| `pnpm --filter @haklex/rich-editor build`            | Build a single package                                  |
| `pnpm --filter @haklex/rich-editor dev:build`        | Watch mode for a single package                         |
| `pnpm lint`                                          | ESLint on the repo root (`eslint . --fix`)              |
| `pnpm test`                                          | Run all Vitest suites (`vitest run`)                    |
| `pnpm typecheck`                                     | `tsc --noEmit` for every `packages/*` workspace         |
| `npx eslint path/to/file.ts`                         | Lint a single file                                      |
| `npx prettier --write path/to/file.ts`               | Format a single file                                    |
| `npx vitest run packages/rich-renderer-katex/tests/` | Run tests for a specific package                        |
| `pnpm release:rich`                                  | Bump version, build, and publish all `@haklex/*` to npm |

## Open Source, AI, and Dialogue

Traditional open source shares **code**; in the era of AI-assisted development, it is just as valuable to share the **dialogue** behind that code: prompts, constraints, trade-offs, and the iterative back-and-forth with assistants. This repository includes **SpecStory** exports under [`.specstory/`](.specstory/) — searchable transcripts of how Haklex was designed, refactored, and shipped. Code is the artifact; the conversation is part of its provenance.

> 当代意义上的开源不应止于代码，也应包括与 AI 协作时的对话与过程。我们把这些会话一并公开，作为真正的开源形态之一。

See [`.specstory/README.md`](.specstory/README.md) for a session index and notes on redacted paths.

## Downstream Consumers

| Project                                                  | Stack   | Package                  | Integration                                                       |
| -------------------------------------------------------- | ------- | ------------------------ | ----------------------------------------------------------------- |
| **[Shiroi](https://github.com/innei-dev/Shiroi)**        | Next.js | `@haklex/rich-kit-shiro` | Native React                                                      |
| **[admin-vue3](https://github.com/mx-space/admin-vue3)** | Vue 3   | Multiple `@haklex/*`     | React-in-Vue bridge (`createRoot()` inside Vue `defineComponent`) |
| **[mx-core](https://github.com/mx-space/core)**          | NestJS  | `@haklex/rich-headless`  | Server-side Lexical JSON → Markdown                               |

## Contributing

Contributions are welcome. Please open an issue or PR on [GitHub](https://github.com/Innei/haklex).

### Key Conventions

- **React 19** — Use `use(Context)` instead of `useContext()` (enforced by ESLint)
- **Styling** — Vanilla Extract (`.css.ts`) only; no Tailwind in editor packages
- **Neutral colors** — Use `#737373` / `#a3a3a3` (neutral-500/400) for muted text and borders
- **Context stability** — Never pass object literals as context `value`; use `useMemo` for objects

### Toolchain

- **ESLint** — [@lobehub/eslint-config](https://github.com/lobehub/eslint-config) (see root `eslint.config.mjs`)
- **Pre-commit** — `simple-git-hooks` + `lint-staged` (ESLint `--fix` + Prettier on staged files)
- **Versioning** — All `@haklex/*` packages share one version; source of truth is `packages/rich-editor/package.json`, managed by [bumpp](https://github.com/antfu-collective/bumpp)

### Before Submitting

1. Run `pnpm lint` and fix any issues
2. Run `pnpm build` to ensure the project builds
3. Run tests for affected packages (e.g. `npx vitest run packages/rich-renderer-katex/tests/`)

## License

2026 © Innei. Released under the MIT License.

> [Personal Website](https://innei.in/) · GitHub [@Innei](https://github.com/innei/)
