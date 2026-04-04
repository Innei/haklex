# Agent Chat Downstream Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the AI agent chat system into admin-vue3 (via mx-core proxy) so editors can use in-editor AI assistance when writing articles.

**Architecture:** mx-core provides a transparent SSE pipe-through proxy (transforms ChatMessage format → provider-specific format, pipes raw LLM SSE back) plus conversation CRUD. admin-vue3 renders a single React root with ShiroEditor + ChatPanel side-by-side, connected via shared zustand store. haklex gets minimal change (initialBubbles support).

**Tech Stack:** NestJS/Fastify (mx-core), React 19 / Lexical / Zustand (haklex + admin), TypeGoose/MongoDB (persistence), Zod (DTOs)

---

## Phase 1: mx-core — Chat Proxy + Conversation CRUD

All files in repo: `/Users/innei/git/innei-repo/mx-core`

### Task 1: Add Collection Name Constant

**Files:**

- Modify: `apps/core/src/constants/db.constant.ts`

- [ ] **Step 1: Add AI agent conversation collection name**

Add after the existing `AI_SUMMARY_COLLECTION_NAME`:

```typescript
export const AI_AGENT_CONVERSATION_COLLECTION_NAME = 'ai_agent_conversations';
```

- [ ] **Step 2: Commit**

```bash
git add apps/core/src/constants/db.constant.ts
git commit -m "feat(ai): add agent conversation collection name constant"
```

---

### Task 2: Create Conversation Model

**Files:**

- Create: `apps/core/src/modules/ai/ai-agent/ai-agent-conversation.model.ts`

- [ ] **Step 1: Create the model file**

```typescript
import { index, modelOptions, prop } from '@typegoose/typegoose';
import mongoose from 'mongoose';

import { AI_AGENT_CONVERSATION_COLLECTION_NAME } from '~/constants/db.constant';
import { BaseModel } from '~/shared/model/base.model';

@modelOptions({
  options: {
    customName: AI_AGENT_CONVERSATION_COLLECTION_NAME,
  },
  schemaOptions: {
    timestamps: {
      createdAt: 'created',
      updatedAt: 'updated',
    },
  },
})
@index({ refId: 1, refType: 1 })
@index({ updated: -1 })
export class AIAgentConversationModel extends BaseModel {
  @prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  refId: string;

  @prop({ required: true })
  refType: string;

  @prop()
  title?: string;

  /**
   * Full conversation messages stored as JSON.
   * Uses rich-agent-core ChatMessage format verbatim.
   */
  @prop({ required: true, type: () => [mongoose.Schema.Types.Mixed] })
  messages: Record<string, unknown>[];

  @prop({ required: true })
  model: string;

  @prop({ required: true })
  providerId: string;

  updated?: Date;
}
```

- [ ] **Step 2: Register model in database.models.ts**

In `apps/core/src/processors/database/database.models.ts`, add the import and model to the array:

```typescript
import { AIAgentConversationModel } from '~/modules/ai/ai-agent/ai-agent-conversation.model';
```

Add `AIAgentConversationModel` to the `databaseModels` array.

- [ ] **Step 3: Commit**

```bash
git add apps/core/src/modules/ai/ai-agent/ai-agent-conversation.model.ts apps/core/src/processors/database/database.models.ts apps/core/src/constants/db.constant.ts
git commit -m "feat(ai): add AIAgentConversation model"
```

---

### Task 3: Create Conversation DTOs

**Files:**

- Create: `apps/core/src/modules/ai/ai-agent/ai-agent.schema.ts`

- [ ] **Step 1: Create the schema/DTO file**

```typescript
import { zMongoId } from '~/common/zod';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// --- Conversation CRUD ---

export const CreateConversationSchema = z.object({
  refId: zMongoId,
  refType: z.enum(['post', 'note', 'page']),
  title: z.string().optional(),
  messages: z.array(z.record(z.unknown())).default([]),
  model: z.string().min(1),
  providerId: z.string().min(1),
});
export class CreateConversationDto extends createZodDto(CreateConversationSchema) {}

export const AppendMessagesSchema = z.object({
  messages: z.array(z.record(z.unknown())).min(1),
});
export class AppendMessagesDto extends createZodDto(AppendMessagesSchema) {}

export const ListConversationsQuerySchema = z.object({
  refId: zMongoId,
});
export class ListConversationsQueryDto extends createZodDto(ListConversationsQuerySchema) {}

// --- Chat Proxy ---

export const ChatProxySchema = z.object({
  model: z.string().min(1),
  providerId: z.string().min(1),
  messages: z.array(z.record(z.unknown())),
  tools: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        parameters: z.record(z.unknown()),
      }),
    )
    .optional(),
});
export class ChatProxyDto extends createZodDto(ChatProxySchema) {}
```

