# Package Consolidation Refactor — Design

**Date:** 2026-05-10

**Goal:** Reduce package count by removing aggregator + bundle packages whose roles are now subsumed by `@haklex/rich-compose`'s modular composition API. Clarify each remaining package's responsibility along a single axis.

## Package Roles (target state)

| Package                                          | Responsibility                                                                                                                                                                                                                                                                                                                 | Notes                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| `@haklex/rich-editor`                            | **Minimal editor core.** Lexical node classes, `RichEditor` component, plugin interfaces, and the runtime primitives that node `decorate()` methods depend on (`RendererWrapper`, `RubyRenderer`, `TagRenderer`, `FootnoteContext`, etc.). The `/static` subpath exposes these primitives without pulling in editor-only deps. | Does **not** host the SSR engine.                      |
| `@haklex/rich-compose`                           | **Composition layer + SSR engine.** Per-feature `RichRendererModule`s (`modules/<name>/`), the `composeRenderer` orchestrator, and the `RichRenderer` headless walker (engine internalized from the deleted `rich-static-renderer`).                                                                                           | Single home for "how to render Lexical JSON to React". |
| `@haklex/rich-renderer-*` / `@haklex/rich-ext-*` | **Per-feature node + renderer pairs.** Each ships its own static renderer, edit renderer (where applicable), node class, and CSS.                                                                                                                                                                                              | Unchanged.                                             |
| `@haklex/rich-headless`                          | **Server-side, zero-React node registry** for Lexical JSON ↔ Markdown.                                                                                                                                                                                                                                                         | Unchanged.                                             |
| `@haklex/rich-style-token`                       | **Theme tokens, CSS variables, variant presets.**                                                                                                                                                                                                                                                                              | Unchanged.                                             |
| `@haklex/rich-diff` / `@haklex/rich-diff-core`   | **Diff viewer.** Imports `RichRenderer` from `rich-compose`.                                                                                                                                                                                                                                                                   | Updated import only.                                   |

### Deleted packages

| Package                        | Reason                                                                                                    | Replaced by                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `@haklex/rich-renderers`       | Pure aggregator (re-exports + `enhancedRendererConfig` + bundled CSS). Yohaku already on compose modules. | `compose/modules/*` per-feature imports                                             |
| `@haklex/rich-renderers-edit`  | Same as above for edit-side.                                                                              | `compose/modules/*`                                                                 |
| `@haklex/rich-static-renderer` | SSR engine moves into `rich-compose`'s internal `static-renderer/` subdirectory.                          | `rich-compose` exports `RichRenderer` + `BuiltinNodeRenderer` + `RichRendererProps` |
| `@haklex/rich-kit-shiro`       | Pre-baked Shiroi bundle. Downstream (admin-vue3, Yohaku) compose their own surface from compose modules.  | Per-app composition                                                                 |

## Cycle-Break: Dependency Injection for Nested Rendering

**Problem.** If `RichRenderer` lives in `rich-compose`, then `rich-ext-nested-doc` and `rich-ext-ai-agent` (both peer-depended on by `compose`) needed to import `RichRenderer` from `compose` — a peer cycle.

**Solution.** Both extensions accept their renderer surface via DI, never importing the engine directly:

- **`rich-ext-nested-doc/NestedDocRenderer`** — drop the `RichRenderer` fallback. Always read from `useOptionalNestedContentRenderer()` (already exposed by `rich-editor/static`). When no provider is wired, render nothing (or a deterministic fallback). `compose`'s `composeRenderer` already wraps with `<NestedContentRendererProvider value={renderNested}>`.
- **`rich-ext-ai-agent/DiffReviewOverlayPlugin`** — accept a renderer surface via the same `NestedContentRendererProvider` (extend its contract to support standalone fragments) or via a new `DiffPreviewRendererProvider` exposed from `rich-editor/static`. Consumer wires it; compose pre-wires it for module users.

After this change:

- `rich-ext-nested-doc`, `rich-ext-ai-agent` depend only on `rich-editor` for the context hook.
- `rich-compose` provides the engine and the Provider.
- No package import cycle, no peer cycle.

## Migration Stages

### Stage 1 — Delete `rich-renderers` + `rich-renderers-edit` (DONE)

- ✅ Move `enhancedRendererConfig` + `enhancedEditRendererConfig` + `TagEditRenderer` into `rich-kit-shiro/src/configs/` (transient — kit-shiro is deleted in Stage 3).
- ✅ Update `rich-kit-shiro` `exports/nodes.ts`, `exports/renderers.ts`, `exports/renderers-edit.ts`, `ShiroRenderer.tsx`, `ShiroEditor.tsx`, style files to import from per-feature source packages.
- ✅ Update `demo/src/fixtures/enhanced-renderers.ts`, `markdown-test-preset.ts`, `pages/ExtensionsPage.tsx`.
- ✅ Update package.jsons (kit-shiro adds direct deps on per-renderer packages; demo drops `rich-renderers`).
- ✅ Delete `packages/rich-renderers` and `packages/rich-renderers-edit`.
- ✅ Update `README.md`, `AGENTS.md`, `CLAUDE.md`.

### Stage 2 — Move SSR engine into `rich-compose`, delete `rich-static-renderer`

