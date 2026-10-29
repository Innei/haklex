// @vitest-environment happy-dom
import type { ImageUploadFn } from '@haklex/rich-editor/plugins';
import { ImageUploadProvider } from '@haklex/rich-editor/plugins';
import type { DialogStackItemProps } from '@haklex/rich-editor-ui';
import { act, createElement } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { GalleryEditRenderer } from '../src/GalleryEditRenderer';
import type { GalleryImage } from '../src/types';

const ui = vi.hoisted(() => ({
  presentDialog: vi.fn(),
  confirmDiscardChanges: vi.fn(),
  toast: vi.fn(),
}));

vi.mock('@haklex/rich-editor-ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@haklex/rich-editor-ui')>()),
  presentDialog: ui.presentDialog,
  confirmDiscardChanges: ui.confirmDiscardChanges,
  toast: ui.toast,
}));

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

const images: GalleryImage[] = [
  { src: 'https://example.com/a.png', alt: 'A' },
  { src: 'https://example.com/b.png', alt: 'B' },
];

let container: HTMLDivElement;
let root: Root;
let dialogRoot: Root | null;

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

beforeEach(() => {
  ui.presentDialog.mockReset();
  ui.confirmDiscardChanges.mockReset();
  ui.toast.mockReset();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  dialogRoot = null;
});

afterEach(() => {
  if (dialogRoot) act(() => dialogRoot!.unmount());
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

async function openModal(upload: ImageUploadFn | null = null) {
  const onImagesChange = vi.fn();
  const onLayoutChange = vi.fn();
  const renderer = (
    <GalleryEditRenderer
      images={images}
      layout="grid"
      onImagesChange={onImagesChange}
      onLayoutChange={onLayoutChange}
    />
  );
  act(() =>
    root.render(
      upload ? <ImageUploadProvider upload={upload}>{renderer}</ImageUploadProvider> : renderer,
    ),
  );
  act(() => container.querySelector<HTMLButtonElement>('[aria-label="Edit gallery"]')!.click());
  const options = ui.presentDialog.mock.calls.at(-1)![0] as DialogStackItemProps;
  const dismiss = vi.fn();
  const requestDismiss = vi.fn(async () => {
    if (!options.confirmDismiss || (await options.confirmDismiss())) dismiss();
  });
  const dialogHost = document.createElement('div');
  container.append(dialogHost);
  dialogRoot = createRoot(dialogHost);
  act(() => dialogRoot!.render(createElement(options.content, { dismiss, requestDismiss })));
  const button = (label: string) =>
    [...dialogHost.querySelectorAll('button')].find(
      (el) => el.getAttribute('aria-label') === label || el.textContent?.startsWith(label),
    )!;
  const press = async (label: string) => {
    await act(async () => button(label).click());
  };
  return { options, dismiss, dialogHost, press, onImagesChange, onLayoutChange };
}

async function pickFiles(input: HTMLInputElement, files: File[]) {
  Object.defineProperty(input, 'files', { configurable: true, value: files });
  await act(async () => {
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await act(async () => {});
}

describe('GalleryEditRenderer modal', () => {
  it('opens as an auto sheet titled Gallery with an image count', async () => {
    const { options, dialogHost } = await openModal();
    expect(options.sheet).toBe('auto');
    expect(options.showCloseButton).toBe(false);
    expect(dialogHost.textContent).toContain('Gallery');
    expect(dialogHost.textContent).not.toContain('Gallery Editor');
    expect(dialogHost.textContent).toContain('2 images');
    expect(dialogHost.querySelectorAll('[role="tab"]').length).toBeGreaterThanOrEqual(3);
  });

  it('opens a file picker for Add images when the host can upload', async () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    const { press, dialogHost } = await openModal(vi.fn());
    await press('Add images');
    const input = dialogHost.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input?.accept).toBe('image/*');
    expect(input?.multiple).toBe(true);
    expect(clickSpy).toHaveBeenCalled();
    expect(clickSpy.mock.contexts.at(-1)).toBe(input);
  });

  it('uploads picked files through the host and appends them', async () => {
    const upload = vi.fn(async (file: File) => ({ src: `https://cdn/${file.name}` }));
    const { dialogHost } = await openModal(upload);
    const input = dialogHost.querySelector<HTMLInputElement>('input[type="file"]')!;
    await pickFiles(input, [new File(['x'], 'c.png', { type: 'image/png' })]);
    expect(upload).toHaveBeenCalledOnce();
    expect(dialogHost.textContent).toContain('3 images');
  });

  it('reports upload failures with a toast', async () => {
    const upload = vi.fn(async () => {
      throw new Error('quota');
    });
    const { dialogHost } = await openModal(upload);
    const input = dialogHost.querySelector<HTMLInputElement>('input[type="file"]')!;
    await pickFiles(input, [new File(['x'], 'c.png', { type: 'image/png' })]);
    expect(ui.toast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'error' }));
    expect(dialogHost.textContent).toContain('2 images');
  });

  it('adds an empty URL row for Add images when no upload is available', async () => {
    const { press, dialogHost } = await openModal();
    const before = dialogHost.querySelectorAll('input[placeholder="Image URL"]').length;
    await press('Add images');
    expect(dialogHost.querySelectorAll('input[placeholder="Image URL"]').length).toBe(before + 1);
  });

  it('asks before discarding unsaved edits and never saves on close', async () => {
    ui.confirmDiscardChanges.mockResolvedValue(false);
    const { press, dismiss, onImagesChange } = await openModal();
    await press('Carousel');
    await press('Close');
    expect(ui.confirmDiscardChanges).toHaveBeenCalledOnce();
    expect(dismiss).not.toHaveBeenCalled();
    expect(onImagesChange).not.toHaveBeenCalled();
  });

  it('closes a clean modal without asking', async () => {
    const { press, dismiss } = await openModal();
    await press('Close');
    expect(ui.confirmDiscardChanges).not.toHaveBeenCalled();
    expect(dismiss).toHaveBeenCalledOnce();
  });

  it('writes back and dismisses on Save', async () => {
    const { press, dismiss, onImagesChange, onLayoutChange } = await openModal();
    await press('Carousel');
    await press('Save');
    expect(onImagesChange).toHaveBeenCalledWith(images);
    expect(onLayoutChange).toHaveBeenCalledWith('carousel');
    expect(dismiss).toHaveBeenCalledOnce();
    expect(ui.confirmDiscardChanges).not.toHaveBeenCalled();
  });
});