- [ ] **Step 2: Commit**

```bash
git add apps/core/src/modules/ai/ai-agent/ai-agent.schema.ts
git commit -m "feat(ai): add agent conversation and chat proxy DTOs"
```

---

### Task 4: Create Chat Proxy Service

The proxy transforms `ChatMessage[]` (agent-core format) to provider-specific format, makes a raw streaming fetch to the LLM API, and returns the raw `Response` for pipe-through.

**Files:**

- Create: `apps/core/src/modules/ai/ai-agent/ai-agent-chat.service.ts`

- [ ] **Step 1: Create the chat proxy service**

```typescript
import { Injectable, Logger } from '@nestjs/common';

import { BizException } from '~/common/exceptions/biz.exception';
import { ErrorCodeEnum } from '~/constants/error-code.constant';

import { AIProviderType, type AIProviderConfig } from '../ai.types';
import { ConfigsService } from '~/modules/configs/configs.service';
import { buildAiSdkDefaultHeaders } from '../runtime/ai-sdk-attribution';

@Injectable()
export class AiAgentChatService {
  private readonly logger = new Logger(AiAgentChatService.name);

  constructor(private readonly configService: ConfigsService) {}

  /**
   * Resolve provider config by ID from AI settings.
   */
  async resolveProvider(providerId: string): Promise<AIProviderConfig> {
    const aiConfig = await this.configService.get('ai');
    const provider = aiConfig.providers?.find((p) => p.id === providerId && p.enabled);
    if (!provider) {
      throw new BizException(
        ErrorCodeEnum.AINotEnabled,
        `Provider "${providerId}" not found or disabled`,
      );
    }
    return provider;
  }

  /**
   * Build provider-specific request body from generic ChatMessage format.
   * Mirrors buildClaudeBody/buildOpenAIBody from @haklex/rich-agent-core.
   */
  buildRequestBody(
    provider: AIProviderConfig,
    model: string,
    messages: Record<string, unknown>[],
    tools?: Array<{ name: string; description: string; parameters: Record<string, unknown> }>,
  ): { url: string; headers: Record<string, string>; body: string } {
    if (provider.type === AIProviderType.Anthropic) {
      return this.buildClaudeRequest(provider, model, messages, tools);
    }
    return this.buildOpenAIRequest(provider, model, messages, tools);
  }

  private buildClaudeRequest(
    provider: AIProviderConfig,
    model: string,
    messages: Record<string, unknown>[],
    tools?: Array<{ name: string; description: string; parameters: Record<string, unknown> }>,
  ) {
    const systemMsgs = messages.filter((m) => m.role === 'system');
    const nonSystemMsgs = messages.filter((m) => m.role !== 'system');

    const claudeMessages = nonSystemMsgs.map((m) => {
      if (m.role === 'user') return { role: 'user', content: m.content };
      if (m.role === 'assistant') return { role: 'assistant', content: m.content };
      if (m.role === 'assistant_tool_call') {
        return {
          role: 'assistant',
          content: (m.toolCalls as any[]).map((tc) => ({
            type: 'tool_use',
            id: tc.id,
            name: tc.name,
            input: JSON.parse(tc.arguments as string),
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

    const baseUrl = provider.endpoint || 'https://api.anthropic.com/v1';

    return {
      url: `${baseUrl}/messages`,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'interleaved-thinking-2025-05-14',
        ...buildAiSdkDefaultHeaders(),
      },
      body: JSON.stringify(body),
    };
  }

  private buildOpenAIRequest(
    provider: AIProviderConfig,
    model: string,
    messages: Record<string, unknown>[],
    tools?: Array<{ name: string; description: string; parameters: Record<string, unknown> }>,
  ) {
    const openaiMessages = messages.map((m) => {
      if (m.role === 'system') return { role: 'system', content: m.content };
      if (m.role === 'user') return { role: 'user', content: m.content };
      if (m.role === 'assistant') return { role: 'assistant', content: m.content };
      if (m.role === 'assistant_tool_call') {
        return {
          role: 'assistant',
          content: null,
          tool_calls: (m.toolCalls as any[]).map((tc) => ({
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

    let baseUrl: string;
    if (provider.type === AIProviderType.OpenRouter) {
      baseUrl = provider.endpoint || 'https://openrouter.ai/api/v1';
    } else if (provider.type === AIProviderType.OpenAI) {
      baseUrl = provider.endpoint || 'https://api.openai.com/v1';
    } else {
      baseUrl = provider.endpoint!;
      if (!baseUrl.endsWith('/v1')) {
        baseUrl = `${baseUrl.replace(/\/+$/, '')}/v1`;
      }
    }

    return {
      url: `${baseUrl}/chat/completions`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
        ...buildAiSdkDefaultHeaders(),
      },
      body: JSON.stringify(body),
    };
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/core/src/modules/ai/ai-agent/ai-agent-chat.service.ts
git commit -m "feat(ai): add agent chat proxy service with format transformation"
```

