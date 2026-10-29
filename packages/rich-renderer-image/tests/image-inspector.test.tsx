// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import type { ImageMetaValues } from '../src/EditMetaPopover';
import { ImageInspector } from '../src/EditMetaPopover';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

const VALUES: ImageMetaValues = {
  src: 'https://cdn.example.com/lake.png',
  altText: 'Sunset over West Lake',
  caption: '',
  size: { mode: 'percent', value: 60 },
};

let container: HTMLDivElement | null = null;
let root: Root | null = null;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
});

async function mount() {
  const onApply = vi.fn();
  const onOpenChange = vi.fn();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () =>
    root!.render(
      <ImageInspector
        open
        trigger={<button type="button">60%</button>}
        values={VALUES}
        onApply={onApply}
        onOpenChange={onOpenChange}
      />,
    ),
  );
  return { onApply, onOpenChange };
}

function control(label: string) {
  const el = [...document.body.querySelectorAll('label')].find((l) => l.textContent === label);
  if (!el) throw new Error(`label "${label}" not found`);
  const input = document.getElementById(el.htmlFor) as HTMLInputElement | null;
  if (!input) throw new Error(`control for "${label}" not found`);
  return input;
}

async function typeInto(input: HTMLInputElement, text: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('Image inspector', () => {
  it('shows labeled fields under an Image header with the live-apply hint', async () => {
    await mount();
    expect(control('Alt text').value).toBe('Sunset over West Lake');
    expect(control('Caption').value).toBe('');
    expect(control('Source URL').value).toBe(VALUES.src);
    expect(document.body.textContent).toContain('Optional');
    expect(document.body.textContent).toContain('Image');
    expect(document.body.textContent).toContain('Changes apply as you type');
  });

  it('applies edits live and merges later keystrokes into one history step', async () => {
    const { onApply } = await mount();
    await typeInto(control('Alt text'), 'Lake');
    await typeInto(control('Caption'), 'Evening');
    expect(onApply).toHaveBeenNthCalledWith(1, { altText: 'Lake' }, false);
    expect(onApply).toHaveBeenNthCalledWith(2, { caption: 'Evening' }, true);
  });

  it('reverts every change since opening on Escape', async () => {
    const { onApply, onOpenChange } = await mount();
    await typeInto(control('Alt text'), 'Lake');
    await typeInto(control('Caption'), 'Evening');
    onApply.mockClear();
    await act(async () => {
      control('Caption').dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      );
    });
    expect(onApply).toHaveBeenCalledWith(VALUES, true);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes on Escape without writing when nothing changed', async () => {
    const { onApply, onOpenChange } = await mount();
    await act(async () => {
      control('Alt text').dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      );
    });
    expect(onApply).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
