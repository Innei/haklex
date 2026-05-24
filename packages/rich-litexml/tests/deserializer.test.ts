import { describe, expect, it } from 'vitest';

import { createDefaultRegistry } from '../src/default-registry';
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

describe('self-closing tag normalization', () => {
  it('does not swallow siblings after a custom self-closing tag', () => {
    const registry = new LitexmlRegistry();
    registry.registerReader(
      'p',
      (el, ctx) =>
        ({
          type: 'paragraph',
          children: ctx.parseChildren(el),
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          version: 1,
        }) as any,
    );
    registry.registerReader(
      'link-card',
      (el) =>
        ({
          type: 'link-card',
          url: el.getAttribute('url') ?? '',
          version: 1,
        }) as any,
    );
    const xml = '<doc><link-card url="https://x.com" /><p>a</p><p>b</p><p>c</p></doc>';
    const state = deserializeFromXml(xml, registry);
    const children = (state.root as any).children;
    expect(children.map((c: any) => c.type)).toEqual([
      'link-card',
      'paragraph',
      'paragraph',
      'paragraph',
    ]);
  });

  it('handles multi-line attributes on self-closing tags', () => {
    const registry = new LitexmlRegistry();
    registry.registerReader(
      'p',
      (el, ctx) =>
        ({
          type: 'paragraph',
          children: ctx.parseChildren(el),
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          version: 1,
        }) as any,
    );
    registry.registerReader(
      'video',
      (el) =>
        ({
          type: 'video',
          src: el.getAttribute('src') ?? '',
          poster: el.getAttribute('poster') ?? undefined,
          version: 1,
        }) as any,
    );
    const xml = `<doc><video
        src="https://x.com/clip.mp4"
        poster="https://x.com/poster.jpg" /><p>after</p></doc>`;
    const state = deserializeFromXml(xml, registry);
    const children = (state.root as any).children;
    expect(children.map((c: any) => c.type)).toEqual(['video', 'paragraph']);
    expect(children[0].src).toBe('https://x.com/clip.mp4');
    expect(children[0].poster).toBe('https://x.com/poster.jpg');
  });

  it('does not normalize inside CDATA sections', () => {
    const registry = createDefaultRegistry();
    const xml =
      '<doc><codeblock lang="xml"><![CDATA[<self-closing attr="x" />]]></codeblock><p>after</p></doc>';
    const state = deserializeFromXml(xml, registry);
    const children = (state.root as any).children;
    expect(children.map((c: any) => c.type)).toEqual(['code-block', 'paragraph']);
    // CDATA contents preserved verbatim including the `/>`
    expect(children[0].code).toContain('<self-closing attr="x" />');
  });

  it('leaves HTML void elements untouched', () => {
    const registry = new LitexmlRegistry();
    registry.registerReader('hr', () => ({ type: 'horizontalrule', version: 1 }) as any);
    registry.registerReader(
      'img',
      (el) =>
        ({
          type: 'image',
          src: el.getAttribute('src') ?? '',
          version: 1,
        }) as any,
    );
    registry.registerReader(
      'p',
      (el, ctx) =>
        ({
          type: 'paragraph',
          children: ctx.parseChildren(el),
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          version: 1,
        }) as any,
    );
    const xml = '<doc><hr /><img src="x.jpg" /><p>after</p></doc>';
    const state = deserializeFromXml(xml, registry);
    const children = (state.root as any).children;
    expect(children.map((c: any) => c.type)).toEqual(['horizontalrule', 'image', 'paragraph']);
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
