// @vitest-environment happy-dom
import type { ImagePreprocessContextValue } from '@haklex/rich-editor/plugins';
import {
  getImageEditor,
  ImagePreprocessProvider,
  keepsOriginal,
  useImagePreprocess,
} from '@haklex/rich-editor/plugins';
import { DialogStackProvider, dismissAllDialogs } from '@haklex/rich-editor-ui';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { ImageEditModalPlugin } from '../src/ImageEditModalPlugin';

vi.mock('../src/ImageEditModal', () => ({
  ImageEditModal: ({
    file,
    onConfirm,
  }: {
    file: File;
    onConfirm: (result: { file: File; summary: string }) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onConfirm({
          file: new File(['e'], `edited-${file.name}`, { type: file.type }),
          summary: 'Cropped',
        })
      }
    >
      Done editing
    </button>
  ),
}));

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let root: Root | null = null;
let host: HTMLDivElement | null = null;

afterEach(async () => {
  await act(async () => dismissAllDialogs());
  await act(async () => root?.unmount());
  host?.remove();
  root = null;
  host = null;
  document.body.innerHTML = '';
});

function Capture({ onReady }: { onReady: (value: ImagePreprocessContextValue | null) => void }) {
  onReady(useImagePreprocess());
  return null;
}

async function mount(
  privacy?: Parameters<typeof ImageEditModalPlugin>[0]['privacy'],
  allowKeepOriginal?: boolean,
) {
  let scope: ImagePreprocessContextValue | null = null;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root!.render(
      <DialogStackProvider>
        <ImagePreprocessProvider>
          <Capture
            onReady={(value) => {
              scope = value;
            }}
          />
          <ImageEditModalPlugin allowKeepOriginal={allowKeepOriginal} privacy={privacy} />
        </ImagePreprocessProvider>
      </DialogStackProvider>,
    ),
  );
  return scope!;
}

function file(name: string): File {
  return new File(['x'], name, { type: 'image/jpeg' });
}

function dialogText(): string {
  return [...document.querySelectorAll('[role="dialog"]')].map((el) => el.textContent).join('|');
}

function button(label: RegExp): HTMLButtonElement {
  const match = [...document.querySelectorAll('button')].find((el) =>
    label.test(el.textContent ?? ''),
  );
  if (!match) throw new Error(`No button ${label}`);
  return match;
}

describe('ImageEditModalPlugin with the shared image dialog', () => {
  it('registers an Edit capability with privacy on its preprocess scope', async () => {
    const privacy = { detectGps: vi.fn().mockResolvedValue(null), stripGps: vi.fn() };
    const scope = await mount(privacy);

    expect(getImageEditor(scope)?.privacy).toBe(privacy);
  });

  it('marks pasted files to keep their original when the host allows it and the option is ticked', async () => {
    const scope = await mount(undefined, true);
    const a = file('a.jpg');

    let result!: Promise<File[] | null>;
    await act(async () => {
      result = scope.ref.current!([a], { source: 'paste' });
    });
    const option = [...document.querySelectorAll<HTMLElement>('[role="checkbox"]')].find((el) =>
      el.textContent?.includes('Keep original'),
    )!;
    await act(async () => option.click());
    await act(async () => button(/^Insert image/).click());

    await expect(result).resolves.toEqual([a]);
    expect(keepsOriginal(a)).toBe(true);
  });

  it('reviews pasted files in the shared dialog titled Insert 2 images', async () => {
    const scope = await mount();
    const a = file('a.jpg');
    const b = file('b.jpg');

    let result!: Promise<File[] | null>;
    await act(async () => {
      result = scope.ref.current!([a, b], { source: 'paste' });
    });

    expect(dialogText()).toContain('Insert 2 images');
    expect(document.querySelector('[role="dialog"]')!.getAttribute('style')).toContain(
      '--rc-dialog-width: 520px',
    );
    await act(async () => button(/^Insert 2 images/).click());

    await expect(result).resolves.toEqual([a, b]);
  });

  it('labels a replace review Replace image', async () => {
    const scope = await mount();
    const a = file('a.jpg');

    let result!: Promise<File[] | null>;
    await act(async () => {
      result = scope.ref.current!([a], { source: 'replace' });
    });

    expect(dialogText()).toContain('Replace image');
    await act(async () => button(/^Replace/).click());

    await expect(result).resolves.toEqual([a]);
  });

  it('opens the full-screen editor on top from a row and keeps the edited file', async () => {
    const scope = await mount();

    let result!: Promise<File[] | null>;
    await act(async () => {
      result = scope.ref.current!([file('a.jpg')], { source: 'drop' });
    });
    await act(async () => button(/^Edit/).click());
    await act(async () => button(/^Done editing/).click());

    expect(dialogText()).toContain('Edited');
    await act(async () => button(/^Insert image/).click());

    const files = await result;
    expect(files?.map((item) => item.name)).toEqual(['edited-a.jpg']);
  });
});
