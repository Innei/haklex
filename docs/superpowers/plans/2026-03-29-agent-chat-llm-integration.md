# Agent Chat: Real LLM Integration & Chat UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate real Claude/OpenAI LLMs into the demo agent chat with production-grade chat UI components (streaming markdown, tool calls, thinking blocks, user intervention, error recovery).

**Architecture:** Vite proxy middleware forwards `/api/chat` to Claude/OpenAI APIs. New UI primitives in `@haklex/rich-editor-ui` (Collapsible, Spinner, Badge, Select, AutoResizeTextArea, StatusDot, CodeBlock, ScrollArea, Alert). Chat components in `@haklex/rich-agent-chat` consume these primitives. Streamdown (core only, no Tailwind) renders streaming markdown with Vanilla Extract styling.

**Tech Stack:** Vite 7, React 19, @base-ui/react 1.2, Vanilla Extract, Streamdown, Shiki, @haklex/rich-style-token

---

## File Map

### New files — `@haklex/rich-editor-ui`

| File | Responsibility |
|------|---------------|
| `src/components/collapsible/index.tsx` | Collapsible, CollapsibleTrigger, CollapsiblePanel wrapping @base-ui |
| `src/components/collapsible/styles.css.ts` | Animated height transition, trigger chevron |
| `src/components/spinner/index.tsx` | Spinner component (sm/md) |
| `src/components/spinner/styles.css.ts` | Rotation keyframes, size recipe |
| `src/components/badge/index.tsx` | Badge with status variants |
| `src/components/badge/styles.css.ts` | Pill shape recipe (neutral/success/error/warning/info) |
| `src/components/select/index.tsx` | Select, SelectTrigger, SelectValue, SelectContent, SelectItem, etc. |
| `src/components/select/styles.css.ts` | Consistent with DropdownMenu appearance |
| `src/components/auto-resize-textarea/index.tsx` | AutoResizeTextArea with maxRows |
| `src/components/auto-resize-textarea/styles.css.ts` | TextArea + focus ring styles |
| `src/components/status-dot/index.tsx` | StatusDot with pulse animation |
| `src/components/status-dot/styles.css.ts` | Color mapping recipe + pulse keyframes |
| `src/components/code-block/index.tsx` | CodeBlock with Shiki + copy button |
| `src/components/code-block/styles.css.ts` | Code block layout, header bar |
| `src/components/scroll-area/index.tsx` | ScrollArea with auto-scroll-to-bottom |
| `src/components/scroll-area/styles.css.ts` | Custom scrollbar styles |
| `src/components/alert/index.tsx` | Alert with info/warning/error + action slot |
| `src/components/alert/styles.css.ts` | Left border, tinted bg recipe |

### Modified files — `@haklex/rich-editor-ui`

| File | Change |
|------|--------|
| `src/components/action-button/index.tsx` | Add `rounded` prop |
| `src/components/action-button/styles.css.ts` | Add `rounded` variant to recipe |
| `src/index.ts` | Export all new components |
| `package.json` | Add `shiki` to peerDependencies |

### Modified files — `@haklex/rich-agent-core`

| File | Change |
|------|--------|
| `src/protocol.ts` | Add `thinking` chunk type to `LLMChunk` |
| `src/store.ts` | Add `thinking` bubble type, expand `status` union |
| `src/agent-executor.ts` | Handle thinking chunks, dispatch thinking bubbles |
| `src/index.ts` | Export new types |

### New files — `@haklex/rich-agent-chat`

| File | Responsibility |
|------|---------------|
| `src/components/StreamdownBubble.tsx` | Streamdown markdown rendering with VE components |
| `src/components/ThinkingBlock.tsx` | Inline faded thinking text |
| `src/components/ToolCallBubble.tsx` | Compact tool call + expandable details |
| `src/components/StatusBar.tsx` | Agent execution status indicator |
| `src/components/ModelSelector.tsx` | Provider + model selection |
| `src/components/ErrorBubble.tsx` | Error display + retry button |

### Modified files — `@haklex/rich-agent-chat`

| File | Change |
|------|--------|
| `src/ChatInput.tsx` | Use AutoResizeTextArea, Send/Stop toggle |
| `src/ChatMessageList.tsx` | Use ScrollArea, render new bubble types |
| `src/ChatPanel.tsx` | Add ModelSelector, StatusBar, onRetry |
| `src/styles.css.ts` | Add styles for new bubble types |
| `src/index.ts` | Export new components |
| `package.json` | Add streamdown, @streamdown/code, @haklex/rich-editor-ui deps |

### New files — demo

| File | Responsibility |
|------|---------------|
| `demo/server/proxy.ts` | Vite proxy middleware for Claude/OpenAI |
| `demo/src/providers/claude-provider.ts` | Claude SSE → LLMChunk adapter |
| `demo/src/providers/openai-provider.ts` | OpenAI SSE → LLMChunk adapter |

### Modified files — demo

| File | Change |
|------|--------|
| `demo/vite.config.ts` | Add proxy plugin |
| `demo/src/pages/AgentPage.tsx` | Replace mock with real providers, add ModelSelector |
| `demo/package.json` | Add shiki dependency |

---

## Task 1: Spinner Component

**Files:**
- Create: `packages/rich-editor-ui/src/components/spinner/styles.css.ts`
- Create: `packages/rich-editor-ui/src/components/spinner/index.tsx`

- [ ] **Step 1: Create spinner styles**

```typescript
// packages/rich-editor-ui/src/components/spinner/styles.css.ts
import { keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

const spin = keyframes({
  to: { transform: 'rotate(360deg)' },
});

export const spinner = recipe({
  base: {
    display: 'inline-block',
    borderRadius: '50%',
    border: '2px solid currentColor',
    borderTopColor: 'transparent',
    animation: `${spin} 0.6s linear infinite`,
    flexShrink: 0,
  },
  variants: {
    size: {
      sm: { width: '14px', height: '14px' },
      md: { width: '20px', height: '20px' },
    },
  },
  defaultVariants: { size: 'sm' },
});
```

- [ ] **Step 2: Create spinner component**

```tsx
// packages/rich-editor-ui/src/components/spinner/index.tsx
import type { ReactElement } from 'react';

import { spinner } from './styles.css';

export interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function Spinner({ size, className }: SpinnerProps): ReactElement {
  return (
    <span
      aria-hidden="true"
      className={`${spinner({ size })}${className ? ` ${className}` : ''}`}
      role="status"
    />
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/rich-editor-ui/src/components/spinner/
git commit -m "feat(rich-editor-ui): add Spinner component"
```

---

## Task 2: StatusDot Component

**Files:**
- Create: `packages/rich-editor-ui/src/components/status-dot/styles.css.ts`
- Create: `packages/rich-editor-ui/src/components/status-dot/index.tsx`

- [ ] **Step 1: Create status-dot styles**

```typescript
// packages/rich-editor-ui/src/components/status-dot/styles.css.ts
import { keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

const pulse = keyframes({
  '0%': { transform: 'scale(1)', opacity: 1 },
  '50%': { transform: 'scale(1.8)', opacity: 0 },
  '100%': { transform: 'scale(1.8)', opacity: 0 },
});

export const statusDotWrapper = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

export const dot = recipe({
  base: {
    borderRadius: '50%',
    flexShrink: 0,
  },
  variants: {
    status: {
      idle: { backgroundColor: '#a3a3a3' },
      active: { backgroundColor: '#3b82f6' },
      success: { backgroundColor: '#22c55e' },
      error: { backgroundColor: '#ef4444' },
      warning: { backgroundColor: '#f59e0b' },
    },
    size: {
      sm: { width: '8px', height: '8px' },
      md: { width: '12px', height: '12px' },
    },
  },
  defaultVariants: { status: 'idle', size: 'sm' },
});

export const pulseRing = recipe({
  base: {
    position: 'absolute',
    borderRadius: '50%',
    animation: `${pulse} 1.5s ease-in-out infinite`,
  },
  variants: {
    status: {
      idle: { backgroundColor: '#a3a3a3' },
      active: { backgroundColor: '#3b82f6' },
      success: { backgroundColor: '#22c55e' },
      error: { backgroundColor: '#ef4444' },
      warning: { backgroundColor: '#f59e0b' },
    },
    size: {
      sm: { width: '8px', height: '8px' },
      md: { width: '12px', height: '12px' },
    },
  },
  defaultVariants: { status: 'idle', size: 'sm' },
});
```

- [ ] **Step 2: Create status-dot component**

```tsx
// packages/rich-editor-ui/src/components/status-dot/index.tsx
import type { ReactElement } from 'react';

import { dot, pulseRing, statusDotWrapper } from './styles.css';

export interface StatusDotProps {
  className?: string;
  pulse?: boolean;
  size?: 'sm' | 'md';
  status: 'idle' | 'active' | 'success' | 'error' | 'warning';
}

export function StatusDot({ status, pulse: showPulse, size, className }: StatusDotProps): ReactElement {
  return (
    <span className={`${statusDotWrapper}${className ? ` ${className}` : ''}`}>
      {showPulse && <span className={pulseRing({ status, size })} />}
      <span className={dot({ status, size })} />
    </span>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/rich-editor-ui/src/components/status-dot/
git commit -m "feat(rich-editor-ui): add StatusDot component"
```

