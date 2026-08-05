# Image Writing Experience: Grid Cells & Gallery Height

Date: 2026-08-05
Status: Approved (design)

## Problem

Two pain points when writing image-heavy content:

1. **Grid cells are second-class editors.** You cannot run slash commands inside a
   grid cell in downstream apps, and you cannot insert an image into a cell at all.
2. **Gallery has no height control.** Images with wildly different aspect ratios
   (especially very tall ones) blow up the block, and there is no way to constrain it.

## Root Causes

### Grid

- `GridEditNode` builds each cell editor with a hardcoded node list,
  `NESTED_EDITOR_NODES` (`packages/rich-editor/src/nodes/shared.ts:16`), which does
  **not** contain `ImageNode` — nor any `rich-ext-*` node, since that constant lives in
  core and cannot reference extension packages.
- The slash menu only reaches nested editors through the `nestedEditorPlugins`
  context. Only `demo/src/lexical/LexicalEditor.tsx:28` wires it, and it whitelists
  seven text-only items. Downstream consumers (Shiroi, Yohaku, mx-core/admin) wire
  nothing, so nested editors have no slash menu at all.
- `ImageUploadPlugin` is mounted on the root editor and inserts with
  `editor.update(...)` against that root editor
  (`packages/rich-editor/src/plugins/ImageUploadPlugin.tsx:147`). Even when a command
  dispatched from a cell propagates up to the root listener, the image lands at root
  level instead of in the cell.

### Gallery

`GalleryNode` stores only `images` and `layout` (`grid | masonry | carousel`). Every
`<img>` renders with `height: auto`, so a tall image dictates the block height and
nothing can constrain it.

## Design

### Part 1 — Grid cells become general block containers

#### 1.1 Inherit the parent editor's node registry

Add `createNestedEditor()` to `packages/rich-editor/src/nodes/shared.ts`.

Lexical's `createEditor()`, when called with **no arguments** inside an update context,
reuses `activeEditor._nodes` verbatim — including `replace` / `with` overrides — and
sets `_parentEditor` to the active editor (`lexical/src/LexicalEditor.ts:920` and
`:940`). That is the officially supported way to build a nested editor that inherits
everything. Namespace inheritance is also correct here: `LexicalNestedComposer` warns
when a nested editor's namespace diverges from its parent while the node config matches.

```ts
function $tryGetEditor(): LexicalEditor | null {
  try {
    return $getEditor();
  } catch {
    return null;
  }
}

export function createNestedEditor(fallbackNamespace: string): LexicalEditor {
  // no-arg createEditor() inherits the active editor's node registry and parent link
  if ($tryGetEditor()) return createEditor();
  return createEditor({
    namespace: fallbackNamespace,
    nodes: NESTED_EDITOR_NODES,
    theme: editorTheme,
    onError: (error: Error) => console.error(`[${fallbackNamespace}]`, error),
  });
}
```

`$getEditor()` is public in Lexical 0.48 but throws an invariant when no editor is
active, hence the wrapper. The fallback branch only covers construction outside an update
context (a unit test calling `new GridEditNode()` directly); every production path —
`$createGridEditNode` inside `editor.update`, `importJSON` during `parseEditorState`,
`clone` via `getWritable` — runs with an active editor.

Two properties improve as a side effect of the inherited path. The cell's namespace now
matches its parent's, which is what `LexicalNestedComposer` expects when node configs
match (it warns otherwise, and mismatched namespaces have always broken copy/paste
between cell and root). The theme still arrives, because `LexicalNestedComposer` assigns
the parent theme to `initialEditor._config.theme` before the cell's DOM is built.

Call sites to convert (all three currently pass `NESTED_EDITOR_NODES`):

- `packages/rich-editor/src/nodes/GridEditNode.ts:32` (`createCellEditor`)
- `packages/rich-editor/src/nodes/BannerEditNode.ts:30`
- `packages/rich-editor/src/nodes/AlertQuoteEditNode.ts:21`

**Register everything, filter at the menu.** Registering the full node set (rather than
a curated subset) means pasting content that contains, say, a `TableNode` into a cell
does not throw on an unregistered node type. What a user can _insert_ is governed by the
slash menu, not by the registry.

