import { createDocumentTools } from './document-tools';
import type {
  AgentToolConfig,
  AgentToolResult,
  ChatMessage,
  LLMProvider,
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
  systemMessages: ChatMessage[];
  signal?: AbortSignal;
  readSelection?: () => { text: string; anchorBlockId: string; focusBlockId: string } | null;
};

export type AgentExecutorResult = {
  operations: AgentOperation[];
};

function toolConfigToSchema(tool: AgentToolConfig): ToolSchema {
  return {
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  };
}

export function createAgentExecutor(config: AgentExecutorConfig) {
  const { provider, snapshot, store, signal, readSelection } = config;
  const operations: AgentOperation[] = [];
  const documentTools = createDocumentTools(snapshot, operations, readSelection);
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
    actionPrompt: ChatMessage,
    documentMessage: ChatMessage,
  ): Promise<AgentExecutorResult> {
    store.dispatch({ type: 'set_status', status: 'running' });

    const turns: ChatMessage[] = [documentMessage];

    const maxTurns = 20;
    for (let turn = 0; turn < maxTurns; turn++) {
      signal?.throwIfAborted();

      const messages: ChatMessage[] = [...config.systemMessages, actionPrompt, ...turns];

      let textAccum = '';
      const toolCalls: Array<{ id: string; name: string; arguments: string }> = [];

      store.dispatch({
        type: 'add_bubble',
        bubble: { type: 'assistant', content: '', streaming: true },
      });

      for await (const chunk of provider.chat(messages, toolSchemas)) {
        signal?.throwIfAborted();

        if (chunk.type === 'text') {
          textAccum += chunk.text;
          store.dispatch({
            type: 'update_last_bubble',
            bubble: { type: 'assistant', content: textAccum, streaming: true },
          });
        } else if (chunk.type === 'tool_call') {
          toolCalls.push({ id: chunk.id, name: chunk.name, arguments: chunk.arguments });
        }
      }

      store.dispatch({
        type: 'update_last_bubble',
        bubble: { type: 'assistant', content: textAccum, streaming: false },
      });

      if (toolCalls.length === 0) break;

      turns.push({ role: 'assistant_tool_call', toolCalls });

      for (const tc of toolCalls) {
        store.dispatch({
          type: 'add_bubble',
          bubble: { type: 'tool_call', toolName: tc.name, params: JSON.parse(tc.arguments) },
        });

        const result = await executeTool(tc.name, tc.arguments);

        const content = result.ok ? result.content : JSON.stringify(result.error);

        store.dispatch({
          type: 'add_bubble',
          bubble: { type: 'tool_result', toolName: tc.name, success: result.ok, summary: content },
        });

        turns.push({
          role: 'tool_result',
          toolCallId: tc.id,
          content,
          isError: !result.ok,
        });
      }
    }

    store.dispatch({ type: 'set_status', status: 'done' });
    return { operations };
  }

  return { run };
}
