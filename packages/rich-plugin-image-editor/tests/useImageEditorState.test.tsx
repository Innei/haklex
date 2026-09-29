// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import type { ImageEditorState } from '../src/useImageEditorState';
import { useImageEditorState } from '../src/useImageEditorState';

const pending: ((url: string) => void)[] = [];

vi.mock('../src/mosaic', () => ({
  applyMosaic: vi.fn(
    () =>
      new Promise<string>((resolve) => {
        pending.push(resolve);
      }),
  ),
}));

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let root: Root | null = null;
let state: ImageEditorState;
const area = { height: 10, width: 10, x: 0, y: 0 };

function Harness() {
  state = useImageEditorState('blob:original');
  return null;
}

async function mount() {
  root = createRoot(document.createElement('div'));
  await act(async () => root!.render(<Harness />));
  await act(async () => state.setNaturalSize({ height: 100, width: 100 }));
}

afterEach(() => {
  pending.length = 0;
  vi.restoreAllMocks();
  vi.clearAllMocks();
  if (root) act(() => root!.unmount());
  root = null;
});

describe('useImageEditorState mosaic', () => {
  it('ignores a second mosaic while one is still applying', async () => {
    await mount();

    await act(async () => {
      void state.applyMosaicArea(area, 'pixelate', 16);
      void state.applyMosaicArea(area, 'pixelate', 16);
    });

    expect(pending).toHaveLength(1);
    expect(state.mosaicBusy).toBe(true);

    await act(async () => pending[0]('blob:m1'));

    expect(state.mosaicBusy).toBe(false);
    expect(state.sourceUrl).toBe('blob:m1');
    expect(state.mosaicCount).toBe(1);
  });

  it('chains mosaics on the latest bitmap', async () => {
    await mount();

    await act(async () => {
      void state.applyMosaicArea(area, 'pixelate', 16);
    });
    await act(async () => pending[0]('blob:m1'));
    await act(async () => {
      void state.applyMosaicArea(area, 'blur', 20);
    });
    await act(async () => pending[1]('blob:m2'));

    const { applyMosaic } = await import('../src/mosaic');
    expect(vi.mocked(applyMosaic).mock.calls[1][0]).toBe('blob:m1');
    expect(state.mosaicCount).toBe(2);
  });

  it('revokes a mosaic that resolves after unmount', async () => {
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    await mount();

    await act(async () => {
      void state.applyMosaicArea(area, 'pixelate', 16);
    });
    act(() => root!.unmount());
    root = null;
    await act(async () => pending[0]('blob:late'));

    expect(revoke).toHaveBeenCalledWith('blob:late');
  });
});
