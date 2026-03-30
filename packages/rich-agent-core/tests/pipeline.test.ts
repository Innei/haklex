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
  it('returns XML format with doc wrapper', () => {
    const state = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            $: { blockId: 'p1' },
            children: [
              {
                type: 'text',
                text: 'Hello',
                format: 0,
                detail: 0,
                mode: 'normal',
                style: '',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            version: 1,
          },
          {
            type: 'heading',
            tag: 'h2',
            $: { blockId: 'h1' },
            children: [
              {
                type: 'text',
                text: 'Title',
                format: 0,
                detail: 0,
                mode: 'normal',
                style: '',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    } as any;

    const xml = buildDocumentContext(state, { mode: 'full' });
    expect(xml).toContain('<p id="p1">Hello</p>');
    expect(xml).toContain('<h2 id="h1">Title</h2>');
  });

  it('wraps output in doc element', () => {
    const state = {
      root: {
        type: 'root',
        children: [],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    } as any;
    const xml = buildDocumentContext(state, { mode: 'full' });
    expect(xml).toContain('<doc>');
    expect(xml).toContain('</doc>');
  });
});
