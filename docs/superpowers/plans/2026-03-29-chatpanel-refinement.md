# ChatPanel Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign ChatPanel: user messages as bubbles, assistant messages as full-width prose, floating composer card, unified collapsed-bar system for thinking/tool calls.

**Architecture:** Restyle existing components in `@haklex/rich-agent-chat`. No new packages. Collapsed-bar is a shared visual pattern implemented via shared CSS classes + `Collapsible` from `rich-editor-ui`. StatusBar merges into ChatInput.

**Tech Stack:** React 19, Vanilla Extract (CSS-in-TS), `@haklex/rich-editor-ui` (Collapsible, Spinner, Popover), Streamdown.

---

### Task 1: Rewrite `styles.css.ts` — Remove old styles, add new tokens

**Files:**

- Modify: `packages/rich-agent-chat/src/styles.css.ts`

This is the foundation. All subsequent component changes depend on these styles.

- [ ] **Step 1: Replace `styles.css.ts` with new style tokens**

Replace the entire file. Keep `chatPanel`, `messageList`, `bubbleUser`, `bubbleTool` (for diff_summary). Remove `bubbleAssistant`, `composerDock`, `inputContainer`, `statusBar`, and old input styles. Add collapsed-bar system and composer card styles.

```typescript
import { vars } from '@haklex/rich-style-token';
import { keyframes, style } from '@vanilla-extract/css';

// ── Layout ──

export const chatPanel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  height: '100%',
  minHeight: 0,
  boxSizing: 'border-box',
  padding: 0,
  fontSize: '14px',
  background: vars.color.bg,
  overflow: 'hidden',
});

export const messageList = style({
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  padding: '16px 18px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
});

// ── User Bubble ──

export const bubbleUser = style({
  alignSelf: 'flex-end',
  maxWidth: '82%',
  padding: '10px 14px',
  background: '#171717',
  color: '#fafafa',
  borderRadius: '18px 18px 6px 18px',
  lineHeight: 1.5,
  fontSize: '13px',
  marginBottom: 12,
});

// ── Assistant Prose ──

export const proseAssistant = style({
  fontSize: '14px',
  lineHeight: 1.75,
  color: vars.color.text,
  textAlign: 'left',
});

// ── Collapsed Bar System (thinking, tool calls) ──

export const collapsedBar = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'gap': 6,
  'padding': '6px 12px',
  'background': vars.color.fillTertiary,
  'border': `1px solid ${vars.color.border}`,
  'borderRadius': 8,
  'fontSize': '12px',
  'color': vars.color.textTertiary,
  'cursor': 'pointer',
  'margin': '8px 0',
  'transition': 'background 120ms ease',
  ':hover': {
    background: vars.color.fillSecondary,
  },
});

export const collapsedBarExpanded = style({
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  borderBottom: 'none',
  marginBottom: 0,
});

export const collapsedBarPanel = style({
  padding: '10px 14px',
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
  fontSize: '12px',
  color: vars.color.textTertiary,
  lineHeight: 1.6,
  marginBottom: 8,
});

const spinAnimation = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

export const collapsedBarSpinner = style({
  animation: `${spinAnimation} 1s linear infinite`,
  flexShrink: 0,
});

export const collapsedBarArrow = style({
  fontSize: '10px',
  color: vars.color.textQuaternary,
  flexShrink: 0,
  width: 10,
  textAlign: 'center',
});

export const collapsedBarMeta = style({
  color: vars.color.textQuaternary,
  fontSize: '11px',
});

export const collapsedBarDot = style({
  width: 6,
  height: 6,
  borderRadius: '50%',
  flexShrink: 0,
});

// ── Thinking (expanded content) ──

export const thinkingContent = style({
  fontStyle: 'italic',
});

// ── Tool Call (expanded content) ──

export const toolCallRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: '12px',
  color: vars.color.textTertiary,
  padding: '2px 0',
});

export const toolCallJson = style({
  margin: 0,
  overflowX: 'auto',
  padding: 6,
  background: vars.color.fillQuaternary,
  borderRadius: vars.borderRadius.sm,
  fontFamily: vars.typography.fontMono,
  fontSize: '11px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
});

// ── Error ──

export const errorInline = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: 8,
  fontSize: '13px',
  color: '#ef4444',
  lineHeight: 1.5,
  margin: '8px 0',
});

export const errorRetryLink = style({
  'fontSize': '12px',
  'color': '#ef4444',
  'textDecoration': 'underline',
  'cursor': 'pointer',
  'background': 'none',
  'border': 'none',
  'padding': 0,
  'fontFamily': 'inherit',
  'whiteSpace': 'nowrap',
  ':hover': {
    opacity: 0.8,
  },
});

// ── Diff Summary (kept as-is per spec) ──

export const bubbleTool = style({
  alignSelf: 'flex-start',
  maxWidth: '86%',
  padding: '8px 12px',
  background: vars.color.fill,
  border: `1px solid ${vars.color.border}`,
  borderRadius: 14,
  fontSize: '12px',
  color: vars.color.textTertiary,
});

// ── Composer Card ──

export const composerContainer = style({
  flexShrink: 0,
  padding: '10px 14px 14px',
});

export const composerCard = style({
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  borderRadius: 14,
  padding: '12px 14px',
  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
});

export const composerStatusLine = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: '11px',
  color: '#22c55e',
  marginBottom: 8,
});

export const composerTextArea = style({
  padding: 0,
  border: 'none',
  borderRadius: 0,
  background: 'transparent',
  boxShadow: 'none',
  fontSize: '13px',
  lineHeight: 1.65,
  color: vars.color.text,
  selectors: {
    '&:focus': {
      borderColor: 'transparent',
      boxShadow: 'none',
    },
    '&::placeholder': {
      color: vars.color.textTertiary,
    },
  },
});

export const composerBottomBar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  paddingTop: 8,
});

export const composerSendButton = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 32,
  'height': 32,
  'flexShrink': 0,
  'border': 'none',
  'borderRadius': '50%',
  'background': '#171717',
  'color': '#fafafa',
  'cursor': 'pointer',
  'transition': 'opacity 160ms ease',
  ':hover': {
    opacity: 0.85,
  },
  ':disabled': {
    background: vars.color.fillSecondary,
    color: vars.color.textQuaternary,
    cursor: 'not-allowed',
  },
});

export const composerAbortButton = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 32,
  'height': 32,
  'flexShrink': 0,
  'border': '1px solid rgba(239, 68, 68, 0.3)',
  'borderRadius': '50%',
  'background': vars.color.bg,
  'color': '#ef4444',
  'cursor': 'pointer',
  'transition': 'background 160ms ease',
  ':hover': {
    background: 'rgba(239, 68, 68, 0.06)',
  },
});
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx eslint packages/rich-agent-chat/src/styles.css.ts`
Expected: No errors (unused exports are OK at this stage — consumers will be updated next).

