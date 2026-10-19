# Container nodes polish — Alert, Banner, Excalidraw — design

Artboard (page "第二轮 · 容器节点"): https://claude.ai/artifact/6YQUUqv44V34U2EdKXtu59
Follows `2026-10-20-typography-polish-design.md` (same branch `feat/typography-polish`); uses its tokens (`flow.*`, `lineHeight*`, `fontSizeCaption`, the new alert colors).

## Intent

Alert and Banner currently read as the same "colored box". Excalidraw's read-only view downloads the whole editor (0.18.1 prod: index.js 490 KB + main chunk 1.7 MB + CSS 141 KB, uncompressed) just to show a picture. This pass gives Alert and Banner distinct roles and makes the Excalidraw read path editor-free.

## Goals

- Alert = an aside within the text (a line). Banner = a notice that asks the reader to stop (a filled block).
- Excalidraw read mode renders the scene as SVG with roughjs, with pan/zoom and a fullscreen viewer, and never imports `@excalidraw/excalidraw`.
- All three take spacing, line height and colors from tokens.

## Non-goals

- No change to node data, serialization, LiteXML, or the edit dialog's editing behaviour (still the real Excalidraw).
- No new alert/banner types.

## Anti-goals

- Any read-only page that imports `@excalidraw/excalidraw` or its CSS.
- Layout shift when the Excalidraw frame goes placeholder → loading → ready.
- Alert and Banner looking alike at a glance.

## Alert (`packages/rich-renderer-alert`)

Default (article, note): "colored line aside"

- No background. A 2px bar in the type color on the left (`box-shadow: inset 2px 0 0 <color>` or a 2px `::before`), radius 1px; `padding: 2px 0 2px 18px` — same geometry as the quote.
- Header: icon 15px + label, 13px / 600, type color, line-height 1.4, `margin-bottom: 4px`. Labels are title case (`Note`, `Tip`, `Important`, `Warning`, `Caution`); remove `text-transform: uppercase` and letter-spacing everywhere, including the edit-mode trigger.
- Body: text color, body size; paragraph gap inside 0.5em; first/last paragraph margins 0.
- Outer margin: `flow.block` only. Delete the package's own `margin: spacing.md`, `padding`, `backgroundColor: bgSecondary` and the 4px bar.
- Note variant: delete the `textIndent: 2em` rule for alert content.

Compact (comment, chat): "inline label"

- Background: type color 7% (`color-mix(in oklab, <color> 7%, transparent)`), radius 6px, padding 8px 12px, no bar.
- Header and first paragraph share a line: header is `display: inline-flex` with `margin-right: 6px`, icon 14px, label 600 type color; following paragraphs are normal blocks.
- How the renderer knows it's compact: CSS under the comment/chat variant classes (`commentVariant`, `chatVariant` from `@haklex/rich-editor/styles`), the same way the package already targets `noteVariant`. No React prop.

Dark mode: type colors come from the existing dark alert tokens.

## Banner (`packages/rich-renderer-banner`)

- Background: type color 8% light / 14% dark (`color-mix`), no border, radius `md`.
- Padding: 14px 18px; compact variants 10px 14px.
- Layout stays flex row; gap 12px; icon 18px (was 1.5em), `margin-top: calc((1lh - 18px) / 2)` so it centres on the first line; `align-self: flex-start` stays.
- Text: text color, body size, `line-height: lineHeight` token (remove hardcoded 1.8); paragraph gap 0.5em.
- Margin: `flow.block`.
- Note variant: delete the `textIndent: 2em` rule.
- The 14% dark mix is applied with `[data-theme='dark'] &` / `.dark &` selectors, matching how other packages detect dark mode.

## Excalidraw (`packages/rich-ext-excalidraw`)

### Read path (static / display renderer)

Port Yohaku's portable renderer (`Yohaku/yohaku-oss/packages/rich-content/src/lexical/portable/excalidraw/`): `types.ts`, `rough.ts`, `Scene.tsx`, `InteractiveScene.tsx`, `fonts.ts`. The author of both repos is the same; porting into MIT haklex is intended.

- Rewrite their Tailwind classes as vanilla-extract styles using haklex tokens. Drop Yohaku-only hooks (`useHost`, `useResource`, `clsxm`, `PrintCaption`, `BlockBoundary`).
- Data loading uses haklex's existing `useExcalidrawData` (it already handles inline / `ref:` / URL / incremental delta via jsondiffpatch and `ExcalidrawConfig.apiUrl`). Yohaku's `parser.ts` is not ported.
- `roughjs` becomes a dependency of `rich-ext-excalidraw` (Yohaku pins 4.6.x; import `roughjs/bin/generator` as Yohaku does).
- `ExcalidrawDisplayRenderer` keeps its name and props (`snapshot`, `onExpand`), but renders `InteractiveScene` instead of `<Excalidraw>`. It must not import `@excalidraw/excalidraw` at module level or lazily.
- `ExcalidrawSSRRenderer` keeps `ViewportGate` + `Suspense`; its placeholder becomes state ① below.
- `@excalidraw/excalidraw` stays a peer dependency (edit path) but is marked optional in `peerDependenciesMeta`.

### Frame

- 1px `border`, radius `md`, background `bg`, `aspect-ratio: 16 / 9`, width 100%, margin `flow.block`. Same box in every state, so there is no layout shift.
- When the node is selected in the editor, the border uses `accent`.

### States