---

## Task 3: Badge Component

**Files:**
- Create: `packages/rich-editor-ui/src/components/badge/styles.css.ts`
- Create: `packages/rich-editor-ui/src/components/badge/index.tsx`

- [ ] **Step 1: Create badge styles**

```typescript
// packages/rich-editor-ui/src/components/badge/styles.css.ts
import { vars } from '@haklex/rich-style-token/styles';
import { recipe } from '@vanilla-extract/recipes';

export const badge = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '9999px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    lineHeight: 1,
  },
  variants: {
    variant: {
      neutral: {
        backgroundColor: vars.color.fillTertiary,
        color: vars.color.textTertiary,
      },
      success: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        color: '#16a34a',
      },
      error: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        color: '#dc2626',
      },
      warning: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        color: '#d97706',
      },
      info: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        color: '#2563eb',
      },
    },
    size: {
      sm: { fontSize: '11px', padding: '2px 6px', gap: '3px' },
      md: { fontSize: '12px', padding: '3px 8px', gap: '4px' },
    },
  },
  defaultVariants: { variant: 'neutral', size: 'sm' },
});
```

- [ ] **Step 2: Create badge component**

```tsx
// packages/rich-editor-ui/src/components/badge/index.tsx
import type { ReactElement, ReactNode } from 'react';

import { badge } from './styles.css';

export interface BadgeProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md';
  variant?: 'neutral' | 'success' | 'error' | 'warning' | 'info';
}

export function Badge({ variant, size, children, className }: BadgeProps): ReactElement {
  return (
    <span className={`${badge({ variant, size })}${className ? ` ${className}` : ''}`}>
      {children}
    </span>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/rich-editor-ui/src/components/badge/
git commit -m "feat(rich-editor-ui): add Badge component"
```

---

## Task 4: Collapsible Component

**Files:**
- Create: `packages/rich-editor-ui/src/components/collapsible/styles.css.ts`
- Create: `packages/rich-editor-ui/src/components/collapsible/index.tsx`

- [ ] **Step 1: Create collapsible styles**

```typescript
// packages/rich-editor-ui/src/components/collapsible/styles.css.ts
import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const trigger = style({
  'display': 'flex',
  'alignItems': 'center',
  'gap': '6px',
  'cursor': 'pointer',
  'border': 'none',
  'background': 'none',
  'padding': 0,
  'color': vars.color.textTertiary,
  'fontSize': 'inherit',
  'fontFamily': 'inherit',
  'width': '100%',
  'textAlign': 'left',
  ':hover': {
    color: vars.color.textSecondary,
  },
});

export const chevron = style({
  'transition': 'transform 0.2s ease',
  'width': '14px',
  'height': '14px',
  'flexShrink': 0,
  'selectors': {
    '[data-panel-open] &': {
      transform: 'rotate(90deg)',
    },
  },
});

export const panel = style({
  overflow: 'hidden',
});
```

- [ ] **Step 2: Create collapsible component**

```tsx
// packages/rich-editor-ui/src/components/collapsible/index.tsx
import * as CollapsiblePrimitive from '@base-ui/react/collapsible';
import { ChevronRight } from 'lucide-react';
import type { ComponentProps, ReactElement, ReactNode } from 'react';

import { chevron, panel, trigger } from './styles.css';

export type CollapsibleProps = ComponentProps<typeof CollapsiblePrimitive.Root>;
export function Collapsible(props: CollapsibleProps): ReactElement {
  return <CollapsiblePrimitive.Root {...props} />;
}

export type CollapsibleTriggerProps = Omit<ComponentProps<typeof CollapsiblePrimitive.Trigger>, 'render'> & {
  children?: ReactNode;
  className?: string;
  hideChevron?: boolean;
};
export function CollapsibleTrigger({
  children,
  className,
  hideChevron,
  ...props
}: CollapsibleTriggerProps): ReactElement {
  return (
    <CollapsiblePrimitive.Trigger
      {...props}
      className={`${trigger}${className ? ` ${className}` : ''}`}
    >
      {!hideChevron && <ChevronRight className={chevron} />}
      {children}
    </CollapsiblePrimitive.Trigger>
  );
}

export type CollapsiblePanelProps = Omit<ComponentProps<typeof CollapsiblePrimitive.Panel>, 'render'> & {
  children?: ReactNode;
  className?: string;
};
export function CollapsiblePanel({
  children,
  className,
  ...props
}: CollapsiblePanelProps): ReactElement {
  return (
    <CollapsiblePrimitive.Panel
      {...props}
      className={`${panel}${className ? ` ${className}` : ''}`}
    >
      {children}
    </CollapsiblePrimitive.Panel>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/rich-editor-ui/src/components/collapsible/
git commit -m "feat(rich-editor-ui): add Collapsible component"
```

---

## Task 5: AutoResizeTextArea Component

**Files:**
- Create: `packages/rich-editor-ui/src/components/auto-resize-textarea/styles.css.ts`
- Create: `packages/rich-editor-ui/src/components/auto-resize-textarea/index.tsx`

- [ ] **Step 1: Create textarea styles**

```typescript
// packages/rich-editor-ui/src/components/auto-resize-textarea/styles.css.ts
import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const textarea = style({
  'width': '100%',
  'resize': 'none',
  'overflow': 'hidden',
  'border': `1px solid ${vars.color.border}`,
  'borderRadius': vars.borderRadius.md,
  'padding': '8px 12px',
  'fontSize': '14px',
  'lineHeight': '1.5',
  'outline': 'none',
  'background': vars.color.bg,
  'color': vars.color.text,
  'fontFamily': 'inherit',
  ':focus': {
    borderColor: vars.color.textQuaternary,
  },
  '::placeholder': {
    color: vars.color.textQuaternary,
  },
});

export const overflowing = style({
  overflowY: 'auto',
});
```

- [ ] **Step 2: Create textarea component**

```tsx
// packages/rich-editor-ui/src/components/auto-resize-textarea/index.tsx
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type TextareaHTMLAttributes,
} from 'react';

import { overflowing, textarea } from './styles.css';

export interface AutoResizeTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxRows?: number;
  minRows?: number;
}

export const AutoResizeTextArea = forwardRef<HTMLTextAreaElement, AutoResizeTextAreaProps>(
  function AutoResizeTextArea({ maxRows = 6, minRows = 1, className, onInput, ...props }, ref) {
    const innerRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => innerRef.current!);

    const resize = useCallback(() => {
      const el = innerRef.current;
      if (!el) return;

      el.style.height = 'auto';
      const lineHeight = Number.parseFloat(getComputedStyle(el).lineHeight) || 21;
      const maxHeight = lineHeight * maxRows + 16; // 16 = vertical padding
      const scrollHeight = el.scrollHeight;

      if (scrollHeight > maxHeight) {
        el.style.height = `${maxHeight}px`;
        el.classList.add(overflowing);
      } else {
        el.style.height = `${scrollHeight}px`;
        el.classList.remove(overflowing);
      }
    }, [maxRows]);

    useEffect(() => {
      resize();
    }, [resize, props.value]);

    return (
      <textarea
        ref={innerRef}
        className={`${textarea}${className ? ` ${className}` : ''}`}
        rows={minRows}
        onInput={(e) => {
          resize();
          onInput?.(e);
        }}
        {...props}
      />
    );
  },
);
```

- [ ] **Step 3: Commit**

```bash
git add packages/rich-editor-ui/src/components/auto-resize-textarea/
git commit -m "feat(rich-editor-ui): add AutoResizeTextArea component"
```

---

## Task 6: Select Component

**Files:**
- Create: `packages/rich-editor-ui/src/components/select/styles.css.ts`
- Create: `packages/rich-editor-ui/src/components/select/index.tsx`

- [ ] **Step 1: Create select styles**

Reference the existing dropdown-menu styles pattern. Use the shared `popupBase`, `itemBase` from menu.css if available, or replicate the visual appearance.

