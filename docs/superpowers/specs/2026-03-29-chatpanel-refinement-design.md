# ChatPanel Refinement Design Spec

**Date:** 2026-03-29
**Package:** `@haklex/rich-agent-chat`
**Scope:** Visual redesign of ChatPanel — message layout, composer, and state displays.

---

## Overview

Redesign ChatPanel from a traditional chat-bubble layout to a hybrid approach: user messages as bubbles, assistant messages as full-width prose, with a floating composer card. All non-user elements left-aligned. Tool calls and thinking blocks share a unified collapsed-bar visual system.

## Layout

### Message Area

- **User messages**: right-aligned bubble, dark background (`#171717` light / inverted dark), max-width 82%, border-radius `18px 18px 6px 18px`.
- **Assistant messages**: left-aligned full-width prose. No bubble, no border, no background. Font-size 14px, line-height 1.75. Rendered via Streamdown (unchanged).
- **Gap between turns**: 16px between a user bubble and the following assistant prose. 4px between same-role elements (e.g., prose → collapsed bar → prose).

### Composer (B-style floating card)

Replaces the current flat `composerDock` with a floating card:

- Container: full-width, padding `10px 14px 14px`, pinned to bottom.
- Card: `background: bg`, `border: 1px solid border`, `border-radius: 14px`, `box-shadow: 0 1px 4px rgba(0,0,0,0.04)`, padding `12px 14px`.
- Interior layout (top to bottom):
  1. **Status line** (visible only when running): spinner + "Writing token-service.ts..." in accent green, font-size 11px.
  2. **Textarea**: AutoResizeTextArea, transparent background, no border, placeholder "Ask a follow-up question...", min-rows 2 (reduced from 4), max-rows 10.
  3. **Bottom bar**: flex row, space-between.
     - Left: ModelSelector (pill style — provider icon + model name, border-radius 8px, background `fillTertiary`).
     - Right: Send button (circle, 32px, dark bg, white arrow) OR Abort button (circle, 32px, white bg, red border, red square icon) when running.

### Empty State

None. When no messages, show only the composer card. The message area is empty.

## Collapsed Bar System

A unified visual pattern for thinking blocks, tool calls, and diff summaries. All share the same shape:

```
[icon/trigger] [readable label] [trailing meta]
```

- Container: `display: inline-flex`, `padding: 6px 12px`, `background: fillTertiary`, `border: 1px solid border`, `border-radius: 8px`, left-aligned.
- Font: 12px, color `textTertiary`.
- Clickable: cursor pointer, expand/collapse on click.

### Thinking Block

**In-progress:**

- Spinner (12px, animated rotation) + "Thinking about {readable summary}..."
- The `content` field of the thinking bubble provides the summary text. Truncate to first clause or ~60 chars.

**Completed (collapsed):**

- ▶ + "Thought about {readable summary}" + duration in `textQuaternary` (e.g., "4s")

**Completed (expanded):**

- ▼ trigger bar (same as collapsed, with border-bottom-radius removed)
- Content panel below: `background: bg`, `border: 1px solid border`, rounded bottom corners, padding `10px 14px`, font-size 12px, color `textTertiary`, font-style italic, line-height 1.6.

### Tool Calls

**In-progress:**

- Spinner + "edit_file token-service.ts"

**Completed (collapsed):**

- ▶ + "{N} tool calls completed" + green dot (6px)

**Completed (expanded):**

- ▼ trigger bar
- Content panel: list of tool calls with status dot + name + params summary. Existing `ToolCallBubble` content reused inside.

**Error:**

- ▶ + "{N} tool calls — {M} failed" + red dot

### Diff Summary

Deferred. Keep current implementation for now; revisit when diff workflow is more defined.

## Error State

Replace the current `Alert` banner with inline text:

- Font-size 13px, color `#ef4444`, line-height 1.5.
- Retry as an underlined text link (not a button), same color, appended inline with 8px gap.
- No background, no border, no card. Just red text in the message flow.

## Component Changes

| Component          | Change                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ChatPanel`        | Remove `composerDock` wrapper. Composer card is now a self-contained section. StatusBar moves inside composer card.                                                      |
| `ChatInput`        | Restyle as floating card. Reduce min-rows to 2. Status line integrated at top of card.                                                                                   |
| `ChatMessageList`  | Remove `bubbleAssistant` class (assistant messages become unstyled prose). Keep `bubbleUser` with updated styles.                                                        |
| `StreamdownBubble` | Remove wrapping `bubbleAssistant` div. Render Streamdown content directly.                                                                                               |
| `ThinkingBlock`    | Rewrite: collapsed bar with readable prefix. Use Collapsible from `rich-editor-ui`.                                                                                      |
| `ToolCallBubble`   | Rewrite: merge consecutive tool calls into a single collapsed bar with count. Expand to show individual calls.                                                           |
| `ErrorBubble`      | Replace Alert with inline red text + retry link.                                                                                                                         |
| `StatusBar`        | Move into ChatInput as a status line above the textarea. Remove standalone component.                                                                                    |
| `ModelSelector`    | Restyle as a pill (rounded, compact). Remove compound control border. Remove standalone settings gear button; add "Settings..." link at bottom of popover panel instead. |
| `styles.css.ts`    | Major rewrite: remove bubble styles for assistant, add collapsed-bar tokens, update composer styles.                                                                     |

## Style Tokens

New styles needed in `styles.css.ts`:

- `collapsedBar` — shared base for thinking/tool/diff collapsed bars
- `collapsedBarExpanded` — trigger bar when panel is open (no bottom radius)
- `collapsedBarPanel` — expanded content panel
- `collapsedBarSpinner` — animated spinner for in-progress state
- `composerCard` — floating card wrapper
- `composerStatusLine` — running status inside composer
- `errorInline` — inline red error text
- `errorRetryLink` — underlined retry link

Remove:

- `bubbleAssistant` (assistant messages are unstyled prose)
- `composerDock` (replaced by composer card)
- `statusBar` (absorbed into composer)
- `inputContainer` old styles (replaced by card)

## Dark Mode

All colors use existing `vars.color.*` tokens. The user bubble inverts: light text on dark bg in light mode, same in dark mode (always dark bg). The collapsed bars use `fillTertiary` / `border` which adapt automatically.

## Interaction States

| State           | Composer                                              | Message Area                                           |
| --------------- | ----------------------------------------------------- | ------------------------------------------------------ |
| Idle, no model  | Textarea disabled, placeholder "Configure a model..." | Empty or previous messages                             |
| Idle, has model | Textarea enabled, send button                         | Messages visible                                       |
| Running         | Status line visible, abort button replaces send       | Streaming assistant prose + in-progress collapsed bars |
| Error           | Returns to idle                                       | Error text inline at end of messages                   |
