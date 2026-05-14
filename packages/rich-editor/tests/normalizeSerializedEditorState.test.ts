import type { SerializedEditorState } from 'lexical';
import { describe, expect, it } from 'vitest';

import { normalizeSerializedEditorState } from '../src/utils/normalizeSerializedEditorState';

describe('normalizeSerializedEditorState', () => {
  it('injects a fallback paragraph when root children are empty', () => {
    const state = {
      root: {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    } as SerializedEditorState;

    const normalized = normalizeSerializedEditorState(state);

    expect(normalized.root.children).toHaveLength(1);
    expect(normalized.root.children[0].type).toBe('paragraph');
  });

  it('preserves existing root children unchanged', () => {
    const state = {
      root: {
        children: [
          {
            children: [],
            direction: null,
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            type: 'paragraph',
            version: 1,
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    } as SerializedEditorState;

    const normalized = normalizeSerializedEditorState(state);

    expect(normalized).toBe(state);
  });

  it('removes structural newline text around quote children', () => {
    const state = {
      root: {
        children: [
          {
            $: { blockId: 'quote-1' },
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: '\n',
                type: 'text',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'quoted',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                textStyle: '',
                type: 'paragraph',
                version: 1,
              },
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: '\n',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            type: 'quote',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    } as SerializedEditorState;

    const normalized = normalizeSerializedEditorState(state);
    const quote = normalized.root.children[0] as any;

    expect(quote.$?.blockId).toBe('quote-1');
    expect(quote.children).toHaveLength(1);
    expect(quote.children[0].type).toBe('paragraph');
  });
});
