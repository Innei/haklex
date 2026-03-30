# Tool Call UI Refine Design

**Date:** 2026-03-30
**Scope:** `@haklex/rich-agent-core` (store + executor) + `@haklex/rich-agent-chat` (components + styles)

## Overview

Redesign the tool call UI from card-based collapsed bars to a minimal row-based layout with real-time status feedback. Restructure the store to use `tool_call_group` as the canonical bubble type, eliminating view-layer merge as the primary grouping mechanism.

Reference: `/private/tmp/b_Hrb2pN2AiFh-1774859030867/app/page.tsx` — minimal row layout with status icons, mono tool names, descriptions, durations, and nested groups.

## 1. Store Data Structures

### New bubble type: `tool_call_group`

```typescript
type ToolCallGroupBubble = {
  type: 'tool_call_group';
  id: string; // generated per assistant turn
  items: ToolCallGroupItem[];
};

type ToolCallGroupItem = {
  id: string; // LLM toolCallId
  toolName: string;
  description?: string; // from tool.describeCall(params), fallback: first param value[:40]
  params: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: string; // raw result content
  resultPreview?: string; // short display text, distinct from raw result
  error?: string;
  startedAt?: number; // Date.now() timestamp
  finishedAt?: number; // Date.now() timestamp; duration = finishedAt - startedAt
};
```

### Enhanced thinking bubble

```typescript
type ThinkingBubble = {
  type: 'thinking';
  id: string;
  rawText: string; // full thinking text
  steps: string[]; // parsed steps (split in executor, not component)
  isStreaming: boolean;
};
```

### New store action

```typescript
updateToolCallItem: (
  groupId: string,
  itemId: string,
  patch: Partial<ToolCallGroupItem>
) => void
```

ID-based lookup, not index-based. The `groupId` locates the bubble in the array, `itemId` locates the item within the group.

### Legacy compatibility

Existing `tool_call` and `tool_result` bubble types remain in the union but are no longer emitted by the executor. The view-layer `mergeBubbles` handles them as a fallback for third-party extensions.

## 2. AgentToolConfig Extension

```typescript
type AgentToolConfig = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (params: unknown) => Promise<AgentToolResult>;
  describeCall?: (params: unknown) => string; // NEW: human-readable invocation summary
};
```

- Executor calls `tool.describeCall?.(params)` when creating the group item.
- Fallback: `String(Object.values(params)[0] ?? '').slice(0, 40)`.

## 3. Executor Flow Changes

Current flow:

```
collect toolCalls[] → for each: addBubble(tool_call) → executeTool → addBubble(tool_result)
```

New flow:

```
collect toolCalls[]
→ build ToolCallGroupItem[] with status: 'pending', description from describeCall
→ addBubble({ type: 'tool_call_group', id: turnId, items })
→ for each item:
    1. updateToolCallItem(groupId, itemId, { status: 'running', startedAt: Date.now() })
    2. result = await executeTool(name, args)
    3. updateToolCallItem(groupId, itemId, {
         status: result.ok ? 'completed' : 'error',
         result: result.ok ? result.content : undefined,
         resultPreview: result.ok ? result.content.slice(0, 80) : undefined,
         error: !result.ok ? JSON.stringify(result.error) : undefined,
         finishedAt: Date.now()
       })
```

The `tool_call_group` bubble is written to the store before any tool executes, so the UI immediately shows all pending items.

### Thinking flow changes

- Streaming: `addBubble({ type: 'thinking', id, rawText: '', steps: [], isStreaming: true })`
- Each chunk: `updateLastBubble({ ..., rawText: accum, isStreaming: true })`
- Complete: `updateLastBubble({ ..., rawText: accum, steps: splitSteps(accum), isStreaming: false })`
- `splitSteps`: split by double newline or sentence boundaries, implementation detail.

### JSON.parse guard

Wrap `JSON.parse(args)` in try-catch. On parse failure, set item status to `'error'` with the parse error message instead of throwing.

## 4. Component Design

### ToolCall (single row)

```
[status icon]  [name mono]  [description gray]  ----spacer----  [duration]  [chevron >]
```

- **Status icon (16x16 container):**
  - `pending` → gray dot (1.5px radius)
  - `running` → spinner (Loader2 animate-spin)
  - `completed` → checkmark (Check icon)
  - `error` → red X icon
- **Name:** mono font, 13px. Color varies: pending=muted, running=foreground, completed=muted, error=red
- **Description:** muted/60, 13px, truncated
- **Duration:** mono 12px, muted/50, right-aligned. Computed from `finishedAt - startedAt`. Hidden while running.
- **Chevron:** 3px, muted/40, rotates 90deg when expanded. Only shown when params/result/error exist.
- **Expanded detail:** indented (pl-6), grid-rows animation for open/close
  - Params: `<pre>` with JSON.stringify, muted bg
  - Result: emerald-tinted `<pre>`
  - Error: red-tinted `<pre>`

### ToolCallGroup (nested container)

