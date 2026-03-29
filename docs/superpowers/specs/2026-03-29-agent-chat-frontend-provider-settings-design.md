# Agent Chat Frontend Provider Settings

## Overview

Move LLM provider configuration from `.env` environment variables to a frontend settings UI. Remove hardcoded model lists and preset providers. Models are only available after configuring a provider and fetching its model list. All requests continue to go through the Vite dev proxy.

## Provider Scope

Two provider types:

- **Claude API** — Anthropic's native API format, default base URL `https://api.anthropic.com`
- **OpenAI Compatible** — Any OpenAI-compatible endpoint (OpenAI, DeepSeek, Ollama, Azure, etc.), user-provided base URL

## UI Changes

### ModelSelector Relocation

- Move from ChatPanel top bar to ChatInput bottom bar, left-aligned
- Layout: `[ModelSelector] [spacer] [Send/Abort]`
- Display current model name; show "No model" placeholder when unconfigured

### ModelSelector Popover

- **Upper section**: Model list grouped by provider (fetched, not hardcoded). Empty state shows "Configure a provider to get started"
- **Lower section**: Divider + "Provider Settings" entry (gear icon). Clicking opens SettingsModal

### SettingsModal (new component)

Left-right split layout:

**Left panel** — Provider list:
- Each entry shows provider name + type badge ("Claude API" / "OpenAI Compatible")
- Selected provider highlighted
- "Add Provider" button (dashed border) at bottom

**Right panel** — Configuration form for selected provider:
- Header: provider name + type badge
- Fields: API Key (password input), Base URL (text input)
- Actions: "Fetch Models" button, "Delete" button (danger)
- Below actions: Available Models tag list (populated after Fetch Models)

**Add Provider flow**:
1. Click "Add Provider"
2. Select type: Claude API or OpenAI Compatible
3. Form appears with defaults pre-filled (Claude: baseUrl = `https://api.anthropic.com`; OpenAI Compatible: baseUrl empty)
4. User fills API Key + Base URL, clicks Fetch Models

### ChatInput Changes

- Bottom bar layout: `[ModelSelector] [spacer] [Send/Abort]`
- Input textarea and send button disabled when no provider configured or no model selected

### ChatPanel Changes

- Remove top-bar ModelSelector rendering
- Add `providers`, `onProvidersChange` props for state propagation

### Empty State

When no providers configured:
- ModelSelector shows "No model" placeholder
- Popover model list area shows guidance text pointing to Provider Settings
- Chat input and send button disabled

## Proxy Changes

### `POST /api/chat` (modified)

- Remove `process.env.ANTHROPIC_API_KEY` / `OPENAI_API_KEY` reads
- Read from request headers: `x-api-key`, `x-base-url`, `x-provider-type` (`claude` | `openai-compatible`)
- `proxyClaude`: use `x-base-url` (default `https://api.anthropic.com`) + `x-api-key`
- `proxyOpenAI`: use `x-base-url` + `x-api-key`, append `/v1/chat/completions` to base URL

### `POST /api/models` (new)

- Read same three headers: `x-api-key`, `x-base-url`, `x-provider-type`
- Claude: `GET {baseUrl}/v1/models` with `x-api-key` header and `anthropic-version` header
- OpenAI Compatible: `GET {baseUrl}/v1/models` with `Authorization: Bearer {key}` header
- Response: `{ models: Array<{ id: string, name?: string }> }`

## Data Storage

All configuration stored in `localStorage` (demo environment, localhost only).

```ts
interface ProviderConfig {
  id: string           // crypto.randomUUID()
  type: 'claude' | 'openai-compatible'
  name: string         // user-defined, e.g. "Anthropic", "DeepSeek"
  apiKey: string
  baseUrl: string
  models: string[]     // cached after Fetch Models
}

// localStorage keys:
// 'agent-providers' → ProviderConfig[]
// 'agent-selected-model' → { providerId: string, modelId: string } | null
```

## Data Flow

1. Page load → read providers + selected model from localStorage
2. Settings Modal edits → write to localStorage, trigger state update
3. Fetch Models → `POST /api/models` via proxy → update provider's `models` field in localStorage
4. Select model → update `agent-selected-model`, rebuild provider instance
5. Send message → read apiKey/baseUrl/type from selected model's provider → attach as request headers (`x-api-key`, `x-base-url`, `x-provider-type`)

## Request Header Contract

All API requests from frontend to proxy carry:

| Header | Value | Required |
|--------|-------|----------|
| `x-api-key` | Provider's API key | Yes |
| `x-base-url` | Provider's base URL | Yes |
| `x-provider-type` | `claude` or `openai-compatible` | Yes |

## Components Affected

| Component | Package | Change |
|-----------|---------|--------|
| ModelSelector | `rich-agent-chat` | Relocate, remove hardcoded models, accept props |
| SettingsModal | `rich-agent-chat` | New component |
| ChatInput | `rich-agent-chat` | Layout change, disabled state |
| ChatPanel | `rich-agent-chat` | Remove top ModelSelector, add provider props |
| AgentPage | `demo` | Provider state management, localStorage read/write |
| proxy.ts | `demo/server` | Header-based auth, new `/api/models` endpoint |
| claude-provider.ts | `demo` | Attach headers to requests |
| openai-provider.ts | `demo` | Attach headers to requests |
