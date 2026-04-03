# rich-agent-chat Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `@haklex/rich-agent-chat` a production-ready, generic Chat UI package with provider transport abstraction in `@haklex/rich-agent-core`, consumable by admin-vue3 with shadcn/Vercel design style.

**Architecture:** Provider layer gets transport adapters (direct/proxy) and SSE parsers moved from demo into `rich-agent-core`. Chat UI drops demo-only components (DirectToolBar, SettingsModal), adopts a consumer-driven `ProviderGroup[]` props API, and gets a full visual redesign. Agent loop (`rich-ext-ai-agent`) remains untouched.

**Tech Stack:** TypeScript 5.9, React 19, Vanilla Extract CSS-in-TS, Zustand 5, Vite 7, Lexical 0.42, Streamdown 2.5

---

## File Structure

### New files in `packages/rich-agent-core/src/`

| File                          | Responsibility                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| `provider/transport.ts`       | `TransportAdapter` type + `createDirectTransport` + `createProxyTransport` factories |
| `provider/sse-claude.ts`      | Claude SSE stream → `LLMChunk` async generator                                       |
| `provider/sse-openai.ts`      | OpenAI SSE stream → `LLMChunk` async generator                                       |
| `provider/message-format.ts`  | `ChatMessage[]` → Claude/OpenAI API body conversion                                  |
| `provider/create-provider.ts` | `createProvider()` factory composing transport + parser                              |
| `provider/index.ts`           | Barrel export for provider module                                                    |

### Modified files in `packages/rich-agent-core/`

| File           | Change               |
| -------------- | -------------------- |
| `src/index.ts` | Add provider exports |

### Modified files in `packages/rich-agent-chat/src/`

| File                                   | Change                                                                            |
| -------------------------------------- | --------------------------------------------------------------------------------- |
| `types.ts`                             | Replace `ProviderConfig` with `ProviderGroup`, `ModelOption`, new `SelectedModel` |
| `index.ts`                             | Update exports                                                                    |
| `ChatPanel.tsx`                        | New props interface, remove DirectToolBar/SettingsModal                           |
| `ChatInput.tsx`                        | Redesign to shadcn style (input box with embedded button)                         |
| `ChatMessageList.tsx`                  | Minor style class updates                                                         |
| `styles.css.ts`                        | Full rewrite to shadcn/Vercel design                                              |
| `components/ModelSelector.tsx`         | Rewrite to accept `ProviderGroup[]`, remove regex/settings                        |
| `components/model-selector.css.ts`     | Update to compact trigger style                                                   |
| `components/ThinkingChain.tsx`         | Replace bounce dots with pulse, remove skeleton                                   |
| `components/ToolCall.tsx`              | Remove hardcoded colors                                                           |
| `components/ToolCallGroup.tsx`         | Remove hardcoded colors                                                           |
| `components/ErrorBubble.tsx`           | Use semantic color vars                                                           |
| `components/DiffReviewBubble.tsx`      | Redesign buttons to shadcn style                                                  |
| `components/diff-review-bubble.css.ts` | Remove hardcoded RGB colors                                                       |

### Files to delete from `packages/rich-agent-chat/src/`

| File                                | Reason                                |
| ----------------------------------- | ------------------------------------- |
| `DirectToolBar.tsx`                 | Moved to demo                         |
| `direct-tool-bar.css.ts`            | Moved to demo                         |
| `components/SettingsModal.tsx`      | Removed (provider config by consumer) |
| `components/settings-modal.css.ts`  | Removed                               |
| `components/model-display-names.ts` | Removed (display names by consumer)   |

### Modified files in `demo/`

| File                                    | Change                                                            |
| --------------------------------------- | ----------------------------------------------------------------- |
| `src/pages/AgentPage.tsx`               | Use new `createProvider` API, pass `ProviderGroup[]` to ChatPanel |
| `src/components/DirectToolBar.tsx`      | Moved from package (new location)                                 |
| `src/components/direct-tool-bar.css.ts` | Moved from package (new location)                                 |

---

## Task 1: Provider Transport Layer (`rich-agent-core`)

**Files:**

- Create: `packages/rich-agent-core/src/provider/transport.ts`
- Create: `packages/rich-agent-core/src/provider/message-format.ts`
- Create: `packages/rich-agent-core/src/provider/sse-claude.ts`
- Create: `packages/rich-agent-core/src/provider/sse-openai.ts`
- Create: `packages/rich-agent-core/src/provider/create-provider.ts`
- Create: `packages/rich-agent-core/src/provider/index.ts`
- Modify: `packages/rich-agent-core/src/index.ts`

- [ ] **Step 1: Create transport adapter types and factories**

Create `packages/rich-agent-core/src/provider/transport.ts`:

```typescript
import type { ChatMessage, ToolSchema } from '../protocol';

export type TransportAdapter = (
  messages: ChatMessage[],
  tools: ToolSchema[] | undefined,
  model: string,
  signal: AbortSignal,
) => Promise<Response>;

export type ProviderType = 'claude' | 'openai-compatible';

export function createDirectTransport(config: {
  apiKey: string;
  baseUrl: string;
  providerType: ProviderType;
}): TransportAdapter {
  const { apiKey, baseUrl, providerType } = config;

  return async (messages, tools, model, signal) => {
    if (providerType === 'claude') {
      const body = buildClaudeBody(messages, tools, model);
      return fetch(`${baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'interleaved-thinking-2025-05-14',
        },
        body: JSON.stringify(body),
        signal,
      });
    }

    const body = buildOpenAIBody(messages, tools, model);
    return fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal,
    });
  };
}