```typescript
// packages/rich-editor-ui/src/components/select/styles.css.ts
import { vars } from '@haklex/rich-style-token/styles';
import { globalStyle, style } from '@vanilla-extract/css';

export const triggerButton = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'gap': '4px',
  'padding': '4px 8px',
  'fontSize': '13px',
  'border': `1px solid ${vars.color.border}`,
  'borderRadius': vars.borderRadius.sm,
  'background': vars.color.bg,
  'color': vars.color.text,
  'cursor': 'pointer',
  'outline': 'none',
  'whiteSpace': 'nowrap',
  ':hover': {
    background: vars.color.fillTertiary,
  },
  ':focus-visible': {
    borderColor: vars.color.accent,
  },
});

export const triggerIcon = style({
  width: '14px',
  height: '14px',
  color: vars.color.textTertiary,
  flexShrink: 0,
});

export const positioner = style({
  outline: 'none',
  zIndex: 50,
});

export const popup = style({
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.borderRadius.md,
  boxShadow: vars.boxShadow.menu,
  padding: '4px',
  minWidth: '120px',
  maxWidth: 'min(20rem, calc(100vw - 0.75rem))',
  maxHeight: '240px',
  overflowY: 'auto',
  outline: 'none',
});

export const item = style({
  'display': 'flex',
  'alignItems': 'center',
  'gap': '8px',
  'padding': '6px 8px',
  'borderRadius': vars.borderRadius.sm,
  'fontSize': '13px',
  'cursor': 'pointer',
  'outline': 'none',
  'color': vars.color.text,
  'selectors': {
    '&[data-highlighted]': {
      background: vars.color.fillTertiary,
    },
    '&[data-disabled]': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
});

export const itemIndicator = style({
  width: '14px',
  height: '14px',
  flexShrink: 0,
});

export const groupLabel = style({
  padding: '6px 8px 4px',
  fontSize: '11px',
  fontWeight: 600,
  color: vars.color.textTertiary,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});

export const separator = style({
  height: '1px',
  background: vars.color.border,
  margin: '4px 0',
});
```

- [ ] **Step 2: Create select component**

```tsx
// packages/rich-editor-ui/src/components/select/index.tsx
import * as SelectPrimitive from '@base-ui/react/select';
import { Check, ChevronDown } from 'lucide-react';
import type { ComponentProps, ReactElement, ReactNode } from 'react';

import { PortalThemeWrapper } from '../../index';
import {
  groupLabel,
  item,
  itemIndicator,
  popup,
  positioner,
  separator,
  triggerButton,
  triggerIcon,
} from './styles.css';

export type SelectProps = ComponentProps<typeof SelectPrimitive.Root>;
export function Select(props: SelectProps): ReactElement {
  return <SelectPrimitive.Root {...props} />;
}

export type SelectTriggerProps = Omit<ComponentProps<typeof SelectPrimitive.Trigger>, 'render'> & {
  children?: ReactNode;
  className?: string;
};
export function SelectTrigger({ children, className, ...props }: SelectTriggerProps): ReactElement {
  return (
    <SelectPrimitive.Trigger
      {...props}
      className={`${triggerButton}${className ? ` ${className}` : ''}`}
    >
      {children}
      <SelectPrimitive.Icon className={triggerIcon}>
        <ChevronDown />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export type SelectValueProps = ComponentProps<typeof SelectPrimitive.Value>;
export function SelectValue(props: SelectValueProps): ReactElement {
  return <SelectPrimitive.Value {...props} />;
}

export type SelectContentProps = Omit<ComponentProps<typeof SelectPrimitive.Popup>, 'render'> & {
  align?: ComponentProps<typeof SelectPrimitive.Positioner>['align'];
  children?: ReactNode;
  className?: string;
  side?: ComponentProps<typeof SelectPrimitive.Positioner>['side'];
  sideOffset?: ComponentProps<typeof SelectPrimitive.Positioner>['sideOffset'];
};
export function SelectContent({
  children,
  className,
  align,
  side,
  sideOffset = 4,
  ...props
}: SelectContentProps): ReactElement {
  return (
    <SelectPrimitive.Portal>
      <PortalThemeWrapper>
        <SelectPrimitive.Positioner align={align} side={side} sideOffset={sideOffset}>
          <SelectPrimitive.Popup
            {...props}
            className={`${popup}${className ? ` ${className}` : ''}`}
          >
            {children}
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </PortalThemeWrapper>
    </SelectPrimitive.Portal>
  );
}

export type SelectItemProps = ComponentProps<typeof SelectPrimitive.Item> & {
  className?: string;
};
export function SelectItem({ className, children, ...props }: SelectItemProps): ReactElement {
  return (
    <SelectPrimitive.Item {...props} className={`${item}${className ? ` ${className}` : ''}`}>
      <SelectPrimitive.ItemIndicator className={itemIndicator}>
        <Check />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export type SelectGroupProps = ComponentProps<typeof SelectPrimitive.Group>;
export function SelectGroup(props: SelectGroupProps): ReactElement {
  return <SelectPrimitive.Group {...props} />;
}

export type SelectGroupLabelProps = ComponentProps<typeof SelectPrimitive.GroupLabel> & {
  className?: string;
};
export function SelectGroupLabel({ className, ...props }: SelectGroupLabelProps): ReactElement {
  return (
    <SelectPrimitive.GroupLabel
      {...props}
      className={`${groupLabel}${className ? ` ${className}` : ''}`}
    />
  );
}

export type SelectSeparatorProps = { className?: string };
export function SelectSeparator({ className }: SelectSeparatorProps): ReactElement {
  return <div className={`${separator}${className ? ` ${className}` : ''}`} />;
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/rich-editor-ui/src/components/select/
git commit -m "feat(rich-editor-ui): add Select component"
```

---

## Task 7: ScrollArea Component

**Files:**
- Create: `packages/rich-editor-ui/src/components/scroll-area/styles.css.ts`
- Create: `packages/rich-editor-ui/src/components/scroll-area/index.tsx`

- [ ] **Step 1: Create scroll-area styles**

```typescript
// packages/rich-editor-ui/src/components/scroll-area/styles.css.ts
import { style } from '@vanilla-extract/css';

export const scrollArea = style({
  'overflow': 'auto',
  'scrollbarWidth': 'thin',
  'scrollbarColor': 'rgba(0,0,0,0.15) transparent',
  '::-webkit-scrollbar': {
    width: '6px',
  },
  '::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '::-webkit-scrollbar-thumb': {
    background: 'rgba(0,0,0,0.15)',
    borderRadius: '3px',
  },
});
```

- [ ] **Step 2: Create scroll-area component**

```tsx
// packages/rich-editor-ui/src/components/scroll-area/index.tsx
import type { ReactElement, ReactNode, RefObject } from 'react';
import { useCallback, useEffect, useRef } from 'react';

import { scrollArea } from './styles.css';

export interface ScrollAreaProps {
  autoScrollToBottom?: boolean;
  children: ReactNode;
  className?: string;
  scrollRef?: RefObject<HTMLDivElement | null>;
}

export function ScrollArea({
  children,
  className,
  autoScrollToBottom = false,
  scrollRef,
}: ScrollAreaProps): ReactElement {
  const innerRef = useRef<HTMLDivElement>(null);
  const ref = scrollRef ?? innerRef;
  const isAtBottomRef = useRef(true);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const threshold = 40;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, [ref]);

  useEffect(() => {
    if (!autoScrollToBottom) return;
    const el = ref.current;
    if (!el || !isAtBottomRef.current) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  });

  return (
    <div
      ref={ref}
      className={`${scrollArea}${className ? ` ${className}` : ''}`}
      onScroll={autoScrollToBottom ? handleScroll : undefined}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/rich-editor-ui/src/components/scroll-area/
git commit -m "feat(rich-editor-ui): add ScrollArea component"
```

---

## Task 8: Alert Component

**Files:**
- Create: `packages/rich-editor-ui/src/components/alert/styles.css.ts`
- Create: `packages/rich-editor-ui/src/components/alert/index.tsx`

- [ ] **Step 1: Create alert styles**

```typescript
// packages/rich-editor-ui/src/components/alert/styles.css.ts
import { recipe } from '@vanilla-extract/recipes';
import { style } from '@vanilla-extract/css';

export const alert = recipe({
  base: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    lineHeight: '1.5',
    borderLeft: '3px solid',
  },
  variants: {
    variant: {
      info: {
        backgroundColor: 'rgba(59, 130, 246, 0.06)',
        borderLeftColor: '#3b82f6',
        color: '#1e40af',
      },
      warning: {
        backgroundColor: 'rgba(245, 158, 11, 0.06)',
        borderLeftColor: '#f59e0b',
        color: '#92400e',
      },
      error: {
        backgroundColor: 'rgba(239, 68, 68, 0.06)',
        borderLeftColor: '#ef4444',
        color: '#991b1b',
      },
    },
  },
  defaultVariants: { variant: 'info' },
});

export const alertContent = style({
  flex: 1,
  minWidth: 0,
});

export const alertIcon = style({
  width: '16px',
  height: '16px',
  flexShrink: 0,
  marginTop: '2px',
});

export const alertAction = style({
  flexShrink: 0,
  marginLeft: 'auto',
});
```

- [ ] **Step 2: Create alert component**