---

### Task 5: Create Conversation Service

**Files:**

- Create: `apps/core/src/modules/ai/ai-agent/ai-agent-conversation.service.ts`

- [ ] **Step 1: Create the conversation CRUD service**

```typescript
import { Injectable, Logger } from '@nestjs/common';

import { BizException } from '~/common/exceptions/biz.exception';
import { ErrorCodeEnum } from '~/constants/error-code.constant';
import type { MongooseModel } from '~/shared/model/base.model';
import { InjectModel } from '~/transformers/model.transformer';

import { AIAgentConversationModel } from './ai-agent-conversation.model';

@Injectable()
export class AiAgentConversationService {
  private readonly logger = new Logger(AiAgentConversationService.name);

  constructor(
    @InjectModel(AIAgentConversationModel)
    private readonly conversationModel: MongooseModel<AIAgentConversationModel>,
  ) {}

  async create(data: {
    refId: string;
    refType: string;
    title?: string;
    messages: Record<string, unknown>[];
    model: string;
    providerId: string;
  }) {
    return this.conversationModel.create(data);
  }

  async listByRef(refId: string) {
    return this.conversationModel
      .find({ refId }, { messages: 0 }) // exclude messages body for list
      .sort({ updated: -1 })
      .lean();
  }

  async getById(id: string) {
    const doc = await this.conversationModel.findById(id).lean();
    if (!doc) {
      throw new BizException(ErrorCodeEnum.ContentNotFoundCantProcess, 'Conversation not found');
    }
    return doc;
  }

  async appendMessages(id: string, messages: Record<string, unknown>[]) {
    const result = await this.conversationModel.findByIdAndUpdate(
      id,
      {
        $push: { messages: { $each: messages } },
        $set: { updated: new Date() },
      },
      { new: true, projection: { messages: 0 } },
    );
    if (!result) {
      throw new BizException(ErrorCodeEnum.ContentNotFoundCantProcess, 'Conversation not found');
    }
    return result;
  }

  async deleteById(id: string) {
    await this.conversationModel.deleteOne({ _id: id });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/core/src/modules/ai/ai-agent/ai-agent-conversation.service.ts
git commit -m "feat(ai): add agent conversation CRUD service"
```

---

### Task 6: Create Agent Controller

**Files:**

- Create: `apps/core/src/modules/ai/ai-agent/ai-agent.controller.ts`

- [ ] **Step 1: Create the controller with chat proxy + conversation CRUD**