export function createProxyTransport(config: {
  endpoint: string;
  headers?: Record<string, string>;
}): TransportAdapter {
  const { endpoint, headers: extraHeaders } = config;

  return async (messages, tools, model, signal) => {
    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...extraHeaders,
      },
      body: JSON.stringify({ model, messages, tools }),
      signal,
    });
  };
}
```

Note: `buildClaudeBody` and `buildOpenAIBody` are from `message-format.ts` (next step). Add the import at top after creating that file.

- [ ] **Step 2: Create message format converters**

Create `packages/rich-agent-core/src/provider/message-format.ts`:

```typescript
import type { ChatMessage, ToolSchema } from '../protocol';

export function buildClaudeBody(
  messages: ChatMessage[],
  tools: ToolSchema[] | undefined,
  model: string,
) {
  const systemMsgs = messages.filter((m) => m.role === 'system');
  const nonSystemMsgs = messages.filter((m) => m.role !== 'system');

  const claudeMessages = nonSystemMsgs.map((m) => {
    if (m.role === 'user') return { role: 'user', content: m.content };
    if (m.role === 'assistant') return { role: 'assistant', content: m.content };
    if (m.role === 'assistant_tool_call') {
      return {
        role: 'assistant',
        content: m.toolCalls.map((tc) => ({
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
    return { role: (m as any).role, content: (m as any).content };
  });

  const claudeTools = tools?.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters,
  }));

  const body: Record<string, unknown> = {
    model,
    max_tokens: 4096,
    stream: true,
    messages: claudeMessages,
  };

  if (systemMsgs.length > 0) {
    body.system = systemMsgs.map((m) => ({ type: 'text', text: m.content }));
  }
  if (claudeTools?.length) {
    body.tools = claudeTools;
  }
  if (model.includes('opus') || model.includes('sonnet')) {
    body.thinking = { type: 'enabled', budget_tokens: 2048 };
  }

  return body;
}

export function buildOpenAIBody(
  messages: ChatMessage[],
  tools: ToolSchema[] | undefined,
  model: string,
) {
  const openaiMessages = messages.map((m) => {
    if (m.role === 'system') return { role: 'system', content: m.content };
    if (m.role === 'user') return { role: 'user', content: m.content };
    if (m.role === 'assistant') return { role: 'assistant', content: m.content };
    if (m.role === 'assistant_tool_call') {
      return {
        role: 'assistant',
        content: null,
        tool_calls: m.toolCalls.map((tc) => ({
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
    return { role: (m as any).role, content: (m as any).content };
  });

  const openaiTools = tools?.map((t) => ({
    type: 'function' as const,
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }));

  const body: Record<string, unknown> = {
    model,
    stream: true,
    messages: openaiMessages,
  };
  if (openaiTools?.length) {
    body.tools = openaiTools;
  }

  return body;
}
```

- [ ] **Step 3: Add import of `buildClaudeBody`/`buildOpenAIBody` to transport.ts**

In `packages/rich-agent-core/src/provider/transport.ts`, add at line 1:

```typescript
import { buildClaudeBody, buildOpenAIBody } from './message-format';
```

- [ ] **Step 4: Create Claude SSE parser**

Create `packages/rich-agent-core/src/provider/sse-claude.ts`:

```typescript
import type { LLMChunk } from '../protocol';

export async function* parseClaudeSSE(response: Response): AsyncIterable<LLMChunk> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let currentToolBlock: { id: string; name: string; arguments: string } | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop()!;

      let currentEvent = '';
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7).trim();
          continue;
        }
        if (!line.startsWith('data: ')) continue;

        const data = line.slice(6).trim();
        if (!data) continue;

        let parsed: any;
        try {
          parsed = JSON.parse(data);
        } catch {
          continue;
        }

        const eventType = currentEvent || parsed.type;

        if (eventType === 'content_block_start') {
          if (parsed.content_block?.type === 'tool_use') {
            currentToolBlock = {
              id: parsed.content_block.id,
              name: parsed.content_block.name,
              arguments: '',
            };
          }
        } else if (eventType === 'content_block_delta') {
          const delta = parsed.delta;
          if (delta?.type === 'text_delta') {
            yield { type: 'text', text: delta.text };
          } else if (delta?.type === 'thinking_delta') {
            yield { type: 'thinking', text: delta.thinking };
          } else if (delta?.type === 'input_json_delta' && currentToolBlock) {
            currentToolBlock.arguments += delta.partial_json;
          }
        } else if (eventType === 'content_block_stop') {
          if (currentToolBlock) {
            yield {
              type: 'tool_call',
              id: currentToolBlock.id,
              name: currentToolBlock.name,
              arguments: currentToolBlock.arguments,
            };
            currentToolBlock = null;
          }
        } else if (eventType === 'message_stop') {
          yield { type: 'done' };
        }

        currentEvent = '';
      }
    }
  } finally {
    reader.releaseLock();
  }

  yield { type: 'done' };
}
```

- [ ] **Step 5: Create OpenAI SSE parser**

Create `packages/rich-agent-core/src/provider/sse-openai.ts`:

```typescript
import type { LLMChunk } from '../protocol';

export async function* parseOpenAISSE(response: Response): AsyncIterable<LLMChunk> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const pendingToolCalls = new Map<number, { id: string; name: string; arguments: string }>();

  try {
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
              pendingToolCalls.set(idx, {
                id: tc.id || '',
                name: tc.function?.name || '',
                arguments: '',
              });
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
  } finally {
    reader.releaseLock();
  }

  yield { type: 'done' };
}
```

- [ ] **Step 6: Create provider factory**

Create `packages/rich-agent-core/src/provider/create-provider.ts`:

```typescript
import type { LLMChunk, LLMProvider } from '../protocol';
import { parseClaudeSSE } from './sse-claude';
import { parseOpenAISSE } from './sse-openai';
import type { ProviderType, TransportAdapter } from './transport';