```tsx
// packages/rich-editor-ui/src/components/alert/index.tsx
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';

import { alert, alertAction, alertContent, alertIcon } from './styles.css';

export interface AlertProps {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  variant: 'info' | 'warning' | 'error';
}

const icons = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
} as const;

export function Alert({ variant, children, action, className }: AlertProps): ReactElement {
  const Icon = icons[variant];
  return (
    <div className={`${alert({ variant })}${className ? ` ${className}` : ''}`} role="alert">
      <Icon className={alertIcon} />
      <div className={alertContent}>{children}</div>
      {action && <div className={alertAction}>{action}</div>}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/rich-editor-ui/src/components/alert/
git commit -m "feat(rich-editor-ui): add Alert component"
```

---

## Task 9: CodeBlock Component

**Files:**
- Create: `packages/rich-editor-ui/src/components/code-block/styles.css.ts`
- Create: `packages/rich-editor-ui/src/components/code-block/index.tsx`
- Modify: `packages/rich-editor-ui/package.json`

- [ ] **Step 1: Add shiki to peerDependencies**

In `packages/rich-editor-ui/package.json`, add to `peerDependencies`:

```json
"shiki": "^3.0.0"
```

And to `peerDependenciesMeta`:

```json
"shiki": { "optional": true }
```

- [ ] **Step 2: Create code-block styles**

```typescript
// packages/rich-editor-ui/src/components/code-block/styles.css.ts
import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const codeBlockWrapper = style({
  borderRadius: vars.borderRadius.md,
  border: `1px solid ${vars.color.border}`,
  overflow: 'hidden',
  fontSize: '13px',
});

export const codeHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '4px 12px',
  background: vars.color.fillQuaternary,
  borderBottom: `1px solid ${vars.color.border}`,
  fontSize: '11px',
  color: vars.color.textTertiary,
});

export const languageLabel = style({
  textTransform: 'uppercase',
  fontWeight: 500,
  letterSpacing: '0.05em',
});

export const copyButton = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'gap': '4px',
  'border': 'none',
  'background': 'none',
  'cursor': 'pointer',
  'color': vars.color.textTertiary,
  'fontSize': '11px',
  'padding': '2px 4px',
  'borderRadius': vars.borderRadius.sm,
  ':hover': {
    color: vars.color.text,
    background: vars.color.fillTertiary,
  },
});

export const codeContent = style({
  padding: '12px',
  overflowX: 'auto',
  background: vars.color.codeBg,
  fontFamily: vars.typography.fontMono,
  lineHeight: '1.6',
});

export const codePre = style({
  margin: 0,
  padding: 0,
  background: 'transparent',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
});
```

- [ ] **Step 3: Create code-block component**

```tsx
// packages/rich-editor-ui/src/components/code-block/index.tsx
import { Check, Copy } from 'lucide-react';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  codeBlockWrapper,
  codeContent,
  codeHeader,
  codePre,
  copyButton,
  languageLabel,
} from './styles.css';

export interface CodeBlockProps {
  className?: string;
  code: string;
  language?: string;
  showCopyButton?: boolean;
  showLineNumbers?: boolean;
}

let shikiHighlighter: any = null;
let shikiLoading: Promise<any> | null = null;

async function getHighlighter() {
  if (shikiHighlighter) return shikiHighlighter;
  if (shikiLoading) return shikiLoading;
  shikiLoading = import('shiki').then(async ({ createHighlighter }) => {
    shikiHighlighter = await createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: [],
    });
    return shikiHighlighter;
  });
  return shikiLoading;
}

export function CodeBlock({
  code,
  language,
  showCopyButton = true,
  className,
}: CodeBlockProps): ReactElement {
  const [html, setHtml] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!language) return;
    let cancelled = false;
    getHighlighter().then(async (highlighter) => {
      if (cancelled) return;
      const loadedLangs = highlighter.getLoadedLanguages();
      if (!loadedLangs.includes(language)) {
        try {
          await highlighter.loadLanguage(language);
        } catch {
          return;
        }
      }
      if (cancelled) return;
      const result = highlighter.codeToHtml(code, {
        lang: language,
        themes: { light: 'github-light', dark: 'github-dark' },
      });
      setHtml(result);
    });
    return () => { cancelled = true; };
  }, [code, language]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className={`${codeBlockWrapper}${className ? ` ${className}` : ''}`}>
      {(language || showCopyButton) && (
        <div className={codeHeader}>
          <span className={languageLabel}>{language || ''}</span>
          {showCopyButton && (
            <button className={copyButton} onClick={handleCopy} type="button">
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      )}
      <div className={codeContent}>
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre className={codePre}>
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/rich-editor-ui/src/components/code-block/ packages/rich-editor-ui/package.json
git commit -m "feat(rich-editor-ui): add CodeBlock component with Shiki"
```

---

## Task 10: ActionButton `rounded` Variant + Export All New Components

**Files:**
- Modify: `packages/rich-editor-ui/src/components/action-button/styles.css.ts`
- Modify: `packages/rich-editor-ui/src/components/action-button/index.tsx`
- Modify: `packages/rich-editor-ui/src/index.ts`

- [ ] **Step 1: Add `rounded` variant to ActionButton recipe**

In `packages/rich-editor-ui/src/components/action-button/styles.css.ts`, add `rounded` to the recipe variants:

```typescript
// Add to variants object:
rounded: {
  true: {},
  false: {},
},
```

Add a compound variant:

```typescript
// Add to compoundVariants array:
{ variants: { rounded: true, icon: true }, style: { borderRadius: '50%' } },
```

Add to `defaultVariants`:

```typescript
rounded: false,
```

- [ ] **Step 2: Add `rounded` prop to ActionButton component**

In `packages/rich-editor-ui/src/components/action-button/index.tsx`, add `rounded?: boolean` to `ActionButtonProps` and pass it to the recipe call.

- [ ] **Step 3: Update index.ts with all new exports**

Append to `packages/rich-editor-ui/src/index.ts`:

```typescript
// Alert
export type { AlertProps } from './components/alert/index';
export { Alert } from './components/alert/index';

// AutoResizeTextArea
export type { AutoResizeTextAreaProps } from './components/auto-resize-textarea/index';
export { AutoResizeTextArea } from './components/auto-resize-textarea/index';

// Badge
export type { BadgeProps } from './components/badge/index';
export { Badge } from './components/badge/index';

// CodeBlock
export type { CodeBlockProps } from './components/code-block/index';
export { CodeBlock } from './components/code-block/index';

// Collapsible
export type { CollapsiblePanelProps, CollapsibleProps, CollapsibleTriggerProps } from './components/collapsible/index';
export { Collapsible, CollapsiblePanel, CollapsibleTrigger } from './components/collapsible/index';

// ScrollArea
export type { ScrollAreaProps } from './components/scroll-area/index';
export { ScrollArea } from './components/scroll-area/index';

// Select
export type {
  SelectContentProps,
  SelectGroupLabelProps,
  SelectGroupProps,
  SelectItemProps,
  SelectProps,
  SelectSeparatorProps,
  SelectTriggerProps,
  SelectValueProps,
} from './components/select/index';
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './components/select/index';

// Spinner
export type { SpinnerProps } from './components/spinner/index';
export { Spinner } from './components/spinner/index';

// StatusDot
export type { StatusDotProps } from './components/status-dot/index';
export { StatusDot } from './components/status-dot/index';
```

- [ ] **Step 4: Commit**

```bash
git add packages/rich-editor-ui/src/
git commit -m "feat(rich-editor-ui): add rounded variant to ActionButton, export all new components"
```

---

## Task 11: Protocol & Store Extensions in `rich-agent-core`

**Files:**
- Modify: `packages/rich-agent-core/src/protocol.ts`
- Modify: `packages/rich-agent-core/src/store.ts`

- [ ] **Step 1: Add `thinking` chunk type to LLMChunk**

In `packages/rich-agent-core/src/protocol.ts`, change `LLMChunk`:

```typescript
export type LLMChunk =
  | { type: 'text'; text: string }
  | { type: 'thinking'; text: string }
  | { type: 'tool_call'; id: string; name: string; arguments: string }
  | { type: 'done' };
```

- [ ] **Step 2: Add `thinking` bubble and expand status in store**

In `packages/rich-agent-core/src/store.ts`, add to `ChatBubble` union:

```typescript
| { type: 'thinking'; content: string }
```

Expand `AgentStoreState.status`:

```typescript
status: 'idle' | 'running' | 'thinking' | 'calling_tool' | 'writing' | 'done';
```

- [ ] **Step 3: Commit**

```bash
git add packages/rich-agent-core/src/protocol.ts packages/rich-agent-core/src/store.ts
git commit -m "feat(rich-agent-core): add thinking chunk/bubble type, expand status"
```

---

## Task 12: AgentExecutor — Handle Thinking Chunks

**Files:**
- Modify: `packages/rich-agent-core/src/agent-executor.ts`

- [ ] **Step 1: Update executor to handle thinking chunks**

In `packages/rich-agent-core/src/agent-executor.ts`, within the `run` function, before the streaming loop, add a `thinkingAccum` variable. In the `for await` loop, add a case for `chunk.type === 'thinking'`:

