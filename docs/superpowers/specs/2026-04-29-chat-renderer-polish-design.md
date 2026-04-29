# Chat Renderer Polish Design

Status: Draft
Date: 2026-04-29
Owner: @innei
Scope: `@haklex/rich-ext-chat` static `ChatRenderer` only.

## Goal

Refine the visual design of the `ChatRenderer` (colors, spacing, typography, layout structure) so that an embedded chat reads as a quiet, document-friendly element. Lower the visual weight of the user's voice, give the agent's answer the role of "the body of the answer," and align all numbers to project tokens or a small set of explicit literals where tokens don't fit.

The structural variants (`user-agent`, `user-user`) and the data shape are unchanged. The Lexical node, edit modal, XML reader/writer, and downstream consumers (Shiroi, admin-vue3, mx-core) are untouched.

## Background — what's wrong with the current rendering

Current `ChatRenderer` (`packages/rich-ext-chat/src/ChatRenderer.tsx`) + `styles.css.ts`:

- **User bubble is `vars.color.text` (`#000`).** Reads as an iMessage send-bubble — high contrast in a document context, drawing the eye to the _question_ rather than the _answer_.
- **Agent row is `[avatar | article-stack]` horizontal.** The article column is squeezed by the 32px avatar + gap; long markdown wraps in a narrower measure than the surrounding document body.
- **Numbers are unaligned.** Bubble fontSize 14.5, article fontSize 15. Container gap 18, row gap 10. Author label 11px uppercase + 0.04em letter-spacing (dated). None map cleanly to the token set.
- **`user-user` uses left-light/right-dark contrast** (originally to mimic chat apps). With user voice now the _quiet_ one, that contrast is incoherent — neither participant in `user-user` is "self," so making one dark is arbitrary.

## Decisions

### Layout

- **`user-agent` user row** stays horizontal: bubble on the right, avatar on the right of the bubble. Unchanged structurally.
- **`user-agent` agent row** flips from horizontal to **vertical**:
  ```
  [avatar 24px] [name]
  <full-width article>
  ```
  Header is a single inline row (24px circle avatar + 13px name with weight 500). Article content sits below, full-width, no left indent.
- **`user-user` both rows** become `[avatar | author-cluster]` where `author-cluster` is a vertical column containing a small author label above the bubble:
  ```
  Left side:  [avatar 28px] (Author label \n bubble)
  Right side: (Author label \n bubble) [avatar 28px]
  ```
  Author label sits _outside and above_ the bubble — replaces the current "label-inside-bubble" pattern. Bubble interior is just the message.

### Colors (neutral grayscale only — no tinted hues, per `CLAUDE.md`)

| Element                           | Token / value                                                                       |
| --------------------------------- | ----------------------------------------------------------------------------------- |
| User bubble background            | `vars.color.bgTertiary` (`#f5f5f5`)                                                 |
| User bubble text                  | `vars.color.text` (`#000` light / `#fff` dark)                                      |
| User bubble border                | none                                                                                |
| Both `user-user` bubbles          | same as user bubble above (no light/dark contrast)                                  |
| User avatar (light)               | bg `vars.color.bgTertiary`, text `vars.color.textTertiary`, 1px `vars.color.border` |
| Agent avatar (dark)               | bg `vars.color.text`, text `vars.color.bg` (existing)                               |
| Agent name (header)               | `vars.color.text`, weight 500                                                       |
| `user-user` author label          | `vars.color.textTertiary`, weight 500                                               |
| Document-context placeholder text | `vars.color.textTertiary` (was `textQuaternary`)                                    |

The current `articleHeader` style — `font-size: 11`, `text-transform: uppercase`, `letter-spacing: 0.04em`, `color: textQuaternary` — is **deleted**. Replaced by a regular-case 13px name in the new agent header.

### Typography

| Element             | Size | Weight     | Line-height |
| ------------------- | ---- | ---------- | ----------- |
| Bubble text         | 15   | 400        | 1.6         |
| Agent article body  | 15   | 400        | 1.7         |
| Agent name (header) | 13   | 500        | —           |
| `user-user` author  | 12   | 500        | —           |
| Empty placeholder   | 13   | 400 italic | —           |

All sizes are pixel literals (matching the existing convention of mixing tokens and literals — the token system's `fontSizeBase` is 16px / `em`-relative and doesn't map cleanly to these explicit sizes for an embedded chat).

### Spacing

| Spacing                                 | Value          |
| --------------------------------------- | -------------- |
| Container row gap                       | 20             |
| Container vertical padding              | 12 (unchanged) |
| Row inner gap (avatar ↔ bubble/cluster) | 10             |
| Bubble padding                          | 10 / 14        |
| Agent header → content                  | 8              |
| Agent header inner gap (avatar ↔ name)  | 8              |
| Author label → bubble (`user-user`)     | 4              |

### Shape

| Element                    | Value                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| User avatar (`user-agent`) | 28×28 circle                                                                                              |
| User avatar (`user-user`)  | 28×28 circle                                                                                              |
| Agent avatar (header)      | 24×24 circle                                                                                              |
| Bubble corner (right tail) | 14px (top-left) / 14px (top-right) / 4px (bottom-right) / 14px (bottom-left)                              |
| Bubble corner (left tail)  | 14px (top-left) / 14px (top-right) / 14px (bottom-right) / 4px (bottom-left) — `user-user` left side only |

Mobile (≤ 600px): bubble `max-width` grows from 70% to 85% (unchanged from current).

