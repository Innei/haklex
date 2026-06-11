# Image Resize & Float Layout — Design

Date: 2026-06-12
Status: Approved (Approach A — node props + edit UI inside `rich-renderer-image`)

## Goal

Let authors control the display size and layout of images: resize via drag handles
or presets, and choose between standalone block (current behavior), left/right
aligned block, or floated (text wraps around the image).

## Scope

- `@haklex/rich-editor` — `ImageNode` gains two serialized properties.
- `@haklex/rich-renderer-image` — static renderer honors the new props; edit
  renderer gains drag-resize handles and toolbar controls.
- `@haklex/rich-litexml` — image writer/reader round-trips the new attributes.
- Docs: `litexml-authoring` skill and `rich-ext-ai-agent` system prompt mention
  the new attributes.

Out of scope: video or other nodes (extract a shared resize wrapper only when a
second consumer appears), Markdown export changes (`rich-headless` ignores the
new props — Markdown cannot express them), gallery images.

## Node changes (`packages/rich-editor/src/nodes/ImageNode.ts`)

New optional serialized properties (version stays 1; both omitted by default, so
old documents are untouched):

- `displayWidth?: number` — display width as a percentage of the container,
  clamped to 10–100. `undefined` keeps current behavior (natural width, capped
  at 1200px).
- `layout?: 'align-left' | 'align-right' | 'float-left' | 'float-right'` —
  `undefined` means the current centered standalone block.

New setters: `setDisplayWidth(width?: number)` and `setLayout(layout?: ImageLayout)`,
following the existing setter pattern (`getWritable()`).

The block wrapper (`<div class="rich-image-wrapper">` from `createDOM`) carries a
`data-layout` attribute (and width style for floats) via `createDOM`/`updateDOM`,
because float must apply to the block-level wrapper for following paragraphs to
wrap around it. The decorated `<figure>` handles size/alignment within the wrapper.

Export the `ImageLayout` type from the package root.

## Static renderer (`packages/rich-renderer-image`)

- `ImageRendererProps` gains `displayWidth?: number` and `layout?: ImageLayout`.
- `<figure>` width becomes `${displayWidth}%` when set (still `max-width: 1200px`).
- Layout styles (Vanilla Extract, keyed by `data-layout` on the wrapper):
  - `align-left` / `align-right` — block stays in flow, figure aligned to that side.
  - `float-left` / `float-right` — wrapper floats with a `1.5rem` gap toward the
    text side and `1rem` bottom margin; figure margin collapses to 0.
- Narrow screens: at `max-width: 640px` a media query removes the float and
  resets the wrapper to a full-width block, so mobile readers never get a
  too-narrow text column.
- SSR static render (via `rich-compose` image module) uses the same component,
  so it inherits the behavior with no module changes beyond prop pass-through.

## Edit UI (`packages/rich-renderer-image`)

### Drag handles (Notion-style side pills)

- Vertical pill bars on the left and right edges of the figure, shown when the
  image is hovered or selected in editor mode.
- Horizontal drag previews the width live (local state / inline style), and on
  release converts the pixel width to a percentage of the editor content width,
  clamps to 10–100, and commits with `setDisplayWidth` inside `editor.update`.
- Aspect ratio is always preserved (height follows width via the existing
  `aspectRatio` style); no vertical handles.

### Toolbar additions (`ImageEditToolbar`)

- Size presets: a 25% / 50% / 75% / 100% button group calling `setDisplayWidth`
  (100% stores `100`, distinct from `undefined` = natural).
- Layout switcher: a five-state button group — default (centered block),
  align-left, align-right, float-left, float-right — calling `setLayout`
  (`undefined` for default). Lucide icons, consistent with existing toolbar
  buttons.

## LiteXML (`packages/rich-litexml`)

- Writer (`writers/custom.ts`): add `display-width` (stringified number) and
  `layout` attributes via the existing `optAttr` helper; omitted when unset.
- Reader (`readers/custom.ts`): parse `display-width` with `numAttr`, validate
  `layout` against the allowed values (invalid → `undefined`).
- No registry changes — `image`/`img` are already registered.

## Docs / agent

- `litexml-authoring` skill: document the two new `img` attributes.
- `rich-ext-ai-agent` system prompt: mention them where image authoring is
  described.

## Testing

- `ImageNode` JSON serialization round-trip including the new fields, and
  defaults when absent.
- LiteXML writer/reader round-trip (`display-width`, `layout`, omission of
  defaults, invalid `layout` value handling) under `packages/rich-litexml/tests/`.
- Manual verification in the demo playground: drag-resize, presets, all five
  layout states, text wrap, narrow-viewport unfloat.

## Error handling

- `setDisplayWidth` clamps to 10–100 and rounds to an integer; non-finite input
  is treated as `undefined`.
- Reader ignores out-of-range or non-numeric `display-width` (falls back to
  `undefined`) and unknown `layout` values.