```typescript
// Add before the for-await loop, alongside textAccum:
let thinkingAccum = '';
let hasThinking = false;

// Add status dispatch before streaming:
store.dispatch({ type: 'set_status', status: 'thinking' });
```

In the `for await` loop, add after the `signal?.throwIfAborted()` line:

```typescript
if (chunk.type === 'thinking') {
  if (!hasThinking) {
    hasThinking = true;
    // Insert thinking bubble before the assistant bubble
    // Replace the assistant placeholder we already added
    store.dispatch({
      type: 'update_last_bubble',
      bubble: { type: 'thinking', content: chunk.text },
    });
    thinkingAccum = chunk.text;
  } else {
    thinkingAccum += chunk.text;
    store.dispatch({
      type: 'update_last_bubble',
      bubble: { type: 'thinking', content: thinkingAccum },
    });
  }
  continue;
}

if (chunk.type === 'text') {
  if (hasThinking && textAccum === '') {
    // First text after thinking — add new assistant bubble
    store.dispatch({
      type: 'add_bubble',
      bubble: { type: 'assistant', content: chunk.text, streaming: true },
    });
    store.dispatch({ type: 'set_status', status: 'writing' });
  } else if (textAccum === '') {
    // First text, no thinking — update the placeholder
    store.dispatch({ type: 'set_status', status: 'writing' });
    store.dispatch({
      type: 'update_last_bubble',
      bubble: { type: 'assistant', content: chunk.text, streaming: true },
    });
  } else {
    store.dispatch({
      type: 'update_last_bubble',
      bubble: { type: 'assistant', content: textAccum + chunk.text, streaming: true },
    });
  }
  textAccum += chunk.text;
  continue;
}
```

Also update tool call dispatch to set status:

```typescript
// Before executing tools:
store.dispatch({ type: 'set_status', status: 'calling_tool' });
```

- [ ] **Step 2: Commit**

```bash
git add packages/rich-agent-core/src/agent-executor.ts
git commit -m "feat(rich-agent-core): handle thinking chunks and granular status in executor"
```

---

## Task 13: Vite Proxy Middleware

**Files:**
- Create: `demo/server/proxy.ts`
- Modify: `demo/vite.config.ts`

- [ ] **Step 1: Create proxy middleware**

```typescript
// demo/server/proxy.ts
import type { Plugin } from 'vite';

export function apiProxyPlugin(): Plugin {
  return {
    name: 'api-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'POST' || req.url !== '/api/chat') {
          return next();
        }

        let body = '';
        for await (const chunk of req) {
          body += chunk;
        }

        let parsed: {
          provider: 'claude' | 'openai';
          model: string;
          messages: any[];
          tools?: any[];
          stream?: boolean;
        };
        try {
          parsed = JSON.parse(body);
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
          return;
        }

        const { provider, model, messages, tools } = parsed;

        try {
          if (provider === 'claude') {
            await proxyClaude(res, model, messages, tools);
          } else if (provider === 'openai') {
            await proxyOpenAI(res, model, messages, tools);
          } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Unknown provider: ${provider}` }));
          }
        } catch (err: any) {
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        }
      });
    },
  };
}

async function proxyClaude(
  res: any,
  model: string,
  messages: any[],
  tools?: any[],
) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }));
    return;
  }

  // Convert chat messages to Claude format
  const systemMsgs = messages.filter((m: any) => m.role === 'system');
  const nonSystemMsgs = messages.filter((m: any) => m.role !== 'system');

  const claudeMessages = nonSystemMsgs.map((m: any) => {
    if (m.role === 'user') return { role: 'user', content: m.content };
    if (m.role === 'assistant') return { role: 'assistant', content: m.content };
    if (m.role === 'assistant_tool_call') {
      return {
        role: 'assistant',
        content: m.toolCalls.map((tc: any) => ({
          type: 'tool_use',
          id: tc.id,
          name: tc.name,
          input: JSON.parse(tc.arguments),
        })),
      };
    }
    if (m.role === 'tool_result') {
      return {
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: m.toolCallId,
            content: m.content,
            is_error: m.isError,
          },
        ],
      };
    }
    return { role: m.role, content: m.content };
  });

  const claudeTools = tools?.map((t: any) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters,
  }));

  const claudeBody: any = {
    model,
    max_tokens: 4096,
    stream: true,
    messages: claudeMessages,
  };
  if (systemMsgs.length > 0) {
    claudeBody.system = systemMsgs.map((m: any) => ({ type: 'text', text: m.content }));
  }
  if (claudeTools?.length) {
    claudeBody.tools = claudeTools;
  }

  // Enable extended thinking for supported models
  if (model.includes('opus') || model.includes('sonnet')) {
    claudeBody.thinking = { type: 'enabled', budget_tokens: 2048 };
  }

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'interleaved-thinking-2025-05-14',
    },
    body: JSON.stringify(claudeBody),
  });

  if (!upstream.ok) {
    const errText = await upstream.text();
    res.writeHead(upstream.status, { 'Content-Type': 'application/json' });
    res.end(errText);
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const reader = upstream.body!.getReader();
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
  } finally {
    res.end();
  }
}

async function proxyOpenAI(
  res: any,
  model: string,
  messages: any[],
  tools?: any[],
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'OPENAI_API_KEY not set' }));
    return;
  }

  const openaiMessages = messages.map((m: any) => {
    if (m.role === 'system') return { role: 'system', content: m.content };
    if (m.role === 'user') return { role: 'user', content: m.content };
    if (m.role === 'assistant') return { role: 'assistant', content: m.content };
    if (m.role === 'assistant_tool_call') {
      return {
        role: 'assistant',
        content: null,
        tool_calls: m.toolCalls.map((tc: any) => ({
          id: tc.id,
          type: 'function',
          function: { name: tc.name, arguments: tc.arguments },
        })),
      };
    }
    if (m.role === 'tool_result') {
      return {
        role: 'tool',
        tool_call_id: m.toolCallId,
        content: m.content,
      };
    }
    return { role: m.role, content: m.content };
  });

  const openaiTools = tools?.map((t: any) => ({
    type: 'function' as const,
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }));

  const openaiBody: any = {
    model,
    stream: true,
    messages: openaiMessages,
  };
  if (openaiTools?.length) {
    openaiBody.tools = openaiTools;
  }

  const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(openaiBody),
  });

  if (!upstream.ok) {
    const errText = await upstream.text();
    res.writeHead(upstream.status, { 'Content-Type': 'application/json' });
    res.end(errText);
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const reader = upstream.body!.getReader();
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
  } finally {
    res.end();
  }
}
```

- [ ] **Step 2: Register proxy plugin in vite config**

In `demo/vite.config.ts`, add import and plugin:

```typescript
import { apiProxyPlugin } from './server/proxy';
```

Add `apiProxyPlugin()` to the plugins array (before `react()`).

Add `envDir` to the config so `.env` is loaded from `demo/`:

```typescript
envDir: '.',
envPrefix: ['ANTHROPIC_', 'OPENAI_', 'VITE_'],
```

- [ ] **Step 3: Create `.env.example` in demo/**

```bash
# demo/.env.example
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

- [ ] **Step 4: Commit**

```bash
git add demo/server/proxy.ts demo/vite.config.ts demo/.env.example
git commit -m "feat(demo): add Vite proxy middleware for Claude/OpenAI APIs"
```

---

## Task 14: Claude Provider

**Files:**
- Create: `demo/src/providers/claude-provider.ts`

- [ ] **Step 1: Create Claude provider**

```typescript
// demo/src/providers/claude-provider.ts
import type { ChatMessage, LLMChunk, LLMProvider, ToolSchema } from '@haklex/rich-agent-core';

export function createClaudeProvider(model: string): LLMProvider {
  return {
    async *chat(messages: ChatMessage[], tools?: ToolSchema[]): AsyncIterable<LLMChunk> {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'claude', model, messages, tools }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Claude API error (${res.status}): ${err}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop()!;

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (!data || data === '[DONE]') continue;

            let event: any;
            try {
              event = JSON.parse(data);
            } catch {
              continue;
            }

            yield* handleClaudeEvent(event);
          }
        }
      }

      // Process remaining buffer
      if (buffer.startsWith('data: ')) {
        const data = buffer.slice(6).trim();
        if (data && data !== '[DONE]') {
          try {
            const event = JSON.parse(data);
            yield* handleClaudeEvent(event);
          } catch {
            // ignore
          }
        }
      }

      yield { type: 'done' };
    },
  };
}

function* handleClaudeEvent(event: any): Generator<LLMChunk> {
  switch (event.type) {
    case 'content_block_delta': {
      if (event.delta?.type === 'text_delta') {
        yield { type: 'text', text: event.delta.text };
      } else if (event.delta?.type === 'thinking_delta') {
        yield { type: 'thinking', text: event.delta.thinking };
      } else if (event.delta?.type === 'input_json_delta') {
        // Tool call arguments arrive incrementally — we accumulate
        // but yield is handled at content_block_stop
      }
      break;
    }
    case 'content_block_start': {
      if (event.content_block?.type === 'tool_use') {
        // Store for later — will yield at stop
      }
      break;
    }
    case 'content_block_stop': {
      // For tool_use blocks, we need the accumulated data
      // This is handled by tracking state in the provider
      break;
    }
    case 'message_stop': {
      yield { type: 'done' };
      break;
    }
  }
}
```

