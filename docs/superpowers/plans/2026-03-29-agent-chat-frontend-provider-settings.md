# Agent Chat Frontend Provider Settings — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move LLM provider config from `.env` to frontend settings UI with dynamic model fetching.

**Architecture:** Provider configs stored in localStorage, passed to proxy via request headers. ModelSelector relocated to ChatInput bottom bar with Popover for model selection + Settings Modal entry. Proxy becomes stateless — reads API key/base URL/type from headers.

**Tech Stack:** React 19, @base-ui/react (Dialog, Popover), Vanilla Extract, Vite proxy middleware.

**Spec:** `docs/superpowers/specs/2026-03-29-agent-chat-frontend-provider-settings-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `packages/rich-agent-chat/src/types.ts` | Modify | Add `ProviderConfig` type |
| `packages/rich-agent-chat/src/components/ModelSelector.tsx` | Rewrite | Popover-based model selector with provider grouping + settings entry |
| `packages/rich-agent-chat/src/components/SettingsModal.tsx` | Create | Provider settings modal (list + form layout) |
| `packages/rich-agent-chat/src/components/model-selector.css.ts` | Create | Styles for new ModelSelector popover |
| `packages/rich-agent-chat/src/components/settings-modal.css.ts` | Create | Styles for SettingsModal |
| `packages/rich-agent-chat/src/ChatInput.tsx` | Modify | Add ModelSelector to bottom bar layout |
| `packages/rich-agent-chat/src/ChatPanel.tsx` | Modify | Remove top ModelSelector, add provider props |
| `packages/rich-agent-chat/src/styles.css.ts` | Modify | Update inputContainer for new layout |
| `packages/rich-agent-chat/src/index.ts` | Modify | Export new types |
| `demo/server/proxy.ts` | Modify | Header-based auth, add `/api/models` endpoint |
| `demo/src/providers/claude-provider.ts` | Modify | Accept + attach headers |
| `demo/src/providers/openai-provider.ts` | Modify | Accept + attach headers |
| `demo/src/pages/AgentPage.tsx` | Modify | Provider state management with localStorage |

---

### Task 1: Add ProviderConfig Type

**Files:**
- Modify: `packages/rich-agent-chat/src/types.ts`

- [ ] **Step 1: Add ProviderConfig interface to types.ts**

Append to the existing `types.ts`:

```typescript
export interface ProviderConfig {
  id: string
  type: 'claude' | 'openai-compatible'
  name: string
  apiKey: string
  baseUrl: string
  models: string[]
}

export interface SelectedModel {
  providerId: string
  modelId: string
}
```

- [ ] **Step 2: Export new types from index.ts**

In `packages/rich-agent-chat/src/index.ts`, add:

```typescript
export type { ChatBubble, ProviderConfig, SelectedModel } from './types';
```

Replace the existing `export type { ChatBubble } from './types';` line.

- [ ] **Step 3: Commit**

```bash
git add packages/rich-agent-chat/src/types.ts packages/rich-agent-chat/src/index.ts
git commit -m "$(cat <<'EOF'
feat(rich-agent-chat): add ProviderConfig and SelectedModel types
EOF
)"
```

---

### Task 2: Rewrite ModelSelector as Popover

**Files:**
- Rewrite: `packages/rich-agent-chat/src/components/ModelSelector.tsx`
- Create: `packages/rich-agent-chat/src/components/model-selector.css.ts`

- [ ] **Step 1: Create model-selector.css.ts**

```typescript
import { style } from '@vanilla-extract/css'
import { vars } from '@haklex/rich-style-token'

export const triggerButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '4px 10px',
  borderRadius: 6,
  background: vars.color.bgTertiary,
  border: `1px solid ${vars.color.border}`,
  fontSize: 12,
  color: vars.color.textSecondary,
  cursor: 'pointer',
  outline: 'none',
  fontFamily: 'inherit',
  lineHeight: 1.4,
  ':hover': {
    background: vars.color.bgQuaternary,
  },
})

export const popoverContent = style({
  width: 260,
  maxHeight: 360,
  overflowY: 'auto',
})

export const modelGroup = style({
  padding: '6px 8px',
})

export const modelGroupLabel = style({
  fontSize: 11,
  color: vars.color.textQuaternary,
  padding: '4px 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
})

export const modelItem = style({
  padding: '6px 8px',
  borderRadius: 6,
  fontSize: 13,
  color: vars.color.textSecondary,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  ':hover': {
    background: vars.color.bgTertiary,
  },
})

