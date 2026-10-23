# Steps node — design

Artboard (LobeHub vs haklex comparison that led here): https://claude.ai/artifact/49YdGMDGRTEHFnVDLFEXpe

## Intent

Imported LobeHub posts use `<Steps>`: a numbered sequence of steps, each a heading plus free content. haklex has no matching node. The current import maps it to `nested-doc`, whose static preview shows only the first 6 nodes behind a fade, so readers lose most of the steps.

`steps` is a new block node with an explicit list of steps. Each step owns a plain-text title and a nested rich-content state. The node is built so that new per-step fields and new layouts can be added without migrating data, and so that host apps can replace the whole UI through a renderer slot, the same way Yohaku overrides other renderers.

## Goals

- A `steps` node whose data is a list of `{ id, title, content }` items.
- A default static renderer: a vertical rail and numbered markers, close to the LobeHub look. Hosts override it through a `Steps` RendererConfig slot, or restyle it through semantic class names.
- An edit node with inline editing: a title input and a nested editor per step, plus add, delete and reorder.
- Full pipeline support everywhere other container nodes have it: headless, markdown export, LiteXML read and write, rich-compose module.
- Server-side AI translation covers step titles and step content.

## Non-goals

- Per-step `icon`, `status`, collapse state, custom start number, horizontal layout. The data shape leaves room for them (optional fields on the step object, optional fields on the node). None is built now.
- Table-of-contents integration. Step titles are not root heading nodes, so a TOC built from root headings does not list them.
- Fixing the lossy container text in `$toMarkdown` (`stateText` flattening). `steps` uses the same helper as `grid-container` and gets the fix when it lands.
- The LobeHub `Cards`/`Card` mapping. Decided separately: plain `grid-container` with `cols: 3`, one cell per card (image plus link title); hosts specialize the grid UI. No haklex change.

## Anti-goals

- Step numbering that depends on heading levels inside the content.
- A dialog or modal for editing steps. Editing is inline, as in `grid-container`.
- A node whose saved data loses fields after an `importJSON` → `exportJSON` round trip, including the block id.

## Data

```ts
interface StepItem {
  id: string;
  title: string;
  content: SerializedEditorState;
}

interface SerializedStepsNode extends SerializedLexicalNode {
  type: 'steps';
  version: 1;
  steps: StepItem[];
}
```

- `id`: a short random id, unique within the node. Used for React keys, reorder, and as the translation key for the title. Generated when a step is created. On import, a step without an `id` gets one.
- `title`: plain text. Inline formatting is not kept. Empty is allowed; the renderer still shows the number.
- `content`: a nested editor state, like `grid-container` cells. A new step starts with one empty paragraph.
- Steps are numbered by position, from 1.
- An empty `steps` array is valid data. The static renderer renders nothing for it; the edit decorator shows one empty step.
- Future fields go on `StepItem` or the node as optional properties. `version` stays 1 unless a field changes meaning.

## Package layout

A new extension package `@haklex/rich-ext-steps`, modelled on `@haklex/rich-ext-chat` (node, slot, augment) and `@haklex/rich-ext-nested-doc` (nested content rendering):

