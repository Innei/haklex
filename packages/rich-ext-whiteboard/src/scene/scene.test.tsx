import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { countElements, toScene } from './normalize';
import { Scene } from './Scene';
import type { ExcalidrawScene } from './types';

const imageScene: ExcalidrawScene = {
  type: 'excalidraw',
  appState: {},
  elements: [
    {
      id: 'img',
      type: 'image',
      x: 0,
      y: 0,
      width: 100,
      height: 60,
      angle: 0,
      fileId: 'f1',
      strokeColor: '#000',
      backgroundColor: 'transparent',
      fillStyle: 'solid',
      strokeWidth: 1,
      strokeStyle: 'solid',
      roughness: 0,
      opacity: 100,
      seed: 1,
    } as never,
  ],
  files: {
    f1: { id: 'f1', dataURL: 'data:image/png;base64,QQ==', mimeType: 'image/png' } as never,
  },
};

describe('toScene', () => {
  it('treats an empty object as an empty scene', () => {
    const scene = toScene({});
    expect(scene).not.toBeNull();
    expect(countElements(scene!)).toBe(0);
  });

  it('unwraps a { data } envelope', () => {
    const scene = toScene({ data: { elements: [{ id: 'a', isDeleted: false }] } });
    expect(scene?.elements).toHaveLength(1);
  });

  it('returns null without data', () => {
    expect(toScene(undefined)).toBeNull();
  });

  it('does not count deleted elements', () => {
    const scene = toScene({ elements: [{ id: 'a' }, { id: 'b', isDeleted: true }] });
    expect(countElements(scene!)).toBe(1);
  });
});

describe('Scene dark mode', () => {
  it('counter-inverts embedded images so photos keep their colours', () => {
    const html = renderToStaticMarkup(<Scene scene={imageScene} theme="dark" />);
    expect(html).toContain('invert(93%) hue-rotate(180deg)');
    expect(html).toContain('<filter');
    expect(html).toMatch(/<image[^>]*filter="url\(#rich-excalidraw-counter-invert-[\w-]+\)"/);
  });

  it('gives each dark scene its own counter-invert filter id', () => {
    const html = renderToStaticMarkup(
      <>
        <Scene scene={imageScene} theme="dark" />
        <Scene scene={imageScene} theme="dark" />
      </>,
    );
    const ids = [...html.matchAll(/<filter[^>]* id="([^"]+)"/g)].map((m) => m[1]);
    const refs = [...html.matchAll(/<image[^>]*filter="url\(#([^)]+)\)"/g)].map((m) => m[1]);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    expect(refs).toEqual(ids);
  });

  it('leaves images untouched in light mode', () => {
    const html = renderToStaticMarkup(<Scene scene={imageScene} theme="light" />);
    expect(html).not.toContain('<filter');
    expect(html).not.toMatch(/<image[^>]*filter=/);
  });
});

describe('arrow labels', () => {
  const base = {
    angle: 0,
    strokeColor: '#000',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 1,
    strokeStyle: 'solid',
    roughness: 0,
    opacity: 100,
    seed: 1,
  };
  const arrow = (id: string, y: number, label?: string) => ({
    ...base,
    id,
    type: 'arrow',
    x: 0,
    y,
    width: 200,
    height: 0,
    points: [
      [0, 0],
      [200, 0],
    ],
    boundElements: label ? [{ id: label, type: 'text' }] : [],
  });
  const text = (id: string, containerId: string) => ({
    ...base,
    id,
    type: 'text',
    x: 80,
    y: -10,
    width: 40,
    height: 20,
    text: 'ws',
    fontSize: 16,
    fontFamily: 1,
    containerId,
  });
  const render = (elements: unknown[]) =>
    renderToStaticMarkup(
      <Scene scene={{ type: 'excalidraw', appState: {}, elements, files: {} } as never} />,
    );

  it('cuts the line out behind an arrow label so the text stays readable', () => {
    const html = render([arrow('a', 0, 't'), text('t', 'a'), arrow('b', 100)]);
    const mask = /<mask[^>]* id="([^"]+)"[^>]*>(.*?)<\/mask>/.exec(html);
    expect(mask).not.toBeNull();
    expect(mask![2]).toContain('height="28" width="48" x="76" y="-14"');
    expect(html.match(/mask="url\(#/g)).toHaveLength(1);
    expect(html).toContain('<g mask="url(#' + mask![1] + ')"><g');
    expect(html.indexOf('data-id="a"')).toBeGreaterThan(html.indexOf('<g mask='));
  });

  it('leaves an arrow whose label is deleted uncut', () => {
    const html = render([arrow('a', 0, 't'), { ...text('t', 'a'), isDeleted: true }]);
    expect(html).not.toContain('<mask');
  });
});
