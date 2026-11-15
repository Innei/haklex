import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

import { newTextElement } from '../model/create';
import { getFontString } from '../model/measure';
import { fontFamilyToCss, HAND_FONT_STACK, SANS_FONT_STACK, setFontFamilyStack } from './fonts';
import { Scene } from './Scene';
import type { ExcalidrawScene } from './types';

afterEach(() => setFontFamilyStack(2, null));

describe('setFontFamilyStack', () => {
  it('replaces the stack used for rendering and measuring one family', () => {
    setFontFamilyStack(2, 'system-ui, sans-serif');
    expect(fontFamilyToCss(2)).toBe('system-ui, sans-serif');
    expect(getFontString({ fontFamily: 2, fontSize: 20 })).toBe('20px system-ui, sans-serif');
    expect(fontFamilyToCss(5)).toBe(HAND_FONT_STACK);
  });

  it('restores the default with null', () => {
    setFontFamilyStack(2, 'system-ui');
    setFontFamilyStack(2, null);
    expect(fontFamilyToCss(2)).toBe(SANS_FONT_STACK);
  });
});

describe('handFontOverride', () => {
  const scene = {
    type: 'excalidraw',
    elements: [
      { ...newTextElement({ text: 'hand', fontFamily: 5 }), id: 'h', width: 40, height: 25 },
      { ...newTextElement({ text: 'old hand', fontFamily: 1 }), id: 'v', width: 40, height: 25 },
      { ...newTextElement({ text: 'sans', fontFamily: 2 }), id: 's', width: 40, height: 25 },
    ],
  } as unknown as ExcalidrawScene;

  const familyOf = (html: string, id: string) =>
    new RegExp(`data-id="${id}"[^>]*>\\s*<text[^>]*font-family="([^"]*)"`).exec(html)?.[1];

  it('draws handwritten families with the override and leaves others alone', () => {
    const html = renderToStaticMarkup(
      <Scene handFontOverride="Readable, sans-serif" scene={scene} />,
    );
    expect(familyOf(html, 'h')).toBe('Readable, sans-serif');
    expect(familyOf(html, 'v')).toBe('Readable, sans-serif');
    expect(familyOf(html, 's')).toBe(SANS_FONT_STACK.replaceAll('"', '&quot;'));
  });

  it('uses the handwritten stack without an override', () => {
    const html = renderToStaticMarkup(<Scene scene={scene} />);
    expect(familyOf(html, 'h')).toBe(HAND_FONT_STACK.replaceAll('"', '&quot;'));
  });
});
