# Poll Node Design

Status: Draft
Date: 2026-04-29
Owner: @innei

## Goal

Add a new Lexical node type, `poll`, that represents a reader-facing voting widget. It must remain interactive in the read-only / static rendering path so that end-users (article readers in Shiroi, users of any other downstream consuming `RichRenderer`) can cast votes without entering the editor.

The editor side is straightforward — it is a normal decorator node with edit UI for the structural definition. The hard part is wiring the interactive component back to a downstream's persistence/business layer in a way that does not couple core to any specific backend.

## Non-Goals (MVP)

- Real-time vote count updates (push/SSE/WebSocket). The adapter may opt in via revalidation strategy, but core does not prescribe one.
- Vote-changing or vote-cancellation flow. Once submitted, a vote is locked. (Confirmed Q4 = A.)
- Rich-text question content (bold/link/code in question text). Plain text only for MVP. (Confirmed Q5 = A.) Forward-compatible: a future `questionRich?: SerializedEditorState` field can be added; renderers fall back to `question`.
- Editor-side preview of real tallies. Edit mode shows structure only. (Confirmed Q3 = A.)
- Vote analytics, charts, demographics. Adapter / downstream's concern.
- Voter identity, anti-fraud, rate limiting. Adapter / downstream's concern.

## Architecture

The poll node follows the existing **Static / Edit Split** convention documented in `CLAUDE.md`:

- **`PollNode`** — static, lives in `@haklex/rich-editor/static`. Used by `RichRenderer`. Its `decorate()` returns the interactive read-only renderer.
- **`PollEditNode extends PollNode`** — overrides `decorate()` with the structural edit UI. Used by `RichEditor`.