## Implementation Surface

Files that change:

- **`packages/rich-ext-chat/src/styles.css.ts`** — bulk of changes:
  - Update `container`, `row`, `bubble`, `avatar`, `avatarDark`, `article`, `empty` values per the tables above.
  - **Delete** `articleHeader` and `authorOnDark` styles (no longer needed — agent header is replaced by the new `agentHeader` cluster, and there is no dark bubble for `authorOnDark` to compensate for).
  - **Replace** `userBubble`, `leftBubble`, `rightBubble` with a single shared `bubble` style (light wash, dark text) plus two corner-radius modifiers (`bubbleRightTail`, `bubbleLeftTail`).
  - **Add** `agentHeader` (flex row, gap 8, marginBottom 8), `agentHeaderName` (13px / 500 / `text` color), `authorCluster` (flex column, max-width 70%, alignment variants), `authorLabel` (12px / 500 / `textTertiary`, marginBottom 4).
- **`packages/rich-ext-chat/src/ChatRenderer.tsx`** — restructure `UserAgentRow` so the agent branch renders `[header / content]` vertically; restructure `UserUserRow` to use `[avatar | author-cluster]` with the label outside the bubble; drop the `authorOnDark` branch (no longer needed since there is no dark bubble).

Files that stay the same:

- `nodes/ChatNode.ts`, `nodes/ChatEditNode.ts` — no schema changes.
- `ChatEditDecorator.tsx`, `ChatEditRenderer.tsx`, `ChatEditorModal.tsx` — modal styling is untouched (out of scope; modal has its own visual language).
- `types.ts`, `utils.ts`, `variant-reducer.ts` — unaffected.
- `semanticClassNames` keys (`rich-chat-container`, `rich-chat-row`, `rich-chat-bubble`, `rich-chat-article`, `rich-chat-avatar`, `rich-chat-author`, `rich-chat-empty`) — preserved exactly. External styling overrides and downstream tests rely on these.
- XML reader/writer in `packages/rich-litexml/` — unaffected.
- Demo showcase in `demo/` — picks up new styling automatically; no demo content changes required.

### Class-name plan

The existing semantic class names map to the new structure as:

- `.rich-chat-container` — outer flex column (unchanged).
- `.rich-chat-row` — each row wrapper (unchanged).
- `.rich-chat-bubble` — applied to bubbles in both variants (unchanged).
- `.rich-chat-article` — applied to the agent content column in `user-agent` (unchanged; structurally now a sibling of the agent header rather than a child of the row's flex child).
- `.rich-chat-avatar` — applied to all avatars (light + dark) (unchanged).
- `.rich-chat-author` — applied to the new `user-user` author label _outside_ the bubble. Note: in current code this class is applied _inside_ the bubble; the test only checks for the participant's name in the HTML, so moving the class to the new location keeps tests green.
- `.rich-chat-empty` — empty-state placeholder (unchanged).

## Testing

### Existing tests (`packages/rich-ext-chat/tests/ChatRenderer.test.tsx`)

All assertions are class-name + text-content based and will continue to pass:

- `rich-chat-empty` + "Empty chat" — empty state.
- `rich-chat-bubble` + `rich-chat-article` in `user-agent` — both still present.
- `rich-chat-article` absent in `user-user`, "Alice" + "Bob" present — still true.
- "Unknown" + "Orphan" for dangling references — unaffected.
- "Assistant" fallback name — unaffected.
- Avatar URL presence + initial-letter fallback — unaffected.

### New tests to add

- **Agent header rendering**: in `user-agent`, the agent row contains the participant's name and a dark avatar inside an element that is a _sibling_ of `.rich-chat-article`, not its parent. Assert structural relationship via DOM query.
- **`user-user` author label outside bubble**: in `user-user`, each author label appears as a preceding sibling of `.rich-chat-bubble`, not inside it.

Test mock update: `tests/ChatRenderer.test.tsx` currently mocks `../src/styles.css` with a hand-listed set of class keys. When new style names (`agentHeader`, `agentHeaderName`, `authorCluster`, `authorLabel`, `bubbleRightTail`, `bubbleLeftTail`) are added, extend the mock object so undefined values don't leak into the rendered HTML. Removed style names (`articleHeader`, `authorOnDark`, `userBubble`, `leftBubble`, `rightBubble`) should be dropped from the mock at the same time.

### Manual verification (demo)

1. `user-agent` showcase — agent's long markdown (paragraph + list + code) renders full-width, not narrowed by an avatar column.
2. `user-user` showcase — both bubbles are the same gray, distinguished only by alignment + author label above.
3. Dark mode — bubble background and text both resolve through `vars.color.bgTertiary` / `vars.color.text` and remain legible without a hardcoded override; the bubble should still read as "lighter than surrounding bg" in both themes (this is what `bgTertiary` is for).
4. CJK serif (`note` ColorScheme) — bubble + article inherit serif font from parent variant.
5. Mobile (≤ 600px) — bubble max-width 85% kicks in; agent header + content remain readable.

## Out of Scope

- `ChatEditorModal` styling.
- The slash-menu / insertion flow.
- The Lexical node schema (no `version: 2` bump).
- XML wire format.
- Markdown export in `rich-headless`.
- Downstream consumer changes — this ships as a `@haklex/rich-ext-chat` package update; consumers pick it up through the standard `pnpm release:rich` flow.

## Open Questions

None.
