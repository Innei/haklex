# Typography polish across all nodes — design

Artboard (source of the visual decisions): https://claude.ai/artifact/6YQUUqv44V34U2EdKXtu59

## Intent

The editor now serves long-form articles, notes, comments and AI chat. Node typography grew per-variant and drifted: tokens collide, variants hardcode values the tokens claim to own, tables and code blocks break at common widths. This pass makes tokens the single source of truth and re-tunes every node's typography so all scenes share one rule set and differ only in token values.

## Goals

- Tokens in `@haklex/rich-style-token` carry the real values; variant files stop hardcoding line-heights, block spacing and radii.
- Body rhythm re-tuned (line height, paragraph/list/heading spacing).
- Tables readable at any column count and container width.
- Code block redesigned: neutral surface, language color only as a small mark, controls always reachable.
- Smaller node fixes listed below.

## Non-goals

- No change to Lexical node data, serialization, or LiteXML. No new node fields (code block filename is a slot only — see Code block).
- No Yohaku-side changes in this pass (Yohaku overrides in `Yohaku/packages/rich-content/src/styles/yohaku-block-styles.css` are reconciled separately; one known Yohaku bug noted at the end).
- No renaming of existing CSS variables or exported style names. Hosts that override `--rc-*` keep working.

## Anti-goals

- A host overriding `accent` and seeing blue leftovers.
- Any variant whose line-height or spacing is set outside the token layer.
- Bouncy/overshoot motion.

## Tokens (`packages/rich-style-token/src/themes.ts`, `vars.css.ts`)

### Colors

| Token                                           | Light now → new                                                  | Dark now → new                                  |
| ----------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| text                                            | #000 → #171717                                                   | #fafafa → #ededed                               |
| textSecondary                                   | #262626 → #404040                                                | #a3a3a3 → #c2c2c2                               |
| textTertiary                                    | #737373 (keep)                                                   | #737373 → #8a8a8a                               |
| textQuaternary                                  | keep #a3a3a3                                                     | keep #525252                                    |
| border                                          | #f5f5f5 → #e8e8e8                                                | #262626 → #2e2e2e                               |
| borderSubtle (new, `rc-border-subtle`)          | #f0f0f0                                                          | #1f1f1f                                         |
| hrBorder                                        | value = border's new value (#e8e8e8)                             | #2e2e2e                                         |
| codeBg                                          | keep #f5f5f5                                                     | #262626 → #1a1a1a                               |
| quoteBorder                                     | #2563eb → `color-mix(in oklab, var(--rc-text) 18%, transparent)` | 22%                                             |
| accentLight                                     | hex → `color-mix(in oklab, var(--rc-accent) 12%, transparent)`   | same expression                                 |
| alertInfo / Tip / Warning / Caution / Important | #2f6db5 / #2f855a / #b7791f / #c53030 / #6b46c1                  | #7aa7e0 / #6cbf8f / #e0a458 / #ef7d7d / #a78bfa |

`lightCommentColors` keeps its own quote overrides only if they still differ after the change; with quoteBorder neutral everywhere, drop the override and keep `quoteBg`.

Rule recorded in the token JSDoc that already exists on the contract: `textQuaternary` is for icons, placeholders, disabled — never readable text (2.5:1).

### Fonts

- `fontFamilySans`: `-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", Roboto, Helvetica, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"` (Latin first; fixes the "Not Color Emoji" typo).
- `fontMono`: append `"PingFang SC", "Noto Sans SC"` before the final `monospace`.

### Typography

| Token                       | Now | New                                               |
| --------------------------- | --- | ------------------------------------------------- |
| lineHeight                  | 1.7 | 1.75 (article), note 1.85, comment 1.6, chat 1.65 |
| lineHeightTight             | 1.4 | 1.35                                              |
| lineHeightCompact (new)     | —   | 1.6 (tables, comment/chat secondary text)         |
| lineHeightCode (new)        | —   | 1.7                                               |
| fontSizeCode (new alias)    | —   | 0.8125em (13px at 16px body)                      |
| fontSizeCaption (new alias) | —   | 0.8125em                                          |

