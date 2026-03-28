import { describe, expect, it } from 'vitest';

import { buildDocumentContext, buildMessages } from '../src/pipeline';
import type { MessagePipeline } from '../src/protocol';

describe('buildMessages', () => {
  it('concatenates system + action + turns in order', () => {
    const pipeline: MessagePipeline = {
      systemMessages: [
        { role: 'system', content: 'You are an editor agent.', cacheBreakpoint: true },
      ],
      actionPrompt: { role: 'user', content: 'Edit the selection', cacheBreakpoint: true },
      turns: [{ role: 'user', content: '## Document\nhello world' }],
    };
    const messages = buildMessages(pipeline);
    expect(messages).toHaveLength(3);
    expect(messages[0].role).toBe('system');
    expect(messages[1].role).toBe('user');
    expect(messages[2].role).toBe('user');
  });
});

describe('buildDocumentContext', () => {
  const editorState = {
    root: {
      type: 'root',
      children: [
        { type: 'paragraph', children: [{ type: 'text', text: 'Block 0' }], $: { blockId: 'b0' } },
        { type: 'paragraph', children: [{ type: 'text', text: 'Block 1' }], $: { blockId: 'b1' } },
        { type: 'paragraph', children: [{ type: 'text', text: 'Block 2' }], $: { blockId: 'b2' } },
        { type: 'paragraph', children: [{ type: 'text', text: 'Block 3' }], $: { blockId: 'b3' } },
        { type: 'paragraph', children: [{ type: 'text', text: 'Block 4' }], $: { blockId: 'b4' } },
      ],
    },
  };

  it('full mode returns all blocks', () => {
    const ctx = buildDocumentContext(editorState as any, { mode: 'full' });
    expect(ctx).toContain('b0');
    expect(ctx).toContain('b4');
  });

  it('structure mode returns type + blockId only', () => {
    const ctx = buildDocumentContext(editorState as any, { mode: 'structure' });
    expect(ctx).toContain('b0');
    expect(ctx).toContain('paragraph');
    expect(ctx.length).toBeLessThan(
      buildDocumentContext(editorState as any, { mode: 'full' }).length,
    );
  });
});
