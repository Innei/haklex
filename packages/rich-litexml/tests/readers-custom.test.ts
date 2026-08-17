import { describe, expect, it } from 'vitest';

import { deserializeFromXml } from '../src/deserializer';
import { registerBuiltinReaders } from '../src/readers/builtin';
import { registerCustomReaders } from '../src/readers/custom';
import { LitexmlRegistry } from '../src/registry';

function parse(xml: string) {
  const registry = new LitexmlRegistry();
  registerBuiltinReaders(registry);
  registerCustomReaders(registry);
  const state = deserializeFromXml(`<doc>${xml}</doc>`, registry);
  return (state.root as any).children;
}

describe('custom readers', () => {
  it('reads <img />', () => {
    const nodes = parse('<img id="i1" src="/a.jpg" alt="Photo" width="800" />');
    expect(nodes[0].type).toBe('image');
    expect(nodes[0].src).toBe('/a.jpg');
    expect(nodes[0].altText).toBe('Photo');
    expect(nodes[0].width).toBe(800);
    expect(nodes[0].$?.blockId).toBe('i1');
  });

  it('reads <img /> display-width and layout', () => {
    const nodes = parse('<img src="/a.jpg" alt="A" display-width="60" layout="float-right" />');
    expect(nodes[0].displayWidth).toBe(60);
    expect(nodes[0].layout).toBe('float-right');
  });

  it('rejects invalid <img /> layout values', () => {
    const nodes = parse('<img src="/a.jpg" alt="A" layout="banana" />');
    expect(nodes[0].layout).toBeUndefined();
  });

  it('rejects out-of-range or non-numeric <img /> display-width', () => {
    expect(parse('<img src="/a.jpg" alt="A" display-width="5" />')[0].displayWidth).toBeUndefined();
    expect(
      parse('<img src="/a.jpg" alt="A" display-width="150" />')[0].displayWidth,
    ).toBeUndefined();
    expect(
      parse('<img src="/a.jpg" alt="A" display-width="abc" />')[0].displayWidth,
    ).toBeUndefined();
  });

  it('reads <img /> fixed-width and fixed-height', () => {
    expect(parse('<img src="/a.jpg" alt="A" fixed-width="360" />')[0].fixedWidth).toBe(360);
    expect(parse('<img src="/a.jpg" alt="A" fixed-height="240" />')[0].fixedHeight).toBe(240);
  });

  it('rejects invalid <img /> fixed-width and fixed-height', () => {
    expect(parse('<img src="/a.jpg" alt="A" fixed-width="0" />')[0].fixedWidth).toBeUndefined();
    expect(parse('<img src="/a.jpg" alt="A" fixed-width="-8" />')[0].fixedWidth).toBeUndefined();
    expect(parse('<img src="/a.jpg" alt="A" fixed-height="abc" />')[0].fixedHeight).toBeUndefined();
  });

  it('keeps only display-width when multiple image size attributes are present', () => {
    const node = parse(
      '<img src="/a.jpg" alt="A" display-width="50" fixed-width="360" fixed-height="240" />',
    )[0];
    expect(node.displayWidth).toBe(50);
    expect(node.fixedWidth).toBeUndefined();
    expect(node.fixedHeight).toBeUndefined();
  });

  it('reads <video />', () => {
    const nodes = parse('<video id="v1" src="/clip.mp4" poster="/thumb.jpg" />');
    expect(nodes[0].type).toBe('video');
    expect(nodes[0].src).toBe('/clip.mp4');
    expect(nodes[0].poster).toBe('/thumb.jpg');
  });

  it('reads <codeblock>', () => {
    const nodes = parse('<codeblock id="cb1" lang="ts">const x = 1</codeblock>');
    expect(nodes[0].type).toBe('code-block');
    expect(nodes[0].code).toBe('const x = 1');
    expect(nodes[0].language).toBe('ts');
  });

  it('reads <codeblock> CDATA without dropping code content', () => {
    const code = [
      '#!/usr/bin/env node',
      "import { spawnSync } from 'node:child_process'",
      'for (const [cmd, args] of steps) {',
      "  console.log(`run ${cmd} ${args.join(' ')}`)",
      '  if (r.status !== 0) process.exit(r.status ?? 1)',
      '}',
    ].join('\n');
    const nodes = parse(`<codeblock id="cb1" lang="js"><![CDATA[${code}]]></codeblock>`);
    expect(nodes[0].type).toBe('code-block');
    expect(nodes[0].code).toBe(code);
    expect(nodes[0].language).toBe('js');
  });

  it('reads <math display="block">', () => {
    const nodes = parse('<math id="kb1" display="block">E=mc^2</math>');
    expect(nodes[0].type).toBe('katex-block');
    expect(nodes[0].equation).toBe('E=mc^2');
  });

  it('reads inline <math>', () => {
    const nodes = parse('<p id="p1">Energy: <math>E=mc^2</math></p>');
    const inline = nodes[0].children[1];
    expect(inline.type).toBe('katex-inline');
    expect(inline.equation).toBe('E=mc^2');
  });

  it('reads inline <math color="..."> and preserves color', () => {
    const nodes = parse('<p id="p1"><math color="#ef4444">E=mc^2</math></p>');
    const inline = nodes[0].children[0];
    expect(inline.type).toBe('katex-inline');
    expect(inline.color).toBe('#ef4444');
  });

  it('reads <alert>', () => {
    const nodes = parse('<alert id="aq1" type="warning"><p>Be careful</p></alert>');
    expect(nodes[0].type).toBe('alert-quote');
    expect(nodes[0].alertType).toBe('warning');
    expect(nodes[0].content.root.children[0].type).toBe('paragraph');
  });

  it('reads <details>', () => {
    const nodes = parse('<details id="d1" summary="Click" open="true"><p>content</p></details>');
    expect(nodes[0].type).toBe('details');
    expect(nodes[0].summary).toBe('Click');
    expect(nodes[0].open).toBe(true);
    expect(nodes[0].children[0].type).toBe('paragraph');
  });

  it('reads <mention>', () => {
    const nodes = parse('<p id="p1"><mention platform="github" handle="innei">Innei</mention></p>');
    const m = nodes[0].children[0];
    expect(m.type).toBe('mention');
    expect(m.platform).toBe('github');
    expect(m.handle).toBe('innei');
    expect(m.displayName).toBe('Innei');
  });

  it('reads <tag>', () => {
    const nodes = parse('<p id="p1"><tag>AI</tag></p>');
    expect(nodes[0].children[0].type).toBe('tag');
    expect(nodes[0].children[0].text).toBe('AI');
  });

  it('reads <comment>', () => {
    const nodes = parse('<p id="p1"><comment>a comment</comment></p>');
    expect(nodes[0].children[0].type).toBe('comment');
    expect(nodes[0].children[0].text).toBe('a comment');
  });

  it('reads <spoiler>', () => {
    const nodes = parse('<p id="p1"><spoiler>hidden</spoiler></p>');
    expect(nodes[0].children[0].type).toBe('spoiler');
    expect(nodes[0].children[0].children[0].text).toBe('hidden');
  });

  it('reads <ruby>', () => {
    const nodes = parse('<p id="p1"><ruby rt="きょう">今日</ruby></p>');
    expect(nodes[0].children[0].type).toBe('ruby');
    expect(nodes[0].children[0].reading).toBe('きょう');
  });

  it('reads <footnote />', () => {
    const nodes = parse('<p id="p1">text<footnote ref="1" /></p>');
    const fn = nodes[0].children[1];
    expect(fn.type).toBe('footnote');
    expect(fn.identifier).toBe('1');
  });

  it('reads <footnote-section>', () => {
    const nodes = parse(
      '<footnote-section id="fs1"><def ref="1">Note one</def></footnote-section>',
    );
    expect(nodes[0].type).toBe('footnote-section');
    expect(nodes[0].definitions['1']).toBe('Note one');
  });

  it('reads <link-card />', () => {
    const nodes = parse('<link-card id="lc1" url="https://example.com" title="Ex" />');
    expect(nodes[0].type).toBe('link-card');
    expect(nodes[0].url).toBe('https://example.com');
  });

  it('reads <embed />', () => {
    const nodes = parse('<embed id="e1" url="https://youtube.com/123" source="youtube" />');
    expect(nodes[0].type).toBe('embed');
  });

  it('reads <mermaid>', () => {
    const nodes = parse('<mermaid id="m1">graph LR</mermaid>');
    expect(nodes[0].type).toBe('mermaid');
    expect(nodes[0].diagram).toBe('graph LR');
  });

  it('reads <gallery>', () => {
    const nodes = parse(
      '<gallery id="g1" layout="grid"><img src="/a.jpg" alt="A" /><img src="/b.jpg" alt="B" /></gallery>',
    );
    expect(nodes[0].type).toBe('gallery');
    expect(nodes[0].layout).toBe('grid');
    expect(nodes[0].images).toHaveLength(2);
    expect(nodes[0].images[0].src).toBe('/a.jpg');
  });

  it('reads <gallery> with no new attributes and applies defaults', () => {
    const nodes = parse('<gallery layout="grid"><img src="/a.jpg" alt="A" /></gallery>');
    expect(nodes[0].aspect).toBe('auto');
    expect(nodes[0].fit).toBe('cover');
    expect(nodes[0].maxItemHeight).toBeUndefined();
  });

  it('reads <gallery> aspect, fit, and max-item-height', () => {
    const nodes = parse(
      '<gallery layout="masonry" aspect="16:9" fit="contain" max-item-height="480"><img src="/a.jpg" alt="A" /></gallery>',
    );
    expect(nodes[0].aspect).toBe('16:9');
    expect(nodes[0].fit).toBe('contain');
    expect(nodes[0].maxItemHeight).toBe(480);
  });

  it('rejects invalid <gallery> aspect, fit, and max-item-height values', () => {
    const nodes = parse(
      '<gallery aspect="banana" fit="squish" max-item-height="-3"><img src="/a.jpg" alt="A" /></gallery>',
    );
    expect(nodes[0].aspect).toBe('auto');
    expect(nodes[0].fit).toBe('cover');
    expect(nodes[0].maxItemHeight).toBeUndefined();

    const nodes2 = parse('<gallery max-item-height="abc"><img src="/a.jpg" alt="A" /></gallery>');
    expect(nodes2[0].maxItemHeight).toBeUndefined();
  });

  it('reads <code-snippet>', () => {
    const nodes = parse(
      '<code-snippet id="cs1"><file name="index.ts" lang="ts">export {}</file></code-snippet>',
    );
    expect(nodes[0].type).toBe('code-snippet');
    expect(nodes[0].files[0].filename).toBe('index.ts');
    expect(nodes[0].files[0].code).toBe('export {}');
  });

  it('reads <banner>', () => {
    const nodes = parse('<banner id="b1" type="tip"><p>Tip content</p></banner>');
    expect(nodes[0].type).toBe('banner');
    expect(nodes[0].bannerType).toBe('tip');
    expect(nodes[0].content.root.children[0].type).toBe('paragraph');
  });

  it('reads <excalidraw> with CDATA', () => {
    const nodes = parse('<excalidraw id="ex1"><![CDATA[{"elements":[]}]]></excalidraw>');
    expect(nodes[0].type).toBe('excalidraw');
    expect(nodes[0].snapshot).toBe('{"elements":[]}');
    expect(nodes[0].$?.blockId).toBe('ex1');
  });

  it('reads <excalidraw> with a remote URL body', () => {
    const nodes = parse(
      '<excalidraw id="ex1">https://cdn.example.com/diagram.excalidraw</excalidraw>',
    );
    expect(nodes[0].type).toBe('excalidraw');
    expect(nodes[0].snapshot).toBe('https://cdn.example.com/diagram.excalidraw');
  });

  it('reads <excalidraw> with snapshot attribute (backward compat)', () => {
    const nodes = parse('<excalidraw id="ex1" snapshot="{&quot;elements&quot;:[]}" />');
    expect(nodes[0].type).toBe('excalidraw');
    expect(nodes[0].snapshot).toBe('{"elements":[]}');
  });

  it('reads <excalidraw /> with empty snapshot', () => {
    const nodes = parse('<excalidraw id="ex2" />');
    expect(nodes[0].type).toBe('excalidraw');
    expect(nodes[0].snapshot).toBe('');
  });

  it('reads <dynamic> with props CDATA', () => {
    const nodes = parse(
      '<dynamic id="dyn1" url="https://cdn.example.com/widget.mjs" initial-height="480"><![CDATA[{"level":1}]]></dynamic>',
    );
    expect(nodes[0].type).toBe('dynamic');
    expect(nodes[0].url).toBe('https://cdn.example.com/widget.mjs');
    expect(nodes[0].initialHeight).toBe(480);
    expect(nodes[0].props).toEqual({ level: 1 });
    expect(nodes[0].$?.blockId).toBe('dyn1');
  });

  it('reads self-closing <dynamic /> with defaults', () => {
    const nodes = parse('<dynamic id="dyn2" url="https://cdn.example.com/widget.mjs" />');
    expect(nodes[0].type).toBe('dynamic');
    expect(nodes[0].props).toEqual({});
    expect(nodes[0].initialHeight).toBe(320);
  });

  it('reads <dynamic> with malformed props as empty object', () => {
    const nodes = parse(
      '<dynamic id="dyn3" url="https://cdn.example.com/widget.mjs"><![CDATA[{broken]]></dynamic>',
    );
    expect(nodes[0].type).toBe('dynamic');
    expect(nodes[0].props).toEqual({});
  });

  it('reads <grid>', () => {
    const nodes = parse(
      '<grid id="g1" cols="3" gap="8px"><cell><p>A</p></cell><cell><p>B</p></cell><cell><p>C</p></cell></grid>',
    );
    expect(nodes[0].type).toBe('grid-container');
    expect(nodes[0].cols).toBe(3);
    expect(nodes[0].gap).toBe('8px');
    expect(nodes[0].cells).toHaveLength(3);
    expect(nodes[0].cells[0].root.children[0].type).toBe('paragraph');
  });

  it('reads <grid> with default cols', () => {
    const nodes = parse('<grid><cell><p>A</p></cell></grid>');
    expect(nodes[0].type).toBe('grid-container');
    expect(nodes[0].cols).toBe(2);
    expect(nodes[0].gap).toBe('16px');
  });

  it('reads <agent-diff />', () => {
    const nodes = parse('<agent-diff id="ad1" op="replace" entry="diff-123" />');
    expect(nodes[0].type).toBe('agent-diff');
    expect(nodes[0].opType).toBe('replace');
    expect(nodes[0].diffEntryId).toBe('diff-123');
  });

  it('reads <poll>', () => {
    const nodes = parse(
      '<poll id="pl1" poll-id="p_abc" mode="multiple" close-at="2026-05-01" show-results="after-vote"><question>Which one?</question><option id="o_a">Option A</option><option id="o_b">Option B</option></poll>',
    );
    expect(nodes[0].type).toBe('poll');
    expect(nodes[0].pollId).toBe('p_abc');
    expect(nodes[0].question).toBe('Which one?');
    expect(nodes[0].mode).toBe('multiple');
    expect(nodes[0].closeAt).toBe('2026-05-01');
    expect(nodes[0].showResults).toBe('after-vote');
    expect(nodes[0].options).toEqual([
      { id: 'o_a', label: 'Option A' },
      { id: 'o_b', label: 'Option B' },
    ]);
  });

  it('reads <poll> mints IDs when missing (agent creates fresh)', () => {
    const nodes = parse(
      '<poll mode="single"><question>Pick one</question><option>A</option><option>B</option></poll>',
    );
    expect(nodes[0].type).toBe('poll');
    expect(nodes[0].mode).toBe('single');
    expect(typeof nodes[0].pollId).toBe('string');
    expect((nodes[0].pollId as string).startsWith('p_')).toBe(true);
    expect(nodes[0].options).toHaveLength(2);
    expect((nodes[0].options[0].id as string).startsWith('o_')).toBe(true);
    expect(nodes[0].options[0].label).toBe('A');
  });
});