- [ ] **Step 3: Commit**

```bash
git add packages/rich-agent-chat/src/styles.css.ts
git commit -m "refactor(agent-chat): rewrite styles for chatpanel redesign"
```

---

### Task 2: Rewrite `model-selector.css.ts` — Pill style, settings in popover

**Files:**

- Modify: `packages/rich-agent-chat/src/components/model-selector.css.ts`

Remove the compound control (border-wrapped trigger + settings button). Replace with a pill (rounded, compact, no outer border).

- [ ] **Step 1: Replace `model-selector.css.ts`**

```typescript
import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const triggerButton = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'gap': 6,
  'minWidth': 0,
  'maxWidth': '100%',
  'padding': '4px 10px',
  'border': 'none',
  'borderRadius': 8,
  'background': vars.color.fillTertiary,
  'color': vars.color.textSecondary,
  'cursor': 'pointer',
  'outline': 'none',
  'fontFamily': 'inherit',
  'fontSize': '11px',
  'lineHeight': 1.2,
  ':hover': {
    background: vars.color.fillSecondary,
  },
  ':focus-visible': {
    background: vars.color.fillSecondary,
  },
});

export const providerIcon = style({
  width: 14,
  height: 14,
  borderRadius: 3,
  background: 'linear-gradient(135deg, #d4a574, #c4956a)',
  flexShrink: 0,
});

export const triggerLabel = style({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: 120,
  color: vars.color.textSecondary,
});

export const chevronIcon = style({
  color: vars.color.textQuaternary,
  flexShrink: 0,
});

export const popoverContent = style({
  width: 288,
  maxHeight: 360,
  overflowY: 'auto',
  padding: 8,
  borderRadius: 8,
  background: vars.color.bg,
});

export const modelGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: '6px 4px 10px',
});

export const modelGroupLabel = style({
  fontSize: 10,
  fontWeight: 700,
  color: vars.color.textQuaternary,
  padding: '4px 8px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
});

export const modelItem = style({
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'space-between',
  'width': '100%',
  'padding': '10px 12px',
  'border': 'none',
  'borderRadius': 4,
  'background': 'transparent',
  'fontFamily': 'inherit',
  'fontSize': 13,
  'color': vars.color.textSecondary,
  'cursor': 'pointer',
  'textAlign': 'left',
  'outline': 'none',
  ':hover': {
    background: vars.color.fillTertiary,
    color: vars.color.text,
  },
  ':focus-visible': {
    background: vars.color.fillTertiary,
    color: vars.color.text,
  },
});

export const modelItemActive = style({
  background: vars.color.fillTertiary,
  color: vars.color.text,
});

export const emptyState = style({
  padding: '20px 16px',
  textAlign: 'center',
  fontSize: 13,
  color: vars.color.textQuaternary,
});

export const settingsLink = style({
  'display': 'flex',
  'alignItems': 'center',
  'gap': 6,
  'width': '100%',
  'padding': '10px 12px',
  'border': 'none',
  'borderTop': `1px solid ${vars.color.border}`,
  'borderRadius': 0,
  'background': 'transparent',
  'fontFamily': 'inherit',
  'fontSize': 12,
  'color': vars.color.textTertiary,
  'cursor': 'pointer',
  'textAlign': 'left',
  'outline': 'none',
  'marginTop': 4,
  ':hover': {
    color: vars.color.text,
  },
});
```