export function createProvider(config: {
  model: string;
  providerType: ProviderType;
  transport: TransportAdapter;
}): LLMProvider {
  const { model, transport, providerType } = config;
  const parse = providerType === 'claude' ? parseClaudeSSE : parseOpenAISSE;

  return {
    async *chat(messages, tools): AsyncIterable<LLMChunk> {
      const controller = new AbortController();
      const response = await transport(messages, tools, model, controller.signal);

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`LLM API error (${response.status}): ${err}`);
      }

      yield* parse(response);
    },
  };
}
```

- [ ] **Step 7: Create barrel export**

Create `packages/rich-agent-core/src/provider/index.ts`:

```typescript
export { createProvider } from './create-provider';
export { createDirectTransport, createProxyTransport } from './transport';
export type { ProviderType, TransportAdapter } from './transport';
```

- [ ] **Step 8: Add provider exports to core index**

In `packages/rich-agent-core/src/index.ts`, add at the end:

```typescript
export { createDirectTransport, createProvider, createProxyTransport } from './provider';
export type { ProviderType, TransportAdapter } from './provider';
```

- [ ] **Step 9: Verify build**

Run: `pnpm --filter @haklex/rich-agent-core build`
Expected: Build succeeds, `dist/index.mjs` includes provider exports.

- [ ] **Step 10: Commit**

```bash
git add packages/rich-agent-core/src/provider/ packages/rich-agent-core/src/index.ts
git commit -m "feat(rich-agent-core): add provider transport layer with direct/proxy adapters"
```

---

## Task 2: Update Chat UI Types & Exports

**Files:**

- Modify: `packages/rich-agent-chat/src/types.ts`
- Modify: `packages/rich-agent-chat/src/index.ts`

- [ ] **Step 1: Replace types.ts with new interfaces**

Replace entire content of `packages/rich-agent-chat/src/types.ts`:

```typescript
export type { ChatBubble } from '@haklex/rich-agent-core';

export interface ProviderGroup {
  icon?: React.ReactNode;
  id: string;
  models: ModelOption[];
  name: string;
  providerType: 'claude' | 'openai-compatible';
}

export interface ModelOption {
  displayName: string;
  icon?: React.ReactNode;
  id: string;
}

export interface SelectedModel {
  modelId: string;
  providerId: string;
  providerType: 'claude' | 'openai-compatible';
}
```

- [ ] **Step 2: Update index.ts exports**

Replace entire content of `packages/rich-agent-chat/src/index.ts`:

```typescript
export { ChatPanel } from './ChatPanel';
export { AgentStoreProvider, useAgentStore } from './context';
export type { ChatBubble, ModelOption, ProviderGroup, SelectedModel } from './types';
```

- [ ] **Step 3: Commit**

```bash
git add packages/rich-agent-chat/src/types.ts packages/rich-agent-chat/src/index.ts
git commit -m "feat(rich-agent-chat): update types to consumer-driven ProviderGroup API"
```

---

## Task 3: Remove DirectToolBar, SettingsModal, model-display-names from Package

**Files:**

- Delete: `packages/rich-agent-chat/src/DirectToolBar.tsx`
- Delete: `packages/rich-agent-chat/src/direct-tool-bar.css.ts`
- Delete: `packages/rich-agent-chat/src/components/SettingsModal.tsx`
- Delete: `packages/rich-agent-chat/src/components/settings-modal.css.ts`
- Delete: `packages/rich-agent-chat/src/components/model-display-names.ts`
- Create: `demo/src/components/DirectToolBar.tsx` (copy from package)
- Create: `demo/src/components/direct-tool-bar.css.ts` (copy from package)

- [ ] **Step 1: Copy DirectToolBar files to demo**

Copy `packages/rich-agent-chat/src/DirectToolBar.tsx` to `demo/src/components/DirectToolBar.tsx`. Update the styles import from `'./styles.css'` to `'./direct-tool-bar.css'`. Also copy `packages/rich-agent-chat/src/direct-tool-bar.css.ts` to `demo/src/components/direct-tool-bar.css.ts`.

- [ ] **Step 2: Delete files from package**

```bash
rm packages/rich-agent-chat/src/DirectToolBar.tsx
rm packages/rich-agent-chat/src/direct-tool-bar.css.ts
rm packages/rich-agent-chat/src/components/SettingsModal.tsx
rm packages/rich-agent-chat/src/components/settings-modal.css.ts
rm packages/rich-agent-chat/src/components/model-display-names.ts
```

- [ ] **Step 3: Commit**

```bash
git add -A packages/rich-agent-chat/src/DirectToolBar.tsx packages/rich-agent-chat/src/direct-tool-bar.css.ts packages/rich-agent-chat/src/components/SettingsModal.tsx packages/rich-agent-chat/src/components/settings-modal.css.ts packages/rich-agent-chat/src/components/model-display-names.ts demo/src/components/DirectToolBar.tsx demo/src/components/direct-tool-bar.css.ts
git commit -m "refactor(rich-agent-chat): remove DirectToolBar, SettingsModal, model-display-names from package"
```

---

## Task 4: Rewrite ModelSelector Component

**Files:**

- Modify: `packages/rich-agent-chat/src/components/ModelSelector.tsx`
- Modify: `packages/rich-agent-chat/src/components/model-selector.css.ts`

- [ ] **Step 1: Rewrite ModelSelector.tsx**

Replace entire content of `packages/rich-agent-chat/src/components/ModelSelector.tsx`:

```tsx
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@haklex/rich-editor-ui';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { ModelOption, ProviderGroup, SelectedModel } from '../types';
import * as css from './model-selector.css';

interface FlatOption {
  displayName: string;
  icon?: React.ReactNode;
  modelId: string;
  providerId: string;
  providerName: string;
}

interface ModelSelectorProps {
  onSelectModel: (selected: SelectedModel) => void;
  providerGroups: ProviderGroup[];
  selectedModel: SelectedModel | null;
}

