# Demo UX Refinement — Design Spec

## Goal

Four targeted UX improvements to the demo app: route-based navigation for Editor/Presets/Comments, redesigned tab bar, Extensions page sidebar layout, and Presets sidebar restyling.

## 1. Route-Based Tab Navigation

**Current**: `PlaygroundPage` uses `useState<Tab>` to switch between Editor/Presets/Comments. Tab state is lost on refresh.

**Proposed**: Split into independent routes. Remove the `PlaygroundPage` wrapper entirely.

```
/           → redirect to /editor
/editor     → EditorPage (current EditorTabContent)
/presets    → PresetsPage (current PresetsTabContent, keeps ?preset=X&mode=edit query params)
/comments   → CommentsPage (current CommentsTabContent)
/nodes      → NodeShowcase (unchanged)
/extensions → ExtensionsPage (redesigned)
/ai         → AgentPage (unchanged)
```

**Router config** (`App.tsx`):

- Add `/editor`, `/presets`, `/comments` routes
- Change `/` to `<Navigate to="/editor" replace />`
- Remove `PlaygroundPage` component
- Extract `EditorTabContent`, `PresetsTabContent`, `CommentsTabContent` into separate page files under `pages/`

**Variant selector**: The `RichEditorVariant` state (article/comment/note) currently lives in `PlaygroundPage`. After split, move it to `Layout` level so it persists across Editor/Presets/Comments routes. Only render the variant selector in the header when the current route is `/editor`, `/presets`, or `/comments`.

## 2. Top Navigation Bar Redesign

**Current**: Two-level navigation — top header has 4 nav items (Playground/Nodes/Extensions/AI), then PlaygroundPage has a second bar with segmented tabs (Editor/Presets/Comments) + variant dropdown.

**Proposed**: Single-level navigation. All 6 items in the top header nav.

**Nav items** (in order): `Editor` · `Presets` · `Comments` · `Nodes` · `Extensions` · `AI`

**Style changes**:

- Use the existing `.nav-tab` style for all items (pill-shaped, subtle background on active)
- Remove `.playground-bar`, `.playground-tabs`, `.playground-tab` CSS classes
- Variant selector (`<select>`) renders in `.app-header-right`, before GitHub link, conditionally visible only on `/editor`, `/presets`, `/comments` routes

**No visual separator** between the first 3 and last 3 nav items — they are peers in the same nav bar.

## 3. Extensions Page — Sidebar Layout

**Current**: 2-column card grid with 160px preview areas. Click toggles `activeExt` state to show/hide detail below cards.

**Proposed**: Sidebar navigation + detail area, similar to Presets.

**Layout structure**:

```
┌─────────────────────────────────────────┐
│ Extensions (page header)                │
├──────────┬──────────────────────────────┤
│ Sidebar  │  Detail area                 │
│ 220px    │  (flex: 1)                   │
│          │                              │
│ [items]  │  Title + package tag         │
│          │  Description                 │
│          │  Live demo                   │
└──────────┴──────────────────────────────┘
```

**Sidebar** (`220px`, no background, border-right only):

- Uppercase label header: "EXTENSIONS"
- Item list: name (13px, 600 weight when active) + short description (11px, muted)
- Active item: subtle background `rgba(text, 0.06)`, rounded 6px
- No border on items, hover shows same subtle background

**Detail area**:

- Title (18px, 600) + package tag pill inline
- Description paragraph (13px, muted)
- Live demo area below (existing `ExtensionDetail` component)

**State**: Default to first extension selected. Use `useState` (no URL binding needed for extensions).

**CSS**: Remove `.ext-grid`, `.ext-card`, `.ext-card-preview`, `.ext-card-body`, `.ext-card-name`, `.ext-card-desc`, `.ext-card-tag`. Add `.ext-layout`, `.ext-sidebar`, `.ext-sidebar-item`, `.ext-detail`.

## 4. Presets Sidebar Restyling

**Current**: `.presets-sidebar` has `background: var(--demo-surface)`, `border: 1px solid`, `border-radius: 10px`, `padding: 20px`. Items are full-width buttons with their own styling.

**Proposed**: Match the Extensions sidebar style for visual consistency.

**Changes**:

- Remove sidebar background color and border-radius — use `border-right: 1px solid var(--demo-border)` only
- Width: keep 220px (down from 280px) to match Extensions
- Sidebar header: uppercase label "PRESETS" (11px, letter-spacing 0.5px)
- Move Edit/Readonly toggle into sidebar header area (right-aligned, small pill buttons)
- Item style: same as Extensions — name (13px) + description (11px, muted), no border, subtle bg on active/hover
- Remove `.presets-sidebar h3` dedicated heading style

**Remove from toolbar**: The Mode toggle (Edit/Readonly) moves into the sidebar header, so the toolbar above the main content area can be removed or simplified.

## Files to Modify

| File                                | Changes                                                                                            |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `demo/src/App.tsx`                  | Update routes, add variant state to Layout, update navItems, conditionally render variant selector |
| `demo/src/pages/PlaygroundPage.tsx` | Delete file. Extract 3 page components into separate files                                         |
| `demo/src/pages/EditorPage.tsx`     | New file, from `EditorTabContent`                                                                  |
| `demo/src/pages/PresetsPage.tsx`    | New file, from `PresetsTabContent`                                                                 |
| `demo/src/pages/CommentsPage.tsx`   | New file, from `CommentsTabContent`                                                                |
| `demo/src/pages/ExtensionsPage.tsx` | Rewrite to sidebar layout                                                                          |
| `demo/src/demo.css`                 | Remove playground-bar/tab styles, add ext-layout/sidebar styles, restyle presets-sidebar           |

## Out of Scope

- NodeShowcase page (unchanged)
- AgentPage (unchanged)
- Logo or header height changes
- Color scheme / theme token changes
- Mobile responsive adjustments (handle in follow-up)
