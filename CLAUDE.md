# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Lexical-based rich editor ecosystem. Modular packages: core editor, UI primitives, content renderers, plugins, extensions, and integration bundles.

**Build**: Vite 8 + Vanilla Extract CSS-in-TS. ESM only (`.mjs`). TypeScript 5.9. Lexical 0.44. pnpm 10. Node >= 20.

## Commands

```bash
pnpm dev                                           # demo/ dev playground (all features)
pnpm --filter @haklex/rich-editor dev:build        # watch mode for core
pnpm build                                         # turbo build (all)
pnpm build:packages                                # workspace packages under packages/
pnpm --filter @haklex/rich-editor build            # single package
pnpm lint                                          # eslint . --fix (repo root)
pnpm test                                          # vitest run (all suites)
pnpm typecheck                                     # tsc --noEmit in packages/*
npx eslint path/to/file.ts                         # lint single file
npx prettier --write path/to/file.ts               # format single file
npx vitest run packages/rich-renderer-katex/tests/ # run specific tests
pnpm release:rich                                  # bump + build + publish @haklex/*
```

## Toolchain

- **ESLint**: `@lobehub/eslint-config` (root `eslint.config.mjs`). Key rule: `react/no-use-context: 'error'` — must use React 19 `use(Context)` not `useContext()`.
- **Versioning**: All `@haklex/*` share one version (from `packages/rich-editor/package.json`), managed by `bumpp`.
- **Pre-commit**: `simple-git-hooks` + `lint-staged` (prettier + eslint on staged files).
- **Build**: Shared Vite config in `vite.shared.ts` (`createViteConfig()`). Auto-externalizes deps/peerDeps. Output: ESM `.mjs` + `.d.ts`. Vanilla Extract for CSS-in-TS (zero runtime).

## Static / Edit Split (Core Architecture)

The ecosystem splits **nodes** and **renderers** into static (read-only) and edit (editor-only) variants for tree-shaking.

- **Static Node/Renderer**: Display-only. No `@haklex/rich-editor-ui` or `lucide-react` imports. Used by `RichRenderer`.
- **Edit Node/Renderer**: Extends static variant. Adds heavy deps (Popover, DropdownMenu, NestedComposer). Used by `RichEditor`.

**Split criteria**: Only split when the edit path introduces heavy imports absent from the static path.

Registration:

- `@haklex/rich-editor` `src/config.ts` → static nodes → `RichRenderer`
- `@haklex/rich-editor` `src/config-edit.ts` → edit nodes → `RichEditor`
- `@haklex/rich-compose` `src/modules/<name>/module.ts` → per-feature `RichRendererModule` (recommended composition API)
- Downstream apps compose their own `RendererConfig` from `compose/modules/*` (or inline a per-app preset). The legacy `enhancedRendererConfig` shipped by `@haklex/rich-kit-shiro` is gone.

**Adding a new node with edit UI**: Create `FooNode` with `RendererWrapper` in `decorate()`, then `FooEditNode extends FooNode` overriding `decorate()` with edit decorator. Register base in `config.ts`, edit in `config-edit.ts`. Create `FooRenderer` (static) + `FooEditRenderer` (edit). Add a module under `rich-compose/src/modules/<name>/`.

## Package Dependency Graph

```
@haklex/rich-editor (core: nodes + plugins + styles + contexts)
├── @haklex/rich-editor-ui (Dialog, Dropdown, Popover via @base-ui/react)
├── @haklex/rich-headless (server-side node registry, zero React)
└── @haklex/rich-style-token (theme tokens, CSS variables, variant presets)

@haklex/rich-compose (modular composition + SSR engine: composeRenderer, RichRenderer, per-feature modules)
@haklex/rich-ext-{chat,code-snippet,embed,excalidraw,gallery,nested-doc} (heavy extensions)
@haklex/rich-plugin-{block-handle,floating-toolbar,link-edit,mention,slash-menu,table,toolbar}
@haklex/rich-renderer-{alert,banner,codeblock,image,linkcard,mention,mermaid,ruby,video,katex}

@haklex/rich-diff → @haklex/rich-diff-core (standalone diff viewer)
@haklex/rich-agent-core → @haklex/rich-litexml (headless agent protocol; used by rich-ext-ai-agent)
@haklex/rich-agent-chat → @haklex/rich-agent-core, @haklex/rich-diff-core (chat UI)
@haklex/rich-editor-demo (dev playground, workspace at demo/)
```

## Key Conventions

- **Context Provider value stability**: Never pass object literals as context `value`. Primitives OK directly; objects must be `useMemo`'d.
- **Neutral colors**: Use `#737373` / `#a3a3a3` (neutral-500/400) for muted text/borders. No tinted grays (slate, zinc).
- **Styling**: Vanilla Extract (`*.css.ts`) throughout. No Tailwind in editor packages.
- **Variant system**: `article` (sans-serif, 16px), `note` (CJK serif, 16px), `comment` (sans-serif, 14px). Controlled by `variant` prop + `ColorSchemeContext`.

## Downstream Consumers

```
Shiroi / Yohaku (Next.js frontends)
  └── @haklex/{rich-compose, rich-editor, rich-ext-*, rich-renderer-*, rich-style-token}
      Compose modules + a per-app ShiroEditor/ShiroRenderer wrapper

mx-core/apps/admin (React dashboard, ../mx-core/apps/admin)
  └── @haklex/rich-editor + @haklex/rich-renderer-* as ordinary React components

mx-core (NestJS backend, ../mx-core)
  └── @haklex/rich-headless
      Server-side: createHeadlessEditor() + allHeadlessNodes + $toMarkdown() for Lexical JSON → Markdown
```

**Release flow**: `pnpm release:rich` → bump + build + publish to npm. Then update pinned versions in `mx-core/apps/admin/package.json` (dashboard) and `mx-core/apps/core/package.json` (server).

## Adding New Nodes Checklist

When creating a new Lexical node type:

- Node class in `packages/rich-editor/src/nodes/`
- Static renderer in `packages/rich-renderers/`
- Edit renderer in `packages/rich-renderers-edit/` (if edit UI needed)
- Register in `config.ts` (static) and `config-edit.ts` (edit)
- **XML writer in `packages/rich-litexml/src/writers/`** (required for AI agent)
- **XML reader in `packages/rich-litexml/src/readers/`** (required for AI agent)
- **Register in `packages/rich-litexml/src/default-registry.ts`**
- Update `packages/rich-ext-ai-agent` system prompt if the node is agent-creatable