export const modelItemActive = style({
  background: vars.color.bgTertiary,
  color: vars.color.text,
})

export const settingsEntry = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 16px',
  borderTop: `1px solid ${vars.color.border}`,
  fontSize: 13,
  color: vars.color.textTertiary,
  cursor: 'pointer',
  ':hover': {
    color: vars.color.textSecondary,
  },
})

export const emptyState = style({
  padding: '16px',
  textAlign: 'center',
  fontSize: 13,
  color: vars.color.textQuaternary,
})

export const chevronIcon = style({
  color: vars.color.textQuaternary,
  flexShrink: 0,
})
```

- [ ] **Step 2: Rewrite ModelSelector.tsx**

```tsx
import { ChevronDown, Check, Settings } from 'lucide-react'
import { useState } from 'react'

import {
  Popover,
  PopoverPanel,
  PopoverTrigger,
} from '@haklex/rich-editor-ui'
import type { ProviderConfig, SelectedModel } from '../types'
import * as css from './model-selector.css'

interface ModelSelectorProps {
  providers: ProviderConfig[]
  selectedModel: SelectedModel | null
  onSelectModel: (selected: SelectedModel) => void
  onOpenSettings: () => void
}

export function ModelSelector({
  providers,
  selectedModel,
  onSelectModel,
  onOpenSettings,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false)

  const currentLabel = selectedModel
    ? selectedModel.modelId
    : 'No model'

  const providersWithModels = providers.filter((p) => p.models.length > 0)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={css.triggerButton}>
        {currentLabel}
        <ChevronDown size={14} className={css.chevronIcon} />
      </PopoverTrigger>
      <PopoverPanel side="top" sideOffset={8} align="start" className={css.popoverContent}>
        {providersWithModels.length === 0 ? (
          <div className={css.emptyState}>
            Configure a provider to get started
          </div>
        ) : (
          providersWithModels.map((provider) => (
            <div key={provider.id} className={css.modelGroup}>
              <div className={css.modelGroupLabel}>{provider.name}</div>
              {provider.models.map((modelId) => {
                const isActive =
                  selectedModel?.providerId === provider.id &&
                  selectedModel?.modelId === modelId
                return (
                  <div
                    key={modelId}
                    className={`${css.modelItem}${isActive ? ` ${css.modelItemActive}` : ''}`}
                    onClick={() => {
                      onSelectModel({ providerId: provider.id, modelId })
                      setOpen(false)
                    }}
                  >
                    {modelId}
                    {isActive && <Check size={14} />}
                  </div>
                )
              })}
            </div>
          ))
        )}
        <div
          className={css.settingsEntry}
          onClick={() => {
            setOpen(false)
            onOpenSettings()
          }}
        >
          <Settings size={14} />
          Provider Settings
        </div>
      </PopoverPanel>
    </Popover>
  )
}
```

- [ ] **Step 3: Run lint on changed files**

```bash
npx eslint packages/rich-agent-chat/src/components/ModelSelector.tsx packages/rich-agent-chat/src/components/model-selector.css.ts --fix
```

- [ ] **Step 4: Commit**

```bash
git add packages/rich-agent-chat/src/components/ModelSelector.tsx packages/rich-agent-chat/src/components/model-selector.css.ts
git commit -m "$(cat <<'EOF'
feat(rich-agent-chat): rewrite ModelSelector as Popover with provider grouping
EOF
)"
```

---

### Task 3: Create SettingsModal

**Files:**
- Create: `packages/rich-agent-chat/src/components/settings-modal.css.ts`
- Create: `packages/rich-agent-chat/src/components/SettingsModal.tsx`

- [ ] **Step 1: Create settings-modal.css.ts**

```typescript
import { style } from '@vanilla-extract/css'
import { vars } from '@haklex/rich-style-token'

export const modalBody = style({
  display: 'flex',
  height: 420,
  width: 580,
})

export const sidebar = style({
  width: 180,
  borderRight: `1px solid ${vars.color.border}`,
  padding: 12,
  flexShrink: 0,
  overflowY: 'auto',
})

export const sidebarLabel = style({
  fontSize: 11,
  color: vars.color.textQuaternary,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  padding: '0 4px',
  marginBottom: 8,
})