1. Placeholder (outside viewport / SSR / Suspense): dotted-paper background (`radial-gradient(<border> 1px, transparent 1px)`, 16px grid), centred pen icon + `Whiteboard · N elements` (N from inline JSON when parseable, otherwise just `Whiteboard`), 13px textTertiary.
2. Loading (remote scene fetch): same dotted background + a slow horizontal sheen (`linear-gradient` sweep, ~1.6s, disabled under `prefers-reduced-motion`) + `Loading whiteboard…`.
3. Ready: SVG scene fitted to the frame (Yohaku's fit with padding).
4. Empty scene: dotted background + `Empty whiteboard`. No icon.
5. Error: neutral background, warning icon in `alertCaution`, message in textSecondary, and a `Retry` button that re-runs the fetch. No red fill. (Needs `useExcalidrawData` to expose a retry; add one.)

Labels are English, matching the other library UI strings.

### Interaction (from Yohaku's `InteractiveScene`)

- Drag to pan; ⌘/Ctrl + wheel and pinch to zoom; a plain wheel scrolls the page; double-click resets to fit.
- Toolbar bottom-right: zoom out · percent · zoom in | fit | fullscreen. Shown on `:hover` and `:focus-within`; always shown on `(pointer: coarse)`. Buttons 28px, 36px on coarse pointers. Background `bg` at 92% opacity, 1px `border`, radius 8px.
- `svg` has `role="img"` and `aria-label="Whiteboard, N elements"`.

### Fullscreen viewer

- In-page fullscreen viewer replacing Yohaku's "open SVG in new tab" and haklex's current dialog that mounts full Excalidraw.
- Reuses the existing expand plumbing: `onExpand` + `ExcalidrawExpandShell` (header title `Whiteboard`, meta `N elements`, close button), with an `InteractiveScene` inside instead of `<Excalidraw>`. Closes on Esc and on the close button.
- When no `onExpand` host handler is provided, the fullscreen button is hidden (current behaviour).

### Dark mode

- Apply `filter: invert(93%) hue-rotate(180deg)` to the SVG (Yohaku's approach).
- New: image elements get the same filter again so photos return to their real colors (Yohaku currently inverts them).

### Fonts

- Text elements use Yohaku's `EXCALIDRAW_FONT_STACK` (hand-drawn: `Excalifont`, `LXGW WenKai Screen`, `Virgil`, … cursive).
- haklex does not ship font files. `ExcalidrawConfig` gains optional `fontCssHref?: string`; when set, the renderer injects that stylesheet once (Yohaku's `useLxgwFont` pattern). Without it, the stack falls back to system fonts.

### Edit path

- `ExcalidrawEditRenderer` shows the same frame and SVG scene. A `Edit` button sits top-right (pen icon + label, 1px border, `bg` at 92%), visible on hover/focus/selection.
- Clicking it lazy-imports `@excalidraw/excalidraw` + its CSS and opens the existing edit dialog. Saving still writes the snapshot through `saveSnapshot` as today.
- Remove the inline always-mounted `<Excalidraw>` canvas from the edit renderer, if it has one.

## Verification

- Demo: the "Excalidraw Whiteboard" and "Tech Article (Multi-Excalidraw)" presets in Read mode — check in the network panel that no `@excalidraw/excalidraw` chunk or CSS is requested; then Edit → open dialog → the chunk loads.
- All five frame states (fixtures: inline, remote, delta, empty, bad URL), light/dark, with an image element.
- Alert and Banner: the Technical Article and Comprehensive Article presets in article / comment / note; a mock with a Banner at the top and an Alert in the text.
- Typecheck + eslint on touched packages; existing vitest suites green; port Yohaku's `StaticExcalidraw.test.tsx` cases that apply to `Scene`/`InteractiveScene`.

## Left to the builder

- File layout inside `rich-ext-excalidraw/src` for the ported renderer.
- Exact sheen animation timing and toolbar icons (lucide equivalents of Yohaku's mingcute icons).
- Whether to keep backward-compat exports (`ExcalidrawStaticRenderer`, `ExcalidrawRenderer` aliases) pointing at the new renderer — yes, keep them.

## Rulings after builder check

1. **Editor preview is still.** The edit renderer shows the non-interactive `Scene` SVG (no pan/zoom, no toolbar). The whole frame stays one click target that selects the node, plus the `Edit` button. Cost if wrong: editors can't zoom into a preview without opening the dialog.
2. **Touch scrolls the page.** On `(pointer: coarse)` the inline frame uses `touch-action: pan-x pan-y`, so one-finger drags scroll the page and no in-frame gesture runs. Zoom buttons still work. Pan and pinch run only in the fullscreen viewer (`touch-action: none`). Mouse/trackpad behaviour is as specified.
3. **Compact Alert keeps the line, not a tint.** In comment and chat the Alert is the default 2px line with the label floated into the first line (`padding: 2px 0 2px 12px`), no background. Banner stays the only filled block, so the anti-goal holds in every variant. (This overrides direction C's tinted box on the artboard.)
4. **Element count in the fullscreen header.** `ExcalidrawExpandPayload` gains optional `elementCount?: number` (in `rich-ext-excalidraw` and `rich-compose/src/modules/excalidraw/types.ts`). The demo host passes `meta={`${n} elements`}` to `ExcalidrawExpandShell`. Hosts that don't update keep the current header.
5. **No tap-to-expand.** Yohaku opens the viewer on a single tap; here a single click does nothing and double-click resets to fit, per the spec.
