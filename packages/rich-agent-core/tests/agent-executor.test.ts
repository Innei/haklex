import { describe, expect, it } from 'vitest';

import { createAgentExecutor } from '../src/agent-executor';
import type { LLMChunk, LLMProvider } from '../src/protocol';
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
      systemMessages: [{ role: 'system', content: 'You are a helpful agent.' }],
    });

    const result = await executor.run(
      {
        role: 'user',
        content: 'Fix the text',
        cacheBreakpoint: true,
      },
      { role: 'user', content: 'Document: Hello' },
    );

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
      systemMessages: [{ role: 'system', content: 'You are a helpful agent.' }],
    });

    const result = await executor.run(
      {
        role: 'user',
        content: 'Delete the paragraph',
        cacheBreakpoint: true,
      },
      { role: 'user', content: 'Document: Hello' },
    );

    expect(result.operations).toHaveLength(1);
    expect(result.operations[0].op).toBe('delete');
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
      systemMessages: [{ role: 'system', content: 'Agent' }],
      signal: controller.signal,
    });

    const promise = executor.run(
      { role: 'user', content: 'Do something' },
      { role: 'user', content: 'Doc' },
    );

    setTimeout(() => controller.abort(), 10);

    await expect(promise).rejects.toThrow();
  });
});
