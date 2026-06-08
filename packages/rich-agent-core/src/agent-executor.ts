import { createDocumentTools } from './document-tools';
import type { ChatBubble } from './initialState';
import type { LitexmlRegistryProvider } from './litexml';
import { buildMessages } from './messages-engine';
import type {
  AgentToolConfig,
  AgentToolResult,
  ChatMessage,
  LLMProvider,
  PreparedMessages,
  ToolSchema,
} from './protocol';
import type { EditorSnapshot } from './snapshot';
import type { AgentStore } from './store';
import type { AgentOperation } from './types';

export type AgentExecutorConfig = {
  provider: LLMProvider;
  snapshot: EditorSnapshot;
  store: AgentStore;
  tools: AgentToolConfig[];
  litexmlRegistry?: LitexmlRegistryProvider;
  signal?: AbortSignal;
  onOperationsChanged?: (operations: AgentOperation[]) => void;
};

export type AgentExecutorResult = {
  operations: AgentOperation[];
};

function describeToolCall(
  tool: AgentToolConfig | undefined,
  params: Record<string, unknown>,
): string | undefined {
  if (tool?.describeCall) {
    try {
      return tool.describeCall(params);
    } catch {
      // fallback below
    }
  }
  const firstVal = Object.values(params)[0];
  return firstVal !== undefined ? String(firstVal).slice(0, 40) : undefined;
}

function splitSteps(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
}

let groupCounter = 0;
function nextGroupId(): string {
  return `tcg-${++groupCounter}-${Date.now()}`;
}

let thinkingCounter = 0;
function nextThinkingId(): string {
  return `th-${++thinkingCounter}-${Date.now()}`;
}

function toolConfigToSchema(tool: AgentToolConfig): ToolSchema {
  return {
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  };
}