`fontSizeMd` etc. keep their values.

### Flow spacing (new group `flow`)

| Token                                                       | article | note                    | comment | chat   |
| ----------------------------------------------------------- | ------- | ----------------------- | ------- | ------ |
| paragraph                                                   | 1.25em  | 0.5em (with 2em indent) | 0.6em   | 0.75em |
| list (between items)                                        | 0.375em | 0.375em                 | 0.25em  | 0.25em |
| block (code, table, image, alert, details, banner, snippet) | 2em     | 2em                     | 1em     | 1em    |
| heading (top margin base)                                   | 2em     | 2em                     | 1em     | 1em    |

### Radius

Inline elements use `borderRadius.sm` (4px). Every block (code, table card variant, alert, image, details) uses `borderRadius.md` (8px). Remove hardcoded `0.5rem` / `0.375rem`.

## Variants

- `article.css.ts`, `note.css.ts`, `comment.css.ts`: replace hardcoded line-heights, paragraph/list/block margins and radii with the tokens above. Variant files keep only what is genuinely variant-specific (note's indent and drop cap, comment's heading clamp).
- New `chat` variant: add `'chat'` to `RichEditorVariant` (`packages/rich-editor/src/types.ts`), a `chatTheme` + `chatLayout` in rich-style-token (15px base, values per tables above), `chat.css.ts` in rich-editor styles, wire it in `components/utils.ts` next to `commentVariant`, and export it like the others. Chat uses the compact code block (B) and no line numbers, same as comment.

## Body rhythm (applies through tokens; article values shown)

- Paragraph: `margin: 0 0 flow.paragraph`; line-height `lineHeight`.
- Headings (all use `lineHeightTight`):
  - H1 2em / 700 (was 48px / 800 / lh 1), margin-bottom 0.6em
  - H2 1.5em / 700, margin 1.6em 0 0.5em
  - H3 1.25em / 600, margin 1.5em 0 0.4em
  - H4 1.125em / 600, H5 1em / 600, H6 0.875em / 600 color textSecondary — define H5/H6 in article too
  - `heading + *` margin-top 0 kept.
- Lists: padding-left 1.375em; plain item padding-left 0.25em; item gap `flow.list`; `::marker` color textQuaternary.
- Note variant: keep first-line indent 2em and drop cap; paragraph gap becomes `flow.paragraph` (0.5em). Indent and gap are no longer both large.
- Comment variant: all headings render at 1em / 600.

## Inline nodes

- Inline code: weight normal, 0.875em of surrounding text (not `fontSizeCode`, which is for blocks), `background: codeBg`, `box-shadow: inset 0 0 0 1px border`, padding `0.12em 0.36em`, radius sm. Remove the article backtick pseudo-elements and the 600 weight.
- Link: weight inherit, `text-decoration-color: color-mix(link 35%)`, `text-underline-offset: 0.22em`, thickness 1px; hover goes to full link color.
- Quote: no italic, no weight 500, no curly-quote pseudo-content in any variant; `box-shadow: inset 2px 0 0 quoteBorder` (or 2px bar), padding-left 18px, color textSecondary, transparent background in article/note, attribution 13px textTertiary. Comment keeps a quoteBg if it reads better — builder's call.
- Footnote reference: drop `vertical-align: super` + pill. Render as `display: inline-block; position: relative; top: -0.5em; font-size: 0.72em; line-height: 1.3; tabular-nums; color accent; weight 600`. Goal: the line containing it is exactly as tall as its neighbours. Same treatment for `textSuperscript`/`textSubscript` (`top: -0.5em` / `0.25em`, line-height 0 or equivalent).
- Strikethrough: color textTertiary + `text-decoration-color` textQuaternary instead of `opacity: 0.65`.
- Checklist checked: text textTertiary + line-through (decoration textQuaternary); checkbox filled `text` color with white check (light) / inverse (dark). Replace the `cubic-bezier(0.34, 1.56, 0.64, 1)` overshoot with a non-overshooting ease-out.
- Edit-mode heading level badge (`left: -1.5rem`) is clipped in narrow containers: hide it when the editor's content box has no left gutter (container query or `@media (max-width: …)` on the editor root) — builder's call on mechanism.