```typescript
import { Body, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';

import { ApiController } from '~/common/decorators/api-controller.decorator';
import { Auth } from '~/common/decorators/auth.decorator';
import { MongoIdDto } from '~/shared/dto/id.dto';
import { endSse, initSse, sendSseEvent } from '~/utils/sse.util';

import { AiAgentChatService } from './ai-agent-chat.service';
import { AiAgentConversationService } from './ai-agent-conversation.service';
import {
  AppendMessagesDto,
  ChatProxyDto,
  CreateConversationDto,
  ListConversationsQueryDto,
} from './ai-agent.schema';

@ApiController('ai/agent')
export class AiAgentController {
  constructor(
    private readonly chatService: AiAgentChatService,
    private readonly conversationService: AiAgentConversationService,
  ) {}

  // --- Chat Proxy ---

  @Post('/chat')
  @Auth()
  async chatProxy(@Body() body: ChatProxyDto, @Res() reply: FastifyReply) {
    const provider = await this.chatService.resolveProvider(body.providerId);
    const {
      url,
      headers,
      body: requestBody,
    } = this.chatService.buildRequestBody(provider, body.model, body.messages, body.tools);

    // Make raw streaming request to LLM API
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: requestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      initSse(reply);
      sendSseEvent(reply, 'error', {
        message: `LLM API error (${response.status}): ${errorText}`,
      });
      endSse(reply);
      return;
    }

    // Pipe raw SSE stream through to client
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache, no-transform');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('X-Accel-Buffering', 'no');
    reply.raw.flushHeaders();

    const reader = response.body!.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        reply.raw.write(value);
      }
    } catch {
      // Client disconnected or upstream error
    } finally {
      reader.releaseLock();
      reply.raw.end();
    }
  }

  // --- Conversation CRUD ---

  @Post('/conversations')
  @Auth()
  async createConversation(@Body() body: CreateConversationDto) {
    return this.conversationService.create(body);
  }

  @Get('/conversations')
  @Auth()
  async listConversations(@Query() query: ListConversationsQueryDto) {
    return this.conversationService.listByRef(query.refId);
  }

  @Get('/conversations/:id')
  @Auth()
  async getConversation(@Param() params: MongoIdDto) {
    return this.conversationService.getById(params.id);
  }

  @Patch('/conversations/:id/messages')
  @Auth()
  async appendMessages(@Param() params: MongoIdDto, @Body() body: AppendMessagesDto) {
    return this.conversationService.appendMessages(params.id, body.messages);
  }

  @Delete('/conversations/:id')
  @Auth()
  async deleteConversation(@Param() params: MongoIdDto) {
    return this.conversationService.deleteById(params.id);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/core/src/modules/ai/ai-agent/ai-agent.controller.ts
git commit -m "feat(ai): add agent controller with chat proxy and conversation CRUD"
```

---

### Task 7: Register in AI Module

**Files:**

- Modify: `apps/core/src/modules/ai/ai.module.ts`

- [ ] **Step 1: Add agent services and controller to AI module**

Add imports at the top of the file:

```typescript
import { AiAgentChatService } from './ai-agent/ai-agent-chat.service';
import { AiAgentConversationService } from './ai-agent/ai-agent-conversation.service';
import { AiAgentController } from './ai-agent/ai-agent.controller';
```

Add `AiAgentChatService` and `AiAgentConversationService` to the `providers` array.
Add `AiAgentController` to the `controllers` array.

- [ ] **Step 2: Verify the module compiles**

Run from mx-core root:

```bash
npx tsc --noEmit --project apps/core/tsconfig.json
```

Expected: no errors related to the new files.

- [ ] **Step 3: Commit**

```bash
git add apps/core/src/modules/ai/ai.module.ts
git commit -m "feat(ai): register agent chat service and controller in AI module"
```

---

## Phase 2: haklex — initialBubbles Support

All files in repo: `/Users/innei/git/innei-repo/haklex`

### Task 8: Add initialBubbles to createAgentStore

**Files:**

- Modify: `packages/rich-agent-core/src/initialState.ts`
- Modify: `packages/rich-agent-core/src/store.ts`

- [ ] **Step 1: Update createInitialAgentStoreState to accept initialBubbles**

In `packages/rich-agent-core/src/initialState.ts`, change the function signature:

```typescript
export function createInitialAgentStoreState(initialBubbles?: ChatBubble[]): AgentStoreState {
  return {
    status: 'idle',
    bubbles: initialBubbles ?? [],
    diffState: null,
    reviewState: null,
  };
}
```

- [ ] **Step 2: Update createAgentStore to accept and thread initialBubbles**

In `packages/rich-agent-core/src/store.ts`, change:

```typescript
export function createAgentStore(initialBubbles?: ChatBubble[]): AgentStore {
  const stateCreator: StateCreator<AgentStoreSlice> = (...params) => ({
    ...createInitialAgentStoreState(initialBubbles),
    ...flattenActions<AgentStoreActions>([createAgentStoreSlice(...params)]),
  });
  return createStore<AgentStoreSlice>()(stateCreator);
}
```

Remove the module-level `createAgentStoreState` const since it's now inlined.

- [ ] **Step 3: Verify build**

```bash
pnpm --filter @haklex/rich-agent-core build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add packages/rich-agent-core/src/initialState.ts packages/rich-agent-core/src/store.ts
git commit -m "feat(rich-agent-core): support initialBubbles in createAgentStore"
```

---

## Phase 3: admin-vue3 — Editor + Agent Integration

All files in repo: `/Users/innei/git/innei-repo/admin-vue3`