| File                                                              | Role                                                                                                                                                                                                                                                                                                           |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/types.ts`                                                    | `StepItem`, `StepsRendererProps`, `SerializedStepsNode`                                                                                                                                                                                                                                                        |
| `src/slot.ts`                                                     | `STEPS_NODE_KEY = 'Steps'`                                                                                                                                                                                                                                                                                     |
| `src/augment.ts`                                                  | `RendererConfig.Steps?: ComponentType<StepsRendererProps>` via module augmentation of `@haklex/rich-editor/static`                                                                                                                                                                                             |
| `src/nodes/StepsNode.ts`                                          | static node. `importJSON` chains `updateFromJSON` so the block id survives. `decorate` returns `createRendererDecoration(STEPS_NODE_KEY, StepsRenderer, { steps })`: the default renderer is the fallback, so a host that registers only the nodes still renders steps (unlike chat, which passes `undefined`) |
| `src/nodes/StepsEditNode.ts`                                      | edit node with `commandItems` (slash and toolbar, section `LAYOUT`, next to Grid)                                                                                                                                                                                                                              |
| `src/StepsRenderer.tsx`                                           | default static renderer                                                                                                                                                                                                                                                                                        |
| `src/StepsEditDecorator.tsx`                                      | inline editing UI                                                                                                                                                                                                                                                                                              |
| `src/transformer.ts`                                              | export-only markdown transformer for the editor side                                                                                                                                                                                                                                                           |
| `src/styles.css.ts`                                               | vanilla-extract styles plus `semanticClassNames`                                                                                                                                                                                                                                                               |
| `src/index.ts`, `src/static.ts`, `src/edit.ts`, `src/renderer.ts` | entries matching the chat package: `stepsNodes`, `stepsEditNodes`                                                                                                                                                                                                                                              |

`StepsRendererProps`:

```ts
interface StepsRendererProps {
  steps: StepItem[];
}
```

The default renderer renders each `content` through `useOptionalNestedContentRenderer()`, as `NestedDocRenderer` does. A host override receives the same props and can render content the same way.

## Default static renderer

- Markup: an `<ol>` of `<li>`, one per step. The title is an `<h3>`-styled element, the marker shows the 1-based index, the content follows.
- Look: a vertical rail on the leading side, round numbered markers on the rail aligned with each title, spacing between steps. Values come from `@haklex/rich-style-token`; no hardcoded colors. Works in light and dark and in every editor variant.
- Semantic class names, so hosts can restyle with CSS alone: `rich-steps`, `rich-steps-item`, `rich-steps-marker`, `rich-steps-title`, `rich-steps-content`.
- Content is never truncated.

## Edit decorator

- Each step: a marker with its number, a single-line title input, and a nested editor for the content, built the same way `GridEditDecorator` builds cell editors (`LexicalNestedComposer` plus `NestedEditorCorePlugins`).
- Those building blocks (`createNestedEditor`, `NESTED_EDITOR_NODES`, `NestedEditorCorePlugins`, the nested-editor plugins context) are private to `@haklex/rich-editor` today. Export them from its edit entry so extension packages can host inline nested editors. This widens the public API on purpose; `steps` stays in its own package rather than moving into `rich-editor` core.
- Actions per step: add a step below, delete, move up, move down. Deleting the last remaining step leaves one empty step; removing the whole node goes through the normal block handle.
- Enter in a title moves focus into that step's content.
- Every change writes back through `getWritable()` on the node.
- Builder's call: control placement and icons, drag-to-reorder (optional, buttons are enough), focus handling details.

## Headless (`@haklex/rich-headless`)

- Add a `StepsNode` stub next to `GridContainerNode` in `src/index.ts`: stores `__steps`, round-trips them in `importJSON`/`exportJSON` (chaining `updateFromJSON`), `getTextContent` joins each title and its content text. Add it to `customHeadlessNodes`.
- Without this stub, a server that parses a post containing `steps` fails, because Lexical cannot find the node type. See Rollout.

## Markdown export

Same directive style as `grid-container`, in both the headless transformer list and the extension's editor transformer:

```
::: steps
::: step{title="Step 1: Download and Install LM Studio"}
<content via stateText>
:::
:::
```

Title values are attribute-escaped with the existing `qA` helper.

## LiteXML (`@haklex/rich-litexml`, `rich-plugin-litexml-paste`)

```xml
<steps id="…">
  <step id="s1" title="Step 1: …">…content…</step>