Note: The Claude SSE event handling for tool calls requires accumulating `input_json_delta` across multiple events. Refactor the provider to track block state:

```typescript
// Replace the simple generator approach with stateful parsing inside chat():
// Track current content blocks to accumulate tool call arguments.
// This is shown in the full implementation — the key insight is:
// - content_block_start type=tool_use → store { id, name }
// - input_json_delta → accumulate arguments string
// - content_block_stop → yield { type: 'tool_call', id, name, arguments }
```

The full stateful implementation moves block tracking into the `chat()` async generator body rather than a separate `handleClaudeEvent` function. Track `currentBlock: { id, name, arguments } | null` and yield the complete tool_call on `content_block_stop`.

- [ ] **Step 2: Commit**

```bash
git add demo/src/providers/claude-provider.ts
git commit -m "feat(demo): add Claude LLM provider with SSE parsing"
```

---

## Task 15: OpenAI Provider

**Files:**
- Create: `demo/src/providers/openai-provider.ts`

- [ ] **Step 1: Create OpenAI provider**

```typescript
// demo/src/providers/openai-provider.ts
import type { ChatMessage, LLMChunk, LLMProvider, ToolSchema } from '@haklex/rich-agent-core';

export function createOpenAIProvider(model: string): LLMProvider {
  return {
    async *chat(messages: ChatMessage[], tools?: ToolSchema[]): AsyncIterable<LLMChunk> {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'openai', model, messages, tools }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`OpenAI API error (${res.status}): ${err}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Track tool call accumulation: { [index]: { id, name, arguments } }
      const pendingToolCalls = new Map<number, { id: string; name: string; arguments: string }>();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop()!;

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            // Flush any pending tool calls
            for (const tc of pendingToolCalls.values()) {
              yield { type: 'tool_call', id: tc.id, name: tc.name, arguments: tc.arguments };
            }
            pendingToolCalls.clear();
            yield { type: 'done' };
            return;
          }

          let parsed: any;
          try {
            parsed = JSON.parse(data);
          } catch {
            continue;
          }

          const delta = parsed.choices?.[0]?.delta;
          if (!delta) continue;

          if (delta.content) {
            yield { type: 'text', text: delta.content };
          }

          if (delta.tool_calls) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index ?? 0;
              if (!pendingToolCalls.has(idx)) {
                pendingToolCalls.set(idx, { id: tc.id || '', name: tc.function?.name || '', arguments: '' });
              }
              const pending = pendingToolCalls.get(idx)!;
              if (tc.id) pending.id = tc.id;
              if (tc.function?.name) pending.name = tc.function.name;
              if (tc.function?.arguments) pending.arguments += tc.function.arguments;
            }
          }

          const finishReason = parsed.choices?.[0]?.finish_reason;
          if (finishReason === 'tool_calls') {
            for (const tc of pendingToolCalls.values()) {
              yield { type: 'tool_call', id: tc.id, name: tc.name, arguments: tc.arguments };
            }
            pendingToolCalls.clear();
          }
        }
      }

      yield { type: 'done' };
    },
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add demo/src/providers/openai-provider.ts
git commit -m "feat(demo): add OpenAI LLM provider with SSE parsing"
```

---

## Task 16: Chat UI Components — ThinkingBlock, ToolCallBubble, ErrorBubble

**Files:**
- Create: `packages/rich-agent-chat/src/components/ThinkingBlock.tsx`
- Create: `packages/rich-agent-chat/src/components/ToolCallBubble.tsx`
- Create: `packages/rich-agent-chat/src/components/ErrorBubble.tsx`
- Modify: `packages/rich-agent-chat/src/styles.css.ts`
- Modify: `packages/rich-agent-chat/package.json`

- [ ] **Step 1: Add `@haklex/rich-editor-ui` dependency to rich-agent-chat**

In `packages/rich-agent-chat/package.json`, add to dependencies:

```json
"@haklex/rich-editor-ui": "workspace:*"
```

- [ ] **Step 2: Add new styles**

Append to `packages/rich-agent-chat/src/styles.css.ts`:

```typescript
export const thinkingBlock = style({
  color: '#a3a3a3',
  fontSize: '12px',
  fontStyle: 'italic',
  borderLeft: '2px solid #e5e5e5',
  paddingLeft: '8px',
  marginBottom: '4px',
  maxWidth: '80%',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
});

export const toolCallRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  color: vars.color.textTertiary,
  cursor: 'pointer',
  padding: '2px 0',
});

export const toolCallDetail = style({
  marginLeft: '28px',
  marginTop: '4px',
  fontSize: '11px',
});

export const toolCallJson = style({
  background: vars.color.fillQuaternary,
  padding: '6px',
  borderRadius: vars.borderRadius.sm,
  margin: 0,
  overflowX: 'auto',
  fontFamily: vars.typography.fontMono,
  fontSize: '11px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
});
```

- [ ] **Step 3: Create ThinkingBlock**

```tsx
// packages/rich-agent-chat/src/components/ThinkingBlock.tsx
import type { ReactElement } from 'react';

import { thinkingBlock } from '../styles.css';

interface ThinkingBlockProps {
  content: string;
  isStreaming: boolean;
}

export function ThinkingBlock({ content, isStreaming }: ThinkingBlockProps): ReactElement {
  return (
    <div className={thinkingBlock}>
      {content}
      {isStreaming && <span style={{ opacity: 0.5 }}> ...</span>}
    </div>
  );
}
```

- [ ] **Step 4: Create ToolCallBubble**

```tsx
// packages/rich-agent-chat/src/components/ToolCallBubble.tsx
import { Badge, Collapsible, CollapsiblePanel, CollapsibleTrigger, Spinner, StatusDot } from '@haklex/rich-editor-ui';
import type { ReactElement } from 'react';

import { toolCallDetail, toolCallJson, toolCallRow } from '../styles.css';

interface ToolCallBubbleProps {
  name: string;
  params: Record<string, unknown>;
  result?: { success: boolean; summary: string };
}

export function ToolCallBubble({ name, params, result }: ToolCallBubbleProps): ReactElement {
  const status = !result ? 'active' : result.success ? 'success' : 'error';
  const isRunning = !result;

  return (
    <Collapsible>
      <CollapsibleTrigger>
        <div className={toolCallRow}>
          {isRunning ? <Spinner size="sm" /> : <StatusDot status={status} size="sm" />}
          <Badge variant="neutral" size="sm">
            <code>{name}</code>
          </Badge>
          {result && (
            <span style={{ color: result.success ? '#22c55e' : '#ef4444' }}>
              {result.summary.length > 60 ? `${result.summary.slice(0, 60)}...` : result.summary}
            </span>
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <div className={toolCallDetail}>
          <div style={{ color: '#737373', marginBottom: '4px' }}>Parameters</div>
          <pre className={toolCallJson}>{JSON.stringify(params, null, 2)}</pre>
          {result && (
            <>
              <div style={{ color: '#737373', margin: '8px 0 4px' }}>Result</div>
              <pre className={toolCallJson}>{result.summary}</pre>
            </>
          )}
        </div>
      </CollapsiblePanel>
    </Collapsible>
  );
}
```

- [ ] **Step 5: Create ErrorBubble**

```tsx
// packages/rich-agent-chat/src/components/ErrorBubble.tsx
import { ActionButton, Alert } from '@haklex/rich-editor-ui';
import type { ReactElement } from 'react';

interface ErrorBubbleProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBubble({ message, onRetry }: ErrorBubbleProps): ReactElement {
  return (
    <Alert
      variant="error"
      action={
        onRetry ? (
          <ActionButton variant="outline" size="sm" onClick={onRetry}>
            Retry
          </ActionButton>
        ) : undefined
      }
    >
      {message}
    </Alert>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add packages/rich-agent-chat/src/components/ packages/rich-agent-chat/src/styles.css.ts packages/rich-agent-chat/package.json
git commit -m "feat(rich-agent-chat): add ThinkingBlock, ToolCallBubble, ErrorBubble"
```

---

## Task 17: Chat UI Components — StreamdownBubble, StatusBar, ModelSelector

**Files:**
- Create: `packages/rich-agent-chat/src/components/StreamdownBubble.tsx`
- Create: `packages/rich-agent-chat/src/components/StatusBar.tsx`
- Create: `packages/rich-agent-chat/src/components/ModelSelector.tsx`
- Modify: `packages/rich-agent-chat/package.json`

- [ ] **Step 1: Add streamdown dependencies**

In `packages/rich-agent-chat/package.json`, add:

```json
"streamdown": "^2.5.0",
"@streamdown/code": "^2.5.0"
```

- [ ] **Step 2: Create StreamdownBubble**

```tsx
// packages/rich-agent-chat/src/components/StreamdownBubble.tsx
import { CodeBlock } from '@haklex/rich-editor-ui';
import { code } from '@streamdown/code';
import type { ReactElement } from 'react';
import { Streamdown } from 'streamdown';

import { bubbleAssistant } from '../styles.css';

interface StreamdownBubbleProps {
  content: string;
  isStreaming: boolean;
}

const plugins = { code };

const components = {
  pre: ({ children, ...props }: any) => {
    // Extract code content and language from children
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
    <div className={bubbleAssistant}>
      <Streamdown isAnimating={isStreaming} plugins={plugins} components={components}>
        {content}
      </Streamdown>
    </div>
  );
}
```

- [ ] **Step 3: Create StatusBar**

```tsx
// packages/rich-agent-chat/src/components/StatusBar.tsx
import { Spinner } from '@haklex/rich-editor-ui';
import type { ReactElement } from 'react';

interface StatusBarProps {
  status: 'idle' | 'running' | 'thinking' | 'calling_tool' | 'writing' | 'done';
  toolName?: string;
}

const labels: Record<string, string> = {
  thinking: 'Thinking...',
  writing: 'Writing...',
  running: 'Processing...',
};

export function StatusBar({ status, toolName }: StatusBarProps): ReactElement | null {
  if (status === 'idle' || status === 'done') return null;

  const label = status === 'calling_tool' && toolName
    ? `Calling ${toolName}...`
    : labels[status] || 'Processing...';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      fontSize: '12px',
      color: '#737373',
    }}>
      <Spinner size="sm" />
      <span>{label}</span>
    </div>
  );
}
```

- [ ] **Step 4: Create ModelSelector**

```tsx
// packages/rich-agent-chat/src/components/ModelSelector.tsx
import { Select, SelectContent, SelectGroup, SelectGroupLabel, SelectItem, SelectTrigger, SelectValue } from '@haklex/rich-editor-ui';
import type { ReactElement } from 'react';

interface ModelSelectorProps {
  model: string;
  onModelChange: (model: string) => void;
}

const models = [
  { group: 'Claude', items: [
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
    { value: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
  ]},
  { group: 'OpenAI', items: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'o3', label: 'o3' },
  ]},
];

