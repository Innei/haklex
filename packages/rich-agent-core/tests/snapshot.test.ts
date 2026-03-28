import { describe, expect, it } from 'vitest';

import { compareBlockContent, createSnapshot } from '../src/snapshot';

function makeEditorState(blocks: Array<{ blockId: string; type: string; text: string }>) {
  return {
    root: {
      type: 'root',
      children: blocks.map((b) => ({
        type: b.type,
        children: [
          {
            type: 'text',
            text: b.text,
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
        $: { blockId: b.blockId },
      })),
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    },
  };
}

describe('createSnapshot', () => {
  it('builds blockId to node index from serialized editor state', () => {
    const state = makeEditorState([
      { blockId: 'a1', type: 'paragraph', text: 'Hello' },
      { blockId: 'b2', type: 'heading', text: 'World' },
    ]);
    const snap = createSnapshot(state as any);

    expect(snap.getBlock('a1')).toBeDefined();
    expect(snap.getBlock('a1')!.type).toBe('paragraph');
    expect(snap.getBlock('b2')!.type).toBe('heading');
    expect(snap.getBlock('nonexistent')).toBeUndefined();
  });

  it('returns all block IDs in document order', () => {
    const state = makeEditorState([
      { blockId: 'x', type: 'paragraph', text: 'first' },
      { blockId: 'y', type: 'paragraph', text: 'second' },
      { blockId: 'z', type: 'paragraph', text: 'third' },
    ]);
    const snap = createSnapshot(state as any);
    expect(snap.blockIds).toEqual(['x', 'y', 'z']);
  });
});

describe('compareBlockContent', () => {
  it('returns true when content matches', () => {
    const node = {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          text: 'hello',
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
    };
    expect(compareBlockContent(node as any, node as any)).toBe(true);
  });

  it('returns false when content differs', () => {
    const original = {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          text: 'hello',
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
    };
    const modified = {
      ...original,
      children: [
        {
          type: 'text',
          text: 'changed',
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          version: 1,
        },
      ],
    };
    expect(compareBlockContent(original as any, modified as any)).toBe(false);
  });
});
