---
name: demo-ui-direction
description: Use when modifying demo/ UI — adding pages, components, or styles. Defines the left-sidebar shell, the Doc and Workbench page templates, and the flat-line Quiet Ink conventions for the haklex demo site.
---

# Demo UI Direction

The demo site is haklex's docs + playground. Its chrome uses the same Quiet Ink tokens as the editor (`--rc-*`); there is no second palette. Direction: modern, flat, 1px lines, translucent fills for interaction, no card shadows.

**Sub-references:**

- `demo-ui-tokens` — which `--rc-*` token each chrome role reads, sizes, the dark "lift"
- `demo-ui-components` — shell, Doc, Workbench and primitive classes/components

Design spec: `docs/superpowers/specs/2026-10-25-docs-site-layout-design.md`.

## Shell

`demo/src/App.tsx` → `.app` is a 2-column grid: `Sidebar` (260px) + `.app-main` (the only scroll container). No top header. Below 768px the sidebar becomes a drawer opened from `.mobile-bar`.

- Sidebar data comes from `demo/src/site/catalog.ts` (`navGroups`). Never hard-code nav items in components. Adding a page = add a route in `App.tsx` + an entry in `navGroups` (tree leaves for per-item pages).
- Groups: Playground (Editor, Presets, Comments) · Reference (Nodes, Extensions, Charts) · Labs (AI Agent, Hostile host).
- The active section expands into a tree; the current leaf is marked by its 1px left line turning `text` color (no fill).
- Theme switch (System / Light / Dark) lives only in the sidebar footer.
- ⌘K / Ctrl+K opens `CommandPalette`, backed by `searchCatalog()`.

## Two page templates

| Template  | Component                        | Use for                                                    | Shape                                                                                                            |
| --------- | -------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Doc       | `components/doc/DocPage`         | reading / comparing (Nodes, Extensions, Charts)            | breadcrumb → H1 → lead → meta chips → body ≤760 + auto TOC (200) + prev/next. `wide` → ≤1080, no TOC (overviews) |
| Workbench | `components/workbench/Workbench` | trying / tweaking (Editor, Presets, Comments, AI, Hostile) | 44px top bar (title, meta, actions) + flush stage + right panel (300, AI 380)                                    |

Doc rules:

- Overview pages use `OverviewSection` + `Tile` with static line drawings from `components/doc/sketches/*`. Never render live components in tiles.
- The TOC collects only `h2.doc-h2`, `h2.panel-title`, `h2.chart-sample-title` — headings inside rendered editor content are ignored.
- Extension pages wrap their demo sections in `.doc-flat`, which turns `Panel` into flat H2 sections separated by 1px lines.

Workbench rules:

- The stage is flush: no padding, no card around the editor. Pass `className="wb-toolbar"` to `ToolbarPlugin` so it becomes a flat full-width bar sticky under the top bar.
- Secondary panels (Renderer, JSON, Import) go in `.wb-extra` below the editor.
- Page controls go in the right panel via `InspectorSection`, `Segmented`, `OptionButton`, `Chip`, `SwitchRow` — never as a toolbar row on the stage.
- In dark mode the stage is lifted one surface step (see `demo-ui-tokens`). `baseSurface` opts out (Hostile host does, so Stone mapping stays honest).

## Anti-patterns

- Raw hex / rgba in chrome CSS — read `var(--rc-*)` (user data like color presets and chart palettes are exempt)
- Shadows on cards or panels — only popovers/palette use `--rc-shadow-menu` / `--rc-shadow-modal`
- Accent color for selected state — selected = `--rc-fill`; accent is for focus rings and prose links only
- Solid hover fills — hover = `--rc-fill-secondary`
- A title repeated in both the top bar and a card header
- `useContext()` — use `use(Context)` (React 19 rule)