export const providerItem = style({
  padding: 8,
  borderRadius: 6,
  fontSize: 13,
  cursor: 'pointer',
  marginBottom: 4,
  ':hover': {
    background: vars.color.bgTertiary,
  },
})

export const providerItemActive = style({
  background: vars.color.bgTertiary,
  border: `1px solid ${vars.color.border}`,
})

export const providerItemName = style({
  color: vars.color.text,
})

export const providerItemType = style({
  fontSize: 11,
  color: vars.color.textQuaternary,
  marginTop: 2,
})

export const addButton = style({
  padding: 8,
  borderRadius: 6,
  marginTop: 8,
  border: `1px dashed ${vars.color.border}`,
  textAlign: 'center',
  fontSize: 12,
  color: vars.color.textQuaternary,
  cursor: 'pointer',
  ':hover': {
    borderColor: vars.color.textTertiary,
    color: vars.color.textTertiary,
  },
})

export const formPane = style({
  flex: 1,
  padding: 16,
  overflowY: 'auto',
})

export const formHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 16,
})

export const formTitle = style({
  fontSize: 15,
  fontWeight: 600,
  color: vars.color.text,
})

export const typeBadge = style({
  fontSize: 11,
  padding: '3px 8px',
  borderRadius: 4,
  background: vars.color.bgTertiary,
  color: vars.color.textTertiary,
})

export const fieldGroup = style({
  marginBottom: 14,
})

export const fieldLabel = style({
  fontSize: 12,
  color: vars.color.textTertiary,
  marginBottom: 4,
})

export const fieldInput = style({
  width: '100%',
  padding: '7px 10px',
  background: vars.color.bgSecondary,
  border: `1px solid ${vars.color.border}`,
  borderRadius: 6,
  fontSize: 13,
  color: vars.color.text,
  outline: 'none',
  fontFamily: 'monospace',
  boxSizing: 'border-box',
  ':focus': {
    borderColor: vars.color.textTertiary,
  },
})

export const actions = style({
  display: 'flex',
  gap: 8,
  marginTop: 20,
})

export const actionButton = style({
  padding: '6px 14px',
  background: vars.color.bgTertiary,
  borderRadius: 6,
  fontSize: 12,
  color: vars.color.textSecondary,
  cursor: 'pointer',
  border: 'none',
  flex: 1,
  textAlign: 'center',
  ':hover': {
    background: vars.color.bgQuaternary,
  },
})

export const deleteButton = style({
  padding: '6px 14px',
  background: 'rgb(239, 68, 68)',
  borderRadius: 6,
  fontSize: 12,
  color: '#fff',
  cursor: 'pointer',
  border: 'none',
  ':hover': {
    background: 'rgb(220, 38, 38)',
  },
})

export const modelTags = style({
  marginTop: 16,
  borderTop: `1px solid ${vars.color.border}`,
  paddingTop: 12,
})

export const modelTagsLabel = style({
  fontSize: 11,
  color: vars.color.textQuaternary,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  marginBottom: 6,
})

export const modelTagList = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 4,
})

export const modelTag = style({
  padding: '3px 8px',
  background: vars.color.bgTertiary,
  borderRadius: 4,
  fontSize: 11,
  color: vars.color.textSecondary,
})

export const typeSelector = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: 16,
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
})

export const typeSelectorTitle = style({
  fontSize: 14,
  color: vars.color.text,
  marginBottom: 8,
})

export const typeOption = style({
  padding: '12px 16px',
  borderRadius: 8,
  border: `1px solid ${vars.color.border}`,
  cursor: 'pointer',
  width: '100%',
  maxWidth: 260,
  ':hover': {
    background: vars.color.bgTertiary,
    borderColor: vars.color.textTertiary,
  },
})

export const typeOptionName = style({
  fontSize: 14,
  fontWeight: 600,
  color: vars.color.text,
  marginBottom: 2,
})

export const typeOptionDesc = style({
  fontSize: 12,
  color: vars.color.textQuaternary,
})

export const emptyForm = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  fontSize: 13,
  color: vars.color.textQuaternary,
})

export const fetchingText = style({
  fontSize: 12,
  color: vars.color.textQuaternary,
  marginTop: 8,
})
```

- [ ] **Step 2: Create SettingsModal.tsx**

```tsx
import { useState } from 'react'

import {
  Dialog,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from '@haklex/rich-editor-ui'
import type { ProviderConfig } from '../types'
import * as css from './settings-modal.css'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  providers: ProviderConfig[]
  onProvidersChange: (providers: ProviderConfig[]) => void
}

