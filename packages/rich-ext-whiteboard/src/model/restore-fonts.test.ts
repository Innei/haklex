// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';

import { newTextElement } from './create';
import { FontLoadError, restoreElements } from './restore';

const stubFonts = (load: (font: string, text?: string) => Promise<unknown>) =>
  Object.defineProperty(document, 'fonts', { value: { load }, configurable: true });

afterEach(() => {
  Reflect.deleteProperty(document, 'fonts');
});

const text = (id: string, value: string, fontFamily = 5) => ({
  ...newTextElement({ text: value, fontFamily: fontFamily as 5, fontSize: 20 }),
  id,
  width: 1,
  height: 1,
});

describe('restoreElements font loading', () => {
  it('loads each font with the characters that use it', async () => {
    const load = vi.fn(async (_font: string, _text?: string) => []);
    stubFonts(load);
    await restoreElements([text('a', '你好'), text('b', '好的'), text('c', 'abc', 2)], null, {
      refreshDimensions: true,
    });
    const hand = load.mock.calls.find(([font]) => String(font).includes('LXGW'));
    expect(new Set(hand![1])).toEqual(new Set('你好的'));
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('rejects without measuring when a font fails under strictFonts', async () => {
    stubFonts(async () => {
      throw new Error('network');
    });
    await expect(
      restoreElements([text('a', 'hello')], null, { refreshDimensions: true, strictFonts: true }),
    ).rejects.toBeInstanceOf(FontLoadError);
  });

  it('rejects under strictFonts when no handwriting face is registered at all', async () => {
    stubFonts(async () => []);
    await expect(
      restoreElements([text('a', 'hello')], null, { refreshDimensions: true, strictFonts: true }),
    ).rejects.toBeInstanceOf(FontLoadError);
  });

  it('accepts an empty load under strictFonts when the handwriting face is registered', async () => {
    Object.defineProperty(document, 'fonts', {
      value: Object.assign([{ family: '"LXGW WenKai Screen"' }], { load: async () => [] }),
      configurable: true,
    });
    const [restored] = await restoreElements([text('a', 'hello')], null, {
      refreshDimensions: true,
      strictFonts: true,
    });
    expect(restored.width).toBeGreaterThan(1);
  });

  it('accepts an empty load under strictFonts for a system font stack', async () => {
    stubFonts(async () => []);
    const [restored] = await restoreElements([text('a', 'hello', 2)], null, {
      refreshDimensions: true,
      strictFonts: true,
    });
    expect(restored.width).toBeGreaterThan(1);
  });

  it('measures with what it has when a font fails without strictFonts', async () => {
    stubFonts(async () => {
      throw new Error('network');
    });
    const [restored] = await restoreElements([text('a', 'hello')], null, {
      refreshDimensions: true,
    });
    expect(restored.width).toBeGreaterThan(1);
  });
});
