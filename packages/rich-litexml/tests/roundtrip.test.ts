import { describe, expect, it } from 'vitest';

import { createDefaultRegistry } from '../src/default-registry';
import { deserializeFromXml } from '../src/deserializer';
import { serializeToXml } from '../src/serializer';

const registry = createDefaultRegistry();

function roundtrip(xml: string) {
  const state = deserializeFromXml(`<doc>${xml}</doc>`, registry);
  const output = serializeToXml(state, registry);
  // Strip <doc> wrapper for comparison
  return output
    .replace(/^<doc>\n/, '')
    .replace(/<\/doc>\n$/, '')
    .trim();
}

describe('roundtrip', () => {
  it('paragraph with plain text', () => {
    expect(roundtrip('<p id="p1">hello world</p>')).toBe('<p id="p1">hello world</p>');
  });

  it('paragraph with formatted text', () => {
    expect(roundtrip('<p id="p1">normal <b>bold</b> <i>italic</i></p>')).toBe(
      '<p id="p1">normal <b>bold</b> <i>italic</i></p>',
    );
  });

  it('heading', () => {
    expect(roundtrip('<h2 id="h1">Title</h2>')).toBe('<h2 id="h1">Title</h2>');
  });

  it('blockquote with attribution', () => {
    const input = '<blockquote id="q1" attribution="— Wang Xizhi">quoted</blockquote>';
    expect(roundtrip(input)).toBe(input);
  });

  it('blockquote without attribution stays as plain quote', () => {
    const input = '<blockquote id="q1">quoted</blockquote>';
    expect(roundtrip(input)).toBe(input);
  });

  it('unordered list', () => {
    const input = '<ul id="u1">\n  <li id="l1">A</li>\n  <li id="l2">B</li>\n</ul>';
    const result = roundtrip(input);
    expect(result).toContain('<ul id="u1">');
    expect(result).toContain('<li id="l1">A</li>');
    expect(result).toContain('<li id="l2">B</li>');
  });

  it('code-block', () => {
    expect(roundtrip('<codeblock id="c1" lang="ts">const x = 1</codeblock>')).toBe(
      '<codeblock id="c1" lang="ts">const x = 1</codeblock>',
    );
  });

  it('image', () => {
    expect(roundtrip('<img id="i1" src="/a.jpg" alt="Photo" />')).toContain('src="/a.jpg"');
  });

  it('image with display-width and layout', () => {
    const result = roundtrip(
      '<img id="i1" src="/a.jpg" alt="Photo" display-width="60" layout="float-right" />',
    );
    expect(result).toContain('display-width="60"');
    expect(result).toContain('layout="float-right"');
  });

  it('link inside paragraph', () => {
    const result = roundtrip('<p id="p1">See <a href="https://x.com">link</a></p>');
    expect(result).toContain('<a href="https://x.com">link</a>');
  });

  it('new XML without ids (AI-generated content)', () => {
    // AI-generated XML won't have ids — should still roundtrip structurally
    const state = deserializeFromXml('<doc><p>new para</p><h2>new heading</h2></doc>', registry);
    const children = (state.root as any).children;
    expect(children).toHaveLength(2);
    expect(children[0].type).toBe('paragraph');
    expect(children[1].type).toBe('heading');
    expect(children[1].tag).toBe('h2');
  });

  it('excalidraw roundtrip', () => {
    const result = roundtrip('<excalidraw id="ex1"><![CDATA[{"elements":[]}]]></excalidraw>');
    expect(result).toContain('<excalidraw id="ex1">');
    expect(result).toContain('<![CDATA[{"elements":[]}]]>');
    expect(result).toContain('</excalidraw>');
  });

  it('excalidraw empty roundtrip (AI inserts empty block)', () => {
    const result = roundtrip('<excalidraw />');
    expect(result).toContain('<excalidraw');
  });

  it('dynamic roundtrip', () => {
    const input =
      '<dynamic id="dyn1" url="https://cdn.example.com/widget.mjs" initial-height="480"><![CDATA[{"level":1}]]></dynamic>';
    expect(roundtrip(input)).toBe(input);
  });

  it('dynamic without props roundtrip', () => {
    const input =
      '<dynamic id="dyn2" url="https://cdn.example.com/widget.mjs" initial-height="320" />';
    expect(roundtrip(input)).toBe(input);
  });

  it('grid-container roundtrip', () => {
    const result = roundtrip(
      '<grid id="g1" cols="2" gap="16px"><cell><p>A</p></cell><cell><p>B</p></cell></grid>',
    );
    expect(result).toContain('<grid id="g1" cols="2" gap="16px">');
    expect(result).toContain('<cell>');
    expect(result).toContain('<p>A</p>');
    expect(result).toContain('<p>B</p>');
    expect(result).toContain('</grid>');
  });

  it('agent-diff roundtrip', () => {
    const result = roundtrip('<agent-diff id="ad1" op="insert" entry="d1" />');
    expect(result).toContain('<agent-diff');
    expect(result).toContain('op="insert"');
    expect(result).toContain('entry="d1"');
  });

  it('chat user-agent roundtrip', () => {
    const xml =
      '<chat variant="user-agent">' +
      '<participants>' +
      '<participant id="p_u" kind="user" name="Innei"></participant>' +
      '<participant id="p_a" kind="agent" name="Claude"></participant>' +
      '</participants>' +
      '<messages>' +
      '<message id="m1" participant="p_u">How are you?</message>' +
      '<message id="m2" participant="p_a">I am fine.</message>' +
      '</messages>' +
      '</chat>';
    const result = roundtrip(xml);
    expect(result).toContain('<chat variant="user-agent">');
    expect(result).toContain('<participant id="p_u" kind="user" name="Innei"');
    expect(result).toContain('<participant id="p_a" kind="agent" name="Claude"');
    expect(result).toContain('<message id="m1" participant="p_u">How are you?</message>');
    expect(result).toContain('<message id="m2" participant="p_a">I am fine.</message>');
  });

  it('chat user-user roundtrip preserves both bubbles', () => {
    const xml =
      '<chat variant="user-user">' +
      '<participants>' +
      '<participant id="p_a" kind="user" name="Alice"></participant>' +
      '<participant id="p_b" kind="user" name="Bob"></participant>' +
      '</participants>' +
      '<messages>' +
      '<message id="m1" participant="p_a">Hi</message>' +
      '<message id="m2" participant="p_b">Hello</message>' +
      '</messages>' +
      '</chat>';
    const result = roundtrip(xml);
    expect(result).toContain('<chat variant="user-user">');
    expect(result).toContain('<participant id="p_a" kind="user" name="Alice"');
    expect(result).toContain('<participant id="p_b" kind="user" name="Bob"');
  });
});
