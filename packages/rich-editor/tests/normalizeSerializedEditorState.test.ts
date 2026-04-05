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
});
