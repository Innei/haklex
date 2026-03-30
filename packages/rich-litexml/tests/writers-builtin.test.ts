import type { SerializedEditorState } from 'lexical';
import { describe, expect, it } from 'vitest';

import { LitexmlRegistry } from '../src/registry';
import { serializeToXml } from '../src/serializer';
import { registerBuiltinWriters } from '../src/writers/builtin';

function makeState(children: any[]): SerializedEditorState {
  return {
    root: { type: 'root', children, direction: 'ltr', format: '', indent: 0, version: 1 },
  } as SerializedEditorState;
}

function serialize(children: any[]): string {
  const registry = new LitexmlRegistry();
  registerBuiltinWriters(registry);
  return serializeToXml(makeState(children), registry);
}

const TEXT = (text: string, format = 0) => ({
  type: 'text',
  text,
  format,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
});

describe('builtin writers', () => {
  it('paragraph', () => {
    const xml = serialize([
      {
        type: 'paragraph',
        $: { blockId: 'p1' },
        children: [TEXT('hello')],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('<p id="p1">hello</p>');
  });

  it('heading h2', () => {
    const xml = serialize([
      {
        type: 'heading',
        tag: 'h2',
        $: { blockId: 'h1' },
        children: [TEXT('Title')],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('<h2 id="h1">Title</h2>');
  });

  it('paragraph with formatted text', () => {
    const xml = serialize([
      {
        type: 'paragraph',
        $: { blockId: 'p2' },
        children: [TEXT('normal '), TEXT('bold', 1), TEXT(' end')],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('<p id="p2">normal <b>bold</b> end</p>');
  });

  it('quote', () => {
    const xml = serialize([
      {
        type: 'quote',
        $: { blockId: 'q1' },
        children: [TEXT('quoted')],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('<blockquote id="q1">quoted</blockquote>');
  });

  it('horizontal rule', () => {
    const xml = serialize([{ type: 'horizontalrule', $: { blockId: 'hr1' }, version: 1 }]);
    expect(xml).toContain('<hr id="hr1" />');
  });

  it('unordered list', () => {
    const xml = serialize([
      {
        type: 'list',
        listType: 'bullet',
        $: { blockId: 'ul1' },
        children: [
          {
            type: 'listitem',
            $: { blockId: 'li1' },
            children: [TEXT('item 1')],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            version: 1,
            value: 1,
          },
          {
            type: 'listitem',
            $: { blockId: 'li2' },
            children: [TEXT('item 2')],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            version: 1,
            value: 2,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        start: 1,
        version: 1,
        tag: 'ul',
      },
    ]);
    expect(xml).toContain('<ul id="ul1">');
    expect(xml).toContain('<li id="li1">item 1</li>');
    expect(xml).toContain('<li id="li2">item 2</li>');
    expect(xml).toContain('</ul>');
  });

  it('ordered list', () => {
    const xml = serialize([
      {
        type: 'list',
        listType: 'number',
        $: { blockId: 'ol1' },
        children: [
          {
            type: 'listitem',
            $: { blockId: 'li1' },
            children: [TEXT('first')],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            version: 1,
            value: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        start: 1,
        version: 1,
        tag: 'ol',
      },
    ]);
    expect(xml).toContain('<ol id="ol1">');
  });

  it('checklist', () => {
    const xml = serialize([
      {
        type: 'list',
        listType: 'check',
        $: { blockId: 'cl1' },
        children: [
          {
            type: 'listitem',
            $: { blockId: 'li1' },
            checked: true,
            children: [TEXT('done')],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            version: 1,
            value: 1,
          },
          {
            type: 'listitem',
            $: { blockId: 'li2' },
            checked: false,
            children: [TEXT('todo')],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            version: 1,
            value: 2,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        start: 1,
        version: 1,
        tag: 'ul',
      },
    ]);
    expect(xml).toContain('<ul id="cl1" type="check">');
    expect(xml).toContain('checked="true"');
    expect(xml).toContain('checked="false"');
  });

  it('link wrapping text', () => {
    const xml = serialize([
      {
        type: 'paragraph',
        $: { blockId: 'p1' },
        children: [
          {
            type: 'link',
            url: 'https://example.com',
            children: [TEXT('click')],
            direction: 'ltr',
            format: '',
            indent: 0,
            rel: null,
            target: null,
            title: null,
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
    expect(xml).toContain('<a href="https://example.com">click</a>');
  });

  it('table', () => {
    const xml = serialize([
      {
        type: 'table',
        $: { blockId: 't1' },
        children: [
          {
            type: 'tablerow',
            children: [
              {
                type: 'tablecell',
                headerState: 1,
                children: [
                  {
                    type: 'paragraph',
                    children: [TEXT('Header')],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    textFormat: 0,
                    textStyle: '',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
              {
                type: 'tablecell',
                headerState: 0,
                children: [
                  {
                    type: 'paragraph',
                    children: [TEXT('Cell')],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    textFormat: 0,
                    textStyle: '',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    ]);
    expect(xml).toContain('<table id="t1">');
    expect(xml).toContain('<th>');
    expect(xml).toContain('<td>');
  });
});
