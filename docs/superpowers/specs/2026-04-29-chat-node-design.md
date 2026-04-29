# Chat Node Design

Status: Draft
Date: 2026-04-29
Owner: @innei

## Goal

Add a new Lexical node type, `chat`, that embeds a static conversation snapshot inside rich documents. Two visual variants are supported:

- **`user-agent`**: User shows as a bubble; agent shows as article-style flowing content (no bubble, paragraphs/lists/code blocks render natively).
- **`user-user`**: Both sides show as bubbles, distinguished by alignment and neutral-shade contrast.

Use cases are display-oriented: embedding a captured Claude/ChatGPT conversation in a blog post, a Q&A excerpt in a Shiroi article, or two-person dialogue in long-form content. The node is **not** intended to be a live chat surface or to integrate with the existing `rich-agent-chat` panel.

## Non-Goals (MVP)

- **Live / streaming conversation**. The node is a static snapshot. Anything dynamic (streaming agent output, tool-call timeline, in-doc agent invocation) is out of scope.
- **Rich Lexical-native message content**. Each message is a markdown string rendered via `streamdown`. No nested Lexical subtree per message, no `NestedComposer`.
- **Per-message timestamps, reactions, edit indicators, threading**. YAGNI for snapshot use case; can be added later as optional fields.
- **More than 2 participants**. Variant locks participant count at 2. Group chats are a future variant.
- **Avatar upload / emoji avatars**. Only `avatar?: string` URL is supported. Falls back to initial letter circle.
- **AI-agent creation**. The `@haklex/rich-ext-ai-agent` system prompt is **not** updated in MVP; the node is not in the agent's create-node whitelist. XML reader/writer are still implemented for future enablement and for litexml round-trip support.
- **Paste-import flow** (e.g. parsing a ChatGPT export into a chat node). Authoring is via slash-menu-only in MVP. Future enhancement.
- **Markdown live-preview pane in the editor modal**. Editing is via plain markdown textareas; preview is the static rendering visible after closing the modal. (Future enhancement: optional split-pane preview.)

## Architecture

Follows the existing **Static / Edit Split** convention documented in `CLAUDE.md`:

- **`ChatNode`** — static decorator node. Renders the read-only `ChatRenderer`. Used by `RichRenderer`.
- **`ChatEditNode extends ChatNode`** — overrides `decorate()` to wrap the static renderer with an edit overlay button. Used by `RichEditor`. Clicking the overlay opens `ChatEditorModal` via `presentDialog`.

The node ships in a new package `@haklex/rich-ext-chat`, following the `rich-ext-*` convention for heavier optional extensions (parallel to `rich-ext-code-snippet`).

The chat data lives entirely inside the Lexical JSON — there is no external adapter, no backend persistence layer. Unlike `PollNode`, the chat is content, not a live widget.

## Package Structure

New package `@haklex/rich-ext-chat`. Layout mirrors `rich-ext-code-snippet`:

```
packages/rich-ext-chat/
├── src/
│   ├── nodes/
│   │   ├── ChatNode.ts            # static decorator node
│   │   ├── ChatEditNode.ts        # extends ChatNode, overrides decorate()
│   │   └── index.ts               # exports chatNodes / chatEditNodes
│   ├── ChatRenderer.tsx           # static rendering (variant a + b)
│   ├── ChatEditRenderer.tsx       # static renderer + Edit overlay button
│   ├── ChatEditDecorator.tsx      # bridges nodeKey ↔ ChatEditRenderer
│   ├── ChatEditorModal.tsx        # editor dialog (two-pane)
│   ├── styles.css.ts              # vanilla-extract styles
│   ├── types.ts                   # ChatVariant / ChatParticipant / ChatMessage
│   └── index.ts                   # public exports
├── package.json
├── tsconfig.json
└── vite.config.ts
```

**Dependencies**: `streamdown`, `nanoid`.
**peerDependencies**: `react`, `react-dom`, `@haklex/rich-editor`, `@haklex/rich-editor-ui`, `@haklex/rich-style-token`, `lucide-react`.

## Lexical Schema

```ts
type ChatVariant = 'user-agent' | 'user-user';
type ChatParticipantKind = 'user' | 'agent';

interface ChatParticipant {
  id: string; // p_xxxxxx (stable, nanoid)
  kind: ChatParticipantKind;
  name?: string; // falls back to "User" / "Assistant" by kind
  avatar?: string; // URL; optional
}

interface ChatMessage {
  id: string; // m_xxxxxx (stable, nanoid)
  participantId: string; // references participants[].id
  content: string; // raw markdown
}

interface SerializedChatNode extends SerializedLexicalNode {
  type: 'chat';
  version: 1;
  variant: ChatVariant;
  participants: ChatParticipant[];
  messages: ChatMessage[];
}
```