export function ModelSelector({
  providerGroups,
  selectedModel,
  onSelectModel,
}: ModelSelectorProps) {
  const options = useMemo(() => {
    const result: FlatOption[] = [];
    for (const group of providerGroups) {
      for (const model of group.models) {
        result.push({
          displayName: model.displayName,
          icon: model.icon,
          modelId: model.id,
          providerId: group.id,
          providerName: group.name,
        });
      }
    }
    return result;
  }, [providerGroups]);

  const selectedOption = selectedModel
    ? (options.find(
        (o) => o.providerId === selectedModel.providerId && o.modelId === selectedModel.modelId,
      ) ?? null)
    : null;

  const [inputValue, setInputValue] = useState('');

  const filteredOptions = useMemo(() => {
    if (!inputValue.trim()) return options;
    const keyword = inputValue.trim().toLowerCase();
    return options.filter(
      (opt) =>
        opt.displayName.toLowerCase().includes(keyword) ||
        opt.modelId.toLowerCase().includes(keyword),
    );
  }, [options, inputValue]);

  const groupedOptions = useMemo(() => {
    const groups: Record<string, { name: string; options: FlatOption[] }> = {};
    for (const opt of filteredOptions) {
      if (!groups[opt.providerId]) {
        groups[opt.providerId] = { name: opt.providerName, options: [] };
      }
      groups[opt.providerId].options.push(opt);
    }
    return groups;
  }, [filteredOptions]);

  return (
    <div className={css.selectorWrapper}>
      <Combobox<FlatOption>
        isItemEqualToValue={(a, b) => a.providerId === b.providerId && a.modelId === b.modelId}
        itemToStringLabel={(opt) => opt.displayName}
        value={selectedOption}
        onInputValueChange={(val) => setInputValue(val)}
        onValueChange={(val) => {
          if (val) {
            const group = providerGroups.find((g) => g.id === val.providerId);
            if (!group) return;
            onSelectModel({
              modelId: val.modelId,
              providerId: val.providerId,
              providerType: group.providerType,
            });
          }
        }}
      >
        <ComboboxTrigger className={css.triggerButton}>
          {selectedOption?.icon ?? <span className={css.modelDot} />}
          <span className={css.triggerLabel}>
            {selectedOption ? selectedOption.displayName : 'Select model'}
          </span>
          <ChevronDown className={css.triggerChevron} size={12} />
        </ComboboxTrigger>
        <ComboboxContent className={css.selectContent} side="top" sideOffset={8}>
          <div className={css.searchWrapper}>
            <ComboboxInput className={css.searchInput} placeholder="Search models..." />
          </div>
          <ComboboxList>
            {Object.entries(groupedOptions).map(([providerId, group]) => (
              <ComboboxGroup key={providerId}>
                <ComboboxGroupLabel className={css.groupLabel}>{group.name}</ComboboxGroupLabel>
                {group.options.map((opt) => (
                  <ComboboxItem key={`${opt.providerId}::${opt.modelId}`} value={opt}>
                    <span className={css.itemInner}>
                      {opt.icon}
                      <span className={css.itemText}>{opt.displayName}</span>
                    </span>
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            ))}
            <ComboboxEmpty>
              <div className={css.emptyState}>No models found</div>
            </ComboboxEmpty>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
```

- [ ] **Step 2: Update model-selector.css.ts**

In `packages/rich-agent-chat/src/components/model-selector.css.ts`:

Remove `settingsFooter` and `settingsLink` styles (lines 105-126). Add these new styles:

```typescript
export const modelDot = style({
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: vars.color.textQuaternary,
  flexShrink: 0,
});

export const triggerChevron = style({
  color: vars.color.textQuaternary,
  flexShrink: 0,
});
```

Update `triggerButton` to use transparent background:

```typescript
export const triggerButton = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'fontSize': 12,
  'padding': '4px 8px',
  'borderRadius': 6,
  'border': 'none',
  'gap': 6,
  'background': 'transparent',
  'color': vars.color.textTertiary,
  'fontFamily': 'inherit',
  'cursor': 'pointer',
  'outline': 'none',
  'minWidth': 0,
  'maxWidth': 220,
  ':hover': {
    background: vars.color.fillTertiary,
    color: vars.color.textSecondary,
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add packages/rich-agent-chat/src/components/ModelSelector.tsx packages/rich-agent-chat/src/components/model-selector.css.ts
git commit -m "refactor(rich-agent-chat): rewrite ModelSelector to accept ProviderGroup props"
```

---

## Task 5: Rewrite ChatPanel Props & Component

**Files:**

- Modify: `packages/rich-agent-chat/src/ChatPanel.tsx`

- [ ] **Step 1: Rewrite ChatPanel.tsx**

Replace entire content of `packages/rich-agent-chat/src/ChatPanel.tsx`:

```tsx
import { type AgentStore, agentStoreSelectors, type ReviewBatch } from '@haklex/rich-agent-core';
import { useCallback } from 'react';
import { useStore } from 'zustand';

import { ChatInput } from './ChatInput';
import { ChatMessageList } from './ChatMessageList';
import { ModelSelector } from './components/ModelSelector';
import * as css from './styles.css';
import type { ProviderGroup, SelectedModel } from './types';

interface ChatPanelProps {
  onAbort: () => void;
  onAcceptBatch?: (batchId: string) => void;
  onRejectBatch?: (batchId: string) => void;
  onRetry?: () => void;
  onSelectModel: (selected: SelectedModel) => void;
  onSend: (message: string) => void;
  providerGroups: ProviderGroup[];
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
  onAcceptBatch,
  onRejectBatch,
  onRetry,
  onSend,
  providerGroups,
  selectedModel,
  onSelectModel,
  store,
}: ChatPanelProps) {
  const bubbles = useStore(store, agentStoreSelectors.bubbles);
  const status = useStore(store, agentStoreSelectors.status);
  const reviewState = useStore(store, agentStoreSelectors.reviewState);

  const getBatch = useCallback(
    (batchId: string) => reviewState?.batches.find((b: ReviewBatch) => b.id === batchId),
    [reviewState],
  );

  const handleSend = useCallback(
    (message: string) => {
      store.getState().addBubble({ type: 'user', content: message });
      onSend(message);
    },
    [onSend, store],
  );

  const isRunning = status !== 'idle' && status !== 'done';
  const hasModel = selectedModel !== null;

  let statusLabel: string | undefined;
  if (isRunning) {
    statusLabel =
      status === 'calling_tool' ? 'Calling tool...' : STATUS_LABELS[status] || 'Processing...';
  }

  return (
    <div className={css.chatPanel}>
      <ChatMessageList
        bubbles={bubbles}
        getBatch={getBatch}
        onAcceptBatch={onAcceptBatch}
        onRejectBatch={onRejectBatch}
        onRetry={onRetry}
      />
      <ChatInput
        disabled={!hasModel}
        isRunning={isRunning}
        statusLabel={statusLabel}
        modelSelector={
          <ModelSelector
            providerGroups={providerGroups}
            selectedModel={selectedModel}
            onSelectModel={onSelectModel}
          />
        }
        onAbort={onAbort}
        onSend={handleSend}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/rich-agent-chat/src/ChatPanel.tsx
git commit -m "refactor(rich-agent-chat): simplify ChatPanel props, remove DirectToolBar/SettingsModal"
```

---

## Task 6: Redesign Styles — shadcn/Vercel

**Files:**

- Modify: `packages/rich-agent-chat/src/styles.css.ts`
- Modify: `packages/rich-agent-chat/src/components/diff-review-bubble.css.ts`

- [ ] **Step 1: Rewrite styles.css.ts**

Replace entire content of `packages/rich-agent-chat/src/styles.css.ts`:

```typescript
import { vars } from '@haklex/rich-style-token/styles';
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
  padding: '20px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
});

// ── User Bubble ──

export const bubbleUser = style({
  alignSelf: 'flex-end',
  maxWidth: '80%',
  padding: '10px 14px',
  background: vars.color.text,
  color: vars.color.bg,
  borderRadius: '18px 18px 4px 18px',
  lineHeight: 1.5,
  fontSize: '14px',
});

// ── Assistant Prose ──

export const proseAssistant = style({
  fontSize: '14px',
  lineHeight: 1.7,
  color: vars.color.text,
  textAlign: 'left',
});

// ── Tool Call Row ──

export const toolCallRow = style({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  gap: 8,
  padding: '3px 0',
  fontSize: '13px',
  color: vars.color.textTertiary,
  cursor: 'default',
  transition: 'color 120ms ease',
  border: 'none',
  background: 'none',
  textAlign: 'left',
  fontFamily: 'inherit',
  lineHeight: 1.4,
  selectors: {
    '&[data-expandable="true"]': { cursor: 'pointer' },
    '&[data-expandable="true"]:hover': { color: vars.color.textSecondary },
  },
});

export const toolCallStatusIcon = style({
  display: 'flex',
  width: 16,
  height: 16,
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

export const toolCallPendingDot = style({
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: vars.color.textQuaternary,
});

export const toolCallName = style({
  fontFamily: vars.typography.fontMono,
  fontSize: '13px',
  flexShrink: 0,
});

export const toolCallDesc = style({
  color: vars.color.textQuaternary,
  fontSize: '13px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
  minWidth: 0,
});

export const toolCallDuration = style({
  fontFamily: vars.typography.fontMono,
  fontSize: '11px',
  color: vars.color.textQuaternary,
  opacity: 0.6,
  flexShrink: 0,
});

export const toolCallChevron = style({
  width: 12,
  height: 12,
  flexShrink: 0,
  color: vars.color.textQuaternary,
  opacity: 0.4,
  transition: 'transform 150ms ease',
  selectors: {
    '&[data-expanded="true"]': { transform: 'rotate(90deg)' },
  },
});

export const toolCallDetail = style({
  display: 'grid',
  transition: 'grid-template-rows 150ms ease',
  gridTemplateRows: '0fr',
  selectors: {
    '&[data-open="true"]': { gridTemplateRows: '1fr' },
  },
});

export const toolCallDetailInner = style({ overflow: 'hidden' });

export const toolCallDetailContent = style({
  paddingLeft: 24,
  paddingBottom: 8,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
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

export const toolCallResultPre = style({
  margin: 0,
  overflowX: 'auto',
  padding: 6,
  background: vars.color.fillQuaternary,
  borderRadius: vars.borderRadius.sm,
  fontFamily: vars.typography.fontMono,
  fontSize: '11px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  color: vars.color.textSecondary,
});

export const toolCallErrorPre = style({
  margin: 0,
  overflowX: 'auto',
  padding: 6,
  background: vars.color.fillQuaternary,
  borderRadius: vars.borderRadius.sm,
  fontFamily: vars.typography.fontMono,
  fontSize: '11px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  color: vars.color.textError,
});

export const toolCallGroupItems = style({
  paddingLeft: 16,
  paddingTop: 2,
});

export const toolCallGroupCounter = style({
  fontFamily: vars.typography.fontMono,
  fontSize: '12px',
  color: vars.color.textQuaternary,
  opacity: 0.5,
});

// ── Thinking Chain ──

export const thinkingRow = style({
  'display': 'flex',
  'width': '100%',
  'alignItems': 'center',
  'gap': 8,
  'padding': '3px 0',
  'fontSize': '13px',
  'color': vars.color.textTertiary,
  'cursor': 'pointer',
  'transition': 'color 120ms ease',
  'border': 'none',
  'background': 'none',
  'textAlign': 'left',
  'fontFamily': 'inherit',
  'lineHeight': 1.4,
  ':hover': { color: vars.color.textSecondary },
});

export const thinkingSteps = style({
  paddingLeft: 24,
  paddingTop: 4,
  paddingBottom: 8,
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: '13px',
  color: vars.color.textTertiary,
  lineHeight: 1.6,
});

const pulseAnimation = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.3 },
});

export const pulseDot = style({
  width: 4,
  height: 4,
  borderRadius: '50%',
  background: vars.color.textTertiary,
  animation: `${pulseAnimation} 1.2s ease-in-out infinite`,
});

// ── Error ──

export const errorInline = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: 8,
  fontSize: '13px',
  color: vars.color.textError,
  lineHeight: 1.5,
  margin: '4px 0',
});

export const errorRetryLink = style({
  'fontSize': '12px',
  'color': vars.color.textError,
  'textDecoration': 'underline',
  'cursor': 'pointer',
  'background': 'none',
  'border': 'none',
  'padding': 0,
  'fontFamily': 'inherit',
  'whiteSpace': 'nowrap',
  ':hover': { opacity: 0.7 },
});

// ── Diff Summary ──

export const bubbleTool = style({
  alignSelf: 'flex-start',
  maxWidth: '86%',
  padding: '8px 12px',
  background: vars.color.fill,
  border: `1px solid ${vars.color.border}`,
  borderRadius: 8,
  fontSize: '12px',
  color: vars.color.textTertiary,
});

// ── Composer ──

export const composerDock = style({
  flexShrink: 0,
  padding: '12px 16px 16px',
  borderTop: `1px solid ${vars.color.border}`,
});

export const composerStatusLine = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: '12px',
  color: vars.color.textTertiary,
  paddingBottom: 8,
});

export const composerStatusDot = style({
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: '#22c55e',
  animation: `${pulseAnimation} 1.5s ease-in-out infinite`,
});

export const composerBox = style({
  display: 'flex',
  alignItems: 'flex-end',
  border: `1px solid ${vars.color.border}`,
  borderRadius: 12,
  padding: '10px 12px',
  background: vars.color.bg,
  transition: 'border-color 150ms ease',
  selectors: {
    '&:focus-within': { borderColor: vars.color.textQuaternary },
  },
});

export const composerTextArea = style({
  flex: 1,
  padding: 0,
  border: 'none',
  borderRadius: 0,
  background: 'transparent',
  boxShadow: 'none',
  fontSize: '14px',
  lineHeight: 1.5,
  color: vars.color.text,
  resize: 'none',
  outline: 'none',
  selectors: {
    '&:focus': { borderColor: 'transparent', boxShadow: 'none' },
    '&::placeholder': { color: vars.color.textTertiary },
  },
});

export const composerBottomBar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: 8,
});