#### 1.2 Nested slash menu becomes a default module

Create `packages/rich-compose/src/modules/slash-menu/` exporting a
`RichEditorModule` whose only field is:

```tsx
nestedEditorPlugins: <SlashMenuPlugin nested />;
```

Add it to `allEditorModules` (`packages/rich-compose/src/editor.ts:41`). Downstream apps
get nested slash commands by upgrading, with no wiring of their own.

Filtering uses a per-item opt-out rather than a title denylist, so each node declares its
own suitability and new nodes are included by default:

- `CommandItemConfig` (`packages/rich-editor/src/types/slash-menu.ts`) gains
  `nested?: boolean`, default `true`.
- `SlashMenuItem` (`packages/rich-plugin-slash-menu/src/SlashMenuItem.ts`) gains the same
  field, carried through its constructor options and through `collectNodeSlashItems`.
- `SlashMenuPlugin` gains a `nested?: boolean` prop. When set, it filters the assembled
  item list to those with `nested !== false`.

Items marked `nested: false`:

| Item       | Where                                                               |
| ---------- | ------------------------------------------------------------------- |
| Grid       | `packages/rich-editor/src/nodes/GridEditNode.ts:47`                 |
| Nested Doc | `packages/rich-ext-nested-doc/src/NestedDocEditNode.ts:32`          |
| Chat       | `packages/rich-ext-chat/src/nodes/ChatEditNode.ts:19`               |
| Excalidraw | `packages/rich-ext-excalidraw/src/ExcalidrawEditNode.ts:26`         |
| Table      | `packages/rich-plugin-slash-menu/src/builtinItems.ts:119` (builtin) |

The demo's local `nestedEditorSlashMenuModule` and its `nestedEditorSlashItemTitles`
whitelist (`demo/src/lexical/LexicalEditor.tsx:18-37`) are deleted — the default module
supersedes them.

#### 1.3 Route image insertion to the originating editor

Lexical passes the **dispatching editor** as the second argument to every command
listener: `listener(payload, fromEditor)`
(`lexical/src/LexicalUpdates.ts:934`), where `fromEditor` is threaded from
`dispatchCommand` (`lexical/src/LexicalUtils.ts:1529`). Commands dispatched on a cell
editor propagate up the `_parentEditor` chain to the root-mounted plugin while retaining
their origin.

In `packages/rich-editor/src/plugins/ImageUploadPlugin.tsx`:

- `insertByUpload` and the URL-insert path take a `target: LexicalEditor` parameter and
  call `target.update(...)` instead of closing over the root `editor`.
- `DRAG_DROP_PASTE` and `PASTE_COMMAND` listeners forward their `fromEditor` argument
  into `handleFiles` → `insertByUpload`.
- `OPEN_IMAGE_UPLOAD_DIALOG_COMMAND` stores `fromEditor` in a ref when opening the
  dialog; dialog confirm inserts into that stored editor. The ref resets to the root
  editor when the dialog closes.

This fixes three flows at once: slash-menu insert, drag-and-drop, and paste — all of
which previously landed at root level.

#### 1.4 Images default to full width inside a cell

`$withAdaptiveImageDisplayWidth` (`packages/rich-editor/src/utils/image-insertion.ts`)
already forces `displayWidth: 100` inside table cells. Extend the same rule to nested
editors: when the active editor has a non-null `_parentEditor`, the cell _is_ the
container, so a floated or partial-width image makes no sense.

### Part 2 — Gallery height control

#### 2.1 Schema

`GalleryImage` is unchanged. `GalleryRendererProps`, `SerializedGalleryNode`, and
`GalleryNodePayload` (`packages/rich-ext-gallery/src/types.ts`,
`GalleryNode.ts`) gain three optional fields. Defaults reproduce today's rendering
exactly, so existing documents are unaffected.

| Field           | Type                                          | Default   | Applies to                                         |
| --------------- | --------------------------------------------- | --------- | -------------------------------------------------- |
| `aspect`        | `'auto' \| '1:1' \| '4:3' \| '16:9' \| '3:4'` | `'auto'`  | `grid`, `carousel`                                 |
| `fit`           | `'cover' \| 'contain'`                        | `'cover'` | `grid`, `carousel`; inert when `aspect === 'auto'` |
| `maxItemHeight` | `number` (px)                                 | unset     | `masonry` only                                     |