Note: The import path `@haklex/rich-style-token/styles` matches the existing import in `model-selector.css.ts`. Check the current import — if it uses `@haklex/rich-style-token` (without `/styles`), keep that instead.

- [ ] **Step 2: Verify**

Run: `npx eslint packages/rich-agent-chat/src/components/model-selector.css.ts`

- [ ] **Step 3: Commit**

```bash
git add packages/rich-agent-chat/src/components/model-selector.css.ts
git commit -m "refactor(agent-chat): restyle model selector as pill"
```

---

### Task 3: Rewrite `ModelSelector` component — Pill trigger, settings link in popover

**Files:**

- Modify: `packages/rich-agent-chat/src/components/ModelSelector.tsx`

Remove the `compoundControl` wrapper and standalone settings button. Add a "Settings..." link at the bottom of the popover panel.

- [ ] **Step 1: Rewrite `ModelSelector.tsx`**

```tsx
import { Popover, PopoverPanel, PopoverTrigger } from '@haklex/rich-editor-ui';
import { Check, ChevronDown, Settings2 } from 'lucide-react';
import { useState } from 'react';

import type { ProviderConfig, SelectedModel } from '../types';
import * as css from './model-selector.css';

interface ModelSelectorProps {
  onOpenSettings: () => void;
  onSelectModel: (selected: SelectedModel) => void;
  providers: ProviderConfig[];
  selectedModel: SelectedModel | null;
}

export function ModelSelector({
  providers,
  selectedModel,
  onSelectModel,
  onOpenSettings,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);

  const currentProvider = selectedModel
    ? (providers.find((provider) => provider.id === selectedModel.providerId) ?? null)
    : null;
  const currentLabel = selectedModel ? selectedModel.modelId : 'No model';

  const providersWithModels = providers.filter((p) => p.models.length > 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={css.triggerButton}>
        <span className={css.providerIcon} />
        <span className={css.triggerLabel}>
          {currentProvider ? `${currentProvider.name} / ` : ''}
          {currentLabel}
        </span>
        <ChevronDown className={css.chevronIcon} size={12} />
      </PopoverTrigger>
      <PopoverPanel align="start" className={css.popoverContent} side="top" sideOffset={10}>
        {providersWithModels.length === 0 ? (
          <div className={css.emptyState}>Configure a provider to get started</div>
        ) : (
          providersWithModels.map((provider) => (
            <div className={css.modelGroup} key={provider.id}>
              <div className={css.modelGroupLabel}>{provider.name}</div>
              {provider.models.map((modelId) => {
                const isActive =
                  selectedModel?.providerId === provider.id && selectedModel?.modelId === modelId;
                return (
                  <button
                    className={`${css.modelItem}${isActive ? ` ${css.modelItemActive}` : ''}`}
                    key={modelId}
                    type="button"
                    onClick={() => {
                      onSelectModel({ providerId: provider.id, modelId });
                      setOpen(false);
                    }}
                  >
                    <span>{modelId}</span>
                    {isActive && <Check size={14} />}
                  </button>
                );
              })}
            </div>
          ))
        )}
        <button
          className={css.settingsLink}
          type="button"
          onClick={() => {
            setOpen(false);
            onOpenSettings();
          }}
        >
          <Settings2 size={13} />
          Settings...
        </button>
      </PopoverPanel>
    </Popover>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx eslint packages/rich-agent-chat/src/components/ModelSelector.tsx`

- [ ] **Step 3: Commit**

```bash
git add packages/rich-agent-chat/src/components/ModelSelector.tsx
git commit -m "refactor(agent-chat): model selector as pill with settings in popover"
```

---

### Task 4: Rewrite `ErrorBubble` — Inline red text + retry link

**Files:**

- Modify: `packages/rich-agent-chat/src/components/ErrorBubble.tsx`

Replace `Alert` + `ActionButton` with plain inline text.

- [ ] **Step 1: Rewrite `ErrorBubble.tsx`**

