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

  it('adds selected="true" to top-level blocks whose blockId is in selectedBlockIds', () => {
    const registry = new LitexmlRegistry();
    registry.registerWriter('paragraph', (node, ctx) => {
      const n = node as any;
      return {
        tag: 'p',
        attrs: n.$?.blockId ? { id: n.$.blockId } : {},
        children: ctx.serializeChildren(n.children ?? []),
      };
    });
    const paragraph = (blockId: string, text: string) => ({
      type: 'paragraph',
      ...(blockId ? { $: { blockId } } : {}),
      children: [
        {
          type: 'text',
          text,
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
    });
    const state = makeState([
      paragraph('p1', 'first'),
      paragraph('p2', 'second'),
      paragraph('p3', 'third'),
    ]);
    const xml = serializeToXml(state, registry, {
      compact: true,
      selectedBlockIds: new Set(['p1', 'p3']),
    });
    expect(xml).toBe(
      '<doc><p id="p1" selected="true">first</p><p id="p2">second</p><p id="p3" selected="true">third</p></doc>',
    );
  });

  it('does not add selected to nodes without blockId even if selectedBlockIds is provided', () => {
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
        children: [
          {
            type: 'text',
            text: 'no id',
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
    const xml = serializeToXml(state, registry, {
      compact: true,
      selectedBlockIds: new Set(['nonexistent']),
    });
    expect(xml).toBe('<doc><p>no id</p></doc>');
  });

  it('does not add selected when selectedBlockIds is undefined', () => {
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