</steps>
```

- Reader and writer registered in `readers/custom.ts` and `writers/custom.ts`, next to `grid`. The writer serializes each `content` with `ctx.serializeNestedState`; the reader builds each `content` from `ctx.parseChildren`, like grid cells.
- Add `steps` to the known-tag lists in `deserializer.ts` and `litexml-import.ts`.
- Round-trip tests alongside the grid ones.

## rich-compose

A `modules/steps` folder in the chat module's shape (`node.ts`, `edit.ts`, `renderer.tsx`, `module.ts`, `index.ts`) wiring `renderers: { Steps: StepsRenderer }`. Add the package CSS to `scripts/build-css.ts`.

## AI translation (`mx-core/packages/ai`, published as `@mx-space/ai`)

Today `scanNestedEditorStates` finds a nested state only as a direct property value or as an item of an array. `steps` holds states one level deeper (`steps[].content`), and titles are plain strings. Two changes:

1. In `scanNestedEditorStates`, when an array item is a plain object rather than an editor state, scan that object's own properties for editor states. Generic; also covers future nodes of the same shape.
2. Step titles: a new property whitelist entry for node type `steps`, with a new value shape for "a string field on each item of an array, keyed by another field" (`steps[].title`, keyed by `steps[].id`). Write-back sets the translated title on the item with the matching id.

Tests in `packages/ai`: parse and write back a document holding a `steps` node; content and titles both translate.

## Rollout

Scope of this work: steps 1 to 4 below, plus the Yohaku renderer (next section). Done means a `steps` block renders in the mx-core and Byline admin previews with the default renderer, and on Yohaku with its own renderer. Step 5 is a separate change.

Order matters, because a server without the headless stub cannot parse a post holding `steps`:

1. haklex: this spec, then a release (new package plus headless, litexml, compose changes).
2. `@mx-space/ai`: translation changes, then a release.
3. Servers (`mx-core/apps/core`, `byline/apps/server`): bump haklex and `@mx-space/ai`.
4. Editors and renderers: mx-core admin, Byline admin, Yohaku register `stepsNodes` / `stepsEditNodes` and the renderer, the way each registers `rich-ext-chat` today.
5. Byline CLI: map `Steps` to `steps` (below).

## Yohaku renderer

Artboard: https://claude.ai/artifact/8eMXES7GuP29UwPUmL3hGQ (direction A, "一线", light and dark; B and C were the rejected directions).

- Lives in `Yohaku/packages/rich-content/src/lexical/portable/`: `steps.tsx` (`LexicalStepsOverride`) and `steps-module.ts` (`yohakuStepsModule`, same shape as `yohakuChatModule`: `name` from the compose module, `nodes: stepsNodes`, `renderers: { Steps: LexicalStepsOverride }`), registered where `yohakuChatModule` is.
- Styles in `yohaku-block-styles.css` under a `steps · 一线` section, Yohaku tokens only (`--color-neutral-*`, `--color-accent`, `--text-*`), no raw hex.
- Look:
  - The list is indented 28px from the prose edge; a 1px rail in `--color-neutral-3` runs down that indent, from the first title to the last.
  - Each step has a small hollow dot on the rail (1px `--color-neutral-5` ring on the paper color), level with the title's first line. The last step's dot is filled with `--color-accent`.
  - The number sits inside, on the title line: two-digit mono (`01`, `02`), `label-12`, `--color-neutral-7`, 10px before the title. No numbers in the left gutter.
  - Title: `copy-16`, weight 500, `--color-neutral-10`. Content: the body's own size and color, rendered through the nested content renderer.
  - 32px between steps.
- Titles render as stored. LobeHub titles already start with "第一步：" / "Step 1:", so the number shows twice; stripping such prefixes is not done (my call: the renderer does not rewrite author text).
- Dark mode needs no extra rules; the neutral scale inverts.

## Byline CLI mapping (consumer, separate change)

- New child conversion for the component map: split `<Steps>` children at headings of a given depth (LobeHub: h3). Each heading becomes a step title, the nodes up to the next heading become its content.
- Title text: the heading's plain text; a bold wrapping the whole title is dropped (3 English titles are `### **Step 1: …**`).
- Content before the first heading: prepended to the first step and reported as an issue. Measured: 0 cases in the LobeHub blog.
- `<Steps>` with no heading at that depth: unwrapped into the post and reported.

## Tests

- Headless: `importJSON` → `exportJSON` keeps `steps` and the block id; `getTextContent` includes titles.
- Markdown: export of a two-step node.
- LiteXML: read, write, round trip.
- Edit node: add, delete, reorder update the serialized data.
- Translation: as above.

## Left to the builder

- Exact spacing, marker size and rail styling, within the tokens.
- Id generator (any short random string helper already in the repo).
- Edit controls' layout and icons.