export const composerSendButton = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 28,
  'height': 28,
  'flexShrink': 0,
  'border': 'none',
  'borderRadius': 8,
  'background': vars.color.text,
  'color': vars.color.bg,
  'cursor': 'pointer',
  'transition': 'opacity 150ms ease',
  'marginLeft': 8,
  ':hover': { opacity: 0.85 },
  ':disabled': {
    background: vars.color.fillTertiary,
    color: vars.color.textQuaternary,
    cursor: 'not-allowed',
  },
});

export const composerAbortButton = style({
  'display': 'inline-flex',
  'alignItems': 'center',
  'justifyContent': 'center',
  'width': 28,
  'height': 28,
  'flexShrink': 0,
  'border': `1px solid ${vars.color.textError}`,
  'borderRadius': 8,
  'background': vars.color.bg,
  'color': vars.color.textError,
  'cursor': 'pointer',
  'marginLeft': 8,
  'transition': 'background 150ms ease',
  ':hover': { opacity: 0.85 },
});

export const composerHint = style({
  fontSize: '11px',
  color: vars.color.textQuaternary,
});
```

Note: This references `vars.color.textError`. If `@haklex/rich-style-token` does not define `textError`, use a fallback approach in Task 7.

- [ ] **Step 2: Rewrite diff-review-bubble.css.ts**

Replace entire content of `packages/rich-agent-chat/src/components/diff-review-bubble.css.ts`:

```typescript
import { vars } from '@haklex/rich-style-token/styles';
import { style } from '@vanilla-extract/css';

