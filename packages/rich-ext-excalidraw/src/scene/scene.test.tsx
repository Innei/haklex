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
    expect(html).toMatch(/<image[^>]*filter="url\(#rich-excalidraw-counter-invert\)"/);
  });

  it('leaves images untouched in light mode', () => {
    const html = renderToStaticMarkup(<Scene scene={imageScene} theme="light" />);
    expect(html).not.toContain('<filter');
    expect(html).not.toMatch(/<image[^>]*filter=/);
  });
});
