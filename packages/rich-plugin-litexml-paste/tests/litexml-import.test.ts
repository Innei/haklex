import { describe, expect, it } from 'vitest';

import { detectLiteXml, parseLiteXmlSerializedNodes } from '../src/litexml-import';

describe('LiteXML import detection', () => {
  it('detects Haklex custom LiteXML fragments', () => {
    expect(detectLiteXml('<poll><question>Pick one</question></poll>')).toBe(true);
    expect(detectLiteXml('<grid cols="2"><cell><p>A</p></cell></grid>')).toBe(true);
    expect(detectLiteXml('<codeblock lang="ts">const x = 1</codeblock>')).toBe(true);
    expect(detectLiteXml('<mention platform="github" handle="innei">Innei</mention>')).toBe(true);
  });

  it('does not classify ordinary Markdown as LiteXML', () => {
    expect(detectLiteXml('![Alt](/image.png)')).toBe(false);
    expect(detectLiteXml('[Haklex](https://example.com)')).toBe(false);
    expect(detectLiteXml('```ts\nconst x = 1\n```')).toBe(false);
  });
});

describe('LiteXML serialized node import', () => {
  it('parses a poll fragment through the default LiteXML registry', () => {
    const nodes = parseLiteXmlSerializedNodes(
      '<poll poll-id="p_abc" mode="multiple"><question>Pick one</question><option id="o_a">A</option><option id="o_b">B</option></poll>',
    );

    expect(nodes).toHaveLength(1);
    expect(nodes?.[0]).toMatchObject({
      type: 'poll',
      pollId: 'p_abc',
      mode: 'multiple',
      question: 'Pick one',
      options: [
        { id: 'o_a', label: 'A' },
        { id: 'o_b', label: 'B' },
      ],
    });
  });

  it('parses nested block fragments', () => {
    const nodes = parseLiteXmlSerializedNodes(
      '<banner type="tip"><p>Tip <mention platform="github" handle="innei">Innei</mention></p></banner>',
    );

    expect(nodes).toHaveLength(1);
    expect(nodes?.[0]).toMatchObject({
      type: 'banner',
      bannerType: 'tip',
    });
    expect((nodes?.[0] as any).content.root.children[0].children[1]).toMatchObject({
      type: 'mention',
      platform: 'github',
      handle: 'innei',
      displayName: 'Innei',
    });
  });

  it('parses kebab-case custom tags', () => {
    const nodes = parseLiteXmlSerializedNodes(
      '<code-snippet><file name="index.ts" lang="ts">export {}</file></code-snippet>',
    );

    expect(nodes).toHaveLength(1);
    expect(nodes?.[0]).toMatchObject({
      type: 'code-snippet',
      files: [{ filename: 'index.ts', language: 'ts', code: 'export {}' }],
    });
  });
});