export const diffReviewRoot = style({
  margin: '4px 0',
  border: `1px solid ${vars.color.border}`,
  borderRadius: 8,
  overflow: 'hidden',
  fontSize: '13px',
  flexShrink: 0,
});

export const diffReviewHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px',
  background: vars.color.fillQuaternary,
  borderBottom: `1px solid ${vars.color.border}`,
  fontSize: '12px',
  color: vars.color.textSecondary,
});

export const diffReviewActions = style({
  display: 'flex',
  gap: 6,
});

export const diffReviewActionBtn = style({
  'padding': '4px 12px',
  'border': `1px solid ${vars.color.border}`,
  'borderRadius': 6,
  'background': vars.color.bg,
  'color': vars.color.text,
  'fontSize': '12px',
  'cursor': 'pointer',
  'fontFamily': 'inherit',
  'transition': 'background 120ms ease',
  ':hover': {
    background: vars.color.fillTertiary,
  },
});

export const diffReviewAcceptBtn = style([
  diffReviewActionBtn,
  {
    'background': vars.color.text,
    'color': vars.color.bg,
    'borderColor': vars.color.text,
    ':hover': {
      opacity: '0.9',
    },
  },
]);

export const diffReviewRejectBtn = style([
  diffReviewActionBtn,
  {
    'color': vars.color.textError,
    'borderColor': vars.color.textError,
    ':hover': {
      background: vars.color.fillQuaternary,
    },
  },
]);

export const diffHunkRow = style({
  padding: '0 12px',
  lineHeight: 1.7,
  fontFamily: vars.typography.fontMono,
  fontSize: '12px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
});

export const diffHunkInsert = style({
  background: 'rgba(22, 163, 74, 0.08)',
  color: vars.color.text,
});

export const diffHunkDelete = style({
  background: 'rgba(220, 38, 38, 0.06)',
  color: vars.color.text,
  textDecoration: 'line-through',
  opacity: 0.7,
});

