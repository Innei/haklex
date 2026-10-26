import { describe, expect, it } from 'vitest';

import { groupRendererBlocks } from '../src/static-renderer/flow';

const block = (type: string, layout?: string) => ({ type, version: 1, layout });
describe('renderer flow boundaries', () => {
  it('ignores invalid optional image layout metadata', () => {
    expect(groupRendererBlocks([{ type: 'image', version: 1, layout: 42 }])).toEqual([[0]]);
  });
  it('keeps zero-height comments in a neighboring flow instead of inserting a gap', () => {
    expect(
      groupRendererBlocks([
        block('comment'),
        block('heading'),
        block('comment'),
        block('paragraph'),
      ]),
    ).toEqual([[0, 1, 2], [3]]);
  });
  it('keeps a float, flowing text, and its clearing block in one native flow', () => {
    expect(
      groupRendererBlocks([
        block('heading'),
        block('image', 'float-left'),
        block('paragraph'),
        block('list'),
        block('rich-quote'),
        block('horizontalrule'),
        block('heading'),
      ]),
    ).toEqual([[0], [1, 2, 3, 4, 5], [6]]);
  });
  it('keeps a second float with the text it affects', () => {
    expect(
      groupRendererBlocks([
        block('image', 'float-left'),
        block('paragraph'),
        block('image', 'float-right'),
        block('paragraph'),
        block('heading'),
        block('paragraph'),
      ]),
    ).toEqual([[0, 1, 2, 3, 4], [5]]);
  });
  it('does not turn a long text document into a single mounted group', () => {
    const blocks = Array.from({ length: 20000 }, () => block('paragraph'));
    expect(groupRendererBlocks(blocks).length).toBe(20000);
    const note = groupRendererBlocks(blocks, true);
    expect(note[0]).toEqual([0, 1]);
    expect(note.length).toBe(19999);
  });
});
