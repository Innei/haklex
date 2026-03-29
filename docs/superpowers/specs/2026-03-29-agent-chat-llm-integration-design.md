# Agent Chat: Real LLM Integration & Chat UI Design

## Overview

Integrate real Claude and OpenAI LLMs into the demo agent chat, with a comprehensive chat UI featuring streaming markdown, tool call visualization, thinking blocks, user intervention controls, and more. Requires new UI primitives in `@haklex/rich-editor-ui`.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| LLM access | Vite dev server proxy middleware | API keys stay in `.env`, no CORS issues, unified proxy for both providers |
| Streaming markdown | Streamdown (core only) | remend self-healing + block memoization; no `streamdown/styles.css`, no Tailwind |
| Styling | Vanilla Extract via `components` prop override | Consistent with haklex ecosystem |
| Thinking block | Inline faded text | Light color, small font, left border; no collapsible wrapper |
| Tool call UI | Compact row + expandable details | Default one-line summary; click to expand params/result JSON |
| Code highlighting | Shiki (via `@streamdown/code`) | VS Code-grade highlighting, compatible with Streamdown |
| IconButton | ActionButton `rounded` variant | No new component; extend existing ActionButton |

## 1. Vite Proxy Middleware

### File: `demo/server/proxy.ts`

A Vite `configureServer` plugin that intercepts `POST /api/chat` requests.

**Request body:**

```typescript
{
  provider: 'claude' | 'openai';
  model: string;
  messages: ChatMessage[];
  tools?: ToolSchema[];
  stream: true;
}
```

**Behavior:**