```tsx
import type { ReactElement } from 'react';

import { errorInline, errorRetryLink } from '../styles.css';

interface ErrorBubbleProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBubble({ message, onRetry }: ErrorBubbleProps): ReactElement {
  return (
    <div className={errorInline}>
      <span>{message}</span>
      {onRetry && (
        <button className={errorRetryLink} type="button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx eslint packages/rich-agent-chat/src/components/ErrorBubble.tsx`

- [ ] **Step 3: Commit**

```bash
git add packages/rich-agent-chat/src/components/ErrorBubble.tsx
git commit -m "refactor(agent-chat): error bubble as inline text with retry link"
```

---

### Task 5: Rewrite `ThinkingBlock` — Collapsed bar with readable prefix

**Files:**

- Modify: `packages/rich-agent-chat/src/components/ThinkingBlock.tsx`

Replace the italic left-border block with a collapsed bar. In-progress shows spinner + readable summary. Completed shows ▶/▼ + summary + duration. Expandable to show full thinking content.

The `ChatBubble` thinking type has `{ type: 'thinking'; content: string }` — no `duration` or `isStreaming` fields. The `isStreaming` prop is passed by `ChatMessageList`. Duration is not available from the store, so we omit it for now (the bar just shows the summary without "4s").

- [ ] **Step 1: Rewrite `ThinkingBlock.tsx`**

```tsx
import { Collapsible, CollapsiblePanel, CollapsibleTrigger, Spinner } from '@haklex/rich-editor-ui';
import type { ReactElement } from 'react';

import {
  collapsedBar,
  collapsedBarArrow,
  collapsedBarExpanded,
  collapsedBarPanel,
  thinkingContent,
} from '../styles.css';

interface ThinkingBlockProps {
  content: string;
  isStreaming: boolean;
}

function summarize(content: string): string {
  const firstClause = content.split(/[.!?\n]/)[0] ?? '';
  const trimmed = firstClause.trim();
  if (trimmed.length <= 60) return trimmed;
  return `${trimmed.slice(0, 57)}...`;
}

export function ThinkingBlock({ content, isStreaming }: ThinkingBlockProps): ReactElement {
  const summary = summarize(content);

  if (isStreaming) {
    return (
      <div className={collapsedBar} style={{ cursor: 'default' }}>
        <Spinner size="sm" />
        <span>Thinking about {summary || '...'}</span>
      </div>
    );
  }

  return (
    <Collapsible>
      <CollapsibleTrigger>
        {({ open }) => (
          <div className={`${collapsedBar}${open ? ` ${collapsedBarExpanded}` : ''}`}>
            <span className={collapsedBarArrow}>{open ? '▼' : '▶'}</span>
            <span>Thought about {summary || 'the problem'}</span>
          </div>
        )}
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <div className={`${collapsedBarPanel} ${thinkingContent}`}>{content}</div>
      </CollapsiblePanel>
    </Collapsible>
  );
}
```

Note: The `CollapsibleTrigger` render-prop API (`{ open }`) needs to be verified against the actual `rich-editor-ui` implementation. If `CollapsibleTrigger` does not support render props, use a `useState` to track open state on the `Collapsible` component instead:

```tsx
const [open, setOpen] = useState(false);
// ...
<Collapsible open={open} onOpenChange={setOpen}>
  <CollapsibleTrigger>
    <div className={`${collapsedBar}${open ? ` ${collapsedBarExpanded}` : ''}`}>
      <span className={collapsedBarArrow}>{open ? '▼' : '▶'}</span>
      ...
```

Check the Collapsible API at `packages/rich-editor-ui/src/components/collapsible/index.tsx` before implementing.

- [ ] **Step 2: Verify**

Run: `npx eslint packages/rich-agent-chat/src/components/ThinkingBlock.tsx`

- [ ] **Step 3: Commit**

```bash
git add packages/rich-agent-chat/src/components/ThinkingBlock.tsx
git commit -m "refactor(agent-chat): thinking block as collapsed bar with readable prefix"
```

---

### Task 6: Rewrite `ToolCallBubble` — Merged collapsed bar with count

**Files:**

- Modify: `packages/rich-agent-chat/src/components/ToolCallBubble.tsx`

The current `ToolCallBubble` renders one tool call at a time. The merging logic in `ChatMessageList` already merges consecutive tool_call + tool_result into `tool_call_merged`. We need a new component that renders a _group_ of merged tool calls as a single collapsed bar.

Rename the component to `ToolCallGroup` and accept an array. The `ChatMessageList` will be updated in a later task to group consecutive tool calls and pass them as an array.

For now, keep supporting a single tool call (the existing interface) but also accept an array.

- [ ] **Step 1: Rewrite `ToolCallBubble.tsx`**

