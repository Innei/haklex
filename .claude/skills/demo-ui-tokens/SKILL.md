---
name: demo-ui-tokens
description: Use when adding or modifying colors, spacing, typography, or layout values in demo/ CSS. Maps each chrome role to its Quiet Ink --rc-* token and lists the shell sizes.
---

# Demo UI Tokens

**Parent skill:** `demo-ui-direction`. **Sibling:** `demo-ui-components`.

The demo chrome reads `--rc-*` from `@haklex/rich-style-token`. `:root` carries the light defaults and `[data-theme='dark']` (set on `.app`) carries dark, so every `--rc-*` resolves anywhere inside `.app`. Values: `docs/superpowers/specs/2026-10-25-quiet-ink-design-refresh-design.md` §6.

`--demo-*` variables still exist in `demo/src/styles/base.css` as aliases on `.app` for the remaining comment styles in `demo.css`. Do not add new uses — write `var(--rc-*)` directly.

## Role → token

| Role                                                    | Token                                                             |
| ------------------------------------------------------- | ----------------------------------------------------------------- |
| Page, sidebar, panels ground                            | `--rc-bg`                                                         |
| Preview stage, code panels                              | `--rc-bg-secondary`                                               |
| Inline code chips                                       | `--rc-bg-tertiary`                                                |
| Primary text                                            | `--rc-text`                                                       |
| Nav labels, body copy                                   | `--rc-text-secondary`                                             |
| Group labels, meta, captions                            | `--rc-text-tertiary`                                              |
| Idle icons, placeholders (not readable text)            | `--rc-text-quaternary`                                            |
| Structure lines (sidebar edge, headers, section breaks) | `--rc-border`                                                     |
| Lines inside lists / code headers                       | `--rc-border-subtle`                                              |
| Hover                                                   | `--rc-fill-secondary`                                             |
| Selected / active                                       | `--rc-fill`                                                       |
| Primary button                                          | `--rc-text` background, `--rc-bg` text                            |
| Focus ring                                              | `--demo-focus-ring` = 1px `--rc-accent` + 3px `--rc-accent-light` |
| Popover / palette shadow                                | `--rc-shadow-menu` / `--rc-shadow-modal`                          |
| Fonts                                                   | `--rc-font-family-sans`, `--rc-font-mono`                         |

## Dark lift (Workbench stage)

In dark mode `.wb-stage` moves one surface step up by remapping the host interface: `--rc-host-bg` → bgSecondary, `--rc-host-bg-secondary` → bgTertiary, `--rc-host-bg-tertiary` → bgTertiary + 5% white. Editor surfaces nested in the stage (code blocks, inline code) stay one step above the lifted ground. Light mode is unchanged.

## Sizes

| Item                                                  | Value                                           |
| ----------------------------------------------------- | ----------------------------------------------- |
| Sidebar                                               | 260                                             |
| Header rows (sidebar head, Workbench bar, panel head) | 44                                              |
| Nav item                                              | 32 high, radius 8                               |
| Tree leaf                                             | 28 high, 1px left line                          |
| Doc article / wide                                    | ≤760 / ≤1080                                    |
| TOC                                                   | 200 (hidden <1200)                              |
| Workbench right panel                                 | 300 (AI 380; stacks below <1024)                |
| Tile preview                                          | 104 high, radius 12                             |
| Radius                                                | 4 chips · 8 controls · 12 cards/frames/popovers |
| Spacing                                               | 4px grid                                        |
| Drawer breakpoint                                     | <768                                            |
