import { createHeadlessEditor } from '@lexical/headless';
import { describe, expect, it } from 'vitest';

import { allHeadlessNodes } from '../src';

const text = (value: string) => ({
  type: 'text',
  version: 1,
  text: value,
  format: 0,
  detail: 0,
  mode: 'normal',
  style: '',
});

const paragraph = (value: string) => ({
  type: 'paragraph',
  version: 1,
  direction: null,
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  children: [text(value)],
});

const element = (type: string, extra: Record<string, unknown> = {}) => ({
  type,
  version: 1,
  direction: null,
  format: '',
  indent: 0,
  children: [text('x')],
  ...extra,
});

const blocks: Record<string, unknown>[] = [
  { type: 'chart', version: 1, spec: '{"type":"bar"}' },
  { type: 'excalidraw', version: 1, snapshot: 'ref:abc' },
  { type: 'mermaid', version: 1, diagram: 'graph TD; A-->B' },
  { type: 'image', version: 1, src: 'https://example.com/a.png', altText: 'a' },
  { type: 'banner', version: 1, bannerType: 'tip', content: null },
  { type: 'alert-quote', version: 1, alertType: 'warning', content: null },
  { type: 'nested-doc', version: 1, content: null },
  { type: 'grid-container', version: 1, cols: 2, gap: '16px', cells: [] },
  element('details', { summary: 'More', open: true, children: [paragraph('inside')] }),
  element('rich-quote', { attribution: 'Lu Xun', children: [paragraph('quote')] }),
];

const inline = [element('ruby', { reading: 'かん' }), element('spoiler')];

function roundTrip() {
  const children = blocks.map((b, i) => ({ ...b, $: { blockId: `b${i}` } }));
  children.push({
    ...paragraph('host'),
    children: inline.map((n, i) => ({ ...n, $: { blockId: `i${i}` } })),
    $: { blockId: 'p0' },
  });
  const state = JSON.stringify({
    root: { type: 'root', version: 1, direction: null, format: '', indent: 0, children },
  });
  const editor = createHeadlessEditor({
    nodes: allHeadlessNodes,
    onError: (e) => {
      throw e;
    },
  });
  const parsed = editor.parseEditorState(state);
  editor.setEditorState(parsed);
  return editor.getEditorState().toJSON() as any;
}

describe('headless block ids', () => {
  const json = roundTrip();
  const out = json.root.children as any[];

  it.each(blocks.map((b, i) => [b.type as string, i] as const))(
    'keeps $.blockId on %s',
    (type, i) => {
      expect(out[i].type).toBe(type);
      expect(out[i].$).toEqual({ blockId: `b${i}` });
    },
  );

  it.each(inline.map((n, i) => [n.type as string, i] as const))(
    'keeps $.blockId on inline %s',
    (type, i) => {
      const node = out.at(-1).children[i];
      expect(node.type).toBe(type);
      expect(node.$).toEqual({ blockId: `i${i}` });
    },
  );

  it('keeps node-specific fields alongside the block id', () => {
    expect(out[0].spec).toBe('{"type":"bar"}');
    expect(out[4].bannerType).toBe('tip');
    expect(out[7].cols).toBe(2);
    expect(out[8].summary).toBe('More');
    expect(out[8].open).toBe(true);
    expect(out[9].attribution).toBe('Lu Xun');
    expect(out.at(-1).children[0].reading).toBe('かん');
  });
});