- Read `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` from `process.env` (loaded via Vite's `.env` support)
- Forward to the respective API endpoint:
  - Claude: `https://api.anthropic.com/v1/messages` (streaming, with `anthropic-beta: interleaved-thinking-2025-05-14`)
  - OpenAI: `https://api.openai.com/v1/chat/completions` (streaming)
- Pipe the SSE response back to the client as `text/event-stream`
- Handle errors: return JSON `{ error, status }` on failure

### File: `demo/src/providers/claude-provider.ts`

Implements `LLMProvider` interface.

```typescript
export function createClaudeProvider(model: string): LLMProvider
```

- `chat()` POSTs to `/api/chat` with `provider: 'claude'`
- Parses Claude SSE events (`content_block_delta`, `content_block_start`, etc.)
- Maps to `LLMChunk`:
  - `text_delta` → `{ type: 'text', text }`
  - `thinking_delta` → `{ type: 'thinking', text }` (new chunk type)
  - `input_json_delta` for tool use → accumulate, yield `{ type: 'tool_call', ... }` on block stop
  - `message_stop` → `{ type: 'done' }`

### File: `demo/src/providers/openai-provider.ts`

Implements `LLMProvider` interface.

```typescript
export function createOpenAIProvider(model: string): LLMProvider
```

- `chat()` POSTs to `/api/chat` with `provider: 'openai'`
- Parses OpenAI SSE (`data: {...}` lines)
- Maps `choices[0].delta` to `LLMChunk`:
  - `content` → `{ type: 'text', text }`
  - `tool_calls` → accumulate arguments, yield on finish_reason `tool_calls`
  - `[DONE]` → `{ type: 'done' }`

## 2. Protocol Extensions

### `LLMChunk` (in `rich-agent-core/src/protocol.ts`)

Add new chunk type:

```typescript
| { type: 'thinking'; text: string }
```

### `ChatBubble` (in `rich-agent-core/src/store.ts`)

Add new bubble type:

```typescript
| { type: 'thinking'; content: string }
```

### `AgentExecutor` updates

- Collect `thinking` chunks into a `thinking` bubble (prepended before assistant text bubble)
- Stream thinking content to store via `update_last_bubble`

## 3. New UI Components in `@haklex/rich-editor-ui`

All components follow existing patterns: Vanilla Extract styling, `@haklex/rich-style-token` design tokens, `@base-ui/react` primitives where available.

### 3.1 Collapsible

Wraps `@base-ui/react/collapsible`.

```typescript
export function Collapsible(props: CollapsibleProps)       // Root
export function CollapsibleTrigger(props: CollapsibleTriggerProps)
export function CollapsiblePanel(props: CollapsiblePanelProps)  // Portal + Content
```

- Animated expand/collapse (CSS transition on `height`)
- `defaultOpen` prop
- Styled trigger with chevron indicator

### 3.2 Spinner

Custom animated SVG spinner.

```typescript
export interface SpinnerProps {
  size?: 'sm' | 'md';    // sm: 14px, md: 20px
  className?: string;
}
export function Spinner(props: SpinnerProps)
```

- CSS `@keyframes` rotation animation
- Color inherits from `currentColor`
- Vanilla Extract recipe with size variants

### 3.3 Badge

Inline label with status variants.

```typescript
export interface BadgeProps {
  variant?: 'neutral' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
}
export function Badge(props: BadgeProps)
```

- Rounded pill shape
- Colors from `rich-style-token` palette (neutral-500, green-600, red-600, amber-600, blue-600)
- `sm`: 11px font, `md`: 12px font

### 3.4 Select

Wraps `@base-ui/react/select`.

```typescript
export function Select(props: SelectProps)               // Root
export function SelectTrigger(props: SelectTriggerProps)  // Styled trigger button
export function SelectContent(props: SelectContentProps)  // Portal + Positioner + Popup
export function SelectItem(props: SelectItemProps)        // Option
export function SelectGroup(props: SelectGroupProps)
export function SelectGroupLabel(props: SelectGroupLabelProps)
export function SelectSeparator(props: SelectSeparatorProps)
```

- Styled consistent with DropdownMenu appearance
- `SelectTrigger` shows selected value + chevron
- Keyboard navigation

### 3.5 AutoResizeTextArea

Native textarea with auto-height.

```typescript
export interface AutoResizeTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxRows?: number;      // default: 6
  minRows?: number;      // default: 1
}
export const AutoResizeTextArea: ForwardRefExoticComponent<AutoResizeTextAreaProps>
```

- Uses hidden shadow element for height measurement
- Respects `maxRows` with overflow scroll
- Vanilla Extract styled (border, focus ring, etc.)

### 3.6 StatusDot

Small colored circle with optional pulse animation.

```typescript
export interface StatusDotProps {
  status: 'idle' | 'active' | 'success' | 'error' | 'warning';
  pulse?: boolean;       // animated pulse ring, default false
  size?: 'sm' | 'md';   // sm: 8px, md: 12px
  className?: string;
}
export function StatusDot(props: StatusDotProps)
```

- Color mapping: idle=#a3a3a3, active=#3b82f6, success=#22c55e, error=#ef4444, warning=#f59e0b
- Pulse: CSS `@keyframes` scale + opacity ring

### 3.7 CodeBlock

Standalone code block with Shiki highlighting.

```typescript
export interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;    // default: true
  className?: string;
}
export function CodeBlock(props: CodeBlockProps)
```

- Shiki for syntax highlighting (async, lazy loaded)
- Header bar: language label (left) + copy button (right)
- Fallback: `<pre><code>` while Shiki loads
- Copy button uses `navigator.clipboard.writeText()`
- Vanilla Extract styling, monospace font

### 3.8 ScrollArea

Custom-styled scrollbar container.

```typescript
export interface ScrollAreaProps {
  children: ReactNode;
  className?: string;
  autoScrollToBottom?: boolean;   // default: false
  scrollRef?: RefObject<HTMLDivElement>;
}
export function ScrollArea(props: ScrollAreaProps)
```

- Thin custom scrollbar via CSS (`::-webkit-scrollbar` + Firefox `scrollbar-width`)
- `autoScrollToBottom`: auto-scroll when new content appended, pause if user scrolls up, resume when scrolled back to bottom
- Expose scroll container ref for programmatic control

### 3.9 Alert

Inline message block with optional action.

```typescript
export interface AlertProps {
  variant: 'info' | 'warning' | 'error';
  children: ReactNode;
  action?: ReactNode;           // e.g. retry button
  className?: string;
}
export function Alert(props: AlertProps)
```

- Left colored border (blue/amber/red)
- Light tinted background
- Icon per variant (info circle / warning triangle / error circle) from `lucide-react`
- `action` slot rendered at right side

### 3.10 ActionButton `rounded` variant

Extend existing ActionButton recipe:

```typescript
// Add to ActionButtonProps
rounded?: boolean;
```

- `border-radius: 50%` when `rounded` + `icon`
- Used for Send button, Stop button

## 4. Chat UI Components (in `@haklex/rich-agent-chat`)

### 4.1 StreamdownBubble

Renders assistant text with Streamdown.

```typescript
interface StreamdownBubbleProps {
  content: string;
  isStreaming: boolean;
}
```

- Uses `<Streamdown>` with `components` prop overriding all elements with Vanilla Extract styled versions
- `@streamdown/code` plugin with Shiki → delegates to `CodeBlock` component
- `@streamdown/math` plugin for KaTeX (optional)

### 4.2 ThinkingBlock

Inline faded thinking display.

```typescript
interface ThinkingBlockProps {
  content: string;
  isStreaming: boolean;
}
```

- Style: `color: #a3a3a3`, `font-size: 12px`, `font-style: italic`, `border-left: 2px solid #e5e5e5`
- Streams text in real-time during generation
- Positioned directly above the assistant text bubble

### 4.3 ToolCallBubble

Compact tool call with expandable details.

```typescript
interface ToolCallBubbleProps {
  name: string;
  arguments: string;       // JSON string
  status: 'running' | 'success' | 'error';
  result?: string;
}
```

- Default: `StatusDot` + `Badge(tool name)` + result summary (one line)
- Uses `Collapsible` for expand/collapse
- Expanded: formatted JSON params + full result
- Running state: `Spinner` instead of StatusDot

### 4.4 StatusBar

Agent execution status indicator.

```typescript
interface StatusBarProps {
  status: 'idle' | 'thinking' | 'calling_tool' | 'writing';
  toolName?: string;
}
```

- Positioned above ChatInput
- Shows: `Spinner` + status text ("Thinking...", "Calling search_document...", "Writing...")
- Hidden when idle
- Animated enter/exit

### 4.5 ModelSelector

Provider and model selection.

```typescript
interface ModelSelectorProps {
  provider: 'claude' | 'openai';
  model: string;
  onProviderChange: (provider: 'claude' | 'openai') => void;
  onModelChange: (model: string) => void;
}
```

- Uses `Select` component
- Two-level: provider group → model items
- Predefined model lists:
  - Claude: claude-sonnet-4-20250514, claude-opus-4-20250514
  - OpenAI: gpt-4o, gpt-4o-mini, o3

### 4.6 ErrorBubble

Error display with retry.

```typescript
interface ErrorBubbleProps {
  message: string;
  onRetry?: () => void;
}
```

- Uses `Alert` component with `variant="error"`
- Retry button as `action` slot

### 4.7 Updated ChatInput

Replaces current textarea with:

- `AutoResizeTextArea` component
- Send button: `ActionButton` with `rounded` + `icon` variant
- Stop button: replaces Send during generation, calls `abort()`
- Shift+Enter for newline, Enter to send (unchanged)

### 4.8 Updated ChatMessageList

- Wraps messages in `ScrollArea` with `autoScrollToBottom`
- Renders bubble types:
  - `user` → plain text bubble (existing)
  - `thinking` → `ThinkingBlock` (new)
  - `assistant` → `StreamdownBubble` (new, replaces plain text)
  - `tool_call` → `ToolCallBubble` (new)
  - `tool_result` → absorbed into `ToolCallBubble` (matched by toolCallId)
  - `error` → `ErrorBubble` (new)
  - `diff_summary` → inline diff preview (existing, enhanced)

## 5. Data Flow

```
User types message
    ↓
ChatInput → ChatPanel.onSend()
    ↓
Dispatch { type: 'user', content } bubble
    ↓
ModelSelector state → select provider
    ↓
createClaudeProvider(model) or createOpenAIProvider(model)
    ↓
useAgentLoop.run(action, message)
    ↓
AgentExecutor streams from LLMProvider:
    ├─ thinking chunks → dispatch thinking bubble (stream update)
    ├─ text chunks → dispatch assistant bubble (stream update via Streamdown)
    ├─ tool_call chunks → dispatch tool_call bubble
    │   ↓
    │   Execute tool → dispatch tool_result (merge into ToolCallBubble)
    │   ↓
    │   Feed result back to LLM → next turn
    └─ done → set_status idle, create DiffState
    ↓
StatusBar reflects: thinking → calling_tool → writing → idle
    ↓
User can: Stop (abort), Accept/Reject diffs, Retry on error
```

## 6. File Inventory

### New files in `@haklex/rich-editor-ui`

| File | Component |
|------|-----------|
| `src/components/collapsible/index.tsx` | Collapsible, CollapsibleTrigger, CollapsiblePanel |
| `src/components/collapsible/styles.css.ts` | Collapsible styles |
| `src/components/spinner/index.tsx` | Spinner |
| `src/components/spinner/styles.css.ts` | Spinner styles + keyframes |
| `src/components/badge/index.tsx` | Badge |
| `src/components/badge/styles.css.ts` | Badge recipe |
| `src/components/select/index.tsx` | Select, SelectTrigger, SelectContent, SelectItem, ... |
| `src/components/select/styles.css.ts` | Select styles |
| `src/components/auto-resize-textarea/index.tsx` | AutoResizeTextArea |
| `src/components/auto-resize-textarea/styles.css.ts` | TextArea styles |
| `src/components/status-dot/index.tsx` | StatusDot |
| `src/components/status-dot/styles.css.ts` | StatusDot recipe + pulse keyframes |
| `src/components/code-block/index.tsx` | CodeBlock |
| `src/components/code-block/styles.css.ts` | CodeBlock styles |
| `src/components/scroll-area/index.tsx` | ScrollArea |
| `src/components/scroll-area/styles.css.ts` | ScrollArea styles |
| `src/components/alert/index.tsx` | Alert |
| `src/components/alert/styles.css.ts` | Alert recipe |

### New files in demo

| File | Purpose |
|------|---------|
| `demo/server/proxy.ts` | Vite proxy middleware |
| `demo/src/providers/claude-provider.ts` | Claude LLMProvider |
| `demo/src/providers/openai-provider.ts` | OpenAI LLMProvider |

### Modified files in `@haklex/rich-agent-core`

| File | Change |
|------|--------|
| `src/protocol.ts` | Add `thinking` to LLMChunk |
| `src/store.ts` | Add `thinking` to ChatBubble |
| `src/agent-executor.ts` | Handle thinking chunks, dispatch thinking bubbles |

### New/modified files in `@haklex/rich-agent-chat`

| File | Purpose |
|------|---------|
| `src/components/StreamdownBubble.tsx` | Streamdown markdown rendering |
| `src/components/ThinkingBlock.tsx` | Inline thinking display |
| `src/components/ToolCallBubble.tsx` | Tool call expandable |
| `src/components/StatusBar.tsx` | Agent status indicator |
| `src/components/ModelSelector.tsx` | Provider/model select |
| `src/components/ErrorBubble.tsx` | Error + retry |
| `src/ChatInput.tsx` | Refactor: use AutoResizeTextArea, add Stop/Send buttons |
| `src/ChatMessageList.tsx` | Refactor: use ScrollArea, render new bubble types |

### Modified files in demo

| File | Change |
|------|--------|
| `demo/vite.config.ts` | Add proxy plugin |
| `demo/src/pages/AgentPage.tsx` | Replace mock provider with real provider, add ModelSelector |

## 7. Dependencies to Add

| Package | Where | Purpose |
|---------|-------|---------|
| `streamdown` | `rich-agent-chat` | Core streaming markdown |
| `@streamdown/code` | `rich-agent-chat` | Shiki code highlighting |
| `@streamdown/math` | `rich-agent-chat` (optional) | KaTeX math |
| `shiki` | `rich-editor-ui` (peer) | CodeBlock highlighting |
| `@base-ui/react` | `rich-editor-ui` (existing) | Collapsible, Select primitives |