Vote state (tallies + the current voter's submitted vote) is **not stored in the Lexical JSON**. Lexical only stores the immutable poll definition + a stable `pollId`. All dynamic state lives behind a `PollDataAdapter` provided by the downstream consumer through `PollDataContext`.

The default renderer ships with a styled, accessible UI (loading / error / unvoted / voted / closed states). Downstream consumers have **two layers** of customization:

1. **Shallow (recommended):** Provide a `PollDataAdapter` via `<PollDataProvider>`. Use the default UI.
2. **Deep:** Override `RendererConfig.Poll` with a fully custom component. Bypasses default UI and adapter both.

## Lexical Schema

```ts
interface SerializedPollNode extends SerializedLexicalNode {
  type: 'poll';
  version: 1;
  pollId: string;
  question: string;
  options: Array<{ id: string; label: string }>;
  mode: 'single' | 'multiple';
  closeAt?: string;
  showResults?: 'always' | 'after-vote' | 'after-close';
}
```

### ID Generation

- `pollId`: nanoid (12 chars), prefixed `p_`. Minted by `$createPollNode()` at insertion time.
- `option.id`: nanoid (8 chars), prefixed `o_`. Minted at option-add time. Stable across reorder/edit.

### Clone vs Paste Behavior

Lexical's internal node cloning (used during reconciliation) preserves `pollId` — required for state stability.

When a poll is **pasted** (cross-editor or duplicate within the same article), the imported node must mint new IDs to avoid two distinct polls sharing tally storage on the backend. Implementation:

- `PollEditNode` registers a transform / paste-aware override that detects an existing `pollId` collision in the current editor state and re-mints.
- Alternative: `importJSON` always mints a fresh `pollId`, and we encode the original ID in a separate transient channel during clone. To verify which approach Lexical's internals support cleanly during plan-writing.

This is an implementation detail to nail down in the plan; the design contract is "no two distinct PollNodes in any editor state share a `pollId`."

## Data Contract

### Types (exported from `@haklex/rich-editor`)

```ts
export interface PollState {
  tallies: Record<string, number>;
  totalVotes: number;
  userVote?: string[];
  status: 'loading' | 'ready' | 'error';
  errorMessage?: string;
  closed: boolean;
  canVote: boolean;
}

export interface PollDataAdapter {
  usePollState: (pollId: string) => PollState;
  useSubmit: (pollId: string) => (optionIds: string[]) => Promise<void>;
}

export interface PollMetadata {
  pollId: string;
  question: string;
  options: Array<{ id: string; label: string }>;
  mode: 'single' | 'multiple';
  closeAt?: string;
}

export interface PollRendererProps {
  pollId: string;
  question: string;
  options: Array<{ id: string; label: string }>;
  mode: 'single' | 'multiple';
  closeAt?: string;
  showResults?: 'always' | 'after-vote' | 'after-close';
}
```

### Provider

```tsx
export function PollDataProvider({
  adapter,
  initialStates,
  children,
}: {
  adapter: PollDataAdapter;
  initialStates?: Record<string, PollState>;
  children: ReactNode;
}): ReactNode;
```

The provider injects both the adapter and an optional snapshot of pre-fetched states (for SSR hydration).

### SSR Utility

```ts
export function extractPolls(state: SerializedEditorState): PollMetadata[];
```

Walks the serialized tree once and returns metadata for every `poll`-typed node. Lets downstream do a single batch fetch in RSC / on the server before rendering.

### Behavior When No Adapter Is Provided

The default `PollRenderer` reads adapter from context. If absent, it renders a non-interactive static fallback: question + option list with no selection affordance. This keeps `RichRenderer` usable without a `PollDataProvider` (e.g., when using it for previews or in Storybook).

## Default Renderer Visual Design

### Visual Language (validated via brainstorming mockups)

The poll node uses a single coherent visual primitive across all states: an **ambient row tint** — each option row has an absolutely-positioned background fill whose `width` represents either "selected" (100%) or "vote share" (percent). The fill uses neutral black at low opacity (`rgba(0,0,0,0.04)` for unselected/preview, `rgba(0,0,0,0.08)` for voted/highlighted). No border, no checkbox, no progress bar shape — just rows with fill-width as the data channel.

### Container

Top + bottom 1px hairline (`#e5e5e5`). No side border, no background tint, no rounded corners. The poll feels like a section break in the article rather than a widget. Vertical padding ~18px above/below the question.

### Per-state Rendering

| Condition                            | UI                                                                                                                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status === 'loading'`               | Skeleton: question-shaped placeholder + N option-shaped placeholders, same dimensions as final rendering to prevent layout shift                                                               |
| `status === 'error'`                 | Question + options shown without interaction; small error message from `errorMessage` below options                                                                                            |
| Unvoted, single, can vote            | Bare rows. Hover: row bg = `rgba(0,0,0,0.04)`; tooltip-style "click to vote" hint right-aligned, fades in on hover. Click submits immediately.                                                 |
| Unvoted, multiple, can vote          | Same bare rows; clicking toggles selection. Selected row = full-width tint at `rgba(0,0,0,0.08)` + bold label + leading `✓`. "Submit N items" button below; disabled (gray) until ≥1 selected. |
| Voted (after submit)                 | Each row's tint width = vote percent. User's chosen option(s) bold + leading `✓` + slightly darker tint. Right-aligned tabular-nums percent. `1,247 votes` in muted footer.                    |
| `closed && userVote === undefined`   | Same as voted-state visualization, no interaction; "Voting closed" label in meta line above options                                                                                            |
| `!canVote && userVote === undefined` | Rows visible, no hover affordance, cursor default; muted message line below from `errorMessage` (e.g., "Sign in to vote")                                                                      |

### Submit Animation

When the user submits in single-choice mode, the clicked row's tint expands from 0% to 100% as a transition cue, then collapses to its true vote share once the adapter resolves. In multi-choice mode, all selected rows' tints (already at 100% from preview) animate to their respective shares; un-selected rows' tints animate from 0% to share.

### `showResults` Modulation

- `'always'` (default): tallies + tint widths visible in voted/closed states
- `'after-vote'`: pre-vote rendering hides tally percent and uses 0% tint width regardless of share
- `'after-close'`: hides tallies until `closed === true`

## Edit Renderer UI

- Question textarea (auto-grow, plain text)
- Options list:
  - each row: text input, delete button, drag handle (or up/down buttons if dnd-kit not already a dep)
  - "Add option" button at the end
  - validation: at least 2 options, max 20, no empty labels (warnings, not blocking)
- Mode: segmented control (Single / Multiple)
- "Advanced" disclosure for `closeAt` (datetime input) and `showResults`
- No tallies, no live data, no `PollDataProvider` needed in editor

The edit renderer reuses primitives from `@haklex/rich-editor-ui` (Button, Input, etc.) and styling tokens from `@haklex/rich-style-token`.

## Markdown Serialization (mx-core via `@haklex/rich-headless`)

Roundtrip strategy: **HTML-comment-wrapped fenced JSON + a fallback bullet list**.

Output of `$toMarkdown()` for a poll node:

```markdown
<!--haklex:poll {"pollId":"p_abc","mode":"single","closeAt":"2026-05-01T00:00:00Z"}-->

**Which one do you prefer?**

- Option A
- Option B
<!--/haklex:poll-->
```

- The HTML comment carries lossless metadata; standard markdown renderers ignore it.
- The bullet list inside is a graceful fallback for any consumer that ignores Lexical-specific extensions — they see a question and a list.
- Reverse direction (markdown → Lexical, if ever needed) parses the comment block to reconstruct the node. MVP only requires the forward direction; mx-core's existing usage is Lexical → Markdown.

`@haklex/rich-headless` registers a serializer for `poll` in its node-to-markdown table.

## AI Agent / litexml Support

Per `CLAUDE.md`, every new node needs litexml read/write + agent prompt updates.

- `packages/rich-litexml/src/writers/poll.ts`: serializes `PollNode` → XML element
- `packages/rich-litexml/src/readers/poll.ts`: parses XML element → `SerializedPollNode`
- Register in `packages/rich-litexml/src/default-registry.ts`
- `packages/rich-ext-ai-agent` system prompt: add a description of the poll element with example usage

XML shape:

```xml
<poll id="p_abc" mode="single" close-at="2026-05-01T00:00:00Z">
  <question>Which one do you prefer?</question>
  <option id="o_a">Option A</option>
  <option id="o_b">Option B</option>
</poll>
```

When the agent creates a fresh poll, it must omit `id` attributes; the litexml reader mints fresh nanoids on import. When the agent edits an existing poll, IDs must be preserved.

## Package Layout & New Exports

### `@haklex/rich-editor`

New files:

- `src/nodes/PollNode.ts`
- `src/nodes/PollEditNode.ts`
- `src/context/PollDataContext.tsx` — provider + `usePollDataAdapter()` + `useInitialPollState(pollId)`
- `src/types/poll.ts` — exported types
- `src/utils/extractPolls.ts`

Updated:

- `src/config.ts` — register `PollNode`
- `src/config-edit.ts` — register `PollEditNode`
- public exports for `PollDataProvider`, `extractPolls`, `PollState`, `PollDataAdapter`, `PollMetadata`

### `@haklex/rich-editor/types/renderer-config.ts`

Add `Poll?: ComponentType<PollRendererProps>` to `RendererConfig`.

### `@haklex/rich-renderers`

- `src/poll.ts` — default `PollRenderer` (static + interactive)
- Register in `src/config.ts` as `enhancedRendererConfig.Poll`

### `@haklex/rich-renderers-edit`

- `src/poll.ts` — `PollEditRenderer` (structural editing UI)
- Register in `src/config.ts` as `enhancedEditRendererConfig.Poll`

### `@haklex/rich-headless`

- Register markdown writer for `poll`

### `@haklex/rich-litexml`

- `src/writers/poll.ts`, `src/readers/poll.ts`, register in `src/default-registry.ts`

### `@haklex/rich-ext-ai-agent`

- Update system prompt to include poll node creation guidance

### `@haklex/rich-kit-shiro`

- Re-export `PollDataProvider` and types so downstream Shiroi only needs `@haklex/rich-kit-shiro`.

## SSR / Hydration Flow (Shiroi reference)

```tsx
// app/posts/[slug]/page.tsx (RSC)
import { extractPolls } from '@haklex/rich-kit-shiro';
import { batchLoadPollStates } from '@/lib/polls';

const article = await getArticle(slug);
const pollMetas = extractPolls(article.content);
const initialStates = await batchLoadPollStates(
  pollMetas.map((p) => p.pollId),
  await getCurrentUserId(),
);

return (
  <PollDataProvider adapter={shiroiPollAdapter} initialStates={initialStates}>
    <ShiroRenderer value={article.content} />
  </PollDataProvider>
);
```

```tsx
// shiroiPollAdapter.ts (client)
export const shiroiPollAdapter: PollDataAdapter = {
  usePollState: (pollId) => {
    const initial = useInitialPollState(pollId);
    const { data } = useSWR(`/api/polls/${pollId}`, fetcher, { fallbackData: initial });
    return data!;
  },
  useSubmit: (pollId) => async (optionIds) => {
    await fetch(`/api/polls/${pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionIds }),
    });
    await mutate(`/api/polls/${pollId}`);
  },
};
```

Backend (mx-core) is responsible for:

- `GET /api/articles/:id/polls` — batch state fetch
- `POST /api/polls/:pollId/vote` — single vote submission, returning new state
- DB schema: `polls(id, article_id, created_at)` + `poll_votes(poll_id, voter_id, option_ids[], created_at)` with unique constraint on `(poll_id, voter_id)` to enforce the one-shot rule
- Voter identity resolution (login session or anonymous fingerprint, business decision)

These backend pieces are documented in this spec for clarity but are implemented in mx-core's repo, not here.

## Testing Notes

- **Unit**: serialization roundtrip (Lexical JSON → node → JSON), pollId minting on paste, `extractPolls` correctness.
- **Integration**: `PollRenderer` renders correct UI for each state in the table; submitting calls `useSubmit` with correct payload; multi-choice submit only fires after Submit button.
- **SSR**: server-render with `initialStates` produces the post-vote UI without flicker.
- **Visual**: storybook entry per state.
- **Markdown**: roundtrip a poll through `$toMarkdown()` and assert the comment block + list shape.

## Open Implementation Questions (to resolve in plan)

1. Exact mechanism for paste-time `pollId` re-mint (transform vs. importJSON-aware vs. clipboard hook).
2. Whether dnd-kit is already a dependency in the editor (drives option reorder UX choice).
3. Naming of the `PollDataProvider` initial-state prop — `initialStates` vs `prefetchedStates`. Cosmetic.

## Future Work (post-MVP)

- Rich-text question (`questionRich?` field, lossless append)
- Vote-changing flow (would relax the one-shot rule; adapter contract change required)
- Real-time push updates (adapter implementation detail)
- Comment-style discussion thread under a poll
- Anonymous toggle stored in node (currently treated as a backend/business decision)