```tsx
import {
  Badge,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  Spinner,
  StatusDot,
} from '@haklex/rich-editor-ui';
import { useState } from 'react';
import type { ReactElement } from 'react';

import {
  collapsedBar,
  collapsedBarArrow,
  collapsedBarDot,
  collapsedBarExpanded,
  collapsedBarPanel,
  toolCallJson,
  toolCallRow,
} from '../styles.css';

interface ToolCallItem {
  name: string;
  params: Record<string, unknown>;
  result?: { success: boolean; summary: string };
}

interface ToolCallBubbleProps {
  items: ToolCallItem[];
}

export function ToolCallBubble({ items }: ToolCallBubbleProps): ReactElement {
  const [open, setOpen] = useState(false);

  const total = items.length;
  const allDone = items.every((i) => i.result);
  const failedCount = items.filter((i) => i.result && !i.result.success).length;

  // Single in-progress tool call — no collapsible, just a spinner bar
  if (total === 1 && !items[0].result) {
    return (
      <div className={collapsedBar} style={{ cursor: 'default' }}>
        <Spinner size="sm" />
        <span>
          {items[0].name}
          {Object.keys(items[0].params).length > 0 && (
            <span style={{ opacity: 0.6 }}>
              {' '}
              {String(Object.values(items[0].params)[0] ?? '').slice(0, 40)}
            </span>
          )}
        </span>
      </div>
    );
  }

  // Determine label
  let label: string;
  let dotColor: string;
  if (!allDone) {
    label = `${total} tool calls running...`;
    dotColor = 'transparent';
  } else if (failedCount > 0) {
    label = `${total} tool calls — ${failedCount} failed`;
    dotColor = '#ef4444';
  } else {
    label = `${total} tool call${total > 1 ? 's' : ''} completed`;
    dotColor = '#22c55e';
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger>
        <div className={`${collapsedBar}${open ? ` ${collapsedBarExpanded}` : ''}`}>
          {!allDone ? (
            <Spinner size="sm" />
          ) : (
            <span className={collapsedBarArrow}>{open ? '▼' : '▶'}</span>
          )}
          <span>{label}</span>
          {allDone && <span className={collapsedBarDot} style={{ background: dotColor }} />}
        </div>
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <div className={collapsedBarPanel}>
          {items.map((item, i) => {
            const status = !item.result ? 'active' : item.result.success ? 'success' : 'error';
            return (
              <div key={i}>
                <div className={toolCallRow}>
                  {!item.result ? <Spinner size="sm" /> : <StatusDot size="sm" status={status} />}
                  <Badge size="sm" variant="neutral">
                    <code>{item.name}</code>
                  </Badge>
                  {item.result && (
                    <span style={{ color: item.result.success ? '#22c55e' : '#ef4444' }}>
                      {item.result.summary.length > 60
                        ? `${item.result.summary.slice(0, 60)}...`
                        : item.result.summary}
                    </span>
                  )}
                </div>
                {open && (
                  <div style={{ marginLeft: 28, marginTop: 4 }}>
                    <div style={{ color: '#737373', marginBottom: 4, fontSize: 11 }}>
                      Parameters
                    </div>
                    <pre className={toolCallJson}>{JSON.stringify(item.params, null, 2)}</pre>
                    {item.result && (
                      <>
                        <div style={{ color: '#737373', margin: '8px 0 4px', fontSize: 11 }}>
                          Result
                        </div>
                        <pre className={toolCallJson}>{item.result.summary}</pre>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CollapsiblePanel>
    </Collapsible>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx eslint packages/rich-agent-chat/src/components/ToolCallBubble.tsx`

- [ ] **Step 3: Commit**

```bash
git add packages/rich-agent-chat/src/components/ToolCallBubble.tsx
git commit -m "refactor(agent-chat): tool call bubble as collapsed bar with grouped items"
```

---

### Task 7: Rewrite `StreamdownBubble` — Remove assistant bubble wrapper

**Files:**

- Modify: `packages/rich-agent-chat/src/components/StreamdownBubble.tsx`

Remove the `bubbleAssistant` wrapping div. Use `proseAssistant` instead (no border, no background).

- [ ] **Step 1: Rewrite `StreamdownBubble.tsx`**

```tsx
import { CodeBlock } from '@haklex/rich-editor-ui';
import { code } from '@streamdown/code';
import type { ReactElement } from 'react';
import { Streamdown } from 'streamdown';

import { proseAssistant } from '../styles.css';

interface StreamdownBubbleProps {
  content: string;
  isStreaming: boolean;
}

const plugins = { code };

const components = {
  pre: ({ children, ...props }: any) => {
    const codeChild = children?.props;
    if (codeChild) {
      const lang = codeChild.className?.replace('language-', '') || '';
      const codeText = typeof codeChild.children === 'string' ? codeChild.children : '';
      return <CodeBlock code={codeText} language={lang} />;
    }
    return <pre {...props}>{children}</pre>;
  },
};

export function StreamdownBubble({ content, isStreaming }: StreamdownBubbleProps): ReactElement {
  return (
    <div className={proseAssistant}>
      <Streamdown components={components} isAnimating={isStreaming} plugins={plugins}>
        {content}
      </Streamdown>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx eslint packages/rich-agent-chat/src/components/StreamdownBubble.tsx`

