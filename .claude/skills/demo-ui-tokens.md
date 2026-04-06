---
name: demo-ui-tokens
description: Use when adding or modifying colors, spacing, typography, or layout values in demo/ CSS. Complete token reference for the monochrome design system.
---

# Demo UI Tokens Reference

**Parent skill:** `demo-ui-direction` — overall design direction and anti-patterns.
**Sibling skill:** `demo-ui-components` — component CSS classes, specs, and anatomy.

All tokens defined in `demo/src/demo.css` as CSS custom properties on `:root` / `[data-theme='dark']`.

## Color Tokens

| Token                   | Light                 | Dark                     | Usage                            |
| ----------------------- | --------------------- | ------------------------ | -------------------------------- |
| `--demo-bg`             | `#fafafa`             | `#0a0a0a`                | Page background                  |
| `--demo-surface`        | `#fff`                | `#141414`                | Card/panel background            |
| `--demo-surface-alt`    | `#fafafa`             | `#0a0a0a`                | Panel header, input bg           |
| `--demo-text`           | `#171717`             | `#fafafa`                | Primary text                     |
| `--demo-text-secondary` | `#525252`             | `#a3a3a3`                | Body text, button labels         |
| `--demo-text-muted`     | `#a3a3a3`             | `#525252`                | Placeholders, labels, captions   |
| `--demo-border`         | `#e5e5e5`             | `#262626`                | Card borders, dividers           |
| `--demo-border-light`   | `#f5f5f5`             | `#262626`                | Subtle dividers inside cards     |
| `--demo-hover`          | `#f5f5f5`             | `#262626`                | Hover background                 |
| `--demo-accent`         | `#171717`             | `#fafafa`                | Active state text (= text color) |
| `--demo-accent-bg`      | `rgba(23,23,23,0.06)` | `rgba(250,250,250,0.06)` | Active state bg, badges          |
| `--demo-code-bg`        | `#1a1a2e`             | `#0a0a0a`                | Code block background            |
| `--demo-code-text`      | `#a5d6ff`             | `#e5e5e5`                | Code block text                  |

**Rule**: Never use raw hex values. Always reference tokens. No teal, pink, or colored accents.

**Exception**: Delete button hover uses `#ef4444` / `rgba(239,68,68,0.1)` — the only non-neutral color, reserved for destructive actions.

## Spacing

| Value  | Where                                                   |
| ------ | ------------------------------------------------------- |
| `2px`  | Pill gaps, icon gaps                                    |
| `4px`  | Inline element gaps, small padding                      |
| `6px`  | Button padding-y, filter pill gaps                      |
| `8px`  | Card internal gaps, badge padding-x, header-right gap   |
| `12px` | Panel header padding, toolbar padding, button padding-x |
| `14px` | Nav tab padding-x, action button padding-x              |
| `16px` | Panel body padding, card preview padding, card gaps     |
| `20px` | Card body padding, ext-card body padding                |
| `24px` | Page padding, section gaps, header content gap          |
| `28px` | Filter bar margin-bottom                                |
| `32px` | Page side padding, page header margin-bottom            |

**Principle**: Increments of 2/4/8. Common spacings: 8, 12, 16, 20, 24, 32.

## Typography

### Font Stacks

| Stack                                                          | Usage       |
| -------------------------------------------------------------- | ----------- |
| `system-ui, -apple-system, sans-serif`                         | All UI text |
| `'SF Mono', SFMono-Regular, ui-monospace, Consolas, monospace` | Code, JSON  |

### Font Sizes

| Size   | Weight  | Usage                                                |
| ------ | ------- | ---------------------------------------------------- |
| `10px` | 600     | Type badge (`.node-card-type`)                       |
| `11px` | 500-600 | Labels, tags, badges, sidebar desc                   |
| `12px` | 500     | Segmented tabs, action buttons, code, filter count   |
| `13px` | 500     | Nav tabs, body buttons, descriptions, inputs         |
| `14px` | 500-600 | Card name, panel title, page desc, sidebar item name |
| `15px` | 600     | Logo text                                            |
| `24px` | 700     | Page title (`.nodes-page-title`)                     |

### Letter Spacing

| Value    | Usage                         |
| -------- | ----------------------------- |
| `-0.5px` | Page titles (24px)            |
| `-0.3px` | Logo text                     |
| `0.5px`  | Uppercase type badges, labels |

### Font Weight

| Weight | Usage                                                         |
| ------ | ------------------------------------------------------------- |
| 400    | Count badges, muted text                                      |
| 500    | Default buttons, nav tabs, sidebar items                      |
| 600    | Active states, panel titles, card names, labels, badges, logo |
| 700    | Page headings                                                 |

## Border Radius

| Value   | Usage                                                 |
| ------- | ----------------------------------------------------- |
| `4px`   | Input fields, small icon buttons, code inline         |
| `6px`   | Buttons, nav tabs, select, code blocks, sidebar items |
| `8px`   | Panels, toolbars, segmented control, card preview     |
| `10px`  | Node cards                                            |
| `12px`  | Extension cards                                       |
| `999px` | Pills, badges (full round)                            |

## Layout Constants

| Property                | Value                          |
| ----------------------- | ------------------------------ |
| Header height           | `56px`                         |
| Content max-width       | `1200px`                       |
| Node grid columns       | 3 (→ 2 at 1200px → 1 at 768px) |
| Extension grid columns  | 2 (→ 1 at 768px)               |
| Preset sidebar width    | `220px`                        |
| Extension sidebar width | `220px`                        |
| Comment sidebar width   | `320px`                        |
| AI chat pane width      | `380px`                        |
| Ext preview height      | `160px`                        |
| Card preview min-height | `64px`                         |

## Transition

Standard: `transition: all 0.15s` on all interactive elements.

## Shadows

Minimal use — only for floating elements:

- Dropdown menu: `box-shadow: 0 4px 12px rgba(0,0,0,0.1)`
- Comment popup/inline input: `box-shadow: 0 2px 8px rgba(0,0,0,0.12)`
- Cards/panels: **no shadow** — border only

## Focus States

```css
/* Standard focus pattern */
border-color: var(--demo-accent);
box-shadow: 0 0 0 2px var(--demo-accent-bg);
outline: none;
```

## Responsive Breakpoints

| Breakpoint | Changes                                                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| `≤1200px`  | Node grid 3→2 columns                                                                                                   |
| `≤768px`   | Node grid 2→1 column, ext grid 1 column, header stacks, sidebars go full-width above content, AI page stacks vertically |