### ID Generation

- `participant.id`: nanoid (6 chars), prefixed `p_`. Minted at participant-init time.
- `message.id`: nanoid (8 chars), prefixed `m_`. Minted at message-add time.

All IDs are preserved across `clone()` (for Lexical reconciliation). The chat itself does not carry a top-level id — it has no backend state, no analytics target, and no need for cross-document identity.

### Variant ↔ Participant Invariant

- `variant === 'user-agent'` ⇒ `participants` length is 2; one is kind `user`, the other kind `agent`.
- `variant === 'user-user'` ⇒ `participants` length is 2; both are kind `user`.

This invariant is maintained by the editor modal's reducer logic (variant switch transforms participant kinds in place, preserving names and avatars). Renderers tolerate violations gracefully (a `user-agent` chat with two users renders with the second participant treated as agent for layout purposes; logging is not added in MVP).

## Static Rendering (`ChatRenderer`)

A single component branches on `variant`. Both variants share a top-level `.chat-container` and per-row `.chat-row` structure.

### Variant A — `user-agent`

| Role  | Visual                               | Alignment   |
| ----- | ------------------------------------ | ----------- |
| user  | Bubble with `#1f1f1f` bg, white text | Right       |
| agent | Article-style; no bubble; full width | Left / flow |

Agent messages render `streamdown` output directly inside `.chat-article` — paragraphs, lists, code blocks all flow as if part of the document body. This conveys the semantic "the agent's answer is the answer" while user prompts are clearly demarcated as embedded quotations.

The agent's avatar may be omitted in this variant by default (since the article-style block already implies authorship); user avatars are shown when provided.

### Variant B — `user-user`

Both participants render as bubbles. Distinction:

- Alignment: first participant left, second right.
- Background: left uses `#f5f5f5` neutral, right uses `#1f1f1f` dark with white text. Pure monochrome neutrals only — no tinted hues, per project convention.
- Author name shown in a small line at the top of each bubble (helpful when distinguishing two specific human speakers).

### Shared Behavior

- Markdown is rendered via `streamdown` in both variants. Configuration: same options as the existing `streamdown` usage in `rich-agent-chat` (no syntax highlighter override, default sanitization).
- Avatars fall back to a circular initial-letter chip when no URL is provided.
- The component respects `ColorSchemeContext` (light / dark / `note` / `comment`) — fonts and backgrounds inherit from the parent variant.
- Mobile (viewport ≤ 600px): bubble max-width grows to 85%; agent article remains full-width.

### Edge Cases

- `messages` empty → renders a placeholder text "Empty chat" in the static renderer; the edit decorator suppresses the placeholder when its modal is open.
- `participantId` references a participant not in the participants list → fallback to a synthetic "Unknown" participant with default avatar; no error thrown.
- `content` empty string → renders an empty bubble (kept visible so the author can see they missed the message).

## Edit Experience (`ChatEditorModal`)

Mirrors the `rich-ext-code-snippet` modal pattern (`presentDialog` → modal with local draft state → commit on Done).

### Layout — Two-pane

Modal width 920px (vs 720 for code-snippet — wider to accommodate the rail). Body height 540px.

- **Left rail (280px wide, sticky)**:
  - **Variant** section: two stacked pills (`user · agent` / `user · user`); active pill marked with `#1f1f1f` border.
  - **Participants** section: 2 cards, each with a kind pill (decorative, non-editable), display-name input, avatar URL input.
- **Right pane (flex, scrollable)**:
  - **Messages** header with `N messages` counter.
  - List of `MessageCard` components: each has a participant dropdown (`<select>`), reorder up/down, delete button, and a markdown `<textarea>` (resizable, min-height 70px).
  - Bottom: dashed `+ Add message` button.

On viewport widths < 720px, the rail collapses to a horizontal section above the message list (wraps via flex-wrap). MVP can ship desktop-only and treat narrow viewports as a known limitation.

### Footer

- `Cancel` (ghost) — discards local draft.
- `Done` (primary, dark) — commits draft to the Lexical node via `editor.update()`.

### Local Draft & Commit Semantics

```
ChatEditDecorator
  └── ChatEditRenderer            // static + Edit overlay button
        └── presentDialog → ChatEditorModal({ initial, onCommit, onCancel })
              ├── useState(initial)  // local draft, not synced to node on every keystroke
              └── Done → onCommit(draft) → editor.update(() => {
                    node.setVariant(draft.variant);
                    node.setParticipants(draft.participants);
                    node.setMessages(draft.messages);
                  })
                  Cancel → dismiss(); no commit
```

