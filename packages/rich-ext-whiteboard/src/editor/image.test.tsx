// @vitest-environment happy-dom
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Mounted } from '../../tests/harness';
import { mountEditor } from '../../tests/harness';
import type { ImageElement } from '../scene/types';
import { fitImageSize, insertImageFile, setImageSizeReader } from './image-actions';
import { createWhiteboardStore } from './store';

let mounted: Mounted | undefined;
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
});

let size = { width: 1200, height: 800 };
beforeEach(() => {
  size = { width: 1200, height: 800 };
  setImageSizeReader(async () => size);
});

const png = () => new File([new Uint8Array([137, 80, 78, 71])], 'a.png', { type: 'image/png' });

const imageOf = (store: ReturnType<typeof createWhiteboardStore>) =>
  store.getState().elements.find((el) => el.type === 'image') as ImageElement | undefined;

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('fitImageSize', () => {
  it('caps the longest side at 600 and keeps the ratio', () => {
    expect(fitImageSize(1200, 800)).toEqual({ width: 600, height: 400 });
    expect(fitImageSize(300, 900)).toEqual({ width: 200, height: 600 });
    expect(fitImageSize(300, 200)).toEqual({ width: 300, height: 200 });
  });
});

describe('insertImageFile', () => {
  it('shows a pending image, then stores the uploaded URL', async () => {
    const store = createWhiteboardStore({ elements: [] });
    const upload = deferred<string>();
    const done = insertImageFile(store, png(), [100, 100], { uploadFile: () => upload.promise });
    await vi.waitFor(() => expect(imageOf(store)).toBeDefined());
    const pending = imageOf(store)!;
    expect(pending.status).toBe('pending');
    expect(pending.width).toBe(600);
    expect(pending.height).toBe(400);
    expect(pending.x).toBe(100 - 300);
    expect(store.getState().files[pending.fileId!].dataURL).toMatch(/^data:image\/png;base64,/);

    upload.resolve('https://cdn.example/a.png');
    await done;
    const saved = imageOf(store)!;
    expect(saved.status).toBe('saved');
    const file = store.getState().files[saved.fileId!];
    expect(file.dataURL).toBe('https://cdn.example/a.png');
    expect(file.mimeType).toBe('image/png');
    expect(typeof file.created).toBe('number');
  });

  it('makes one undo step that redo restores with the uploaded URL', async () => {
    const store = createWhiteboardStore({ elements: [] });
    await insertImageFile(store, png(), [0, 0], {
      uploadFile: async () => 'https://cdn.example/b.png',
    });
    store.undo();
    expect(imageOf(store)).toBeUndefined();
    expect(store.canUndo()).toBe(false);
    store.redo();
    const img = imageOf(store)!;
    expect(img.status).toBe('saved');
    expect(store.getState().files[img.fileId!].dataURL).toBe('https://cdn.example/b.png');
  });

  it('falls back to base64 and reports the error when upload fails', async () => {
    const store = createWhiteboardStore({ elements: [] });
    const onUploadError = vi.fn();
    const error = new Error('quota');
    await insertImageFile(store, png(), [0, 0], {
      uploadFile: async () => {
        throw error;
      },
      onUploadError,
    });
    const img = imageOf(store)!;
    expect(img.status).toBe('saved');
    expect(store.getState().files[img.fileId!].dataURL).toMatch(/^data:image\/png;base64,/);
    expect(onUploadError).toHaveBeenCalledWith(error);
  });

  it('keeps base64 without an upload hook', async () => {
    const store = createWhiteboardStore({ elements: [] });
    await insertImageFile(store, png(), [0, 0]);
    const img = imageOf(store)!;
    expect(img.status).toBe('saved');
    expect(store.getState().files[img.fileId!].dataURL).toMatch(/^data:image\/png;base64,/);
    expect(store.getScene().files?.[img.fileId!]).toBeDefined();
  });
});

describe('image input in the editor', () => {
  it('inserts an image pasted from the clipboard', async () => {
    const store = createWhiteboardStore({ elements: [] });
    mounted = mountEditor(store);
    const event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', {
      value: { getData: () => '', files: [png()], items: [] },
    });
    act(() => {
      mounted!.canvas.dispatchEvent(event);
    });
    await vi.waitFor(() => expect(imageOf(store)?.status).toBe('saved'));
  });

  it('inserts an image dropped on the canvas at the drop point', async () => {
    const store = createWhiteboardStore({ elements: [] });
    mounted = mountEditor(store);
    const event = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'dataTransfer', { value: { files: [png()], types: ['Files'] } });
    Object.defineProperty(event, 'clientX', { value: 400 });
    Object.defineProperty(event, 'clientY', { value: 300 });
    act(() => {
      mounted!.canvas.dispatchEvent(event);
    });
    await vi.waitFor(() => expect(imageOf(store)?.status).toBe('saved'));
    const img = imageOf(store)!;
    expect(img.x + img.width / 2).toBe(400);
    expect(img.y + img.height / 2).toBe(300);
  });

  it('opens the file picker when the image tool is chosen', () => {
    const store = createWhiteboardStore({ elements: [] });
    mounted = mountEditor(store);
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    act(() => store.setState({ tool: 'image' }));
    expect(click).toHaveBeenCalledTimes(1);
    expect(mounted.container.querySelector('input[type="file"][accept^="image/"]')).not.toBeNull();
    click.mockRestore();
  });
});
