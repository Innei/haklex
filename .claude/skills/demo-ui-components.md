---
name: demo-ui-components
description: Use when creating or modifying demo/ UI components — buttons, cards, panels, pills, inputs, badges. Reference for all component CSS classes and their exact specs.
---

# Demo UI Components Reference

**Parent skill:** `demo-ui-direction` — overall design direction and anti-patterns.
**Sibling skill:** `demo-ui-tokens` — color/spacing/typography/radius token tables.

All components use CSS custom properties from `demo/src/demo.css`. No Tailwind, no CSS-in-JS (except Vanilla Extract for editor package internals).

## Buttons

| Class                    | Size           | Usage                                   |
| ------------------------ | -------------- | --------------------------------------- |
| `.btn`                   | 13px, 6px 12px | Default bordered button                 |
| `.btn-active`            | 13px, 6px 12px | Selected state — accent border + bg     |
| `.btn-sm`                | 12px, 4px 10px | Compact variant                         |
| `.playground-action-btn` | 12px, 6px 14px | Transparent bg, bordered, hover darkens |

```css
/* Default button */
.btn {
  padding: 6px 12px;
  font-size: 13px;
  border: 1px solid var(--demo-border);
  border-radius: 6px;
  background: var(--demo-surface);
  color: var(--demo-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.btn:hover {
  background: var(--demo-hover);
}

/* Active state — NOT a modifier, replaces .btn */
.btn-active {
  /* same sizing as .btn */
  border: 1px solid var(--demo-accent);
  background: var(--demo-accent-bg);
  color: var(--demo-accent);
  font-weight: 600;
}
```

## Cards

**Node card** (`.node-card`): 10px radius, 1px border, hover darkens border. Body 20px padding.

```
┌─────────────────────────────┐
│ .node-card-body (20px pad)  │
│  ┌─name──────────type-pill┐ │  .node-card-top
│  └────────────────────────┘ │
│  .node-card-desc (13px)     │
│  ┌────────────────────────┐ │
│  │ .node-card-preview     │ │  bg: var(--demo-bg), 8px radius
│  └────────────────────────┘ │
├─────────────────────────────┤  border-top (only when expanded)
│ .node-card-detail (16px 20px)│
│  JsonViewer + action buttons │
└─────────────────────────────┘
```

Expand state: add class `.node-card-expanded` alongside `.node-card`.

**Extension card**: 12px radius, 160px preview area top, body 16px 20px bottom.

```css
.ext-card {
  border-radius: 12px;
  overflow: hidden;
}
.ext-card-preview {
  height: 160px;
  background: var(--demo-bg);
  border-bottom: 1px solid var(--demo-border);
}
.ext-card-body {
  padding: 16px 20px;
}
.ext-card-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--demo-accent-bg);
}
```

## Panel

Bordered container with optional header. Used for editor wrappers, JSON viewers.

```css
.panel {
  background: var(--demo-surface);
  border-radius: 8px;
  border: 1px solid var(--demo-border);
}
.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--demo-border);
  background: var(--demo-surface-alt);
}
.panel-body {
  padding: 16px;
}
```

Component: `demo/src/components/Panel.tsx` — props: `title`, `badge?`, `headerExtra?`, `bodyStyle?`.

## Filter Pills

Round pill buttons for category filtering.

```css
.nodes-filter-pill {
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid var(--demo-border);
  border-radius: 999px;
  color: var(--demo-text-muted);
  background: transparent;
}
.nodes-filter-pill-active {
  color: var(--demo-text);
  background: var(--demo-accent-bg);
  border-color: transparent;
}
```

Count badge inside pill: `<span class="nodes-filter-count">18</span>` — 12px, muted, margin-left 6px.

## Segmented Control

Tab group with shared background border.

```css
.playground-tabs {
  display: flex;
  gap: 1px;
  background: var(--demo-border);
  border-radius: 8px;
  padding: 1px;
}
.playground-tab {
  padding: 7px 16px;
  font-size: 12px;
  font-weight: 500;
  background: var(--demo-bg);
  color: var(--demo-text-muted);
}
.playground-tab-active {
  background: var(--demo-surface);
  color: var(--demo-text);
  font-weight: 600;
}
/* First/last child get 7px radius on outer corners */
```

## Badge

Pill-shaped label. Used in panel headers, comment cards.

```css
.badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--demo-accent-bg);
  color: var(--demo-accent);
  text-transform: uppercase;
}
```

## Type Badge (Node)

Smaller, more compact than `.badge`. Used on node cards.

```css
.node-card-type {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--demo-accent-bg);
  color: var(--demo-text-muted);
  text-transform: uppercase;
}
```

## Toolbar

Horizontal control strip with grouped buttons.

```css
.toolbar {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  padding: 12px 16px;
  border-radius: 8px;
  background: var(--demo-surface);
  border: 1px solid var(--demo-border);
}
.toolbar-group {
  display: flex;
  gap: 6px;
  align-items: center;
}
.toolbar-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--demo-text-muted);
}
```

## Select

Native select styled to match.

```css
.playground-select {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid var(--demo-border);
  border-radius: 6px;
  background: var(--demo-surface);
  color: var(--demo-text-secondary);
}
```

## Code Block

```css
.json-pre,
.json-viewer-content {
  padding: 16px;
  font-size: 12px;
  line-height: 1.5;
  font-family: 'SF Mono', SFMono-Regular, ui-monospace, Consolas, monospace;
  background: var(--demo-code-bg);
  color: var(--demo-code-text);
  border-radius: 6px;
  max-height: 400-500px;
  overflow: auto;
}
```

## Input / Textarea

```css
.comment-input {
  padding: 4px 8px;
  font-size: 13px;
  border: 1px solid var(--demo-border);
  border-radius: 4px;
  background: var(--demo-surface-alt);
  color: var(--demo-text);
}
.comment-input:focus {
  border-color: var(--demo-accent);
  box-shadow: 0 0 0 2px var(--demo-accent-bg);
}

.import-textarea {
  /* same pattern, larger: padding 12px, border-radius 6px */
}
```

## Sidebar (Shared)

Reusable sidebar pattern used by Presets and Extensions.

```css
.sidebar-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.sidebar-item {
  padding: 8px 12px;
  border-radius: 6px;
}
.sidebar-item:hover {
  background: var(--demo-hover);
}
.sidebar-item-active {
  background: var(--demo-accent-bg);
}
.sidebar-item-name {
  font-size: 13px;
  font-weight: 500;
}
.sidebar-item-active .sidebar-item-name {
  font-weight: 600;
  color: var(--demo-text);
}
```

## Sizing Constants

| Token                  | Value       |
| ---------------------- | ----------- |
| Border radius (card)   | 10px        |
| Border radius (panel)  | 8px         |
| Border radius (button) | 6px         |
| Border radius (pill)   | 999px       |
| Font size (body)       | 13-14px     |
| Font size (label)      | 11-12px     |
| Font size (heading)    | 24px        |
| Font size (card name)  | 14px        |
| Transition             | `all 0.15s` |