- [ ] **Step 3: Commit**

```bash
git add packages/rich-agent-chat/src/components/StreamdownBubble.tsx
git commit -m "refactor(agent-chat): assistant messages as unstyled prose"
```

---

### Task 8: Rewrite `ChatInput` — Floating card with integrated status

**Files:**

- Modify: `packages/rich-agent-chat/src/ChatInput.tsx`

Restyle as a floating card. Integrate status line at top. Reduce min-rows to 2. Circular send/abort buttons.

- [ ] **Step 1: Rewrite `ChatInput.tsx`**

```tsx
import { AutoResizeTextArea, Spinner } from '@haklex/rich-editor-ui';
import { ArrowUp, Square } from 'lucide-react';
import type { ReactNode } from 'react';
import { useRef, useState } from 'react';

import * as css from './styles.css';

interface ChatInputProps {
  disabled?: boolean;
  isRunning?: boolean;
  modelSelector?: ReactNode;
  onAbort?: () => void;
  onSend: (message: string) => void;
  statusLabel?: string;
}

export function ChatInput({
  disabled,
  isRunning,
  modelSelector,
  onAbort,
  onSend,
  statusLabel,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const trimmed = input.trim();
  const placeholder = disabled
    ? 'Configure a model to start an agent task.'
    : 'Ask a follow-up question...';

  function handleSend() {
    if (!trimmed) return;
    onSend(trimmed);
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !isRunning) handleSend();
    }
  }

  return (
    <div className={css.composerContainer}>
      <div className={css.composerCard}>
        {isRunning && statusLabel && (
          <div className={css.composerStatusLine}>
            <Spinner size="sm" />
            <span>{statusLabel}</span>
          </div>
        )}
        <AutoResizeTextArea
          className={css.composerTextArea}
          disabled={disabled}
          maxRows={10}
          minRows={2}
          placeholder={placeholder}
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className={css.composerBottomBar}>
          <div>{modelSelector ?? <div />}</div>
          {isRunning ? (
            <button
              aria-label="Abort agent run"
              className={css.composerAbortButton}
              type="button"
              onClick={onAbort}
            >
              <Square size={14} />
            </button>
          ) : (
            <button
              aria-label="Send message"
              className={css.composerSendButton}
              disabled={disabled || !trimmed}
              type="button"
              onClick={handleSend}
            >
              <ArrowUp size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

Key changes:

- New prop `statusLabel?: string` — the status text (e.g., "Writing token-service.ts...") passed from ChatPanel.
- `composerContainer` + `composerCard` replaces old `inputContainer`.
- `composerStatusLine` at top of card, visible when running.
- `composerTextArea` replaces `inputTextArea`, min-rows reduced from 4 to 2.
- `composerSendButton` (circle, dark bg) and `composerAbortButton` (circle, red border) replace `inputActionButton`.
- `composerBottomBar` replaces `inputBottomBar` (no longer has borderTop separator).

- [ ] **Step 2: Verify**

Run: `npx eslint packages/rich-agent-chat/src/ChatInput.tsx`

- [ ] **Step 3: Commit**

```bash
git add packages/rich-agent-chat/src/ChatInput.tsx
git commit -m "refactor(agent-chat): chatinput as floating card with integrated status"
```

---

### Task 9: Rewrite `ChatMessageList` — Group tool calls, update rendering

**Files:**

- Modify: `packages/rich-agent-chat/src/ChatMessageList.tsx`

Update the merge logic to group consecutive tool calls into arrays. Pass grouped items to the new `ToolCallBubble` interface. Remove `bubbleAssistant` import.

- [ ] **Step 1: Rewrite `ChatMessageList.tsx`**

```tsx
import type { ChatBubble } from '@haklex/rich-agent-core';
import { ScrollArea } from '@haklex/rich-editor-ui';
import type { ReactElement } from 'react';
import { useRef } from 'react';

import { ErrorBubble } from './components/ErrorBubble';
import { StreamdownBubble } from './components/StreamdownBubble';
import { ThinkingBlock } from './components/ThinkingBlock';
import { ToolCallBubble } from './components/ToolCallBubble';
import { bubbleTool, bubbleUser, messageList } from './styles.css';

interface ChatMessageListProps {
  bubbles: ChatBubble[];
  onRetry?: () => void;
}

interface ToolCallItem {
  name: string;
  params: Record<string, unknown>;
  result?: { success: boolean; summary: string };
}

