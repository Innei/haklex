// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { ImageEditModal } from '../src/ImageEditModal';
import { applyMosaic } from '../src/mosaic';

vi.mock('../src/mosaic', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/mosaic')>()),
  applyMosaic: vi.fn().mockResolvedValue('blob:mosaic'),
}));

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let root: Root | null = null;

afterEach(() => {
  if (root) act(() => root!.unmount());
  root = null;
  vi.restoreAllMocks();
});

function pointer(type: string, x: number, y: number) {
  return new PointerEvent(type, {
    bubbles: true,
    button: 0,
    buttons: type === 'pointerup' ? 0 : 1,
    cancelable: true,
    clientX: x,
    clientY: y,
    isPrimary: true,
    pointerId: 1,
    pointerType: 'mouse',
  });
}

describe('ImageEditModal mosaic tool', () => {
  it('applies a mosaic to the dragged area', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({ height: 400, width: 600, x: 0, y: 0 }),
    );
    const container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () =>
      root!.render(
        <ImageEditModal
          file={new File(['x'], 'a.png', { type: 'image/png' })}
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
        />,
      ),
    );

    const img = container.querySelector('img')!;
    for (const [prop, value] of Object.entries({
      height: 400,
      naturalHeight: 800,
      naturalWidth: 1200,
      width: 600,
    })) {
      Object.defineProperty(img, prop, { configurable: true, value });
    }
    await act(async () => img.dispatchEvent(new Event('load')));
    await act(async () =>
      container.querySelector<HTMLButtonElement>('[aria-label="Mosaic"]')!.click(),
    );

    const surface = container.querySelector('.ReactCrop__child-wrapper')!;
    await act(async () => surface.dispatchEvent(pointer('pointerdown', 100, 100)));
    await act(async () => document.dispatchEvent(pointer('pointermove', 200, 160)));
    await act(async () => document.dispatchEvent(pointer('pointerup', 200, 160)));

    expect(applyMosaic).toHaveBeenCalledTimes(1);
    const rect = vi.mocked(applyMosaic).mock.calls[0][1];
    expect(rect.width).toBeGreaterThan(100);
    expect(rect.height).toBeGreaterThan(50);
    container.remove();
  });
});
