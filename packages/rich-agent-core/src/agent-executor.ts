import { createDocumentTools } from './document-tools';
import type { ChatBubble } from './initialState';
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
  const documentTools = createDocumentTools(snapshot, operations);
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

      setStatus('thinking');
      addBubble({ type: 'assistant', content: '', streaming: true });

      for await (const chunk of provider.chat(messages, toolSchemas)) {
        signal?.throwIfAborted();

        if (chunk.type === 'thinking') {
          thinkingAccum += chunk.text;
          if (!hasThinking) {
            hasThinking = true;
            thinkingId = nextThinkingId();
            updateLastBubble({
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
          if (hasThinking && textAccum === '') {
            addBubble({ type: 'assistant', content: chunk.text, streaming: true });
            setStatus('writing');
          } else if (textAccum === '') {
            setStatus('writing');
            updateLastBubble({ type: 'assistant', content: chunk.text, streaming: true });
          } else {
            updateLastBubble({
              type: 'assistant',
              content: textAccum + chunk.text,
              streaming: true,
            });
          }
          textAccum += chunk.text;
          continue;
        }

        if (chunk.type === 'tool_call') {
          toolCalls.push({ id: chunk.id, name: chunk.name, arguments: chunk.arguments });
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

      updateLastBubble({ type: 'assistant', content: textAccum, streaming: false });

      if (toolCalls.length === 0) break;

      turns.push({ role: 'assistant_tool_call', toolCalls });

      setStatus('calling_tool');

      const groupId = nextGroupId();
      const items: Array<{
        id: string;
        toolName: string;
        description?: string;
        params: Record<string, unknown>;
        status: 'pending' | 'running' | 'completed' | 'error';
        result?: string;
        resultPreview?: string;
        error?: string;
        startedAt?: number;
        finishedAt?: number;
      }> = [];

      for (const tc of toolCalls) {
        let params: Record<string, unknown>;
        try {
          params = JSON.parse(tc.arguments);
        } catch {
          params = {};
        }
        items.push({
          id: tc.id,
          toolName: tc.name,
          description: describeToolCall(toolMap.get(tc.name), params),
          params,
          status: 'pending',
        });
      }

      addBubble({ type: 'tool_call_group', id: groupId, items });

      const { updateToolCallItem } = store.getState();

      for (let i = 0; i < toolCalls.length; i++) {
        const tc = toolCalls[i];

        updateToolCallItem(groupId, tc.id, {
          status: 'running',
          startedAt: Date.now(),
        });

        try {
          JSON.parse(tc.arguments);
        } catch (e) {
          updateToolCallItem(groupId, tc.id, {
            status: 'error',
            error: `JSON parse error: ${(e as Error).message}`,
            finishedAt: Date.now(),
          });
          turns.push({
            role: 'tool_result',
            toolCallId: tc.id,
            content: `JSON parse error: ${(e as Error).message}`,
            isError: true,
          });
          continue;
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

        turns.push({
          role: 'tool_result',
          toolCallId: tc.id,
          content,
          isError: !result.ok,
        });

        if (operations.length > lastOpsLength) {
          lastOpsLength = operations.length;
          onOperationsChanged?.(operations);
        }
      }
    }

    setStatus('done');
    return { operations };
  }

  return { run };
}