export const diffHunkEqual = style({
  color: vars.color.textTertiary,
});

export const diffStatusBadge = style({
  padding: '2px 8px',
  borderRadius: 999,
  fontSize: '12px',
  fontFamily: vars.typography.fontMono,
  background: vars.color.fillTertiary,
  border: `1px solid ${vars.color.border}`,
  color: vars.color.textSecondary,
});
```

- [ ] **Step 3: Commit**

```bash
git add packages/rich-agent-chat/src/styles.css.ts packages/rich-agent-chat/src/components/diff-review-bubble.css.ts
git commit -m "feat(rich-agent-chat): redesign all styles to shadcn/Vercel design"
```

---

## Task 7: Check and Handle `vars.color.textError`

**Files:**

- Check: `packages/rich-style-token/src/`

- [ ] **Step 1: Check if textError exists in style tokens**

Run: `grep -r 'textError' packages/rich-style-token/src/`

If `textError` does NOT exist, we need to either:

- (a) Add it to `@haklex/rich-style-token`, or
- (b) Use a CSS variable fallback in styles

If it does not exist, add a CSS custom property `--hk-color-text-error` to the token package's theme contract, with value `#dc2626` (light) / `#ef4444` (dark).

If adding to the token package is too invasive, replace all `vars.color.textError` references in Task 6 with the string `'var(--hk-color-text-error, #dc2626)'` as a safe fallback.

- [ ] **Step 2: Commit if changes were made**

```bash
git add packages/rich-style-token/ packages/rich-agent-chat/
git commit -m "feat(rich-style-token): add textError semantic color variable"
```

---

## Task 8: Update ThinkingChain & ToolCall Components

**Files:**

- Modify: `packages/rich-agent-chat/src/components/ThinkingChain.tsx`
- Modify: `packages/rich-agent-chat/src/components/ToolCall.tsx`
- Modify: `packages/rich-agent-chat/src/components/ToolCallGroup.tsx`

- [ ] **Step 1: Update ThinkingChain — replace bounce dots with pulse dots**

In `packages/rich-agent-chat/src/components/ThinkingChain.tsx`:

Replace the import of `bounceDot` with `pulseDot`:

```typescript
import {
  pulseDot,
  thinkingRow,
  thinkingSteps,
  toolCallChevron,
  toolCallDetail,
  toolCallDetailInner,
  toolCallGroupCounter,
  toolCallStatusIcon,
} from '../styles.css';
```

Replace the streaming dots section (lines 46-50):

```tsx
<span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
  <span className={pulseDot} />
  <span className={pulseDot} style={{ animationDelay: '0.2s' }} />
  <span className={pulseDot} style={{ animationDelay: '0.4s' }} />
</span>
```

Remove the skeleton loader section (lines 68-73) and replace with nothing (just show the steps, no skeleton when streaming).

- [ ] **Step 2: Update ToolCall — remove hardcoded colors**

In `packages/rich-agent-chat/src/components/ToolCall.tsx`:

Line 35: Replace `style={{ color: '#ef4444' }}` with `style={{ color: 'var(--hk-color-text-error, #dc2626)' }}`.

Lines 62-65: Replace the inline style block:

```tsx
<span
  className={toolCallName}
  style={item.status === 'running' ? { color: 'var(--hk-color-text)' } : undefined}
>
```

(Remove the error color override from toolName — the error status is already shown by the icon.)

- [ ] **Step 3: Update ToolCallGroup — remove hardcoded colors**

In `packages/rich-agent-chat/src/components/ToolCallGroup.tsx`:

Line 39: Replace `style={{ color: '#ef4444' }}` with `style={{ color: 'var(--hk-color-text-error, #dc2626)' }}`.

Line 72: Remove the inline style for running status (or keep using `var(--hk-color-text)`).

- [ ] **Step 4: Commit**

```bash
git add packages/rich-agent-chat/src/components/ThinkingChain.tsx packages/rich-agent-chat/src/components/ToolCall.tsx packages/rich-agent-chat/src/components/ToolCallGroup.tsx
git commit -m "refactor(rich-agent-chat): use semantic colors, pulse dots for thinking"
```

---

## Task 9: Update ChatInput to shadcn Style

**Files:**

- Modify: `packages/rich-agent-chat/src/ChatInput.tsx`

- [ ] **Step 1: Rewrite ChatInput layout**

Replace entire content of `packages/rich-agent-chat/src/ChatInput.tsx`:

```tsx
import { AutoResizeTextArea } from '@haklex/rich-editor-ui';
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
  const isAbortMode = Boolean(isRunning);

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
    <div className={css.composerDock}>
      {isRunning && statusLabel && (
        <div className={css.composerStatusLine}>
          <span className={css.composerStatusDot} />
          <span>{statusLabel}</span>
        </div>
      )}
      <div className={css.composerBox}>
        <AutoResizeTextArea
          className={css.composerTextArea}
          disabled={disabled}
          maxRows={10}
          minRows={1}
          placeholder="Message..."
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          aria-label={isAbortMode ? 'Stop' : 'Send'}
          className={isAbortMode ? css.composerAbortButton : css.composerSendButton}
          disabled={isAbortMode ? !onAbort : disabled || !trimmed}
          type="button"
          onClick={isAbortMode ? () => onAbort?.() : handleSend}
        >
          {isAbortMode ? (
            <Square fill="currentColor" size={14} strokeWidth={0} />
          ) : (
            <ArrowUp size={16} strokeWidth={2.5} />
          )}
        </button>
      </div>
      <div className={css.composerBottomBar}>
        <div>{modelSelector ?? <div />}</div>
        <span className={css.composerHint}>↵ Send · ⇧↵ Newline</span>
      </div>
    </div>
  );
}
```

Key changes from original:

