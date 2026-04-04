# Agent Chat Downstream Integration Design

## Overview

Integrate the AI agent chat system (`rich-agent-core`, `rich-agent-chat`, `rich-ext-ai-agent`) into downstream projects: **admin-vue3** (Vue 3 dashboard) and **mx-core** (NestJS backend).

The agent enables in-editor AI assistance: users chat with an LLM that can read/modify Lexical editor content (insert, replace, delete nodes) with diff review, scoped to article body only (no metadata).

## Architecture: Approach A — Core Thin Proxy

- **mx-core**: thin LLM proxy + conversation persistence. No agent logic on backend.
- **admin-vue3**: full React agent UI in single React root, LLM calls via core proxy.
- **haklex**: minimal changes (initialBubbles support in store).

## mx-core Changes

### 1. Chat Proxy Endpoint

New submodule: `modules/ai/ai-agent/`

```
POST /api/ai/agent/chat
Auth: @Auth() (admin login required)
```

**Request:**

```typescript
{
  model?: string
  providerId?: string
  messages: ChatMessage[]  // rich-agent-core ChatMessage format
  tools?: ToolSchema[]     // tool definitions from frontend
}
```

**Response:** SSE stream, unified event format:

```
event: text        → data: {"content": "..."}
event: thinking    → data: {"content": "..."}
event: tool_call   → data: {"id", "name", "arguments"}
event: done        → data: {}
event: error       → data: {"message": "..."}
```

**Implementation:**

- Resolve `providerId` → runtime via existing `AiService`
- Extend runtime interface: add `chatStream(options: ChatStreamOptions): AsyncIterable<LLMEvent>` method
  - Distinct from existing `generateTextStream` (plain text only)
  - Must support `tools` parameter and `tool_call`/`tool_result` message formats
- `AnthropicRuntime`: expose `messages.stream()` tools support
- `OpenAICompatibleRuntime`: expose function_calling/tools support
- Core only forwards — does not interpret tool call semantics

### 2. Conversation Persistence

**Schema:**

```typescript
// ai-agent-conversation.schema.ts
{
  refId: ObjectId         // article (post/note/page) ID
  refType: string         // 'post' | 'note' | 'page'
  title?: string          // optional conversation title
  messages: ChatMessage[] // full conversation record, JSON array
  model: string           // model ID used
  providerId: string      // provider ID used
  createdAt: Date
  updatedAt: Date
}
```

Core stores messages verbatim without parsing content.

**CRUD API:**

```
POST   /api/ai/agent/conversations              — create new conversation
GET    /api/ai/agent/conversations?refId=xx      — list by article (meta only, no messages body)
GET    /api/ai/agent/conversations/:id           — get single (full messages)
DELETE /api/ai/agent/conversations/:id           — delete
```

**Append endpoint:**

```
PATCH  /api/ai/agent/conversations/:id/messages
Body: { messages: ChatMessage[] }  // append one or more
```

**Persistence strategy:**

- Frontend appends messages at every stage of the agent loop:
  1. User sends message → append `user`
  2. Assistant text stream ends → append `assistant`
  3. Thinking block completes → append `thinking`
  4. Tool call issued → append `tool_call`
  5. Tool result returned → append `tool_result`
  6. Loop continues — each stage appends immediately
- One agent loop may produce N PATCH calls
- On page load, GET conversation by refId → restore store bubbles
- Single article can have multiple conversations, listed by updatedAt desc

## haklex Changes

### rich-agent-core

- `createAgentStore`: add optional `initialBubbles` parameter for conversation restore
- No other changes. `createProxyTransport` already sends `{ model, messages, tools }` to endpoint.

### rich-ext-ai-agent / rich-agent-chat

- No changes required.

## admin-vue3 Changes

### Single React Root — Editor + Chat Panel

Follow the same pattern as `demo/src/pages/AgentPage.tsx`. The existing `RichEditor` Vue bridge renders a single React root; expand it to include agent components.

**React component structure:**

```tsx
ShiroEditorWithAgent = (props) => {
  const store = useMemo(() => createAgentStore({ initialBubbles }), [])

  return (
    <div className="editor-agent-split">  {/* flex row */}
      <div className="editor-pane">       {/* flex: 1 */}
        <ShiroEditor ...>
          <ToolbarPlugin />
          <NestedDocPlugin />
          <AgentPanelPlugin provider={provider} store={store} />
          <DiffReviewOverlayPlugin store={store} />
          <AgentLoopCapture ... />
        </ShiroEditor>
      </div>
      {agentVisible && (
        <div className="chat-pane">       {/* fixed width ~400px */}
          <ChatPanel store={store} ... />
        </div>
      )}
    </div>
  )
}
```

**Vue bridge:** Same `createRoot` pattern as existing `RichEditor.tsx`. New props:

- `agentEnabled: boolean` — load agent packages (false = current behavior unchanged)
- `agentVisible: boolean` — toggle chat panel visibility (Vue button controls)

When `agentEnabled` is false, no agent code is loaded.

### LLM Provider via Core Proxy

```tsx
const transport = createProxyTransport({
  endpoint: `${API_URL}/api/ai/agent/chat`,
  headers: { Authorization: `Bearer ${token}` },
});
const provider = createProvider({ model, transport, providerType });
```

Model list fetched from `GET /api/ai/models` (existing admin AI config infrastructure).

### Conversation Sync

React component/hook inside `ShiroEditorWithAgent`:

- On mount: if articleId exists, `GET /api/ai/agent/conversations?refId=articleId`, restore latest conversation's messages as initialBubbles
- Subscribe to store: on each bubble change, `PATCH /api/ai/agent/conversations/:id/messages` to append new messages
- On unmount: unsubscribe

## Data Flow

```
User types in ChatPanel
  → store.addBubble(user) + PATCH append to core
  → AgentLoopCapture.run(message)
  → createProxyTransport → POST /api/ai/agent/chat (mx-core)
  → mx-core resolves provider → runtime.chatStream() → LLM API
  → SSE stream back to browser
  → agent-core executor processes chunks:
    → thinking bubble + PATCH append
    → assistant bubble + PATCH append
    → tool_call bubble + PATCH append
    → tool execution (insert/replace/delete node in Lexical)
    → tool_result bubble + PATCH append
    → loop continues if more tool calls
  → ReviewBatch created → DiffReviewOverlay shows inline diffs
  → User accept/reject → editor updated
```

## Scope Boundaries

- Agent operates on article body only (Lexical nodes). No metadata (title, slug, category, tags).
- LLM API keys stored in mx-core config only — never exposed to browser.
- mx-core does not execute agent logic or interpret tool calls.
- Conversation messages stored as-is; core does not parse or validate content.
