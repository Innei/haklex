# Demo Redesign — Design Spec

## Goal

Redesign the haklex demo from a developer playground into a polished open-source project showcase, serving both as a project landing page and a development tool.

## Visual Direction

**Style**: Minimal, restrained — inspired by Linear/Vercel dashboard aesthetics.

- **Color**: Monochrome. Light: `#171717` text on `#fafafa` bg. Dark: `#fafafa` text on `#0a0a0a` bg. No teal, pink, or colored accents.
- **Accent**: `--text` itself (black in light, white in dark). Active states use `rgba(text, 0.06)` subtle background.
- **Typography**: `-apple-system, BlinkMacSystemFont, 'Inter', system-ui, sans-serif`. Tight letter-spacing on headings (-0.3px to -0.5px).
- **Spacing**: Generous whitespace. 32px page padding, 16px card gaps, 48–64px editor content padding.
- **Borders**: 1px `var(--border)` (#e5e5e5 light / #262626 dark). Hover darkens to `var(--text-muted)`.
- **Radius**: 6–10px on cards/panels. 999px on pills/badges. No heavy shadows.
- **Theme**: System/Light/Dark toggle in header. CSS custom properties for all tokens.

## Logo

**Design**: F3 — Angle brackets `< >` + center 4-point sparkle star on rounded-square background.

- Angles `< >` represent markup/AST/structure (Lexical node tree)
- Sparkle represents AI capability
- Monochrome: inverts between light/dark mode
- Sizes: 20px (nav), 24px (inline), 32px (standalone), 40px (marketing)
- SVG, single path group, no color dependency beyond foreground/background

## Navigation

**Header**: 56px fixed height, full-width.

- **Left**: Logo icon + "haklex" text
- **Center**: 4 nav items — `Playground` / `Nodes` / `Extensions` / `AI`
- **Right**: GitHub link (bordered pill) + theme toggle button
- **Active state**: Subtle background + text color darkening, no colored accent
- **No subtitle**: Remove current "Lexical-based rich text editor & renderer"

## Page Structure

### 1. Playground (default route: `/`)

Consolidates current Editor, Presets, and Comments pages.

**Layout**:

- Top bar: segmented control tabs (`Editor` / `Presets` / `Comments`) left, variant selector + Import/Export buttons right
- Below: content area based on active tab

**Editor tab**:

- White card with toolbar, large content area (48px/64px padding), bottom status bar
- Status bar: word count, node count, variant, JSON viewer toggle
- Toolbar: formatting buttons with dividers, `+ Insert` at end

**Presets tab**:

- Left sidebar (280px sticky) with preset list
- Right: editor rendering selected preset
- Toolbar with variant/mode controls

**Comments tab**:

- Editor (flex: 1) + right comment sidebar (320px sticky)
- Range comments (selection-based) + block comments (paragraph-level)
- Comment highlight via CSS Highlight API

### 2. Nodes (`/nodes`)

Catalog of all custom node types.

**Layout**:

- Page header: title + one-line description
- Filter bar: pill buttons — `All` / `Inline` / `Block` / `Container` with count badges
- 3-column card grid

**Card design**:

- Top: node name (left) + type badge pill (right, uppercase)
- Middle: one-line description
- Bottom: live preview area (varied per node type — code, table, image placeholder, etc.)
- Click to expand: reveals JSON/Markdown tabs + serialized output + Readonly/Editable toggle + Copy button
- Hover: border darkens, no shadow

### 3. Extensions (`/extensions`)

Heavy-weight plugins and integrations.

**Layout**:

- Page header: title + description
- 2-column card grid

**Card design**:

- Top: 160px preview area showing extension's actual effect
- Bottom: name, description, package tag pill (`rich-ext-*`)
- Click: enters dedicated live playground for that extension

**Content** (merged from current Biz page):

- Excalidraw whiteboard
- Code Snippet (syntax highlighting)
- Gallery (masonry + lightbox)
- Embed (rich link cards, video, oEmbed)
- Diff viewer

### 4. AI (`/ai`)

AI-powered document editing with chat.

**Layout**: Full-bleed, no max-width. Left-right split, no outer margins.

**Left — Editor pane** (flex: 1):

- Toolbar (same as Playground)
- Content area with article text
- Inline diff blocks when AI edits: green add / red delete lines, with Accept/Reject buttons in diff header
- Bottom status bar showing pending edit count

**Right — Chat pane** (380px fixed):

- Header: "Chat" title + model selector dropdown (green dot + model name + caret)
- Message flow: user messages right-aligned (dark bg), AI messages left-aligned (bordered light bg)
- Tool call display: compact cards showing tool name + action description
- Selection pin: appears above input when text is selected in editor — shows pinned quote text + close button
- Input area: textarea + "Enter to send" hint + Send button

**Model/provider config**: Integrated in chat header dropdown, no separate settings page.

## Removed / Deprecated

- **Design System page**: Removed from top nav. Design tokens remain in code but are no longer a demo page. Could be accessible as a dev tool popover/drawer from Playground if needed.
- **Biz page**: Content (diff, excalidraw, link cards, embed) absorbed into Extensions page.
- **Current color scheme**: Teal (#33a6b8) and pink (#f596aa) accents are replaced by monochrome.
- **Subtitle in header**: Removed for cleaner appearance.

## CSS Token Migration

Current tokens → new tokens:

| Current                   | New                                | Value (light)       |
| ------------------------- | ---------------------------------- | ------------------- |
| `--demo-accent` (#33a6b8) | `--demo-accent` (var(--demo-text)) | #171717             |
| `--demo-accent-bg`        | `--demo-accent-subtle`             | rgba(23,23,23,0.06) |
| `--demo-surface-alt`      | Keep                               | #fafafa             |
| All others                | Keep names, adjust values          | Per design          |

## Mockup References

All mockups are in `.superpowers/brainstorm/` (not committed):

- `demo-mockup-c.html` — Full 4-page overview
- `logo-bracket-ai.html` — Logo with AI elements
- `logo-no-braces.html` — Final logo direction (F3)
- `nodes-page-mockup.html` — Nodes page detail
- `ai-page-mockup.html` — AI page detail
