// @vitest-environment happy-dom
import { DialogStackProvider, dismissAllDialogs } from '@haklex/rich-editor-ui';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import type { ImageDialogEntry, ImageDialogOptions } from '../src/plugins/present-image-dialog';
import { presentImageDialog } from '../src/plugins/present-image-dialog';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let root: Root | null = null;
let host: HTMLDivElement | null = null;
const OriginalImage = globalThis.Image;

afterEach(async () => {
  await act(async () => dismissAllDialogs());
  await act(async () => root?.unmount());
  host?.remove();
  root = null;
  host = null;
  document.body.innerHTML = '';
  globalThis.Image = OriginalImage;
  vi.useRealTimers();
});

function file(name: string, type = 'image/jpeg'): File {
  return new File(['x'], name, { type });
}

async function open(options: ImageDialogOptions = {}) {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root!.render(<DialogStackProvider />));
  let result!: Promise<ImageDialogEntry[] | null>;
  await act(async () => {
    result = presentImageDialog(options);
  });
  return { result };
}

function popup(): HTMLElement {
  const el = document.querySelector<HTMLElement>('[role="dialog"]');
  if (!el) throw new Error('No dialog');
  return el;
}

function button(label: string | RegExp): HTMLButtonElement {
  const match = [...document.querySelectorAll('button')].find((el) => {
    const text = el.textContent ?? '';
    const aria = el.getAttribute('aria-label') ?? '';
    return typeof label === 'string'
      ? text === label || aria === label
      : label.test(text) || label.test(aria);
  });
  if (!match) throw new Error(`No button ${label}`);
  return match;
}

async function click(el: HTMLElement) {
  await act(async () => {
    el.click();
  });
}

