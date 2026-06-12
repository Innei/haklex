# Pre-upload Image Edit Modal — Design

Date: 2026-06-12
Status: Approved (Approach A — opt-in plugin package + preprocessor seam in core)

## Goal

When a user adds an image to the editor, show a CleanShot-style edit modal first
— crop and annotate (arrow, pen, rect, ellipse, text, counter, cover) — and only
upload the edited result. The modal doubles as an insertion confirmation step.

## Decisions

- Libraries: `react-image-crop` (ISC) for cropping (free-aspect draggable
  marquee — `react-easy-crop` was rejected during implementation because it
  only supports fixed-aspect zoom/pan cropping), `@markerjs/markerjs3`
  (Linkware — a small attribution link to markerjs.com stays visible in the
  modal UI) for annotation. Both headless; all chrome is our own Vanilla
  Extract components.
- Trigger: all three entry paths (drag-drop, paste, file-picker dialog) open
  the modal for a SINGLE image file. Multi-file drops/pastes upload directly
  with no modal. The modal always offers "Upload without editing".
- UI: single-screen editor modeled on CleanShot X — left vertical tool rail,
  contextual top bar, canvas center, action footer. Crop is a tool mode, not a
  wizard step.

## Architecture

### Core seam (`@haklex/rich-editor`)

New context `ImagePreprocessContext` (follows `ImageUploadContext` patterns):

```ts
type ImagePreprocessResult = File | 'skip' | null;
type ImagePreprocessFn = (
  file: File,
  meta: { source: 'drop' | 'paste' | 'dialog' },
) => Promise<ImagePreprocessResult>;
```

- `File` → upload the returned (edited) file instead of the original.
- `'skip'` → upload the original unchanged ("Upload without editing").
- `null` → cancel; nothing is inserted.

`ImageUploadPlugin` changes:

- `insertByUpload()` consults the context before uploading. The preprocessor is
  invoked only when exactly one image file is being inserted in that gesture;
  multi-file batches bypass it.
- No provider registered → behavior identical to today. Default value is
  `null`; the provider value must be stable (ref or useMemo per repo context
  conventions).
- Upload, `computeImageMeta` (dimensions + thumbhash), and node insertion all
  operate on the preprocessor's output file.

### Plugin package (`@haklex/rich-plugin-image-editor`)

New workspace package following the existing `rich-plugin-*` layout and shared
Vite config (`createViteConfig()`).

- deps: `react-image-crop`, `@markerjs/markerjs3`
- peerDeps: `react`, `react-dom`, `@haklex/rich-editor`, `@haklex/rich-editor-ui`
- Exports `ImageEditModalPlugin`: a component rendered inside `RichEditor` that
  registers an `ImagePreprocessFn` via `ImagePreprocessContext`'s provider and
  presents the modal through the `presentDialog()` stack API from
  `@haklex/rich-editor-ui` (same pattern as the Excalidraw fullscreen editor).
  The preprocessor returns a Promise resolved by the modal's outcome.

## Modal UI

Layout (CleanShot-style, near-fullscreen dialog):

- **Left tool rail** (top → bottom): Crop (separated by a divider), Arrow, Pen,
  Rect, Ellipse, Text, Counter (auto-incrementing numbered badge), Cover
  (solid-fill redaction). Active tool highlighted.
- **Top bar**: title, color swatches (red, amber, green, blue, black, white),
  stroke size (3 steps), undo/redo. Options are contextual to the active tool
  (e.g. crop shows none of the stroke options).
- **Canvas**: checkerboard backdrop, image centered.
  - Crop tool active → `react-image-crop` surface (free-aspect draggable and
    resizable selection marquee, full-image initial selection).
  - Any annotation tool active → markerjs3 `MarkerArea` on the current cropped
    bitmap.
- **Footer**: left "Upload without editing"; right Cancel / Upload (primary).
- A small markerjs.com attribution link sits unobtrusively in the modal (
  Linkware requirement).

### Crop/annotate interplay

- Confirming a crop (switching from Crop to an annotation tool, or pressing
  Upload while in crop mode) extracts the crop region to a canvas and re-bases
  the markerjs3 surface on the new bitmap.
- Annotation state lives in image coordinates; after a re-crop, existing
  markers are offset by the crop origin so they keep their position relative
  to the image content. Markers falling outside the new bounds are simply
  clipped visually (markerjs renders them off-canvas; no deletion).
- Undo/redo covers annotation operations (markerjs3 state snapshots); crop has
  a single "reset crop" affordance rather than participating in undo history.

### Output pipeline

1. `Renderer.rasterize()` flattens markers onto the cropped bitmap.
2. `canvas.toBlob()` with the original MIME type; falls back to `image/png`
   when the type is unsupported for encoding.
3. `new File([blob], originalName, { type })` resolves the preprocessor
   Promise; core proceeds with upload + metadata exactly as today.

## Error handling

- Image fails to decode in the modal → inline error state; only "Upload
  without editing" and Cancel remain enabled.
- Rasterize/export failure → error toast, resolve with `'skip'` (original file
  uploads) so user work isn't lost silently.
- Dialog dismissed (Esc, backdrop, Cancel) → resolve `null`; nothing inserted.

## Out of scope

- Regional blur/pixelate (markerjs3 has no such marker; Cover is the redaction
  story). Revisit only if demanded.
- Editing images already in the document (post-insertion re-edit).
- Video or other media types.
- Mobile-optimized layout beyond what the dialog stack's responsive sheet mode
  provides.

## Testing

- Plugin package: vitest unit tests for pure logic — crop coordinate math
  (percent crop area → pixel rect), output pipeline helpers (MIME fallback
  selection), marker re-base offset math. UI interactions verified manually.
- Core seam: tests for `insertByUpload` with and without a registered
  preprocessor — single file goes through preprocessor (File / 'skip' / null
  outcomes), multi-file batches bypass it (follow existing rich-editor test
  conventions from tests/).
- Manual verification in the demo playground: all three entry paths, multi-file
  bypass, skip button, cancel, crop+annotate+upload round trip.