type MergedBubble = ChatBubble | { type: 'tool_call_group'; items: ToolCallItem[] };

function mergeBubbles(bubbles: ChatBubble[]): MergedBubble[] {
  const result: MergedBubble[] = [];
  let currentGroup: ToolCallItem[] | null = null;

  function flushGroup() {
    if (currentGroup && currentGroup.length > 0) {
      result.push({ type: 'tool_call_group', items: currentGroup });
      currentGroup = null;
    }
  }

  for (let i = 0; i < bubbles.length; i++) {
    const b = bubbles[i];

    if (b.type === 'tool_call') {
      if (!currentGroup) currentGroup = [];
      const next = bubbles[i + 1];
      if (next?.type === 'tool_result' && next.toolName === b.toolName) {
        currentGroup.push({
          name: b.toolName,
          params: b.params,
          result: { success: next.success, summary: next.summary },
        });
        i++; // skip tool_result
      } else {
        currentGroup.push({
          name: b.toolName,
          params: b.params,
        });
      }
    } else if (b.type === 'tool_result') {
      // orphaned tool_result — skip
      flushGroup();
    } else {
      flushGroup();
      result.push(b);
    }
  }
  flushGroup();
  return result;
}

export function ChatMessageList({ bubbles, onRetry }: ChatMessageListProps): ReactElement {
  const scrollRef = useRef<HTMLDivElement>(null);
  const mergedBubbles = mergeBubbles(bubbles);

  return (
    <ScrollArea autoScrollToBottom className={messageList} scrollRef={scrollRef}>
      {mergedBubbles.map((item, i) => {
        switch (item.type) {
          case 'user': {
            return (
              <div className={bubbleUser} key={i}>
                {item.content}
              </div>
            );
          }

          case 'thinking': {
            return <ThinkingBlock content={item.content} isStreaming={false} key={i} />;
          }

          case 'assistant': {
            return (
              <StreamdownBubble
                content={item.content}
                isStreaming={item.streaming ?? false}
                key={i}
              />
            );
          }

          case 'tool_call_group': {
            return <ToolCallBubble items={item.items} key={i} />;
          }

          case 'error': {
            return <ErrorBubble key={i} message={item.message} onRetry={onRetry} />;
          }

          case 'diff_summary': {
            return (
              <div className={bubbleTool} key={i}>
                Diff: {item.accepted} accepted, {item.rejected} rejected, {item.pending} pending
              </div>
            );
          }

          default: {
            return null;
          }
        }
      })}
    </ScrollArea>
  );
}
```

Key changes:

- `mergeBubbles` now groups consecutive tool calls into `tool_call_group` with an `items` array.
- Non-tool bubbles flush the current group.
- Renders `ToolCallBubble` with `items` prop instead of individual tool calls.
- Removed `bubbleAssistant` import.

- [ ] **Step 2: Verify**

Run: `npx eslint packages/rich-agent-chat/src/ChatMessageList.tsx`

- [ ] **Step 3: Commit**

```bash
git add packages/rich-agent-chat/src/ChatMessageList.tsx
git commit -m "refactor(agent-chat): group tool calls, update message list rendering"
```

---

### Task 10: Rewrite `ChatPanel` — Remove composerDock, wire statusLabel

**Files:**

- Modify: `packages/rich-agent-chat/src/ChatPanel.tsx`

Remove `composerDock` wrapper. Remove `StatusBar` import. Pass `statusLabel` string to `ChatInput` instead.

- [ ] **Step 1: Rewrite `ChatPanel.tsx`**

```tsx
import type { AgentStore } from '@haklex/rich-agent-core';
import { useCallback, useState } from 'react';

import { ChatInput } from './ChatInput';
import { ChatMessageList } from './ChatMessageList';
import { ModelSelector } from './components/ModelSelector';
import { SettingsModal } from './components/SettingsModal';
import * as css from './styles.css';
import type { ProviderConfig, SelectedModel } from './types';

interface ChatPanelProps {
  onAbort?: () => void;
  onProvidersChange: (providers: ProviderConfig[]) => void;
  onRetry?: () => void;
  onSelectModel: (selected: SelectedModel) => void;
  onSend?: (message: string) => void;
  providers: ProviderConfig[];
  selectedModel: SelectedModel | null;
  store: AgentStore;
}

const STATUS_LABELS: Record<string, string> = {
  thinking: 'Thinking...',
  writing: 'Writing...',
  running: 'Processing...',
};