function getProviderFromModel(model: string): 'claude' | 'openai' {
  return model.startsWith('claude') ? 'claude' : 'openai';
}

export function ModelSelector({ model, onModelChange }: ModelSelectorProps): ReactElement {
  return (
    <Select value={model} onValueChange={onModelChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent side="bottom" align="start">
        {models.map((group) => (
          <SelectGroup key={group.group}>
            <SelectGroupLabel>{group.group}</SelectGroupLabel>
            {group.items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

export { getProviderFromModel };
```

- [ ] **Step 5: Commit**

```bash
git add packages/rich-agent-chat/src/components/ packages/rich-agent-chat/package.json
git commit -m "feat(rich-agent-chat): add StreamdownBubble, StatusBar, ModelSelector"
```

---

## Task 18: Refactor ChatMessageList, ChatInput, ChatPanel

**Files:**
- Modify: `packages/rich-agent-chat/src/ChatMessageList.tsx`
- Modify: `packages/rich-agent-chat/src/ChatInput.tsx`
- Modify: `packages/rich-agent-chat/src/ChatPanel.tsx`
- Modify: `packages/rich-agent-chat/src/styles.css.ts`
- Modify: `packages/rich-agent-chat/src/index.ts`

- [ ] **Step 1: Refactor ChatMessageList**

Replace `packages/rich-agent-chat/src/ChatMessageList.tsx` with:

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

export function ChatMessageList({ bubbles, onRetry }: ChatMessageListProps): ReactElement {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Merge tool_result into preceding tool_call for display
  const mergedBubbles = mergeBubbles(bubbles);

  return (
    <ScrollArea autoScrollToBottom className={messageList} scrollRef={scrollRef}>
      {mergedBubbles.map((item, i) => {
        switch (item.type) {
          case 'user':
            return <div className={bubbleUser} key={i}>{item.content}</div>;

          case 'thinking':
            return <ThinkingBlock key={i} content={item.content} isStreaming={false} />;

          case 'assistant':
            return (
              <StreamdownBubble
                key={i}
                content={item.content}
                isStreaming={item.streaming ?? false}
              />
            );

          case 'tool_call_merged':
            return (
              <ToolCallBubble
                key={i}
                name={item.toolName}
                params={item.params}
                result={item.result}
              />
            );

          case 'error':
            return <ErrorBubble key={i} message={item.message} onRetry={onRetry} />;

          case 'diff_summary':
            return (
              <div className={bubbleTool} key={i}>
                Diff: {item.accepted} accepted, {item.rejected} rejected, {item.pending} pending
              </div>
            );

          default:
            return null;
        }
      })}
    </ScrollArea>
  );
}

type MergedBubble =
  | ChatBubble
  | {
      type: 'tool_call_merged';
      toolName: string;
      params: Record<string, unknown>;
      result?: { success: boolean; summary: string };
    };

function mergeBubbles(bubbles: ChatBubble[]): MergedBubble[] {
  const result: MergedBubble[] = [];
  for (let i = 0; i < bubbles.length; i++) {
    const b = bubbles[i];
    if (b.type === 'tool_call') {
      // Look ahead for matching tool_result
      const next = bubbles[i + 1];
      if (next?.type === 'tool_result' && next.toolName === b.toolName) {
        result.push({
          type: 'tool_call_merged',
          toolName: b.toolName,
          params: b.params,
          result: { success: next.success, summary: next.summary },
        });
        i++; // skip tool_result
      } else {
        result.push({
          type: 'tool_call_merged',
          toolName: b.toolName,
          params: b.params,
        });
      }
    } else if (b.type === 'tool_result') {
      // Orphan tool_result (shouldn't happen, but handle gracefully)
      result.push(b);
    } else {
      result.push(b);
    }
  }
  return result;
}
```

- [ ] **Step 2: Refactor ChatInput**

Replace `packages/rich-agent-chat/src/ChatInput.tsx` with:

```tsx
import { ActionButton, AutoResizeTextArea } from '@haklex/rich-editor-ui';
import { ArrowUp, Square } from 'lucide-react';
import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';

import { inputContainer } from './styles.css';

interface ChatInputProps {
  disabled?: boolean;
  isRunning?: boolean;
  onAbort?: () => void;
  onSend: (message: string) => void;
}

export function ChatInput({ disabled, isRunning, onSend, onAbort }: ChatInputProps): ReactElement {
  const [value, setValue] = useState('');

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  }, [value, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className={inputContainer}>
      <AutoResizeTextArea
        disabled={disabled}
        maxRows={6}
        placeholder="Ask AI to edit..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {isRunning ? (
        <ActionButton icon rounded variant="outline" size="sm" onClick={onAbort}>
          <Square size={14} />
        </ActionButton>
      ) : (
        <ActionButton
          icon
          rounded
          variant="solid"
          size="sm"
          disabled={disabled || !value.trim()}
          onClick={handleSend}
        >
          <ArrowUp size={14} />
        </ActionButton>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Refactor ChatPanel**

Replace `packages/rich-agent-chat/src/ChatPanel.tsx` with:

```tsx
import type { AgentStore, AgentStoreState } from '@haklex/rich-agent-core';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { ChatInput } from './ChatInput';
import { ChatMessageList } from './ChatMessageList';
import { ModelSelector, getProviderFromModel } from './components/ModelSelector';
import { StatusBar } from './components/StatusBar';
import { chatPanel } from './styles.css';

interface ChatPanelProps {
  model?: string;
  onAbort?: () => void;
  onModelChange?: (model: string) => void;
  onRetry?: () => void;
  onSend?: (message: string) => void;
  store: AgentStore;
}

export function ChatPanel({
  store,
  onSend,
  onAbort,
  onRetry,
  model,
  onModelChange,
}: ChatPanelProps): ReactElement {
  const [state, setState] = useState<AgentStoreState>(store.getState);

  useEffect(() => store.subscribe(setState), [store]);

  const handleSend = useCallback(
    (message: string) => {
      store.dispatch({ type: 'add_bubble', bubble: { type: 'user', content: message } });
      onSend?.(message);
    },
    [store, onSend],
  );

  const isRunning = state.status !== 'idle' && state.status !== 'done';

  return (
    <div className={chatPanel}>
      {model && onModelChange && (
        <div style={{ padding: '8px 12px', borderBottom: `1px solid var(--rc-border)` }}>
          <ModelSelector model={model} onModelChange={onModelChange} />
        </div>
      )}
      <ChatMessageList bubbles={state.bubbles} onRetry={onRetry} />
      <StatusBar status={state.status} />
      <ChatInput
        disabled={isRunning}
        isRunning={isRunning}
        onAbort={onAbort}
        onSend={handleSend}
      />
    </div>
  );
}
```

- [ ] **Step 4: Update styles — remove old inputField and sendButton**

In `packages/rich-agent-chat/src/styles.css.ts`, remove the `inputField` and `sendButton` styles (replaced by AutoResizeTextArea and ActionButton). Keep `inputContainer` but update alignment:

```typescript
export const inputContainer = style({
  display: 'flex',
  alignItems: 'flex-end',
  padding: '8px 12px',
  borderTop: `1px solid ${vars.color.border}`,
  gap: '8px',
});
```

- [ ] **Step 5: Update exports**

In `packages/rich-agent-chat/src/index.ts`:

```typescript
export { ChatPanel } from './ChatPanel';
export { AgentStoreProvider, useAgentStore } from './context';
export { ModelSelector, getProviderFromModel } from './components/ModelSelector';
export { StatusBar } from './components/StatusBar';
export type { ChatBubble } from './types';
```

- [ ] **Step 6: Commit**

```bash
git add packages/rich-agent-chat/src/
git commit -m "feat(rich-agent-chat): refactor ChatPanel with Streamdown, tool calls, model selector"
```

---

## Task 19: Update Demo AgentPage with Real Providers

**Files:**
- Modify: `demo/src/pages/AgentPage.tsx`

- [ ] **Step 1: Replace mock provider with real providers**

Replace `demo/src/pages/AgentPage.tsx`:

```tsx
import { ChatPanel, getProviderFromModel } from '@haklex/rich-agent-chat';
import type { LLMProvider } from '@haklex/rich-agent-core';
import { createAgentStore } from '@haklex/rich-agent-core';
import { AgentPanelPlugin, builtInActions, useAgentLoop } from '@haklex/rich-ext-ai-agent';
import { MentionPlatformProvider, ShiroEditor } from '@haklex/rich-kit-shiro';
import { ToolbarPlugin } from '@haklex/rich-plugin-toolbar';
import type { SerializedEditorState } from 'lexical';
import { useCallback, useMemo, useRef, useState } from 'react';

import { useTheme } from '../context/ThemeContext';
import { createClaudeProvider } from '../providers/claude-provider';
import { createOpenAIProvider } from '../providers/openai-provider';

const initialContent: SerializedEditorState = {
  root: {
    type: 'root',
    children: [
      {
        type: 'heading',
        children: [{ type: 'text', text: 'AI Agent Demo', detail: 0, format: 0, mode: 'normal', style: '', version: 1 }],
        direction: 'ltr', format: '', indent: 0, version: 1, tag: 'h1', textFormat: 0, textStyle: '',
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'This is a demo of the AI agent extension. The agent can insert, replace, and delete blocks in the document via tool calling.', detail: 0, format: 0, mode: 'normal', style: '', version: 1 }],
        direction: 'ltr', format: '', indent: 0, version: 1, textFormat: 0, textStyle: '',
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Try typing a message in the chat panel to interact with the agent. The agent will propose changes as inline diffs that you can accept or reject.', detail: 0, format: 0, mode: 'normal', style: '', version: 1 }],
        direction: 'ltr', format: '', indent: 0, version: 1, textFormat: 0, textStyle: '',
      },
    ],
    direction: 'ltr', format: '', indent: 0, version: 1,
  },
} as any;

function createProvider(model: string): LLMProvider {
  const provider = getProviderFromModel(model);
  return provider === 'claude' ? createClaudeProvider(model) : createOpenAIProvider(model);
}

function AgentEditorWithChat({
  store,
}: {
  store: ReturnType<typeof createAgentStore>;
}) {
  const theme = useTheme();
  const [model, setModel] = useState('claude-sonnet-4-20250514');
  const providerRef = useRef<LLMProvider>(createProvider(model));
  const agentLoopRef = useRef<ReturnType<typeof useAgentLoop> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleModelChange = useCallback((newModel: string) => {
    setModel(newModel);
    providerRef.current = createProvider(newModel);
  }, []);

  const handleSend = useCallback(
    (message: string) => {
      const loop = agentLoopRef.current;
      if (!loop) return;
      abortRef.current = new AbortController();
      loop.run(builtInActions[1], message).catch((err: unknown) => {
        if ((err as Error).name === 'AbortError') return;
        store.dispatch({
          type: 'add_bubble',
          bubble: { type: 'error', message: String(err) },
        });
      });
    },
    [store],
  );

  const handleAbort = useCallback(() => {
    abortRef.current?.abort();
    store.dispatch({ type: 'set_status', status: 'idle' });
  }, [store]);

  const handleRetry = useCallback(() => {
    const bubbles = store.getState().bubbles;
    const lastUserBubble = [...bubbles].reverse().find((b) => b.type === 'user');
    if (lastUserBubble && lastUserBubble.type === 'user') {
      handleSend(lastUserBubble.content);
    }
  }, [store, handleSend]);

  return (
    <div className="agent-split">
      <div className="agent-pane-editor">
        <MentionPlatformProvider platforms={{}}>
          <ShiroEditor header={<ToolbarPlugin />} initialValue={initialContent}>
            <AgentPanelPlugin provider={providerRef.current} store={store} />
            <AgentLoopCapture loopRef={agentLoopRef} provider={providerRef.current} store={store} />
          </ShiroEditor>
        </MentionPlatformProvider>
      </div>
      <div className="agent-pane-chat" data-theme={theme}>
        <ChatPanel
          store={store}
          model={model}
          onModelChange={handleModelChange}
          onSend={handleSend}
          onAbort={handleAbort}
          onRetry={handleRetry}
        />
      </div>
    </div>
  );
}

function AgentLoopCapture({
  loopRef,
  provider,
  store,
}: {
  loopRef: React.RefObject<ReturnType<typeof useAgentLoop> | null>;
  provider: LLMProvider;
  store: ReturnType<typeof createAgentStore>;
}) {
  const loop = useAgentLoop({ provider, store });
  loopRef.current = loop;
  return null;
}

export function AgentPage() {
  const store = useMemo(() => createAgentStore(), []);

  return <AgentEditorWithChat store={store} />;
}
```

- [ ] **Step 2: Install new dependencies**

```bash
cd /Users/innei/git/innei-repo/haklex && pnpm install
```

- [ ] **Step 3: Verify demo builds and runs**

```bash
pnpm --filter @haklex/rich-editor-ui build
pnpm --filter @haklex/rich-agent-core build
pnpm --filter @haklex/rich-agent-chat build
pnpm dev
```

Verify in browser: ModelSelector renders, chat sends messages to proxy, streaming response renders with Streamdown.

- [ ] **Step 4: Commit**

```bash
git add demo/src/pages/AgentPage.tsx
git commit -m "feat(demo): integrate real Claude/OpenAI providers with model selector"
```

---

## Task 20: End-to-End Smoke Test

- [ ] **Step 1: Create `.env` in `demo/` with real API keys**

```bash
cp demo/.env.example demo/.env
# Edit with real keys
```

- [ ] **Step 2: Start dev server and test Claude**

```bash
pnpm dev
```

In browser:
1. Select "Claude Sonnet 4" from model selector
2. Type "insert a paragraph about testing"
3. Verify: thinking block appears (faded italic), then streaming markdown, then tool call (collapsible), then diff in editor

- [ ] **Step 3: Test OpenAI**

1. Select "GPT-4o" from model selector
2. Type "replace the first paragraph with something shorter"
3. Verify: streaming text, tool calls, diffs

- [ ] **Step 4: Test error recovery**

1. Set invalid API key in `.env`, restart dev server
2. Send a message
3. Verify: error bubble appears with retry button
4. Fix key, click retry

- [ ] **Step 5: Test abort**

1. Send a message, click Stop during streaming
2. Verify: generation stops, status returns to idle

- [ ] **Step 6: Lint modified files**

```bash
npx eslint packages/rich-editor-ui/src/components/spinner/index.tsx packages/rich-editor-ui/src/components/status-dot/index.tsx packages/rich-editor-ui/src/components/badge/index.tsx packages/rich-editor-ui/src/components/collapsible/index.tsx packages/rich-editor-ui/src/components/auto-resize-textarea/index.tsx packages/rich-editor-ui/src/components/select/index.tsx packages/rich-editor-ui/src/components/scroll-area/index.tsx packages/rich-editor-ui/src/components/alert/index.tsx packages/rich-editor-ui/src/components/code-block/index.tsx packages/rich-agent-core/src/protocol.ts packages/rich-agent-core/src/store.ts packages/rich-agent-core/src/agent-executor.ts packages/rich-agent-chat/src/ChatInput.tsx packages/rich-agent-chat/src/ChatMessageList.tsx packages/rich-agent-chat/src/ChatPanel.tsx demo/src/pages/AgentPage.tsx demo/src/providers/claude-provider.ts demo/src/providers/openai-provider.ts
```

Fix any lint errors.

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "chore: lint fixes and smoke test validation"
```
