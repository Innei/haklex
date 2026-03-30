import { describe, expect, it } from 'vitest';

import { createAgentExecutor } from '../src/agent-executor';
import type { LLMChunk, LLMProvider, PreparedMessages } from '../src/protocol';
import { createSnapshot } from '../src/snapshot';
import { createAgentStore } from '../src/store';

function makeEditorState() {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text: 'Hello',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
          textFormat: 0,
          textStyle: '',
          $: { blockId: 'p1' },
        },
      ],
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    },
  };
}

function mockProvider(chunks: LLMChunk[]): LLMProvider {
  return {
    async *chat() {
      for (const chunk of chunks) {
        yield chunk;
      }
    },
  };
}

function makeInitialMessages(): Omit<PreparedMessages, 'turns'> {
  return {
    systemMessages: [{ role: 'system', content: 'You are a helpful agent.' }],
    preambleMessages: [
      {
        role: 'user',
        content: 'Fix the text',
        cacheBreakpoint: true,
      },
      {
        role: 'user',
        content: 'Document: Hello',
      },
    ],
  };
}

describe('createAgentExecutor', () => {
  it('executes a simple text-only response', async () => {
    const store = createAgentStore();
    const snapshot = createSnapshot(makeEditorState() as any);
    const provider = mockProvider([{ type: 'text', text: 'I will help you.' }, { type: 'done' }]);

    const executor = createAgentExecutor({
      provider,
      snapshot,
      store,
      tools: [],
    });

    const result = await executor.run(makeInitialMessages());

    expect(result.operations).toHaveLength(0);
    expect(store.getState().bubbles.length).toBeGreaterThan(0);
  });

  it('executes tool calls and accumulates operations', async () => {
    const store = createAgentStore();
    const snapshot = createSnapshot(makeEditorState() as any);

    // Mock provider that returns tool call first, then text after tool result
    let callCount = 0;
    const provider: LLMProvider = {
      async *chat() {
        callCount++;
        if (callCount === 1) {
          yield {
            type: 'tool_call' as const,
            id: 'tc1',
            name: 'delete_node',
            arguments: JSON.stringify({ blockId: 'p1' }),
          };
          yield { type: 'done' as const };
        } else {
          yield { type: 'text' as const, text: 'Deleted.' };
          yield { type: 'done' as const };
        }
      },
    };

    const executor = createAgentExecutor({
      provider,
      snapshot,
      store,
      tools: [],
    });

    const result = await executor.run({
      ...makeInitialMessages(),
      preambleMessages: [
        {
          role: 'user',
          content: 'Delete the paragraph',
          cacheBreakpoint: true,
        },
        { role: 'user', content: 'Document: Hello' },
      ],
    });

    expect(result.operations).toHaveLength(1);
    expect(result.operations[0].op).toBe('delete');
  });

  it('emits tool_call_group bubble with per-item status updates', async () => {
    const store = createAgentStore();
    const snapshot = createSnapshot(makeEditorState() as any);

    let callCount = 0;
    const provider: LLMProvider = {
      async *chat() {
        callCount++;
        if (callCount === 1) {
          yield {
            type: 'tool_call' as const,
            id: 'tc1',
            name: 'search_document',
            arguments: JSON.stringify({ query: 'Hello' }),
          };
          yield {
            type: 'tool_call' as const,
            id: 'tc2',
            name: 'delete_node',
            arguments: JSON.stringify({ blockId: 'p1' }),
          };
          yield { type: 'done' as const };
        } else {
          yield { type: 'text' as const, text: 'Done.' };
          yield { type: 'done' as const };
        }
      },
    };

    const executor = createAgentExecutor({
      provider,
      snapshot,
      store,
      tools: [],
    });

    await executor.run({
      systemMessages: [{ role: 'system', content: 'Agent' }],
      preambleMessages: [
        { role: 'user', content: 'Do it' },
        { role: 'user', content: 'Doc' },
      ],
    });

    const groupBubbles = store.getState().bubbles.filter((b) => b.type === 'tool_call_group');
    expect(groupBubbles).toHaveLength(1);

    const group = groupBubbles[0];
    if (group.type === 'tool_call_group') {
      expect(group.items).toHaveLength(2);
      expect(group.items[0].toolName).toBe('search_document');
      expect(group.items[0].status).toBe('completed');
      expect(group.items[0].finishedAt).toBeGreaterThan(0);
      expect(group.items[1].toolName).toBe('delete_node');
      expect(group.items[1].status).toBe('completed');
    }
  });

  it('sets item status to error on JSON parse failure', async () => {
    const store = createAgentStore();
    const snapshot = createSnapshot(makeEditorState() as any);

    let callCount = 0;
    const provider: LLMProvider = {
      async *chat() {
        callCount++;
        if (callCount === 1) {
          yield {
            type: 'tool_call' as const,
            id: 'tc1',
            name: 'delete_node',
            arguments: '{bad json',
          };
          yield { type: 'done' as const };
        } else {
          yield { type: 'text' as const, text: 'Failed.' };
          yield { type: 'done' as const };
        }
      },
    };

    const executor = createAgentExecutor({
      provider,
      snapshot,
      store,
      tools: [],
    });

    await executor.run({
      systemMessages: [{ role: 'system', content: 'Agent' }],
      preambleMessages: [
        { role: 'user', content: 'Do it' },
        { role: 'user', content: 'Doc' },
      ],
    });

    const group = store.getState().bubbles.find((b) => b.type === 'tool_call_group');
    if (group?.type === 'tool_call_group') {
      expect(group.items[0].status).toBe('error');
      expect(group.items[0].error).toBeDefined();
    }
  });

  it('supports abort via AbortController', async () => {
    const store = createAgentStore();
    const snapshot = createSnapshot(makeEditorState() as any);
    const controller = new AbortController();

    const provider: LLMProvider = {
      async *chat() {
        yield { type: 'text' as const, text: 'thinking...' };
        await new Promise((_, reject) => {
          controller.signal.addEventListener('abort', () => reject(new Error('aborted')));
        });
      },
    };

    const executor = createAgentExecutor({
      provider,
      snapshot,
      store,
      tools: [],
      signal: controller.signal,
    });

    const promise = executor.run({
      systemMessages: [{ role: 'system', content: 'Agent' }],
      preambleMessages: [
        { role: 'user', content: 'Do something' },
        { role: 'user', content: 'Doc' },
      ],
    });

    setTimeout(() => controller.abort(), 10);

    await expect(promise).rejects.toThrow();
  });
});
