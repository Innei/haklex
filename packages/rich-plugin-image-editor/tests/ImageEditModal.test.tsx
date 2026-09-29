// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { ImageEditModal } from '../src/ImageEditModal';

vi.mock('../src/pipeline', () => ({
  applyCropRebase: vi.fn(),
  exportResult: vi.fn().mockRejectedValue(new Error('canvas too large')),
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
});

describe('ImageEditModal', () => {
  it('tells the author when export fails and keeps the editor open', async () => {
    const onConfirm = vi.fn();
    const container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () =>
      root!.render(
        <ImageEditModal
          file={new File(['x'], 'a.png', { type: 'image/png' })}
          onCancel={vi.fn()}
          onConfirm={onConfirm}
        />,
      ),
    );
    const done = [...container.querySelectorAll('button')].find((b) => b.textContent === 'Done')!;
    await act(async () => done.click());

    expect(onConfirm).not.toHaveBeenCalled();
    expect(container.querySelector('[role="alert"]')?.textContent).toMatch(/could not export/i);
    expect(done.disabled).toBe(false);
    errorSpy.mockRestore();
    container.remove();
  });
});
