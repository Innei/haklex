---
name: demo-ui-components
description: Use when creating or modifying demo/ UI components — sidebar, doc pages, overview tiles, workbench inspector controls, buttons, panels. Lists the components and CSS classes and where they live.
---

# Demo UI Components

**Parent skill:** `demo-ui-direction`. **Sibling:** `demo-ui-tokens`.

Styles are plain CSS under `demo/src/styles/` (imported in `App.tsx`): `base.css` (aliases, primitives), `shell.css`, `doc.css`, `sketch.css`, `workbench.css`, `palette.css`, `catalog.css` (component pages, frames, states), `tokens.css` (Design tokens page), `component-sketch.css` (UI and chrome tiles). `demo/src/demo.css` holds only page-specific styles (comments, agent chat, chart samples).

## Shell — `components/shell/`

| Component        | Notes                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `Sidebar`        | Renders `navGroups`; `.nav-item[data-active]`, `.nav-tree`, `.nav-leaf[aria-current=page]`; scrolls the current leaf into view |
| `CommandPalette` | ⌘K dialog; combobox + listbox, arrow keys / Enter / Esc; results from `searchCatalog()`                                        |
| `GithubMark`     | GitHub logo (lucide has none)                                                                                                  |

## Doc — `components/doc/`

| Component                 | Notes                                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `DocPage`                 | `breadcrumb`, `title`, `aside` (chip next to the H1), `lead`, `meta`, `wide`; auto TOC from doc headings; prev/next from `pagerFor()` |
| `OverviewSection`, `Tile` | 4-column auto-fill grid; tile = 104px sketch + optional `marker` (review dot) + label + mono code + count                             |
| `sketches/*`              | Static line drawings keyed by node type / extension id / chart kind; primitives in `primitives.tsx` + `.sk-*` classes                 |

Classes: `.doc-h2`, `.doc-note`, `.doc-tabs` / `.doc-tab[aria-selected]` (underline tabs), `.preview-frame`, `.preview-caption`, `.codebox` / `.codebox-head`, `.doc-flat` (flattens `Panel`s into H2 sections).

## Component catalog — `components/preview/`, `pages/components/`

| Component                                                    | Notes                                                                                                                                                                                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ThemeFrame`, `ThemePair`                                    | Real light/dark frame: theme class + `data-theme` + `--rc-host-*` from the exported palette + `PortalThemeProvider`, so portaled popups follow the frame                                                                  |
| `usePinnedOpen`                                              | Controlled `open` that ignores outside-press / focus-out, so two popups stay open side by side; pair with `modal={false}` on Menu and Select                                                                              |
| `Force` + `hover` / `focus` / `focusVisible` / `highlighted` | Sets attributes on the wrapped element. Pseudo states work by mirroring the component's own `:hover` / `:focus` / `:focus-visible` rules onto `[data-pseudo~=…]` (`site/pseudo-states.ts`); never restyle to fake a state |
| `StateGrid`, `StateCell`                                     | Labelled cells for the States section                                                                                                                                                                                     |
| `ComponentPage`, `ComponentsOverview`                        | Shared by `/ui` and `/chrome`; demos come from `pages/ui/demos/index.ts` and `pages/chrome/demos/index.tsx` keyed by registry id                                                                                          |

Registry: `site/components.ts` (+ `site/component-data/`). Review findings: edit `site/reviews.ts` (key `ui/<id>`, `chrome/<id>` or `tokens`); pages only read it. Status dots and chips may use semantic colors; other chrome stays neutral.

## Workbench — `components/workbench/`

| Component                       | Notes                                                                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `Workbench`                     | `title`, `meta`, `actions`, `panel`, `panelTitle`, `panelWidth`, `baseSurface`                                                             |
| `InspectorSection`              | `.wb-section` with 12px tertiary title, 1px bottom line                                                                                    |
| `OptionButton`                  | Full-width single-choice row, `aria-pressed`                                                                                               |
| `Chip`                          | Pill toggle, `aria-pressed`; selected = text-colored border                                                                                |
| `SwitchRow`                     | `role=switch` row; `.switch` track turns `--rc-text` when on                                                                               |
| `PanelTabs`                     | Underline tabs in the 56px panel head (`.wb-panel-tab[aria-selected]`); use instead of `panelTitle` when the right panel has several views |
| `JsonPanel`                     | Full-height live JSON with Copy; for EditorState output                                                                                    |
| `ImportPanel` (`pages/editor/`) | Paste + "Load into editor"; validates with `parseEditorState()` and shows inline errors                                                    |

Output and input tools (JSON, Import) live as right-panel tabs, never as switches that open panels under the editor. The panel widens to 440 while such a tab is active.

Classes: `.wb-toolbar` (pass to `ToolbarPlugin`), `.wb-extra` (secondary panels area), `.opt-list`, `.chip-row`, `.swatch`, `.color-row`, `.wb-section-text`.

## Primitives

| Item                                                          | Where                                                                                                      |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `Segmented` (`components/ui/Segmented.tsx`)                   | `.seg` / `.seg-btn[aria-pressed]`; `block` stretches, `iconOnly` for icon buttons; `.seg-count` for counts |
| `VariantPicker`                                               | `Segmented` over Article / Note / Comment                                                                  |
| `Panel`                                                       | `.panel` frame (1px ring, radius 12) + 40px header; flattened inside `.doc-flat`                           |
| `.btn`, `.btn-active`, `.btn-primary`, `.btn-sm`, `.icon-btn` | 28px controls, radius 8; active = `--rc-fill`, primary = text background                                   |
| `.badge`                                                      | 1px border, radius 4, 11px tertiary                                                                        |
| `.chip-code`                                                  | Mono on `--rc-bg-tertiary`                                                                                 |
| `.kbd`                                                        | Keyboard hint                                                                                              |

## Data for components

`demo/src/site/` holds the catalog (`catalog.ts`), component registry (`components.ts`), reviews (`reviews.ts`), token rows and host vars (`tokens.ts`), pseudo-state mirroring (`pseudo-states.ts`), extension metadata (`extensions.ts`), chart kinds (`charts.ts`) and `slugify.ts`; `demo/src/fixtures/node-types.ts` is the 23-row node-type table. Tests: `./node_modules/.bin/vitest run --root demo src/site` from the repo root.
