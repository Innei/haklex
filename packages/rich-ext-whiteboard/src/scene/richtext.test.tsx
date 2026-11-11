import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { newRichTextElement } from '../model/create';
import { paragraphs } from '../model/richtext';
import { computeSceneBounds, Scene, SceneContent } from './Scene';
import type { ExcalidrawElement } from './types';

const BREW = {
  root: {
    type: 'root',
    children: [
      { type: 'paragraph', children: [{ type: 'text', text: 'Brew', format: 1 }] },
      { type: 'paragraph', children: [{ type: 'text', text: 'Mila', style: 'color: #6b6b6b' }] },
      {
        type: 'list',
        listType: 'bullet',
        children: [{ type: 'listitem', children: [{ type: 'text', text: 'hops' }] }],
      },
      {
        type: 'image',
        src: 'x.png',
        altText: 'pic',
        children: [{ type: 'text', text: 'caption' }],
      },
      {
        type: 'paragraph',
        children: [
          { type: 'link', url: 'javascript:alert(1)', children: [{ type: 'text', text: 'bad' }] },
          { type: 'link', url: 'https://example.com', children: [{ type: 'text', text: 'good' }] },
        ],
      },
    ],
  },
};

const render = (el: ExcalidrawElement) =>
  renderToStaticMarkup(
    <svg>
      <SceneContent scene={{ elements: [el] }} />
    </svg>,
  );

describe('rich text card rendering', () => {
  it('draws the card body and its content in a foreignObject', () => {
    const html = render(newRichTextElement({ width: 160, height: 100, content: BREW }));
    expect(html).toMatch(/<path[^>]*fill="#ffec99"/);
    expect(html).toContain('<foreignObject');
    expect(html).toContain('<strong>Brew</strong>');
    expect(html).toMatch(/<span style="color:\s*#6b6b6b[^"]*">Mila<\/span>/);
    expect(html).toMatch(/<ul[^>]*><li[^>]*>.*hops.*<\/li><\/ul>/);
  });

  it('shows only the text of nodes a card does not support', () => {
    const html = render(newRichTextElement({ width: 160, height: 100, content: BREW }));
    expect(html).toContain('caption');
    expect(html).not.toContain('<img');
  });

  it('drops unsafe link targets', () => {
    const html = render(newRichTextElement({ width: 160, height: 100, content: BREW }));
    expect(html).not.toContain('javascript:');
    expect(html).toContain('href="https://example.com"');
  });

  it('uses the content height for the static scene bounds', () => {
    const card = newRichTextElement({
      x: 0,
      y: 0,
      width: 160,
      height: 10,
      content: paragraphs(['a', 'b', 'c', 'd', 'e']),
    });
    const html = renderToStaticMarkup(<Scene scene={{ elements: [card] }} />);
    const viewBoxHeight = Number(/viewBox="[^"]*\s([\d.]+)"/.exec(html)![1]);
    expect(viewBoxHeight).toBeGreaterThan(card.height + 64);
    expect(computeSceneBounds([card]).height).toBe(viewBoxHeight);
  });
});