### Task 9: Add haklex agent dependencies

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Add @haklex/rich-agent-core, rich-agent-chat, rich-ext-ai-agent to package.json**

Add to dependencies (use same version as other @haklex packages, currently 0.0.97):

```json
"@haklex/rich-agent-chat": "0.0.97",
"@haklex/rich-agent-core": "0.0.97",
"@haklex/rich-ext-ai-agent": "0.0.97"
```

- [ ] **Step 2: Install**

```bash
pnpm install
```

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat: add haklex agent packages to dependencies"
```

---

### Task 10: Create agent API client

**Files:**

- Create: `src/api/ai-agent.ts`

- [ ] **Step 1: Create API client for agent endpoints**

```typescript
import { fetchClient } from './fetch-client';

// --- Conversation CRUD ---

export interface AgentConversation {
  id: string;
  refId: string;
  refType: string;
  title?: string;
  model: string;
  providerId: string;
  created: string;
  updated: string;
  messages?: Record<string, unknown>[];
}

export const aiAgentApi = {
  createConversation(data: {
    refId: string;
    refType: string;
    model: string;
    providerId: string;
    title?: string;
    messages?: Record<string, unknown>[];
  }): Promise<AgentConversation> {
    return fetchClient.post('ai/agent/conversations', data);
  },

  listConversations(refId: string): Promise<AgentConversation[]> {
    return fetchClient.get('ai/agent/conversations', { params: { refId } });
  },

  getConversation(id: string): Promise<AgentConversation> {
    return fetchClient.get(`ai/agent/conversations/${id}`);
  },

  appendMessages(id: string, messages: Record<string, unknown>[]): Promise<void> {
    return fetchClient.patch(`ai/agent/conversations/${id}/messages`, {
      messages,
    });
  },

  deleteConversation(id: string): Promise<void> {
    return fetchClient.delete(`ai/agent/conversations/${id}`);
  },
};
```

Note: Check `src/api/` for the exact fetch client import pattern used in this project and adapt accordingly. The above is pseudocode — match the existing API client style (e.g., if it uses axios or a custom wrapper).

- [ ] **Step 2: Commit**

```bash
git add src/api/ai-agent.ts
git commit -m "feat: add AI agent API client"
```

---

### Task 11: Create ShiroEditorWithAgent React component

This is the core integration component. It follows the exact pattern of `demo/src/pages/AgentPage.tsx` in the haklex repo.

**Files:**

- Create: `src/components/editor/rich/RichAgentEditor.tsx`

- [ ] **Step 1: Create the React component**

This component lives inside the existing React-in-Vue bridge's React tree. It renders ShiroEditor + ChatPanel side-by-side:

```tsx
import type { ProviderGroup, SelectedModel } from '@haklex/rich-agent-chat';
import { ChatPanel } from '@haklex/rich-agent-chat';
import type { LLMProvider } from '@haklex/rich-agent-core';
import { createAgentStore, createProxyTransport, createProvider } from '@haklex/rich-agent-core';
import type { ChatBubble } from '@haklex/rich-agent-core';
import { getVariantClass } from '@haklex/rich-editor';
import { blockIdState } from '@haklex/rich-editor/plugins';
import { DiffReviewOverlayPlugin, useAgentLoop } from '@haklex/rich-ext-ai-agent';
import type { ShiroEditorProps } from '@haklex/rich-kit-shiro';
import { ShiroEditor } from '@haklex/rich-kit-shiro';
import { PortalThemeProvider } from '@haklex/rich-style-token';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getRoot,
  $getState,
  $parseSerializedNode,
  type LexicalEditor,
  type LexicalNode,
} from 'lexical';
import { createElement, useCallback, useMemo, useRef, useState, type ReactNode } from 'react';

import { API_URL } from '~/constants/env';

interface RichAgentEditorProps {
  editorProps: Omit<ShiroEditorProps, 'onChange' | 'onSubmit' | 'onEditorReady'>;
  editorChildren?: ReactNode;
  onChange?: ShiroEditorProps['onChange'];
  onSubmit?: ShiroEditorProps['onSubmit'];
  onEditorReady?: (editor: LexicalEditor | null) => void;
  providerGroups: ProviderGroup[];
  selectedModel: SelectedModel | null;
  onSelectModel: (model: SelectedModel) => void;
  authToken: string;
  agentVisible: boolean;
  initialBubbles?: ChatBubble[];
  onBubblesChange?: (bubbles: ChatBubble[]) => void;
}