## Tables (`shared.css.ts`, `article.css.ts`; table plugin untouched except where noted)

Default style "A — ruled":

- Table: `border-collapse: collapse; width: max-content; min-width: 100%` (fill), no outer border, no radius, font-size 0.875em, line-height `lineHeightCompact`, `font-variant-numeric: tabular-nums`.
- Header cell: 13px-equivalent (0.8125em of body / 0.9286em of table text — builder picks the expression), weight 600, color textSecondary, padding `8px 14px`, `border-bottom: 1px solid color-mix(text 18%)`, no uppercase, no letter-spacing, no background, **no sticky**.
- Body cell: padding `10px 14px`, `border-bottom: 1px solid borderSubtle`, last row `border`, `vertical-align: top`, `min-width: 4em`. No vertical borders.
- First / last column: padding-left / padding-right 0, so table text aligns with paragraph edges.
- Long text: cell's direct child paragraph gets `max-width: 20em`, so long cells wrap instead of widening the table.
- Scroll wrapper (`tableScrollableWrapper`): `overflow-x: auto`, plus a right-edge fade mask that only shows when there is more to scroll. Use a CSS scroll-driven animation (`animation-timeline: scroll(self inline)`) to remove the mask at the end; without support, show no mask.
- Narrow screens (wrapper narrower than the table): first column `position: sticky; left: 0; background: bg; box-shadow: 1px 0 0 borderSubtle`, with 16px horizontal padding on first/last cells. Apply sticky only when the table actually overflows if that is cheap to detect; otherwise always-on sticky first column is acceptable.
- Manual column widths: when Lexical emits `<colgroup>` widths (user resized), switch to `table-layout: fixed` and honour them; otherwise auto layout as above.
- Card style "B" (border 1px `border`, radius md, header background bgSecondary, first/last padding 16px, no last-row border) is used by the editor (edit mode, `[contenteditable="true"]`) so resize/row handles have a frame to attach to. Renderer output uses A.
- Comment and chat use A with `min-width: 100%` dropped (fit content).

## Code block (`packages/rich-renderer-codeblock`)

Two chromes sharing tokens: **A (header bar)** for article and note, **B (floating label)** for comment and chat. Chrome follows the variant; renderer config may override.

Shared:

