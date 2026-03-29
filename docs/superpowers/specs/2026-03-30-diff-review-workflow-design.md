# Diff Review Workflow Design

**Date**: 2026-03-30
**Status**: Approved

## Problem

After AI agent operations complete, changes are applied immediately to the editor with no review step. Users cannot see what changed, accept/reject individual changes, or handle conflicts when subsequent operations target the same blocks.

## Design Overview

Replace the current auto-apply `DiffState` with a **ReviewState** architecture. Agent output produces immutable proposed batches; the editor is only mutated when the user explicitly accepts. A git-diff-style view appears in both the chat panel (unified diff) and the editor (overlay markers).

## Data Model

### ReviewState (replaces DiffState)

```typescript
type ReviewState = {
  documentRevision: number;
  committedSnapshot: SerializedEditorState;
  batches: ReviewBatch[];
};

type ReviewBatch = {
  id: string;
  runId: string;
  baseRevision: number;
  baseSnapshot: SerializedEditorState;
  previewSnapshot: SerializedEditorState; // applyOpsToSnapshot(base, ops)
  status: 'pending' | 'accepted' | 'rejected' | 'conflicted';
  hunks: ReviewHunk[];
  entries: ReviewEntry[];
  touchedBlockIds: string[];
};

type ReviewHunk = {
  id: string;
  batchId: string;
  entryIds: string[];
  anchorRange: { startBlockId: string; endBlockId: string };
  status: 'pending' | 'accepted' | 'rejected' | 'conflicted' | 'stale';
};

type ReviewEntry = {
  id: string;
  op: AgentOperation;
  targetBlockId?: string;
  anchorBeforeId?: string;
  anchorAfterId?: string;
  originalFingerprint: string; // JSON hash of original block for conflict detection
  status: 'pending' | 'accepted' | 'rejected' | 'conflicted';
};
```

### Pure Preview Generation

```typescript
function applyOpsToSnapshot(
  base: SerializedEditorState,
  ops: AgentOperation[],
): SerializedEditorState;
```

Applies operations to a serialized state purely (no Lexical mutation). Used to generate `previewSnapshot` for diff computation.

## Chat Panel: Unified Diff View

### Default: Unified Diff

A new `DiffReviewBubble` component in `@haklex/rich-agent-chat` renders after agent completion. It uses `computeDiff(baseSnapshot, previewSnapshot)` from `@haklex/rich-diff` and displays hunks in a single-column unified format:

- Deleted lines: red background + strikethrough
- Inserted lines: green background
- Equal lines: collapsed (show N unchanged lines)
- Each hunk shows the affected block type (heading, paragraph, etc.)

### Controls

- **Accept All** / **Reject All** buttons at the top
- Per-hunk **Accept** / **Reject** buttons (secondary)
- Batch status indicator (pending/accepted/rejected/conflicted)

### Optional: Side-by-Side Expansion

A toggle or expand button switches to the existing `RichDiff` component for detailed comparison.

## Editor: Overlay Markers

Pending proposals are rendered as **overlays anchored to block DOM**, not as Lexical nodes. This preserves document state integrity, selection, and history.

### Rendering by Operation Type

| Operation   | Editor Rendering                                                               |
| ----------- | ------------------------------------------------------------------------------ |
| **Insert**  | Green insertion rail between blocks + ghost preview card in overlay layer      |
| **Delete**  | Red gutter on existing block + dimmed/strikethrough presentation via CSS class |
| **Replace** | Red gutter on original block + green ghost replacement preview adjacent        |

### Implementation: DiffReviewOverlayPlugin

Replaces `DiffApplyPlugin`. This plugin:

1. Subscribes to `reviewState.batches` in the store
2. For pending batches, finds target blocks by blockId using `blockIdState`
3. Measures block positions via `getBoundingClientRect()`
4. Renders overlay elements in a portal layer positioned relative to target blocks
5. Ghost previews use `RichRenderer` (static) for content display
6. CSS classes are applied to existing block DOM for delete/replace markers

On accept: applies operations to editor via `editor.update()` + `$parseSerializedNode()`.
On reject: removes overlay markers, discards batch.

## Conflict Resolution: Selective Supersession

| Case                                                  | Outcome                               |
| ----------------------------------------------------- | ------------------------------------- |
| New batch touches unrelated blocks                    | Both batches coexist as pending       |
| New batch targets a block with pending replace/delete | Mark **older** entry as `conflicted`  |
| New batch inserts at same anchor as pending insert    | Mark both as conflicting alternatives |
| Document changed under a pending batch's target       | Mark affected hunks as `stale`        |

### Detection Mechanism

Each `ReviewEntry` stores an `originalFingerprint` (hash of the target block's serialized JSON at creation time). When a new batch is created or the document changes:

1. Iterate all pending entries
2. Compare `originalFingerprint` against current block content
3. If mismatch → mark as `stale`
4. Check `touchedBlockIds` overlap between batches → mark conflicts

## Flow Diagram

```
Document (revision N)
    |
    v
Agent run → AgentOperation[]
    |
    v
Create ReviewBatch
  - baseSnapshot = snapshot at revision N
  - previewSnapshot = applyOpsToSnapshot(base, ops)
  - hunks = computeDiff(base, preview)
  - touchedBlockIds = extract from ops
  - check conflicts with existing pending batches
    |
    +--→ Chat panel: DiffReviewBubble (unified diff + controls)
    |
    +--→ Editor: DiffReviewOverlayPlugin (gutters + ghost previews)
    |
    v
User decision (per-batch or per-hunk)
    |
    +-- Accept → validate fingerprints → apply to editor → increment revision
    |
    +-- Reject → discard batch → remove overlays
    |
    +-- Conflict detected → show conflict UI → user resolves
```

## Store Changes

### AgentStoreState

```diff
- diffState: DiffState | null;
+ reviewState: ReviewState | null;
```

### New Actions

```typescript
type ReviewActions = {
  setReviewState: (state: ReviewState | null) => void;
  addReviewBatch: (batch: ReviewBatch) => void;
  acceptBatch: (batchId: string) => void;
  rejectBatch: (batchId: string) => void;
  acceptHunk: (hunkId: string) => void;
  rejectHunk: (hunkId: string) => void;
  invalidateConflicts: () => void;
};
```

## Implementation Order

1. **Core**: `ReviewState` types + `applyOpsToSnapshot()` pure function + store changes
2. **Chat**: `DiffReviewBubble` with unified diff rendering + accept/reject controls
3. **Editor**: `DiffReviewOverlayPlugin` replacing `DiffApplyPlugin`
4. **Conflicts**: Fingerprint validation + selective conflict marking
5. **Polish**: Side-by-side toggle, animation, stale batch cleanup

## Package Impact

| Package                     | Changes                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| `@haklex/rich-agent-core`   | New types, store actions, `applyOpsToSnapshot()`, deprecate `DiffState` |
| `@haklex/rich-agent-chat`   | New `DiffReviewBubble` component                                        |
| `@haklex/rich-ext-ai-agent` | Replace `DiffApplyPlugin` with `DiffReviewOverlayPlugin`                |
| `@haklex/rich-diff`         | Add `computeDiff` for unified output (reuse existing algorithm)         |
| `demo/`                     | Update `AgentPage` to use new review flow                               |