export function ChatPanel({
  onAbort,
  onRetry,
  onSend,
  providers,
  onProvidersChange,
  selectedModel,
  onSelectModel,
  store,
}: ChatPanelProps) {
  const { bubbles, status } = store.getState();
  store.subscribe(() => {});

  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSend = useCallback(
    (message: string) => {
      store.dispatch({ type: 'add_bubble', bubble: { type: 'user', content: message } });
      onSend?.(message);
    },
    [onSend, store],
  );

  const isRunning = status !== 'idle' && status !== 'done';
  const hasModel = selectedModel !== null;

  // Build status label for composer
  let statusLabel: string | undefined;
  if (isRunning) {
    if (status === 'calling_tool') {
      statusLabel = 'Calling tool...';
    } else {
      statusLabel = STATUS_LABELS[status] || 'Processing...';
    }
  }

  return (
    <div className={css.chatPanel}>
      <ChatMessageList bubbles={bubbles} onRetry={onRetry} />
      <ChatInput
        disabled={!hasModel}
        isRunning={isRunning}
        modelSelector={
          <ModelSelector
            providers={providers}
            selectedModel={selectedModel}
            onOpenSettings={() => setSettingsOpen(true)}
            onSelectModel={onSelectModel}
          />
        }
        onAbort={onAbort}
        onSend={handleSend}
        statusLabel={statusLabel}
      />
      <SettingsModal
        open={settingsOpen}
        providers={providers}
        onOpenChange={setSettingsOpen}
        onProvidersChange={onProvidersChange}
      />
    </div>
  );
}
```

Key changes:

- Removed `composerDock` div wrapper — `ChatInput` now renders its own `composerContainer`.
- Removed `StatusBar` import and usage.
- Added `statusLabel` computation from `status` field, passed to `ChatInput`.

- [ ] **Step 2: Verify**

Run: `npx eslint packages/rich-agent-chat/src/ChatPanel.tsx`

- [ ] **Step 3: Commit**

```bash
git add packages/rich-agent-chat/src/ChatPanel.tsx
git commit -m "refactor(agent-chat): chatpanel wires status label to floating composer"
```

---

### Task 11: Update `index.ts` exports — Remove StatusBar export

**Files:**

- Modify: `packages/rich-agent-chat/src/index.ts`

StatusBar is no longer a standalone component. Remove its export.

- [ ] **Step 1: Update `index.ts`**

Change:

```typescript
export { ChatPanel } from './ChatPanel';
export { StatusBar } from './components/StatusBar';
export { AgentStoreProvider, useAgentStore } from './context';
export type { ChatBubble, ProviderConfig, SelectedModel } from './types';
```

To:

```typescript
export { ChatPanel } from './ChatPanel';
export { AgentStoreProvider, useAgentStore } from './context';
export type { ChatBubble, ProviderConfig, SelectedModel } from './types';
```

- [ ] **Step 2: Check for external consumers of `StatusBar`**

Run: `grep -r "StatusBar" packages/ --include="*.ts" --include="*.tsx" -l` (via Grep tool)

If any file outside `rich-agent-chat` imports `StatusBar`, keep the export or update the consumer. If none, safe to remove.

- [ ] **Step 3: Delete `StatusBar.tsx`** (optional — can keep the file as dead code for now, or delete)

The file `packages/rich-agent-chat/src/components/StatusBar.tsx` is no longer used. Delete it.

- [ ] **Step 4: Verify**

Run: `npx eslint packages/rich-agent-chat/src/index.ts`

- [ ] **Step 5: Commit**

```bash
git add packages/rich-agent-chat/src/index.ts
git rm packages/rich-agent-chat/src/components/StatusBar.tsx
git commit -m "refactor(agent-chat): remove standalone StatusBar export and file"
```

---

### Task 12: Verify full build and lint

**Files:**

- None (verification only)

- [ ] **Step 1: Lint all changed files**

```bash
npx eslint packages/rich-agent-chat/src/ChatPanel.tsx packages/rich-agent-chat/src/ChatInput.tsx packages/rich-agent-chat/src/ChatMessageList.tsx packages/rich-agent-chat/src/styles.css.ts packages/rich-agent-chat/src/components/ModelSelector.tsx packages/rich-agent-chat/src/components/model-selector.css.ts packages/rich-agent-chat/src/components/ErrorBubble.tsx packages/rich-agent-chat/src/components/ThinkingBlock.tsx packages/rich-agent-chat/src/components/ToolCallBubble.tsx packages/rich-agent-chat/src/components/StreamdownBubble.tsx packages/rich-agent-chat/src/index.ts
```

Expected: No errors.

- [ ] **Step 2: Build the package**

```bash
pnpm --filter @haklex/rich-agent-chat build
```

Expected: Build succeeds.

- [ ] **Step 3: Check demo still compiles**

```bash
pnpm --filter @haklex/rich-editor-demo build
```

Expected: Build succeeds. If it fails due to removed `StatusBar` import, update the demo consumer.

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix(agent-chat): resolve build issues from chatpanel redesign"
```