export function createAgentExecutor(config: AgentExecutorConfig) {
  const { provider, snapshot, store, signal, onOperationsChanged } = config;
  const operations: AgentOperation[] = [];
  let lastOpsLength = 0;
  const documentTools = createDocumentTools(snapshot, operations, {
    litexmlRegistry: config.litexmlRegistry,
  });
  const allTools = [...documentTools, ...config.tools];
  const toolMap = new Map(allTools.map((t) => [t.name, t]));
  const toolSchemas = allTools.map(toolConfigToSchema);

  async function executeTool(name: string, args: string): Promise<AgentToolResult> {
    const tool = toolMap.get(name);
    if (!tool) {
      return { ok: false, error: { error: 'unknown_tool', message: `Tool "${name}" not found` } };
    }
    const params = JSON.parse(args);
    return tool.execute(params);
  }

  async function run(
    initialMessages: Omit<PreparedMessages, 'turns'>,
  ): Promise<AgentExecutorResult> {
    const { addBubble, setStatus, updateLastBubble } = store.getState();

    setStatus('running');

    const turns: ChatMessage[] = [];

    const maxTurns = 20;
    for (let turn = 0; turn < maxTurns; turn++) {
      signal?.throwIfAborted();

      const messages = buildMessages({
        ...initialMessages,
        turns,
      });

      let textAccum = '';
      let thinkingAccum = '';
      let hasThinking = false;
      let thinkingId = '';
      const toolCalls: Array<{ id: string; name: string; arguments: string }> = [];
      // Mid-stream tool execution: create group lazily on first tool_call chunk,
      // then append + execute each tool as it arrives so diffs surface immediately
      // instead of only after the full assistant turn completes.
      let streamGroupId: string | null = null;
      const streamToolTurns: ChatMessage[] = [];
      // Assistant bubble is created lazily so a tool_call_group inserted
      // mid-stream doesn't get clobbered by subsequent updateLastBubble calls.
      let assistantBubbleOpen = false;
      // Ids whose item was already inserted via a `tool_call_partial` snapshot.
      // The final `tool_call` chunk for these must overwrite params + execute, NOT
      // addToolCallItem again (which would render a duplicate row).
      const partialToolIds = new Set<string>();

      const ensureStreamGroup = (): string => {
        if (assistantBubbleOpen) {
          updateLastBubble({ type: 'assistant', content: textAccum, streaming: false });
          assistantBubbleOpen = false;
          textAccum = '';
        }
        if (!streamGroupId) {
          streamGroupId = nextGroupId();
          addBubble({ type: 'tool_call_group', id: streamGroupId, items: [] });
          setStatus('calling_tool');
        }
        return streamGroupId;
      };

      const handleToolCallPartial = (chunk: {
        id: string;
        name: string;
        argumentsPartial: string;
      }) => {
        const groupId = ensureStreamGroup();
        let params: Record<string, unknown>;
        try {
          const parsed = JSON.parse(chunk.argumentsPartial);
          params =
            parsed && typeof parsed === 'object' && !Array.isArray(parsed)
              ? (parsed as Record<string, unknown>)
              : {};
        } catch {
          params = {};
        }
        const { addToolCallItem, updateToolCallItem } = store.getState();
        if (!partialToolIds.has(chunk.id)) {
          partialToolIds.add(chunk.id);
          addToolCallItem(groupId, {
            id: chunk.id,
            toolName: chunk.name,
            description: describeToolCall(toolMap.get(chunk.name), params),
            params,
            status: 'running',
            startedAt: Date.now(),
          });
        } else {
          updateToolCallItem(groupId, chunk.id, {
            params,
            description: describeToolCall(toolMap.get(chunk.name), params),
          });
        }
      };

      const runToolCallMidStream = async (tc: { id: string; name: string; arguments: string }) => {
        ensureStreamGroup();
        const groupId = streamGroupId!;
        const alreadyAdded = partialToolIds.has(tc.id);

        let params: Record<string, unknown>;
        let parseError: string | null = null;
        try {
          params = JSON.parse(tc.arguments);
        } catch (e) {
          params = {};
          parseError = (e as Error).message;
        }

        const { addToolCallItem, updateToolCallItem } = store.getState();
        if (!alreadyAdded) {
          addToolCallItem(groupId, {
            id: tc.id,
            toolName: tc.name,
            description: describeToolCall(toolMap.get(tc.name), params),
            params,
            status: parseError ? 'error' : 'running',
            startedAt: Date.now(),
            ...(parseError
              ? { error: `JSON parse error: ${parseError}`, finishedAt: Date.now() }
              : {}),
          });
        } else {
          updateToolCallItem(groupId, tc.id, {
            params,
            description: describeToolCall(toolMap.get(tc.name), params),
            ...(parseError
              ? {
                  status: 'error',
                  error: `JSON parse error: ${parseError}`,
                  finishedAt: Date.now(),
                }
              : { status: 'running' }),
          });
        }

        if (parseError) {
          streamToolTurns.push({
            role: 'tool_result',
            toolCallId: tc.id,
            content: `JSON parse error: ${parseError}`,
            isError: true,
          });
          return;
        }

        const result = await executeTool(tc.name, tc.arguments);
        const content = result.ok ? result.content : JSON.stringify(result.error);

        updateToolCallItem(groupId, tc.id, {
          status: result.ok ? 'completed' : 'error',
          result: result.ok ? result.content : undefined,
          resultPreview: result.ok ? result.content.slice(0, 80) : undefined,
          error: !result.ok ? content : undefined,
          finishedAt: Date.now(),
        });

        streamToolTurns.push({
          role: 'tool_result',
          toolCallId: tc.id,
          content,
          isError: !result.ok,
        });

        if (operations.length > lastOpsLength) {
          lastOpsLength = operations.length;
          onOperationsChanged?.(operations);
        }
      };

      setStatus('thinking');

      for await (const chunk of provider.chat(messages, toolSchemas)) {
        signal?.throwIfAborted();

        if (chunk.type === 'thinking') {
          thinkingAccum += chunk.text;
          if (!hasThinking) {
            hasThinking = true;
            thinkingId = nextThinkingId();
            addBubble({
              type: 'thinking',
              content: chunk.text,
              id: thinkingId,
              rawText: chunk.text,
              steps: [],
              isStreaming: true,
            });
          } else {
            updateLastBubble({
              type: 'thinking',
              content: thinkingAccum,
              id: thinkingId,
              rawText: thinkingAccum,
              steps: [],
              isStreaming: true,
            });
          }
          continue;
        }

        if (chunk.type === 'text') {
          if (!assistantBubbleOpen) {
            addBubble({ type: 'assistant', content: chunk.text, streaming: true });
            assistantBubbleOpen = true;
            textAccum = chunk.text;
            setStatus('writing');
          } else {
            textAccum += chunk.text;
            updateLastBubble({
              type: 'assistant',
              content: textAccum,
              streaming: true,
            });
          }
          continue;
        }

        if (chunk.type === 'tool_call_start') {
          const groupId = ensureStreamGroup();
          if (!partialToolIds.has(chunk.id)) {
            partialToolIds.add(chunk.id);
            store.getState().addToolCallItem(groupId, {
              id: chunk.id,
              toolName: chunk.name,
              description: describeToolCall(toolMap.get(chunk.name), {}),
              params: {},
              status: 'running',
              startedAt: Date.now(),
            });
          }
          continue;
        }

        if (chunk.type === 'tool_call_partial') {
          handleToolCallPartial(chunk);
          continue;
        }

        if (chunk.type === 'tool_call') {
          toolCalls.push({ id: chunk.id, name: chunk.name, arguments: chunk.arguments });
          await runToolCallMidStream({
            id: chunk.id,
            name: chunk.name,
            arguments: chunk.arguments,
          });
        }
      }

      if (hasThinking) {
        const { bubbles } = store.getState();
        const thinkingIdx = bubbles.findIndex(
          (b: ChatBubble) => b.type === 'thinking' && 'id' in b && b.id === thinkingId,
        );
        if (thinkingIdx !== -1) {
          const nextBubbles = [...bubbles];
          nextBubbles[thinkingIdx] = {
            type: 'thinking',
            content: thinkingAccum,
            id: thinkingId,
            rawText: thinkingAccum,
            steps: splitSteps(thinkingAccum),
            isStreaming: false,
          };
          store.setState({ bubbles: nextBubbles });
        }
      }

      if (assistantBubbleOpen) {
        updateLastBubble({ type: 'assistant', content: textAccum, streaming: false });
        assistantBubbleOpen = false;
      }

      if (toolCalls.length === 0) break;

      // Tools were executed mid-stream above; just wire the turns for the next LLM call.
      turns.push({ role: 'assistant_tool_call', toolCalls });
      for (const t of streamToolTurns) turns.push(t);
    }

    setStatus('done');
    return { operations };
  }

  return { run };
}