Masonry deliberately ignores `aspect`/`fit`: uneven heights are the point of a waterfall
layout. `maxItemHeight` caps runaway tall images without flattening the variation.

`GalleryNode` gains `getAspect/setAspect`, `getFit/setFit`,
`getMaxItemHeight/setMaxItemHeight`, mirrored in `clone`, `importJSON`, `exportJSON`, and
in `GalleryEditNode`'s `clone`/`importJSON`/`decorate` change handlers.

#### 2.2 Rendering

`packages/rich-ext-gallery/src/GalleryRenderer.tsx` and `styles.css.ts`:

- **grid / carousel, `aspect !== 'auto'`**: the `<figure>` gets `aspectRatio` from the
  chosen ratio; the `<img>` gets `width: 100%; height: 100%; object-fit: <fit>`.
  Total block height becomes `rows × rowHeight` — predictable.
- **grid / carousel, `aspect === 'auto'`**: unchanged from today.
- **masonry with `maxItemHeight`**: the `<img>` gets `max-height: <N>px; width: auto;
max-width: 100%`, preserving each image's own ratio while capping height.
- **masonry without `maxItemHeight`**: unchanged.

Ratio values are passed as CSS `aspect-ratio` strings (`16 / 9`), not computed padding
hacks.

#### 2.3 Editing UI

In the gallery dialog header (`GalleryEditRenderer.tsx:342-355`), next to the existing
layout `SegmentedControl`:

- When layout is `grid` or `carousel`: an aspect `SegmentedControl` (Auto / 1:1 / 4:3 /
  16:9 / 3:4) and a fit `SegmentedControl` (Cover / Contain). Fit is disabled while
  aspect is Auto.
- When layout is `masonry`: a single "Max height" number input (px, empty = unset).

The new controls hold local dialog state and commit on Save alongside `images` and
`layout`, matching the existing `handleSave` flow; `GalleryEditNode.decorate` gains the
corresponding `onAspectChange` / `onFitChange` / `onMaxItemHeightChange` handlers.

#### 2.4 Serialization round-trips

- **LiteXML writer** (`packages/rich-litexml/src/writers/custom.ts:288`): emit `aspect`,
  `fit`, `max-item-height` via the existing `optAttr` helper so unset fields stay absent.
- **LiteXML reader** (`packages/rich-litexml/src/readers/custom.ts:346`): parse the three
  attributes, coercing `max-item-height` to a number and dropping invalid values.
- **Headless** (`packages/rich-headless/src/index.ts:348`): extend the
  `headlessDecorator('gallery', [...])` prop list to
  `['images', 'layout', 'aspect', 'fit', 'maxItemHeight']` with matching defaults.

## Testing

- `packages/rich-editor/tests/grid-node.test.ts`: a cell editor created inside an update
  inherits the parent's node registry; created outside one, it falls back to
  `NESTED_EDITOR_NODES`. The existing `vi.mock('../src/nodes/shared', ...)` at line 21
  must also stub `createNestedEditor`, or the mock will shadow it with `undefined`.
- New test: `SlashMenuPlugin` with `nested` omits items flagged `nested: false` and keeps
  everything else.
- New test: dispatching `DRAG_DROP_PASTE` on a cell editor inserts the `ImageNode` into
  that cell's editor state, not the root's.
- `packages/rich-litexml/tests/roundtrip.test.ts`: gallery round-trip covering all three
  new attributes, plus a legacy gallery (no attributes) that survives unchanged.

## Out of Scope

- Downstream repos (Shiroi, Yohaku, mx-core/admin). They pick this up on the next
  `@haklex/*` release; the nested slash menu arrives with no code change on their side.
- `BlockHandlePlugin` and `FloatingToolbarPlugin` support inside nested editors.
- The drag-hover highlight overlay inside cells. Drop-to-insert works via
  `DRAG_DROP_PASTE`; only the visual affordance (which `ImageUploadPlugin` attaches to
  the root element) is absent.
- Per-image aspect overrides and focal-point cropping.