const TYPE_LABELS: Record<ProviderConfig['type'], string> = {
  claude: 'Claude API',
  'openai-compatible': 'OpenAI Compatible',
}

const DEFAULT_URLS: Record<ProviderConfig['type'], string> = {
  claude: 'https://api.anthropic.com',
  'openai-compatible': '',
}

export function SettingsModal({
  open,
  onOpenChange,
  providers,
  onProvidersChange,
}: SettingsModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    providers[0]?.id ?? null,
  )
  const [addingType, setAddingType] = useState(false)
  const [fetching, setFetching] = useState(false)

  const selectedProvider = providers.find((p) => p.id === selectedId) ?? null

  function updateProvider(id: string, patch: Partial<ProviderConfig>) {
    onProvidersChange(
      providers.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    )
  }

  function addProvider(type: ProviderConfig['type']) {
    const newProvider: ProviderConfig = {
      id: crypto.randomUUID(),
      type,
      name: type === 'claude' ? 'Anthropic' : 'New Provider',
      apiKey: '',
      baseUrl: DEFAULT_URLS[type],
      models: [],
    }
    onProvidersChange([...providers, newProvider])
    setSelectedId(newProvider.id)
    setAddingType(false)
  }

  function deleteProvider(id: string) {
    const next = providers.filter((p) => p.id !== id)
    onProvidersChange(next)
    setSelectedId(next[0]?.id ?? null)
  }

  async function fetchModels(provider: ProviderConfig) {
    setFetching(true)
    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': provider.apiKey,
          'x-base-url': provider.baseUrl,
          'x-provider-type': provider.type,
        },
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
      }
      const data = (await res.json()) as { models: Array<{ id: string }> }
      updateProvider(provider.id, {
        models: data.models.map((m) => m.id),
      })
    } catch (err) {
      console.error('Failed to fetch models:', err)
    } finally {
      setFetching(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup showCloseButton>
        <DialogTitle>Provider Settings</DialogTitle>
        <div className={css.modalBody}>
          {/* Left: provider list */}
          <div className={css.sidebar}>
            <div className={css.sidebarLabel}>Providers</div>
            {providers.map((p) => (
              <div
                key={p.id}
                className={`${css.providerItem}${p.id === selectedId ? ` ${css.providerItemActive}` : ''}`}
                onClick={() => {
                  setSelectedId(p.id)
                  setAddingType(false)
                }}
              >
                <div className={css.providerItemName}>{p.name}</div>
                <div className={css.providerItemType}>
                  {TYPE_LABELS[p.type]}
                </div>
              </div>
            ))}
            <div
              className={css.addButton}
              onClick={() => {
                setSelectedId(null)
                setAddingType(true)
              }}
            >
              + Add Provider
            </div>
          </div>

          {/* Right: form or type selector */}
          <div className={css.formPane}>
            {addingType ? (
              <div className={css.typeSelector}>
                <div className={css.typeSelectorTitle}>
                  Choose Provider Type
                </div>
                <div
                  className={css.typeOption}
                  onClick={() => addProvider('claude')}
                >
                  <div className={css.typeOptionName}>Claude API</div>
                  <div className={css.typeOptionDesc}>
                    Anthropic native API
                  </div>
                </div>
                <div
                  className={css.typeOption}
                  onClick={() => addProvider('openai-compatible')}
                >
                  <div className={css.typeOptionName}>OpenAI Compatible</div>
                  <div className={css.typeOptionDesc}>
                    OpenAI, DeepSeek, Ollama, etc.
                  </div>
                </div>
              </div>
            ) : selectedProvider ? (
              <>
                <div className={css.formHeader}>
                  <input
                    className={css.formTitle}
                    value={selectedProvider.name}
                    onChange={(e) =>
                      updateProvider(selectedProvider.id, {
                        name: e.target.value,
                      })
                    }
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      padding: 0,
                      width: '100%',
                    }}
                  />
                  <span className={css.typeBadge}>
                    {TYPE_LABELS[selectedProvider.type]}
                  </span>
                </div>
                <div className={css.fieldGroup}>
                  <div className={css.fieldLabel}>API Key</div>
                  <input
                    className={css.fieldInput}
                    type="password"
                    value={selectedProvider.apiKey}
                    placeholder="Enter API key"
                    onChange={(e) =>
                      updateProvider(selectedProvider.id, {
                        apiKey: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={css.fieldGroup}>
                  <div className={css.fieldLabel}>Base URL</div>
                  <input
                    className={css.fieldInput}
                    value={selectedProvider.baseUrl}
                    placeholder="https://api.example.com"
                    onChange={(e) =>
                      updateProvider(selectedProvider.id, {
                        baseUrl: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={css.actions}>
                  <button
                    className={css.actionButton}
                    disabled={!selectedProvider.apiKey || !selectedProvider.baseUrl || fetching}
                    onClick={() => fetchModels(selectedProvider)}
                  >
                    {fetching ? 'Fetching...' : 'Fetch Models'}
                  </button>
                  <button
                    className={css.deleteButton}
                    onClick={() => deleteProvider(selectedProvider.id)}
                  >
                    Delete
                  </button>
                </div>
                {selectedProvider.models.length > 0 && (
                  <div className={css.modelTags}>
                    <div className={css.modelTagsLabel}>
                      Available Models
                    </div>
                    <div className={css.modelTagList}>
                      {selectedProvider.models.map((m) => (
                        <span key={m} className={css.modelTag}>
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={css.emptyForm}>
                Select a provider or add a new one
              </div>
            )}
          </div>
        </div>
      </DialogPopup>
    </Dialog>
  )
}
```

- [ ] **Step 3: Run lint on new files**

```bash
npx eslint packages/rich-agent-chat/src/components/SettingsModal.tsx packages/rich-agent-chat/src/components/settings-modal.css.ts --fix
```

- [ ] **Step 4: Commit**

```bash
git add packages/rich-agent-chat/src/components/SettingsModal.tsx packages/rich-agent-chat/src/components/settings-modal.css.ts
git commit -m "$(cat <<'EOF'
feat(rich-agent-chat): add SettingsModal for provider configuration
EOF
)"
```

---

### Task 4: Update ChatInput Layout

**Files:**
- Modify: `packages/rich-agent-chat/src/ChatInput.tsx`
- Modify: `packages/rich-agent-chat/src/styles.css.ts`

- [ ] **Step 1: Update inputContainer style in styles.css.ts**

Replace the existing `inputContainer` style (lines 59-65) with:

```typescript
export const inputContainer = style({
  borderTop: `1px solid ${vars.color.border}`,
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
})

export const inputTextArea = style({
  padding: '10px 12px',
})

export const inputBottomBar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '6px 8px',
})
```

- [ ] **Step 2: Update ChatInput props and layout**

Rewrite `ChatInput.tsx` to accept a `modelSelector` slot:

```tsx
import { ArrowUp, Square } from 'lucide-react'
import { type ReactNode, useRef, useState } from 'react'

import { ActionButton, AutoResizeTextArea } from '@haklex/rich-editor-ui'
import * as css from '../styles.css'

interface ChatInputProps {
  disabled?: boolean
  isRunning?: boolean
  modelSelector?: ReactNode
  onAbort?: () => void
  onSend: (message: string) => void
}

export function ChatInput({
  disabled,
  isRunning,
  modelSelector,
  onAbort,
  onSend,
}: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSend() {
    const trimmed = input.trim()
    if (!trimmed) return
    onSend(trimmed)
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && !isRunning) handleSend()
    }
  }

  return (
    <div className={css.inputContainer}>
      <AutoResizeTextArea
        ref={textareaRef}
        className={css.inputTextArea}
        disabled={disabled}
        maxRows={6}
        placeholder="Ask AI to edit..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className={css.inputBottomBar}>
        {modelSelector ?? <div />}
        {isRunning ? (
          <ActionButton size="sm" onClick={onAbort}>
            <Square size={16} />
          </ActionButton>
        ) : (
          <ActionButton
            disabled={disabled || !input.trim()}
            size="sm"
            onClick={handleSend}
          >
            <ArrowUp size={16} />
          </ActionButton>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Lint changed files**

```bash
npx eslint packages/rich-agent-chat/src/ChatInput.tsx packages/rich-agent-chat/src/styles.css.ts --fix
```

- [ ] **Step 4: Commit**

```bash
git add packages/rich-agent-chat/src/ChatInput.tsx packages/rich-agent-chat/src/styles.css.ts
git commit -m "$(cat <<'EOF'
feat(rich-agent-chat): update ChatInput layout with model selector slot
EOF
)"
```

---

### Task 5: Update ChatPanel Props

**Files:**
- Modify: `packages/rich-agent-chat/src/ChatPanel.tsx`
- Modify: `packages/rich-agent-chat/src/index.ts`

- [ ] **Step 1: Update ChatPanel to accept provider props and pass ModelSelector to ChatInput**

```tsx
import { useState, useCallback } from 'react'

import type { AgentStore } from '@haklex/rich-agent-core'
import { ModelSelector } from './components/ModelSelector'
import { SettingsModal } from './components/SettingsModal'
import { ChatInput } from './ChatInput'
import { ChatMessageList } from './ChatMessageList'
import { StatusBar } from './components/StatusBar'
import type { ProviderConfig, SelectedModel } from './types'
import * as css from './styles.css'

interface ChatPanelProps {
  onAbort?: () => void
  onRetry?: () => void
  onSend?: (message: string) => void
  providers: ProviderConfig[]
  onProvidersChange: (providers: ProviderConfig[]) => void
  selectedModel: SelectedModel | null
  onSelectModel: (selected: SelectedModel) => void
  store: AgentStore
}

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
  const { bubbles, status } = store.getState()
  store.subscribe(() => {})

  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleSend = useCallback(
    (message: string) => {
      store.dispatch({ type: 'add_bubble', bubble: { type: 'user', content: message } })
      onSend?.(message)
    },
    [onSend, store],
  )

  const isRunning = status !== 'idle' && status !== 'done'
  const hasModel = selectedModel !== null

  return (
    <div className={css.chatPanel}>
      <ChatMessageList bubbles={bubbles} onRetry={onRetry} />
      {isRunning && <StatusBar status={status} />}
      <ChatInput
        disabled={!hasModel}
        isRunning={isRunning}
        modelSelector={
          <ModelSelector
            providers={providers}
            selectedModel={selectedModel}
            onSelectModel={onSelectModel}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        }
        onAbort={onAbort}
        onSend={handleSend}
      />
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        providers={providers}
        onProvidersChange={onProvidersChange}
      />
    </div>
  )
}
```

- [ ] **Step 2: Update index.ts exports**

Remove the old `getProviderFromModel` and `ModelSelector` exports. Update to:

```typescript
export { ChatPanel } from './ChatPanel'
export { StatusBar } from './components/StatusBar'
export { AgentStoreProvider, useAgentStore } from './context'
export type { ChatBubble, ProviderConfig, SelectedModel } from './types'
```

- [ ] **Step 3: Lint changed files**

```bash
npx eslint packages/rich-agent-chat/src/ChatPanel.tsx packages/rich-agent-chat/src/index.ts --fix
```

- [ ] **Step 4: Commit**

```bash
git add packages/rich-agent-chat/src/ChatPanel.tsx packages/rich-agent-chat/src/index.ts
git commit -m "$(cat <<'EOF'
feat(rich-agent-chat): update ChatPanel with provider props and SettingsModal
EOF
)"
```

---

### Task 6: Update Proxy — Header-Based Auth + /api/models

**Files:**
- Modify: `demo/server/proxy.ts`

- [ ] **Step 1: Add header extraction helper and /api/models endpoint**

At the top of `proxy.ts`, add a helper to extract provider headers:

```typescript
function extractProviderHeaders(req: any): {
  apiKey: string
  baseUrl: string
  providerType: 'claude' | 'openai-compatible'
} {
  const apiKey = req.headers['x-api-key'] as string
  const baseUrl = req.headers['x-base-url'] as string
  const providerType = req.headers['x-provider-type'] as 'claude' | 'openai-compatible'
  return { apiKey, baseUrl, providerType }
}
```

- [ ] **Step 2: Modify existing /api/chat handler**

Replace the provider routing logic (that reads from body.provider and process.env) to use headers:

```typescript
// In the /api/chat handler, replace provider detection:
const { apiKey, baseUrl, providerType } = extractProviderHeaders(req)

if (!apiKey) {
  res.writeHead(400, { 'Content-Type': 'text/plain' })
  res.end('Missing x-api-key header')
  return
}

if (providerType === 'claude') {
  await proxyClaude(body, res, apiKey, baseUrl || 'https://api.anthropic.com')
} else {
  await proxyOpenAI(body, res, apiKey, baseUrl)
}
```

Update `proxyClaude` and `proxyOpenAI` signatures to accept `apiKey` and `baseUrl` parameters instead of reading from `process.env`. For `proxyClaude`:

```typescript
async function proxyClaude(
  body: any,
  res: any,
  apiKey: string,
  baseUrl: string,
) {
  // ... existing message transform logic stays the same ...

  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'interleaved-thinking-2025-05-14',
    },
    body: JSON.stringify(claudeBody),
  })
  // ... stream logic stays the same ...
}
```

For `proxyOpenAI`:

```typescript
async function proxyOpenAI(
  body: any,
  res: any,
  apiKey: string,
  baseUrl: string,
) {
  // ... existing message transform logic stays the same ...

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(openaiBody),
  })
  // ... stream logic stays the same ...
}
```

- [ ] **Step 3: Add /api/models endpoint**

In the middleware, add a new route handler before the existing `/api/chat`:

```typescript
if (req.url === '/api/models' && req.method === 'POST') {
  const { apiKey, baseUrl, providerType } = extractProviderHeaders(req)

  if (!apiKey || !baseUrl) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Missing x-api-key or x-base-url header' }))
    return
  }

  try {
    let response: Response
    if (providerType === 'claude') {
      response = await fetch(`${baseUrl}/v1/models`, {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
      })
    } else {
      response = await fetch(`${baseUrl}/v1/models`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })
    }

    if (!response.ok) {
      res.writeHead(response.status, { 'Content-Type': 'text/plain' })
      res.end(await response.text())
      return
    }

    const data = await response.json()

    // Normalize response: Claude returns { data: [...] }, OpenAI returns { data: [...] }
    const models = (data.data || []).map((m: any) => ({
      id: m.id,
      name: m.display_name || m.id,
    }))

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ models }))
  } catch (err: any) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end(err.message || 'Failed to fetch models')
  }
  return
}
```

- [ ] **Step 4: Lint proxy.ts**

```bash
npx eslint demo/server/proxy.ts --fix
```

- [ ] **Step 5: Commit**

```bash
git add demo/server/proxy.ts
git commit -m "$(cat <<'EOF'
feat(demo): proxy reads auth from headers, add /api/models endpoint
EOF
)"
```

---

### Task 7: Update Provider Factories to Attach Headers

**Files:**
- Modify: `demo/src/providers/claude-provider.ts`
- Modify: `demo/src/providers/openai-provider.ts`

- [ ] **Step 1: Update claude-provider.ts**

Change factory signature to accept config and attach headers to fetch:

```typescript
import type { LLMProvider, ChatMessage, ToolSchema, LLMChunk } from '@haklex/rich-agent-core'

interface ProviderOptions {
  model: string
  apiKey: string
  baseUrl: string
}

export function createClaudeProvider({ model, apiKey, baseUrl }: ProviderOptions): LLMProvider {
  return {
    async *chat(messages: ChatMessage[], tools?: ToolSchema[]): AsyncIterable<LLMChunk> {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'x-base-url': baseUrl,
          'x-provider-type': 'claude',
        },
        body: JSON.stringify({ model, messages, tools }),
      })

      // ... rest of SSE parsing logic stays exactly the same ...
    },
  }
}
```

- [ ] **Step 2: Update openai-provider.ts**

Same pattern:

```typescript
import type { LLMProvider, ChatMessage, ToolSchema, LLMChunk } from '@haklex/rich-agent-core'

interface ProviderOptions {
  model: string
  apiKey: string
  baseUrl: string
}

export function createOpenAIProvider({ model, apiKey, baseUrl }: ProviderOptions): LLMProvider {
  return {
    async *chat(messages: ChatMessage[], tools?: ToolSchema[]): AsyncIterable<LLMChunk> {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'x-base-url': baseUrl,
          'x-provider-type': 'openai-compatible',
        },
        body: JSON.stringify({ model, messages, tools }),
      })

      // ... rest of SSE parsing logic stays exactly the same ...
    },
  }
}
```

- [ ] **Step 3: Lint both files**

```bash
npx eslint demo/src/providers/claude-provider.ts demo/src/providers/openai-provider.ts --fix
```

- [ ] **Step 4: Commit**

```bash
git add demo/src/providers/claude-provider.ts demo/src/providers/openai-provider.ts
git commit -m "$(cat <<'EOF'
feat(demo): provider factories accept config, attach auth headers
EOF
)"
```

---

### Task 8: Update AgentPage — localStorage State Management

**Files:**
- Modify: `demo/src/pages/AgentPage.tsx`

- [ ] **Step 1: Add localStorage helpers at top of file**

```typescript
import type { ProviderConfig, SelectedModel } from '@haklex/rich-agent-chat'

const STORAGE_KEY_PROVIDERS = 'agent-providers'
const STORAGE_KEY_MODEL = 'agent-selected-model'

function loadProviders(): ProviderConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROVIDERS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveProviders(providers: ProviderConfig[]) {
  localStorage.setItem(STORAGE_KEY_PROVIDERS, JSON.stringify(providers))
}

function loadSelectedModel(): SelectedModel | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MODEL)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSelectedModel(model: SelectedModel | null) {
  if (model) {
    localStorage.setItem(STORAGE_KEY_MODEL, JSON.stringify(model))
  } else {
    localStorage.removeItem(STORAGE_KEY_MODEL)
  }
}
```

- [ ] **Step 2: Update AgentEditorWithChat to use provider state**

Replace the model state and createProvider logic:

```typescript
function AgentEditorWithChat({ store }: { store: AgentStore }) {
  const [providers, setProviders] = useState<ProviderConfig[]>(loadProviders)
  const [selectedModel, setSelectedModel] = useState<SelectedModel | null>(loadSelectedModel)

  const providerRef = useRef<LLMProvider | null>(null)
  const loopRef = useRef<ReturnType<typeof useAgentLoop> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Rebuild provider when selection changes
  useEffect(() => {
    if (!selectedModel) {
      providerRef.current = null
      return
    }
    const providerConfig = providers.find((p) => p.id === selectedModel.providerId)
    if (!providerConfig) {
      providerRef.current = null
      return
    }
    const opts = {
      model: selectedModel.modelId,
      apiKey: providerConfig.apiKey,
      baseUrl: providerConfig.baseUrl,
    }
    providerRef.current =
      providerConfig.type === 'claude'
        ? createClaudeProvider(opts)
        : createOpenAIProvider(opts)
  }, [selectedModel, providers])

  function handleProvidersChange(next: ProviderConfig[]) {
    setProviders(next)
    saveProviders(next)
  }

  function handleSelectModel(selected: SelectedModel) {
    setSelectedModel(selected)
    saveSelectedModel(selected)
  }

  // ... handleSend, handleAbort, handleRetry stay the same
  // but remove old model state and handleModelChange

  return (
    <div className="agent-split">
      <div className="agent-pane-editor">
        {/* ... editor stays the same ... */}
      </div>
      <div className="agent-pane-chat">
        <ChatPanel
          providers={providers}
          onProvidersChange={handleProvidersChange}
          selectedModel={selectedModel}
          onSelectModel={handleSelectModel}
          onSend={handleSend}
          onAbort={handleAbort}
          onRetry={handleRetry}
          store={store}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Remove old imports**

Remove `getProviderFromModel` import from `@haklex/rich-agent-chat`. Remove `ModelSelector` import if present. Update `createClaudeProvider` and `createOpenAIProvider` calls to use the new object signature.

- [ ] **Step 4: Lint AgentPage.tsx**

```bash
npx eslint demo/src/pages/AgentPage.tsx --fix
```

- [ ] **Step 5: Commit**

```bash
git add demo/src/pages/AgentPage.tsx
git commit -m "$(cat <<'EOF'
feat(demo): AgentPage uses localStorage provider config, removes hardcoded models
EOF
)"
```

---

### Task 9: Verify and Clean Up

- [ ] **Step 1: Typecheck the affected packages**

```bash
npx tsc --noEmit -p packages/rich-agent-chat/tsconfig.json
npx tsc --noEmit -p demo/tsconfig.json
```

Fix any type errors that surface.

- [ ] **Step 2: Run dev server and verify manually**

```bash
pnpm dev
```

Verify:
- ModelSelector appears in ChatInput bottom bar
- Clicking shows Popover with empty model list + "Configure a provider" message
- Clicking "Provider Settings" opens modal
- Can add a Claude provider, enter API key, click Fetch Models
- Models appear in the modal and in the popover
- Can select a model and send a message
- Input is disabled when no model selected

- [ ] **Step 3: Remove .env.example reference to API keys if present**

Check if `demo/.env.example` references `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`. If so, remove those lines since keys are now managed in the frontend.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore(demo): clean up env references, verify provider settings flow
EOF
)"
```
