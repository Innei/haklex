---
name: demo-ui-direction
description: Use when modifying demo/ UI — adding pages, components, or styles. Defines the monochrome visual system, layout patterns, and component conventions for the haklex demo site.
---

# Demo UI Direction

Monochrome, minimal aesthetic inspired by Linear/Vercel. All demo/ UI work must follow these conventions.

**Sub-references:**

- `demo-ui-tokens` — full color/spacing/typography/radius token tables
- `demo-ui-components` — all component CSS classes, specs, and anatomy diagrams

## Visual System

**Palette**: Black/white only. No colored accents. See `demo-ui-tokens` for full color table.

- Light: `#171717` text, `#fafafa` bg, `#e5e5e5` border
- Dark: `#fafafa` text, `#0a0a0a` bg, `#262626` border
- Accent = text color itself. Subtle bg = `rgba(text, 0.06)`

**Typography**: `-apple-system, 'Inter', system-ui, sans-serif`. Headings: tight letter-spacing (-0.3px to -0.5px), 700 weight. See `demo-ui-tokens` for full size/weight matrix.

**Spacing**: 32px page padding, 16px card gaps, 24-28px section gaps. Increments of 2/4/8. See `demo-ui-tokens` for complete spacing scale.

**Borders**: 1px `var(--demo-border)`. Hover darkens to `var(--demo-text-muted)`. No shadows on cards.

**Radius**: 6-10px cards/panels, 999px pills/badges. See `demo-ui-tokens` for per-component values.

## Logo

SVG angle brackets `< >` + center 4-point sparkle on rounded-square (`rx="7"`). Uses `currentColor` fill, `var(--demo-bg)` for inner paths. Component at `demo/src/components/Logo.tsx`.

## Layout

**Header**: 56px fixed, `max-width: 1200px`. Logo left, 4 nav tabs center, GitHub + theme toggle right.

**Nav items**: Playground (`/`), Nodes (`/nodes`), Extensions (`/extensions`), AI (`/ai`).

**Content area**: `max-width: 1200px`, `padding: 24px`.

## Component Patterns

See `demo-ui-components` for full CSS specs and anatomy of each pattern.

| Pattern           | CSS Class                                | Usage                                   |
| ----------------- | ---------------------------------------- | --------------------------------------- |
| Filter pills      | `.nodes-filter-pill`                     | Category filtering with count badge     |
| Segmented control | `.playground-tabs`                       | Tab switching within a page             |
| Card grid         | `.nodes-grid` / `.ext-grid`              | 3-col (nodes) or 2-col (extensions)     |
| Card expand       | `.node-card` + `.node-card-expanded`     | Click to reveal detail panel            |
| Page header       | `.nodes-page-title` + `.nodes-page-desc` | Title + one-line description            |
| Action button     | `.playground-action-btn`                 | Bordered, transparent bg, hover darkens |

## Page Conventions

- **Playground**: Segmented tabs for sub-views. Shared variant selector in top bar.
- **Nodes**: Filter → grid → card with preview → expand for JSON/edit toggle.
- **Extensions**: Sidebar + detail area. Click sidebar item to show live demo.
- **AI**: Full-bleed split layout, no max-width. Editor left, chat 380px right.

## Anti-Patterns

- No teal (#33a6b8) or pink (#f596aa) — monochrome only
- No box shadows on cards — border darkening only
- No colored badges — use `var(--demo-accent-bg)` (subtle gray)
- No subtitle in header — logo + text only
- No `useContext()` — use `use(Context)` (React 19 rule)