function $findBlockByBlockId(blockId: string): LexicalNode | null {
  const root = $getRoot();
  for (const child of root.getChildren()) {
    if ($getState(child, blockIdState) === blockId) {
      return child;
    }
  }
  return null;
}

export function RichAgentEditor({
  editorProps,
  editorChildren,
  onChange,
  onSubmit,
  onEditorReady,
  providerGroups,
  selectedModel,
  onSelectModel,
  authToken,
  agentVisible,
  initialBubbles,
  onBubblesChange,
}: RichAgentEditorProps) {
  const store = useMemo(
    () => createAgentStore(initialBubbles),
    // initialBubbles only used at creation time
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const agentLoopRef = useRef<ReturnType<typeof useAgentLoop> | null>(null);
  const editorRef = useRef<LexicalEditor | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const provider = useMemo<LLMProvider | null>(() => {
    if (!selectedModel) return null;
    const group = providerGroups.find((g) => g.id === selectedModel.providerId);
    if (!group) return null;
    const transport = createProxyTransport({
      endpoint: `${API_URL}/api/ai/agent/chat`,
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return createProvider({
      model: selectedModel.modelId,
      transport,
      providerType: group.providerType as 'claude' | 'openai-compatible',
    });
  }, [selectedModel, providerGroups, authToken]);

  const handleSend = useCallback(
    (message: string) => {
      const loop = agentLoopRef.current;
      if (!loop) return;
      abortRef.current = new AbortController();
      loop.run(message).catch((err: unknown) => {
        if ((err as Error).name === 'AbortError') return;
        store.getState().addBubble({ type: 'error', message: String(err) });
      });
    },
    [store],
  );

  const handleAbort = useCallback(() => {
    abortRef.current?.abort();
    store.getState().setStatus('idle');
  }, [store]);

  const handleRetry = useCallback(() => {
    const bubbles = store.getState().bubbles;
    const lastUserBubble = [...bubbles].reverse().find((b) => b.type === 'user');
    if (lastUserBubble && lastUserBubble.type === 'user') {
      handleSend(lastUserBubble.content);
    }
  }, [store, handleSend]);

  const handleAcceptBatch = useCallback(
    (batchId: string) => {
      store.getState().acceptReviewBatch(batchId);
      const reviewState = store.getState().reviewState;
      const batch = reviewState?.batches.find((b) => b.id === batchId);
      if (!batch || !editorRef.current) return;

      const editor = editorRef.current;
      editor.update(() => {
        const root = $getRoot();
        for (const entry of batch.entries) {
          const { op } = entry;
          if (op.op === 'insert') {
            if (!op.node?.type) continue;
            const newNode = $parseSerializedNode(op.node);
            if (op.position.type === 'root') {
              const idx = op.position.index ?? root.getChildrenSize();
              const children = root.getChildren();
              if (idx >= children.length) root.append(newNode);
              else children[idx].insertBefore(newNode);
            } else {
              const target = $findBlockByBlockId(op.position.blockId);
              if (!target) continue;
              if (op.position.type === 'after') target.insertAfter(newNode);
              else target.insertBefore(newNode);
            }
          } else if (op.op === 'replace') {
            if (!op.node?.type) continue;
            const target = $findBlockByBlockId(op.blockId);
            if (!target) continue;
            target.replace($parseSerializedNode(op.node));
          } else if (op.op === 'delete') {
            const target = $findBlockByBlockId(op.blockId);
            if (!target) continue;
            target.remove();
          }
        }
      });
    },
    [store],
  );

  const handleRejectBatch = useCallback(
    (batchId: string) => {
      store.getState().rejectReviewBatch(batchId);
    },
    [store],
  );

  const handleEditorReady = useCallback(
    (editor: LexicalEditor | null) => {
      onEditorReady?.(editor);
    },
    [onEditorReady],
  );

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      <div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        <ShiroEditor
          {...editorProps}
          onChange={onChange}
          onSubmit={onSubmit}
          onEditorReady={handleEditorReady}
        >
          {editorChildren}
          {provider && <DiffReviewOverlayPlugin store={store} />}
          <AgentLoopCapture
            editorRef={editorRef}
            loopRef={agentLoopRef}
            provider={provider}
            store={store}
          />
        </ShiroEditor>
      </div>
      {agentVisible && (
        <div
          style={{
            width: 420,
            borderLeft: '1px solid var(--border-color, #e5e5e5)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <PortalThemeProvider
            className={getVariantClass('article')}
            theme={editorProps.theme || 'light'}
          >
            <ChatPanel
              providerGroups={providerGroups}
              selectedModel={selectedModel}
              store={store}
              onAbort={handleAbort}
              onAcceptBatch={handleAcceptBatch}
              onRejectBatch={handleRejectBatch}
              onRetry={handleRetry}
              onSelectModel={onSelectModel}
              onSend={handleSend}
            />
          </PortalThemeProvider>
        </div>
      )}
    </div>
  );
}

// --- Agent Loop Capture (must be inside LexicalComposer) ---

function AgentLoopCapture({
  editorRef,
  loopRef,
  provider,
  store,
}: {
  editorRef: React.RefObject<LexicalEditor | null>;
  loopRef: React.RefObject<ReturnType<typeof useAgentLoop> | null>;
  provider: LLMProvider | null;
  store: ReturnType<typeof createAgentStore>;
}) {
  if (!provider) {
    loopRef.current = null;
    return null;
  }
  return (
    <AgentLoopCaptureInner
      editorRef={editorRef}
      loopRef={loopRef}
      provider={provider}
      store={store}
    />
  );
}

function AgentLoopCaptureInner({
  editorRef,
  loopRef,
  provider,
  store,
}: {
  editorRef: React.RefObject<LexicalEditor | null>;
  loopRef: React.RefObject<ReturnType<typeof useAgentLoop> | null>;
  provider: LLMProvider;
  store: ReturnType<typeof createAgentStore>;
}) {
  const loop = useAgentLoop({ provider, store });
  loopRef.current = loop;

  const [editor] = useLexicalComposerContext();
  editorRef.current = editor;

  return null;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/editor/rich/RichAgentEditor.tsx
git commit -m "feat: add RichAgentEditor React component with ChatPanel integration"
```

---

### Task 12: Update RichEditor Vue bridge to support agent mode

**Files:**

- Modify: `src/components/editor/rich/RichEditor.tsx`

- [ ] **Step 1: Add agent-related props and conditional rendering**

Add new props to the Vue `defineComponent`:

```typescript
agentEnabled: { type: Boolean, default: false },
agentVisible: { type: Boolean, default: false },
authToken: String,
providerGroups: Array as PropType<ProviderGroup[]>,
selectedModel: Object as PropType<SelectedModel | null>,
initialBubbles: Array as PropType<ChatBubble[]>,
```

Add new emits:

```typescript
selectModel: (_model: SelectedModel) => true,
bubblesChange: (_bubbles: ChatBubble[]) => true,
```

In `renderReact()`, when `props.agentEnabled` is true, render `RichAgentEditor` instead of `ShiroEditorReact`. Pass through the editor props, agent props, and callbacks.

When `props.agentEnabled` is false, render `ShiroEditorReact` as before (zero change to existing behavior).

- [ ] **Step 2: Add CSS imports for agent packages**

```typescript
import '@haklex/rich-agent-chat/style.css';
import '@haklex/rich-ext-ai-agent/style.css';
```

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/editor/rich/RichEditor.tsx
git commit -m "feat: add agent mode support to RichEditor Vue bridge"
```

---

### Task 13: Create conversation sync hook

**Files:**

- Create: `src/hooks/use-agent-conversation-sync.ts`

- [ ] **Step 1: Create Vue composable for conversation persistence**

```typescript
import type { AgentStore, ChatBubble } from '@haklex/rich-agent-core';
import { ref, onUnmounted, watch } from 'vue';
import { aiAgentApi } from '~/api/ai-agent';

export function useAgentConversationSync(options: {
  store: AgentStore | null;
  refId: string;
  refType: 'post' | 'note' | 'page';
  model: string;
  providerId: string;
}) {
  const conversationId = ref<string | null>(null);
  const initialBubbles = ref<ChatBubble[]>([]);
  const lastSyncedLength = ref(0);
  let unsubscribe: (() => void) | null = null;

  // Load existing conversation on init
  async function loadConversation() {
    try {
      const conversations = await aiAgentApi.listConversations(options.refId);
      if (conversations.length > 0) {
        const latest = await aiAgentApi.getConversation(conversations[0].id);
        conversationId.value = latest.id;
        initialBubbles.value = (latest.messages ?? []) as ChatBubble[];
        lastSyncedLength.value = initialBubbles.value.length;
      }
    } catch {
      // No conversation yet, will create on first message
    }
  }

  // Subscribe to store bubble changes
  function startSync(store: AgentStore) {
    unsubscribe = store.subscribe((state, prevState) => {
      if (state.bubbles.length > lastSyncedLength.value) {
        const newBubbles = state.bubbles.slice(lastSyncedLength.value);
        lastSyncedLength.value = state.bubbles.length;
        appendToConversation(newBubbles as Record<string, unknown>[]);
      }
    });
  }

  async function appendToConversation(messages: Record<string, unknown>[]) {
    if (!conversationId.value) {
      // Create conversation on first message
      try {
        const conv = await aiAgentApi.createConversation({
          refId: options.refId,
          refType: options.refType,
          model: options.model,
          providerId: options.providerId,
          messages,
        });
        conversationId.value = conv.id;
      } catch (e) {
        console.error('Failed to create conversation:', e);
      }
      return;
    }

    try {
      await aiAgentApi.appendMessages(conversationId.value, messages);
    } catch (e) {
      console.error('Failed to append messages:', e);
    }
  }

  function stopSync() {
    unsubscribe?.();
    unsubscribe = null;
  }

  onUnmounted(stopSync);

  return {
    conversationId,
    initialBubbles,
    loadConversation,
    startSync,
    stopSync,
  };
}
```

Note: This composable manages the Vue-side lifecycle. The actual store subscription happens after the React root creates the store. The integration pattern in the editor page will call `loadConversation()` on mount, then `startSync(store)` once the React store is available.

- [ ] **Step 2: Commit**

```bash
git add src/hooks/use-agent-conversation-sync.ts
git commit -m "feat: add conversation sync composable for agent persistence"
```

---

### Task 14: Wire agent into editor page

This task depends on the specific editor page structure in admin-vue3. The exact file will be one of the post/note/page editor views.

**Files:**

- Modify: The editor page component that uses `<RichEditor>` (e.g., `src/views/manage-posts/write.tsx` or similar)

- [ ] **Step 1: Add agent toggle button and state**

Add to the editor page:

- A ref `agentVisible` to control panel visibility
- A button (AI icon) in the editor toolbar area to toggle `agentVisible`
- Fetch provider groups from `GET /api/ai/models` on mount
- Track `selectedModel` state
- Pass `agentEnabled`, `agentVisible`, `providerGroups`, `selectedModel`, `authToken` to `<RichEditor>`

- [ ] **Step 2: Wire conversation sync**

```typescript
const { initialBubbles, loadConversation, startSync } = useAgentConversationSync({
  store: null, // set after React mount
  refId: articleId,
  refType: 'post',
  model: selectedModel.value?.modelId ?? '',
  providerId: selectedModel.value?.providerId ?? '',
});

onMounted(() => loadConversation());
```

Pass `initialBubbles` to `<RichEditor>`. After editor mounts and creates the React store, call `startSync(store)`.

Note: The exact wiring depends on how the existing editor page exposes the store reference. This may require `RichEditor` to emit a `storeReady` event or expose the store via a ref. The implementation details will be refined during development based on the actual page structure.

- [ ] **Step 3: Commit**

```bash
git add src/views/manage-posts/write.tsx # or whichever file
git commit -m "feat: wire agent chat panel into post editor page"
```

---

## Notes

### Provider Type Mapping

admin-vue3 AI config stores providers with `type` field using `AIProviderType` enum values: `'openai'`, `'openai-compatible'`, `'anthropic'`, `'openrouter'`. The `createProvider` in `rich-agent-core` expects `providerType: 'claude' | 'openai-compatible'`. The mapping:

- `'anthropic'` → `'claude'`
- `'openai'` / `'openai-compatible'` / `'openrouter'` → `'openai-compatible'`

This mapping should be done in `RichAgentEditor` when creating the provider.

### Chat Proxy: Transparent Pipe-Through

The mx-core chat proxy does NOT parse the LLM's SSE response. It pipes the raw bytes through to the client. The frontend's existing `parseClaudeSSE` / `parseOpenAISSE` in `rich-agent-core` handles parsing. This keeps the proxy stateless and simple.

### CSS Imports

Agent packages export styles that must be imported:

- `@haklex/rich-agent-chat/style.css`
- `@haklex/rich-ext-ai-agent/style.css`

### Error Handling

- If chat proxy fetch to LLM fails: return SSE error event
- If conversation CRUD fails: log error, don't block chat functionality
- If store subscription misses updates: acceptable — conversation is best-effort persistence