- `Send` icon → `ArrowUp` icon (shadcn style)
- `Spinner` component → simple dot with pulse animation
- Textarea wrapped in `composerBox` div (bordered container)
- `minRows` 2 → 1
- Placeholder: "Message..." instead of conditional text
- Added hint text at bottom right

- [ ] **Step 2: Remove `@haklex/rich-editor-ui` Spinner import check**

The `Spinner` component is no longer imported. Verify `Spinner` is not used elsewhere in this package:

Run: `grep -r 'Spinner' packages/rich-agent-chat/src/`

Expected: No matches (only the old ChatInput used it).

- [ ] **Step 3: Commit**

```bash
git add packages/rich-agent-chat/src/ChatInput.tsx
git commit -m "feat(rich-agent-chat): redesign ChatInput to shadcn embedded input style"
```

---

## Task 10: Update Demo AgentPage

**Files:**

- Modify: `demo/src/pages/AgentPage.tsx`

- [ ] **Step 1: Update imports and provider creation**

In `demo/src/pages/AgentPage.tsx`, replace the imports of `createClaudeProvider`/`createOpenAIProvider` from `../providers/` with imports from `@haklex/rich-agent-core`:

```typescript
import { createDirectTransport, createProvider } from '@haklex/rich-agent-core';
```

Replace `ProviderConfig` and `SelectedModel` imports from `@haklex/rich-agent-chat` with the new types:

```typescript
import type { ProviderGroup, SelectedModel } from '@haklex/rich-agent-chat';
```

- [ ] **Step 2: Update provider creation logic**

Replace the section that creates `LLMProvider` (around lines 157-175 in original) with:

```typescript
const transport = useMemo(() => {
  if (!selectedModel || !providerConfig) return null;
  return createDirectTransport({
    apiKey: providerConfig.apiKey,
    baseUrl: providerConfig.baseUrl,
    providerType: providerConfig.type,
  });
}, [selectedModel, providerConfig]);

const provider = useMemo(() => {
  if (!transport || !selectedModel) return null;
  return createProvider({
    model: selectedModel.modelId,
    transport,
    providerType: selectedModel.providerType,
  });
}, [transport, selectedModel]);
```

- [ ] **Step 3: Build providerGroups from stored providers**

Add a memo that converts the stored `ProviderConfig[]` (localStorage format) to `ProviderGroup[]`:

```typescript
const providerGroups: ProviderGroup[] = useMemo(() => {
  return providers.map((p) => ({
    id: p.id,
    name: p.name,
    providerType: p.type,
    models: p.models.map((modelId) => ({
      id: modelId,
      displayName: modelId,
    })),
  }));
}, [providers]);
```

- [ ] **Step 4: Update ChatPanel props in JSX**

Replace the ChatPanel usage with new props:

```tsx
<ChatPanel
  providerGroups={providerGroups}
  selectedModel={selectedModel}
  store={agentStore}
  onAbort={handleAbort}
  onAcceptBatch={handleAcceptBatch}
  onRejectBatch={handleRejectBatch}
  onRetry={handleRetry}
  onSelectModel={handleSelectModel}
  onSend={handleSend}
/>
```

Remove `providers`, `onProvidersChange`, `onRetryToolCall` props.

- [ ] **Step 5: Update DirectToolBar import**

Replace:

```typescript
// DirectToolBar is no longer in ChatPanel, import from local if still needed
import { DirectToolBar } from '../components/DirectToolBar';
```

If the DirectToolBar was only used inside ChatPanel (which it was), it can now be added separately in the AgentPage layout if desired, or removed from the page entirely.

- [ ] **Step 6: Update handleSelectModel to include providerType**

The new `SelectedModel` includes `providerType`. Update the handler:

```typescript
function handleSelectModel(selected: SelectedModel) {
  saveSelectedModel(selected);
  setSelectedModel(selected);
}
```

The `SelectedModel` now carries `providerType`, so update `loadSelectedModel`/`saveSelectedModel` and the `ProviderConfig` localStorage schema to ensure `providerType` propagates.

- [ ] **Step 7: Verify demo builds and runs**

Run: `pnpm dev`
Expected: Demo starts, chat panel renders with new UI, model selector shows providers.

- [ ] **Step 8: Commit**

```bash
git add demo/src/pages/AgentPage.tsx demo/src/components/
git commit -m "refactor(demo): update AgentPage to use new provider API and ChatPanel props"
```

---

## Task 11: Remove Old Demo Provider Files

**Files:**

- Delete: `demo/src/providers/claude-provider.ts`
- Delete: `demo/src/providers/openai-provider.ts`

- [ ] **Step 1: Delete old provider files**

```bash
rm demo/src/providers/claude-provider.ts demo/src/providers/openai-provider.ts
```

Check if the `demo/src/providers/` directory has other files:

```bash
ls demo/src/providers/
```

If empty or only has an index, remove the directory.

- [ ] **Step 2: Remove any remaining imports of old providers**

Run: `grep -r 'providers/claude-provider\|providers/openai-provider' demo/src/`

Fix any remaining imports.

- [ ] **Step 3: Commit**

```bash
git add demo/src/providers/
git commit -m "chore(demo): remove old provider implementations, now in @haklex/rich-agent-core"
```

---

## Task 12: Build Verification & Lint

- [ ] **Step 1: Build all affected packages**

```bash
pnpm --filter @haklex/rich-agent-core build
pnpm --filter @haklex/rich-agent-chat build
```

Expected: Both build successfully.

- [ ] **Step 2: Lint changed files**

```bash
npx eslint packages/rich-agent-core/src/provider/
npx eslint packages/rich-agent-chat/src/
```

Fix any lint errors.

- [ ] **Step 3: Run demo**

```bash
pnpm dev
```

Verify: Chat panel renders, model selector works, messages display correctly, thinking/tool-call/diff-review bubbles render with new design.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: lint and build fixes for agent chat refactor"
```