- Neutral surface: background `codeBg` (dark #1a1a1a after token change). Remove `--rr-code-accent` from the background, copy button, highlighted line and expand gradient. Language color appears only on the language icon / a 10px rounded square.
- Text 13px (`fontSizeCode`), line-height `lineHeightCode` (1.7) for both static output and CodeMirror (`.cm-scroller`).
- Radius md (8px). Block margin `flow.block`.
- Line numbers: gutter `min-width: 2ch`, padding-right 16px, color textQuaternary. Replaces the 5em + 2em gutter in both static `.line::before` and CodeMirror `.cm-gutters`.
- Highlighted line: `background: color-mix(accent 8%)`, `box-shadow: inset 2px 0 0 accent` (uses theme accent, not language color). Diff lines keep their add/remove semantics with the same shape.
- Collapse: fade ends at `codeBg` (same as body, so no band). Expand control is a full-width 32px button reading "展开全部 · N 行" (N = line count).
- Copy: never hover-only on touch. `@media (hover: none)` always visible.

A — header bar:

- 1px `border` outline, header row 36px, background slightly darker than body (light #f2f2f2 / dark #1a1a1a vs body codeBg — builder may add a `codeHeaderBg` token), `border-bottom: 1px border`.
- Left: language mark + language display name (12px textTertiary) + optional filename slot (`langSlot` stays as the edit-mode hook; filename renders only if a future prop supplies it — no data model change now).
- Right: ghost button with copy icon + "复制" label, always visible; check icon + "已复制" for 2s.
- Body padding 12px 16px.
- Edit mode: the `LanguageCombobox` sits in the header's left slot instead of the bottom-right overlay.

B — floating label:

- No outline; codeBg block, padding 12px 16px; content keeps `padding-right: 3em` so long lines never run under the label.
- Top-right: lowercase language id, 11px mono textTertiary. On hover the label is replaced by the copy button (ghost, `border` background). `@media (hover: none)`: label and copy both visible side by side.

Remove the bottom-right language overlay (`styles.lang` position) in both chromes.

## Also fix

- `article.css.ts` `.rich-code-block` (Lexical's built-in CodeNode) uses the same surface, radius, font size and line-height as the code block card.
- Alerts pick up the new token colors; no structural change.

## Known Yohaku bug (out of scope, record only)

`.rich-table-scroll td { word-break: keep-all }` in Yohaku stops Chinese cells from wrapping. Remove it when Yohaku adopts this release.

## Verification

- Demo playground (`pnpm dev`, `demo/`) is the visual check: article, note, comment, chat at 700px and 360px; light and dark.
- Fixtures to cover: 2-col short table, 5-col table with long CJK text, 8-col wide table on 360px, code blocks in TS/JS/CSS/Shell with and without line numbers, collapsed long block, paragraph with footnote refs, checklist, quote with attribution.
- `pnpm typecheck` and lint on touched packages; existing vitest suites stay green.

## Left to the builder

- Exact CSS expressions for the em-based header size and for "only sticky when overflowing".
- Whether the code header background becomes a token.
- Splitting this into one PR per package or one PR overall.
- Release/version bump (single shared version via bumpp) after merge.

## Rulings after builder check

1. **Static renderer tables.** `rich-compose/src/static-renderer` renders tables with its own `table.css.ts` (zebra rows, hover, `spacing.lg` padding). It switches to the shared `rich-table*` classes from `rich-editor`, and `table.css.ts` is deleted, so editor and renderer share one table stylesheet. Cost if wrong: hosts that targeted the old hashed classes lose their overrides (none known; Yohaku uses its own `.rich-table-scroll`).
2. **Two `CodeBlockCard` copies** (`rich-editor-ui` static, `rich-renderer-codeblock` edit): both get the new chrome. They are not merged in this pass. Both take `chrome?: 'bar' | 'compact'`. Static `CodeBlockRenderer` (`rich-renderer-codeblock/static`) and the edit renderer derive it from `useVariant()` (`comment` / `chat` → compact). `rich-agent-chat` `StreamdownBubble` passes `chrome="compact"` explicitly because it runs outside a `RendererConfigProvider`. The fallback renderer in `rich-editor` (`.rich-code-block`) is restyled to match chrome A.
3. **Manual column widths.** `TableCellResizerPlugin` writes inline `width` on cells, not `<colgroup>`. No `table-layout: fixed` switch and no renderer JS change. Inline cell widths keep working as auto-layout hints. The "manual column widths" line above is withdrawn.
4. **Heading margins.** `flow.heading` is a body-relative length. Each heading's top margin = `calc(flow.heading * k / r)`, where `r` is the heading's size ratio and `k` = H1 1.25, H2 1.1, H3 1, H4–H6 0.9. Article H2 then sits 35px below the previous block, H3 32px, H4 29px. Bottom margins stay in the heading's own em (0.6 / 0.5 / 0.4 / 0.35 / 0.3 / 0.25).
5. **Editing a code block in comment/chat.** Edit mode always uses chrome A, because the language picker needs the header. Compact chrome applies to read-only output only.
6. **Code font size.** `fontSizeCode` is set per layout so code renders at 13px everywhere: article/note `0.8125em`, comment `0.9286em`, chat `0.8667em`. `fontSizeCaption` = 13px the same way.
7. **Dark code header.** New token `codeHeaderBg`: light `#f0f0f0`, dark `#212121`, against dark `codeBg` `#1a1a1a`.
8. **Note quote.** Note's sticky-note quote (Kai font, accent paper, tape) is deliberate and not italic. It is kept as is; the quote changes apply to shared/article/comment/chat only.
