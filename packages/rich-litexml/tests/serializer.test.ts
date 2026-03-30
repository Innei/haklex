import type { SerializedEditorState } from 'lexical';
import { describe, expect, it } from 'vitest';

import { LitexmlRegistry } from '../src/registry';
import { serializeToXml } from '../src/serializer';

function makeState(children: any[]): SerializedEditorState {
  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  } as SerializedEditorState;
}

describe('serializeToXml', () => {
  it('serializes empty document', () => {
    const registry = new LitexmlRegistry();
    const state = makeState([]);
    const xml = serializeToXml(state, registry);
    expect(xml).toBe('<doc>\n</doc>\n');
  });

  it('uses fallback for unregistered nodes', () => {
    const registry = new LitexmlRegistry();
    const state = makeState([
      { type: 'custom-thing', $: { blockId: 'abc' }, foo: 'bar', version: 1 },
    ]);
    const xml = serializeToXml(state, registry);
    expect(xml).toContain('<node type="custom-thing" id="abc"');
    expect(xml).toContain('data=');
  });

  it('calls registered writer', () => {
    const registry = new LitexmlRegistry();
    registry.registerWriter('paragraph', (node, ctx) => {
      const n = node as any;
      return {
        tag: 'p',
        attrs: n.$?.blockId ? { id: n.$.blockId } : {},
        children: ctx.serializeChildren(n.children ?? []),
      };
    });
    const state = makeState([
      {
        type: 'paragraph',
        $: { blockId: 'p1' },
        children: [
          {
            type: 'text',
            text: 'hello',
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
    ]);
    const xml = serializeToXml(state, registry);
    expect(xml).toContain('<p id="p1">hello</p>');
  });

  it('supports compact output without indentation or trailing newlines', () => {
    const registry = new LitexmlRegistry();
    registry.registerWriter('paragraph', (node, ctx) => {
      const n = node as any;
      return {
        tag: 'p',
        attrs: n.$?.blockId ? { id: n.$.blockId } : {},
        children: ctx.serializeChildren(n.children ?? []),
      };
    });
    const state = makeState([
      {
        type: 'paragraph',
        $: { blockId: 'p1' },
        children: [
          {
            type: 'text',
            text: 'hello',
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
    ]);
    const xml = serializeToXml(state, registry, { compact: true });
    expect(xml).toBe('<doc><p id="p1">hello</p></doc>');
  });
});
