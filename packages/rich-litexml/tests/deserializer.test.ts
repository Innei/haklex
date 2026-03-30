import { describe, expect, it } from 'vitest';

import { deserializeFromXml, deserializeNodesFromXml } from '../src/deserializer';
import { LitexmlRegistry } from '../src/registry';

describe('deserializeFromXml', () => {
  it('deserializes empty doc', () => {
    const registry = new LitexmlRegistry();
    const state = deserializeFromXml('<doc></doc>', registry);
    expect(state.root.type).toBe('root');
    expect((state.root as any).children).toEqual([]);
  });

  it('parses fallback <node> elements', () => {
    const registry = new LitexmlRegistry();
    const xml = `<doc><node type="custom-thing" id="abc" data='{"foo":"bar"}' /></doc>`;
    const state = deserializeFromXml(xml, registry);
    const children = (state.root as any).children;
    expect(children).toHaveLength(1);
    expect(children[0].type).toBe('custom-thing');
    expect(children[0].foo).toBe('bar');
    expect(children[0].$?.blockId).toBe('abc');
  });

  it('calls registered reader', () => {
    const registry = new LitexmlRegistry();
    registry.registerReader('p', (element, ctx) => {
      const children = ctx.parseChildren(element);
      const id = element.getAttribute('id');
      return {
        type: 'paragraph',
        ...(id ? { $: { blockId: id } } : {}),
        children,
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      } as any;
    });
    const xml = '<doc><p id="p1">hello</p></doc>';
    const state = deserializeFromXml(xml, registry);
    const children = (state.root as any).children;
    expect(children).toHaveLength(1);
    expect(children[0].type).toBe('paragraph');
    expect(children[0].$?.blockId).toBe('p1');
  });
});

describe('deserializeNodesFromXml', () => {
  it('parses xml fragment into node array', () => {
    const registry = new LitexmlRegistry();
    registry.registerReader(
      'p',
      (element, ctx) =>
        ({
          type: 'paragraph',
          children: ctx.parseChildren(element),
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          version: 1,
        }) as any,
    );
    const nodes = deserializeNodesFromXml('<p>one</p><p>two</p>', registry);
    expect(nodes).toHaveLength(2);
    expect(nodes[0].type).toBe('paragraph');
    expect(nodes[1].type).toBe('paragraph');
  });
});