1. **Apply DI cycle-break first.**
   - In `rich-ext-nested-doc/NestedDocRenderer.tsx`: remove `import { RichRenderer } from '@haklex/rich-static-renderer'` and the fallback branch. Render nothing (or a debug placeholder) when `useOptionalNestedContentRenderer()` returns undefined.
   - In `rich-ext-ai-agent/DiffReviewOverlayPlugin.tsx`: remove direct `RichRenderer` import. Accept renderer via context (extend `NestedContentRendererProvider` to handle single-fragment rendering, or introduce a sibling `DiffPreviewProvider` in `rich-editor/static`). Consumer (the editor wrapper that mounts the agent plugin) wires it.
   - Update `rich-ext-nested-doc/package.json` and `rich-ext-ai-agent/package.json`: drop `@haklex/rich-static-renderer` dependency.

2. **Move engine source into `rich-compose`.**
   - `packages/rich-static-renderer/src/{RichRenderer.tsx,types.ts,table.css.ts,engine/*,preprocess/*,components/*}` → `packages/rich-compose/src/static-renderer/`.
   - Add `compose/src/static-renderer/index.ts` that exports `RichRenderer`, `BuiltinNodeRenderer`, `RichRendererProps`.
   - Update `compose/src/core/compose.tsx` and `core/types.ts` to import from `../static-renderer` (relative).
   - Update `compose/src/index.ts` to re-export `RichRenderer`, `BuiltinNodeRenderer`, `RichRendererProps`.

3. **Compose package config.**
   - `package.json`: add `@lexical/headless` to `dependencies`. Add `@haklex/rich-style-token` and `lucide-react` to `peerDependencies`. Add `@vanilla-extract/css` + `@vanilla-extract/vite-plugin` to `devDependencies`. Drop `@haklex/rich-static-renderer` from peer/devDeps.
   - `vite.config.ts`: set `vanillaExtract: true` (table.css.ts source needs it).

4. **Update other consumers.**
   - `rich-diff/src/RichDiff.tsx` — import `RichRenderer` + `RichRendererProps` from `@haklex/rich-compose`. Update `rich-diff/package.json` deps.
   - `rich-kit-shiro/src/ShiroRenderer.tsx` and `exports/renderers.ts` — import from `@haklex/rich-compose`. Update `rich-kit-shiro/package.json` deps.
   - `demo/src/pages/ExtensionsPage.tsx` — import from `@haklex/rich-compose`. Update `demo/package.json` deps.

5. **Delete `packages/rich-static-renderer`.** Update docs.

6. **Yohaku.** Edit `Yohaku/apps/web/src/components/ui/rich-content/LexicalContent.tsx`:
   - Remove `import '@haklex/rich-renderers/style.css'` (compose modules side-effect their own CSS).
   - Change `import type { BuiltinNodeRenderer } from '@haklex/rich-static-renderer'` → `from '@haklex/rich-compose'`.
   - Update `Yohaku/apps/web/package.json`: drop `@haklex/rich-renderers` and `@haklex/rich-static-renderer`; bump `@haklex/rich-compose` to the new version.

### Stage 3 — Migrate admin-vue3 + Yohaku off `rich-kit-shiro`, delete it

1. **admin-vue3 migration.**
   - `admin-vue3/packages/rich-react/components/ReactEditorPane.tsx` and `NestedDocDialogEditor.tsx`: replace `ShiroEditor` with a local wrapper around `RichEditor` that mounts the same plugins (`SlashMenuPlugin`, `MentionMenuPlugin`, `BlockHandlePlugin`, `FloatingToolbarPlugin`, `FloatingLinkEditorPlugin`, `ExcalidrawPlugin`, `EmbedPlugin`, `PasteLinkCardPlugin`, `TableRowColumnHandlesPlugin`, `TableCellResizerPlugin`) and supplies the renderer config via compose modules (or inlines `enhancedEditRendererConfig` locally).
   - Update `admin-vue3/packages/rich-react/package.json`: drop `@haklex/rich-kit-shiro`; add `@haklex/rich-compose`, `@haklex/rich-plugin-block-handle`, `@haklex/rich-plugin-floating-toolbar`, `@haklex/rich-plugin-link-edit`, `@haklex/rich-plugin-mention`, `@haklex/rich-plugin-slash-menu`, `@haklex/rich-plugin-table`, `@haklex/rich-ext-excalidraw`, `@haklex/rich-ext-embed`, `@haklex/rich-renderer-linkcard`.

2. **Demo migration.**
   - `demo/src/pages/{EditorPage,CommentsPage,PresetsPage,NodeShowcase,AgentPage}.tsx` and `fixtures/extra-mention-platforms.ts`: replace `ShiroEditor` / `ShiroRenderer` / `MentionPlatformProvider` with compose-based equivalents.
   - Drop `@haklex/rich-kit-shiro` from `demo/package.json`.

3. **Delete `packages/rich-kit-shiro`.** Update docs (root README dependency graph, AGENTS.md, CLAUDE.md).

## Open Risks

- **Yohaku release coordination.** Yohaku consumes published versions, not workspace. Stage 2 requires publishing new haklex versions before Yohaku updates. Use existing release-orchestrator skill.
- **DI fallback removal in `NestedDocRenderer`.** If any downstream uses NestedDoc node without compose's Provider, it will silently render nothing. Audit all consumers.
- **DiffReviewOverlayPlugin renderer surface.** This component renders fragments outside the main document tree (via `createPortal`). The renderer Provider must be carried into the portal's React subtree; verify the Provider is mounted at the editor root level so portals inherit it.

## Out of Scope

- Renaming the `/static` subpath conventions on per-feature renderer/ext packages. They stay as-is.
- Restructuring `rich-headless` or `rich-style-token`.
- Changing the public API of `composeRenderer` or `RichRendererModule`.
