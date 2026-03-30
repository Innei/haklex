import { describe, expect, it } from 'vitest';

import { deserializeFromXml } from '../src/deserializer';
import { registerBuiltinReaders } from '../src/readers/builtin';
import { LitexmlRegistry } from '../src/registry';

function parse(xml: string) {
  const registry = new LitexmlRegistry();
  registerBuiltinReaders(registry);
  const state = deserializeFromXml(`<doc>${xml}</doc>`, registry);
  return (state.root as any).children;
}

describe('builtin readers', () => {
  it('reads <p>', () => {
    const nodes = parse('<p id="p1">hello</p>');
    expect(nodes).toHaveLength(1);
    expect(nodes[0].type).toBe('paragraph');
    expect(nodes[0].$?.blockId).toBe('p1');
    expect(nodes[0].children[0].type).toBe('text');
    expect(nodes[0].children[0].text).toBe('hello');
  });

  it('reads <h3>', () => {
    const nodes = parse('<h3 id="h1">Title</h3>');
    expect(nodes[0].type).toBe('heading');
    expect(nodes[0].tag).toBe('h3');
  });

  it('reads <blockquote>', () => {
    const nodes = parse('<blockquote id="q1">text</blockquote>');
    expect(nodes[0].type).toBe('quote');
  });

  it('reads <hr />', () => {
    const nodes = parse('<hr id="hr1" />');
    expect(nodes[0].type).toBe('horizontalrule');
  });

  it('reads <ul> with <li>', () => {
    const nodes = parse('<ul id="ul1"><li id="li1">item</li></ul>');
    expect(nodes[0].type).toBe('list');
    expect(nodes[0].listType).toBe('bullet');
    expect(nodes[0].children[0].type).toBe('listitem');
  });

  it('reads <ol>', () => {
    const nodes = parse('<ol id="ol1"><li id="li1">item</li></ol>');
    expect(nodes[0].listType).toBe('number');
  });

  it('reads checklist', () => {
    const nodes = parse('<ul type="check" id="cl1"><li checked="true" id="li1">done</li></ul>');
    expect(nodes[0].listType).toBe('check');
    expect(nodes[0].children[0].checked).toBe(true);
  });

  it('reads <a>', () => {
    const nodes = parse('<p id="p1"><a href="https://example.com">link</a></p>');
    const link = nodes[0].children[0];
    expect(link.type).toBe('link');
    expect(link.url).toBe('https://example.com');
    expect(link.children[0].text).toBe('link');
  });

  it('reads formatted text', () => {
    const nodes = parse('<p id="p1">plain <b>bold</b> <b><i>both</i></b></p>');
    const children = nodes[0].children;
    expect(children[0].text).toBe('plain ');
    expect(children[0].format).toBe(0);
    expect(children[1].text).toBe('bold');
    expect(children[1].format).toBe(1); // bold
    expect(children[2].text).toBe(' ');
    expect(children[2].format).toBe(0);
    expect(children[3].text).toBe('both');
    expect(children[3].format).toBe(3); // bold + italic
  });

  it('reads table', () => {
    const nodes = parse('<table id="t1"><tr><th><p>H</p></th><td><p>C</p></td></tr></table>');
    expect(nodes[0].type).toBe('table');
    const row = nodes[0].children[0];
    expect(row.type).toBe('tablerow');
    expect(row.children[0].type).toBe('tablecell');
    expect(row.children[0].headerState).toBe(1);
    expect(row.children[1].headerState).toBe(0);
  });
});