async function chooseFiles(files: File[]) {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error('No file input');
  Object.defineProperty(input, 'files', { configurable: true, value: files });
  await act(async () => {
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

function stubImage(width: number, height: number, fail = false) {
  globalThis.Image = class {
    naturalHeight = height;
    naturalWidth = width;
    onerror: (() => void) | null = null;
    onload: (() => void) | null = null;
    set src(_value: string) {
      queueMicrotask(() => (fail ? this.onerror?.() : this.onload?.()));
    }
  } as unknown as typeof Image;
}

async function typeUrl(value: string) {
  const input = document.querySelector<HTMLInputElement>('input[type="url"]')!;
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  await act(async () => {
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
  });
}

describe('presentImageDialog', () => {
  it('opens at 520px titled Insert image with the paste hint and format footer', async () => {
    await open();

    expect(popup().style.getPropertyValue('--rc-dialog-width')).toBe('520px');
    expect(popup().textContent).toContain('Insert image');
    expect(popup().textContent).toContain('Drop images here');
    expect(popup().textContent).toContain('to paste');
    expect(popup().textContent).toContain('PNG, JPG, GIF, WebP, AVIF');
    expect(button('Choose files')).toBeTruthy();
  });

  it('moves two chosen files to the review step and inserts both', async () => {
    const { result } = await open();
    const a = file('a.jpg');
    const b = file('b.jpg');

    expect(document.querySelector<HTMLInputElement>('input[type="file"]')!.multiple).toBe(true);
    await chooseFiles([a, b]);

    expect(popup().textContent).toContain('Insert 2 images');
    expect(popup().textContent).toContain('Nothing is uploaded until you insert');
    await click(button(/^Insert 2 images/));

    await expect(result).resolves.toEqual([
      { file: a, kind: 'file' },
      { file: b, kind: 'file' },
    ]);
  });

  it('goes back to the source step from review', async () => {
    await open();
    await chooseFiles([file('a.jpg')]);
    await click(button('Back'));

    expect(popup().textContent).toContain('Drop images here');
  });

  it('accepts one file in replace mode and labels the action Replace', async () => {
    const { result } = await open({ mode: 'replace' });
    const a = file('a.jpg');

    expect(popup().textContent).toContain('Replace image');
    expect(document.querySelector<HTMLInputElement>('input[type="file"]')!.multiple).toBe(false);
    await chooseFiles([a, file('b.jpg')]);

    expect(popup().textContent).toContain('Replace image');
    expect(document.querySelectorAll('[data-image-dialog-row]')).toHaveLength(1);
    await click(button(/^Replace/));

    await expect(result).resolves.toEqual([{ file: a, kind: 'file' }]);
  });

  it('previews a URL as it is typed and enables Add once it loads', async () => {
    stubImage(800, 600);
    const { result } = await open();

    expect(button('Add').disabled).toBe(true);
    await typeUrl('https://example.com/a.png');

    expect(popup().textContent).toContain('Loaded · 800 × 600');
    expect(button('Add').disabled).toBe(false);
    await click(button('Add'));
    await click(button(/^Insert image/));

    await expect(result).resolves.toEqual([
      { height: 600, kind: 'url', src: 'https://example.com/a.png', width: 800 },
    ]);
  });

  it('reports a URL that fails to load or uses an unsafe scheme', async () => {
    stubImage(0, 0, true);
    await open();

    await typeUrl('https://example.com/missing.png');
    expect(popup().textContent).toContain('Could not load this image URL');
    expect(button('Add').disabled).toBe(true);

    await typeUrl('javascript:alert(1)');
    expect(popup().textContent).toContain('Unsupported URL scheme');
  });

  it('shows Edit only when an image editor is available and keeps the edited file', async () => {
    const a = file('a.jpg');
    const edited = file('a-edited.jpg');
    const edit = vi.fn().mockResolvedValue({ file: edited, summary: 'Cropped' });
    const { result } = await open({ editor: { edit }, files: [a] });

    await click(button(/Edit/));
    expect(edit).toHaveBeenCalledWith(a);
    expect(popup().textContent).toContain('Edited');
    await click(button(/^Insert image/));

    await expect(result).resolves.toEqual([{ file: edited, kind: 'file' }]);
  });

  it('has no Edit button without an image editor', async () => {
    await open({ files: [file('a.jpg')] });

    expect(() => button(/Edit/)).toThrow();
  });

  it('removes a row and resolves null when the last row of a files-first review is removed', async () => {
    const a = file('a.jpg');
    const b = file('b.jpg');
    const { result } = await open({ files: [a, b] });

    await click(button('Remove a.jpg'));
    expect(popup().textContent).toContain('Insert image');
    await click(button('Remove b.jpg'));

    await expect(result).resolves.toBeNull();
  });

  it('strips GPS from unedited rows by default, after detection settles', async () => {
    const a = file('a.jpg');
    const clean = file('a-clean.jpg');
    let resolveGps!: (value: { latitude: number; longitude: number }) => void;
    const privacy = {
      detectGps: vi.fn(
        () =>
          new Promise<{ latitude: number; longitude: number }>((resolve) => {
            resolveGps = resolve;
          }),
      ),
      stripGps: vi.fn().mockResolvedValue(clean),
    };
    const { result } = await open({ editor: { edit: vi.fn(), privacy }, files: [a] });

    const insert = button(/^Insert image/);
    await act(async () => {
      insert.click();
      resolveGps({ latitude: 1, longitude: 2 });
    });

    expect(privacy.stripGps).toHaveBeenCalledWith(a);
    await expect(result).resolves.toEqual([{ file: clean, kind: 'file' }]);
  });

  it('shows a per-row location checkbox and blocks insert when stripping fails', async () => {
    const a = file('a.jpg');
    const privacy = {
      detectGps: vi.fn().mockResolvedValue({ latitude: 1, longitude: 2 }),
      stripGps: vi.fn().mockRejectedValue(new Error('wasm')),
    };
    const { result } = await open({ editor: { edit: vi.fn(), privacy }, files: [a] });

    const checkbox = document.querySelector<HTMLElement>('[role="checkbox"]')!;
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
    expect(checkbox.textContent).toContain('Remove before upload');

    await click(button(/^Insert image/));
    expect(popup().textContent).toContain('Could not remove location');
    expect(button(/^Insert image/).disabled).toBe(true);

    await click(checkbox);
    await click(button(/^Insert image/));

    await expect(result).resolves.toEqual([{ file: a, kind: 'file' }]);
  });
});