Rationale: writing every keystroke into the Lexical node would cause editor-state thrashing and lose the cancel-to-revert affordance.

### Variant Switch Reducer

When the user switches variant in the modal:

- `user-agent → user-user`: second participant's `kind` flips from `agent` to `user`; `name` and `avatar` preserved. Existing message `participantId` references remain valid.
- `user-user → user-agent`: second participant's `kind` flips from `user` to `agent`; `name` and `avatar` preserved.

Participant ids are never regenerated on variant switch — message references stay stable.

### Slash Menu Insertion Flow

Added to `@haklex/rich-plugin-slash-menu`. Trigger: `/chat`.

- Title: `Chat`
- Description: `Embed a conversation snapshot`
- Icon: `MessageSquare` (lucide-react)

On selection:

1. `editor.update()` creates `$createChatEditNode({ variant: 'user-agent' })` and inserts via `$insertNodeToNearestRoot`. The constructor synthesizes default participants when none are supplied: `[{ id: <new>, kind: 'user' }, { id: <new>, kind: 'agent' }]` — no `name` or `avatar` set, so the renderer falls back to "User" / "Assistant" labels and initial-letter avatars.
2. `ChatEditDecorator` mounts. A `useEffect` checks `messages.length === 0 && !openedRef.current`; if true, sets `openedRef.current = true` and calls `presentDialog(ChatEditorModal, ...)`. The ref ensures re-renders don't re-open.
3. If the user clicks Cancel and `messages` is still empty, the decorator schedules a follow-up `editor.update(() => node.remove())` to avoid leaving an empty chat block in the document. (Implementation: `ChatEditorModal` exposes an `onCancel` prop; the decorator's onCancel checks current node state and removes if still empty.)

### Per-Message Operations

- **Reorder**: ↑/↓ swap with neighbor; disabled at boundaries.
- **Delete**: removes message; no confirmation dialog (Cancel modal to undo).
- **Add**: appends a message with the most-recently-used participant pre-selected (small UX nicety; first message defaults to the user-kind participant).

## Registration & Integration

Per `CLAUDE.md` "Adding New Nodes Checklist":

- **`@haklex/rich-editor` `src/config.ts`** — add `ChatNode` to static node list (consumed by `RichRenderer`).
- **`@haklex/rich-editor` `src/config-edit.ts`** — add `ChatEditNode` (consumed by `RichEditor`).
- **`@haklex/rich-renderers` `src/config.ts`** — extend `enhancedRendererConfig` with `chat: ChatRenderer`.
- **`@haklex/rich-renderers-edit` `src/config.ts`** — extend `enhancedEditRendererConfig` with `chat: ChatEditRenderer`.
- **`@haklex/rich-headless`** — add `ChatNode` to `allHeadlessNodes` (so mx-core can deserialize for markdown export).
- **`@haklex/rich-kit-shiro`** — gets the node automatically through the dependency chain.

## XML Reader / Writer (litexml)

Required for litexml round-trip support; not gated on agent creation.

New files:

- `packages/rich-litexml/src/writers/chat.ts`
- `packages/rich-litexml/src/readers/chat.ts`
- Registered in `packages/rich-litexml/src/default-registry.ts`.

### Wire Format

```xml
<chat variant="user-agent">
  <participants>
    <participant id="p_a1" kind="user" name="Innei" />
    <participant id="p_b2" kind="agent" name="Claude" />
  </participants>
  <messages>
    <message participant="p_a1">How does Lexical's DecoratorNode differ from ElementNode?</message>
    <message participant="p_b2">The two serve different purposes:

- **ElementNode** contains other nodes
- **DecoratorNode** renders a React component as a leaf
    </message>
  </messages>
</chat>
```

Decisions:

- **IDs preserved**. Allows the AI agent (when later enabled) to reference participants by id rather than position.
- **Message content is raw markdown** with no inner XML. CDATA is unnecessary because markdown does not contain `<` / `&` patterns that conflict with the wrapping `<message>` element when the writer escapes them. Writer escapes `<`, `>`, `&` per standard XML rules.
- **Variant attribute uses full names** (`user-agent`, `user-user`) — no abbreviations, to reduce AI generation errors when the agent path is enabled later.
- **Avatar attribute is omitted when empty**, consistent with the schema's optional semantics.

### Reader Robustness

- Missing `id` on participant → reader generates one.
- `<message participant="p_xyz">` referencing a non-existent participant → reader still creates the message; the renderer's "Unknown" fallback handles display.
- Unknown attributes → ignored.

## Markdown Export (mx-core `$toMarkdown`)

The `@haklex/rich-headless` markdown converter must handle `ChatNode`. Format: blockquote-prefixed user lines + plain-paragraph agent content.

Example output for a `user-agent` chat:

```markdown
> **Innei:** How does Lexical's DecoratorNode differ from ElementNode?

The two serve different purposes:

- **ElementNode** contains other nodes
- **DecoratorNode** renders a React component as a leaf

> **Innei:** Got it.
```

For `user-user` variant: both speakers use the blockquote form with their respective names.

```markdown
> **Alice:** Are we still doing the static/edit split?

> **Bob:** Yes — same pattern as code-snippet.
```

A blank line separates each message. Names default to "User" / "Assistant" when `name` is unset.

## Demo Playground

`demo/` adds a `Chat` showcase, accessible from the demo navigation. Contents:

- A **`user-agent`** example: short user prompt + long agent answer with code block, list, and inline code.
- A **`user-user`** example: 4-turn conversation between named participants.
- Both rendered under each `ColorSchemeContext` variant (`article`, `note`, `comment`) to verify CJK serif + sans-serif font inheritance.

The demo also exercises the slash-menu insertion + edit flow on a separate editable demo page (linked from the showcase).

## Testing Strategy

### Unit (vitest)

- **`ChatNode` serialization round-trip**: `exportJSON()` → `importJSON()` produces an equal node; ids stable; `version: 1`.
- **`ChatEditNode` clone**: `getType()` returns `chat`; `clone()` preserves all fields including ids.
- **XML writer**: snapshot tests for both variants (with and without avatar / name).
- **XML reader**: parses valid XML to expected schema; missing optional fields default correctly; dangling `participant` references survive (renderer-handled).
- **Variant switch reducer** (extracted as a pure function from `ChatEditorModal`): `user-agent → user-user` flips kind, preserves names; `user-user → user-agent` symmetrically.

### Component (@testing-library/react)

- **`ChatRenderer`**: fixtures for each variant; assert `.chat-bubble` placement (right for user in variant a; both sides in variant b); assert `.chat-article` only present for agent in variant a.
- **Empty messages**: placeholder rendered.
- **Dangling `participantId`**: renders "Unknown" fallback, no throw.
- **Avatar fallback**: missing URL → initial-letter chip rendered.

### Integration

- **Markdown export**: given a `ChatNode` JSON, `$toMarkdown()` produces the blockquote-formatted string above (snapshot test in `rich-headless`).

### Manual Verification (demo)

1. Slash menu shows `/chat` entry; selecting it inserts an empty chat node and auto-opens the modal.
2. Editing flow: add 2 messages → Done → renders correctly outside the modal.
3. Cancel after edits: original state restored.
4. Insert empty chat → Cancel: node is removed from the document.
5. Variant switch: a→b and b→a both preserve names and avatars; messages still reference valid participants.
6. Variant a renders agent's long markdown (code block + list) correctly within the article column.
7. Variant b shows author names atop each bubble.
8. Under `note` ColorScheme, CJK serif is applied to message content.

## Downstream Consumer Impact

- **Shiroi**: bumping `@haklex/rich-kit-shiro` exposes the new node automatically. No code changes required for read-side rendering.
- **admin-vue3**: bumping the pinned `@haklex/*` versions adds the slash-menu entry automatically. No Vue-side code changes.
- **mx-core**: bumping `@haklex/rich-headless` is required for `$toMarkdown()` to know about `ChatNode`. The blockquote markdown export logic ships in `rich-headless`.

## Release

Follows the standard `pnpm release:rich` flow:

1. Bump all `@haklex/*` package versions including the new `@haklex/rich-ext-chat`.
2. Build and publish to npm.
3. Update pinned versions in `admin-vue3/package.json` and `mx-core/apps/core/package.json`.

## Open Questions

None as of this draft. All major design choices were resolved during brainstorming.

## Future Enhancements (Post-MVP)

- AI agent creation (whitelist `chat` in `rich-ext-ai-agent`, add example XML to system prompt).
- Paste-import: parse ChatGPT / Claude conversation exports into `ChatNode` JSON.
- Markdown live preview in the editor modal (right pane split).
- Per-message timestamps (optional field).
- Participant >2 (group chat variant).
- Avatar upload (file picker → asset pipeline).
- Migration to nested Lexical-native message content (schema bump `version: 2`, replace `content: string` with `content: SerializedLexicalNode[]`).