```
[group status icon]  [title]  [completed/total]  ----spacer----  [chevron]
  └─ ToolCall
  └─ ToolCall
  └─ ToolCall
```

- **Single item optimization:** When group has 1 item, render ToolCall directly without nesting.
- **Title:** "Executing parallel tasks" (while running) / "Executed N tasks" (when done). Or tool-specific when single.
- **Group status:** Derived from items — any error → error, any running → running, all completed → completed, else pending.
- **Counter:** `completedCount/total` in mono, muted/50.
- **Children:** indented pl-4, defaultExpanded=true.

### ThinkingChain (replaces ThinkingBlock)

```
[sparkles icon]  Thinking  [bounce dots | N steps]  ----spacer----  [chevron]
  └─ step 1 text
  └─ step 2 text
  └─ [pulse skeleton]   (if streaming)
```

- **Streaming state:** Sparkles with animate-pulse, 3 bouncing dots after "Thinking"
- **Completed state:** Static sparkles (muted/50), "N steps" counter, collapsible
- **Expanded steps:** 13px, muted color, leading-relaxed. Skeleton placeholder during streaming.
- **defaultExpanded:** false (collapsed by default when complete)

### mergeBubbles (legacy compat)

- `tool_call_group` bubble → pass directly to ToolCallGroup
- Adjacent `tool_call` + `tool_result` (legacy) → merge into `tool_call_group` format with `id: 'legacy-${index}'`, items get `id: 'fallback-${i}'`
- Single-item legacy group → render as bare ToolCall (no nesting)

## 5. CSS (Vanilla Extract)

### Design principle

Remove card-based `collapsedBar` system (background + border + borderRadius). Replace with pure row layout — no visual container, hierarchy expressed through indentation only.

### New style classes

| Class                 | Purpose                                                                         |
| --------------------- | ------------------------------------------------------------------------------- |
| `toolCallRow`         | flex, items-center, gap-2, py-1, text-sm, hover:text-foreground, cursor-pointer |
| `toolCallName`        | font-mono, 13px, color by status                                                |
| `toolCallDesc`        | textTertiary/60, 13px, truncate, flex-1                                         |
| `toolCallDuration`    | font-mono, 12px, textQuaternary/50                                              |
| `toolCallChevron`     | size-3, textQuaternary/40, transition rotate-90                                 |
| `toolCallDetail`      | grid transition (grid-rows-[0fr] / grid-rows-[1fr]), overflow-hidden            |
| `toolCallDetailInner` | pl-6, pb-2, space-y-2                                                           |
| `toolCallJson`        | keep existing, minor tweaks                                                     |
| `toolCallResultPre`   | emerald bg/text pre block                                                       |
| `toolCallErrorPre`    | red bg/text pre block                                                           |
| `toolCallGroupItems`  | pl-4, pt-0.5                                                                    |
| `thinkingRow`         | same layout as toolCallRow                                                      |
| `thinkingSteps`       | pl-6, 13px, muted, leading-relaxed                                              |
| `thinkingSkeleton`    | h-3.5, rounded, muted/50, animate-pulse                                         |
| `bounceDot`           | size-1, rounded-full, muted, animate-bounce with staggered delays               |

### Deprecated styles

- `collapsedBar`, `collapsedBarExpanded`, `collapsedBarPanel`, `collapsedBarArrow`, `collapsedBarDot`, `collapsedBarSpinner` — remove if no other consumers
- `toolCallRow` (old version) — replaced
- `toolCallRetryButton` — remove (retry handled differently or omitted in v1)

### Animation

- Spinner: reuse existing `spinAnimation` keyframe
- Bounce dots: 3 dots with `animation-delay: -0.3s, -0.15s, 0s`
- Expand/collapse: `grid-rows` transition, 150ms duration
- Sparkles pulse: CSS `animate-pulse`

## 6. File Changes Summary

| Package           | File                            | Change                                                                     |
| ----------------- | ------------------------------- | -------------------------------------------------------------------------- |
| `rich-agent-core` | `initialState.ts`               | Add `ToolCallGroupBubble`, `ToolCallGroupItem`, enhance `ThinkingBubble`   |
| `rich-agent-core` | `store-actions.ts`              | Add `updateToolCallItem(groupId, itemId, patch)`                           |
| `rich-agent-core` | `agent-executor.ts`             | Rewrite tool call loop to emit group + update items; rewrite thinking flow |
| `rich-agent-core` | `protocol.ts`                   | Add `describeCall?` to `AgentToolConfig`                                   |
| `rich-agent-chat` | `components/ToolCallBubble.tsx` | Delete, replace with `ToolCall.tsx` + `ToolCallGroup.tsx`                  |
| `rich-agent-chat` | `components/ThinkingBlock.tsx`  | Delete, replace with `ThinkingChain.tsx`                                   |
| `rich-agent-chat` | `ChatMessageList.tsx`           | Update `mergeBubbles` for compat, update render switch                     |
| `rich-agent-chat` | `styles.css.ts`                 | Remove collapsedBar system, add row-based styles                           |
