// @vitest-environment happy-dom
import { DialogStackProvider, dismissAllDialogs, dismissToast } from '@haklex/rich-editor-ui';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, type LexicalEditor } from 'lexical';
import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { getToasts } from '../../rich-editor-ui/src/components/toast/store';
import { $isImageNode, ImageNode } from '../src/nodes/ImageNode';
import { OPEN_IMAGE_UPLOAD_DIALOG_COMMAND } from '../src/plugins/image-upload-command';
import { type ImageUploadFn, ImageUploadPlugin } from '../src/plugins/ImageUploadPlugin';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

vi.mock('../src/styles/theme', () => ({ editorTheme: {} }));

vi.mock('../src/styles/shared.css', () => {
  const identityProxy = new Proxy({}, { get: (_target, prop: string) => prop });
  return { semanticClassNames: identityProxy, sharedStyles: identityProxy };
});

vi.mock('../src/styles/katex.css', () => {
  const identityProxy = new Proxy({}, { get: (_target, prop: string) => prop });
  return { katexClassNames: identityProxy, katexStyles: identityProxy };
});

vi.mock('../src/components/utils', () => ({
  clsx: (...args: Array<string | undefined | null | false>) => args.filter(Boolean).join(' '),
  getVariantClass: () => '',
}));

vi.mock('../src/utils/thumbhash', () => ({
  computeImageMeta: async () => ({ width: 10, height: 10, thumbhash: 'stub-hash' }),
  decodeThumbHash: () => undefined,
}));

let root: Root | null = null;
let host: HTMLDivElement | null = null;

afterEach(async () => {
  await act(async () => dismissAllDialogs());
  for (const item of getToasts()) dismissToast(item.id);
  await act(async () => root?.unmount());
  host?.remove();
  root = null;
  host = null;
  document.body.innerHTML = '';
});

function EditorCapture({ onReady }: { onReady: (editor: LexicalEditor) => void }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => onReady(editor), [editor, onReady]);
  return null;
}

async function settle() {
  await act(async () => {
    for (let i = 0; i < 5; i++) await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

async function mount(onUpload: ImageUploadFn) {
  let editor!: LexicalEditor;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root!.render(
      <DialogStackProvider>
        <LexicalComposer
          initialConfig={{
            namespace: 'image-upload-dialog',
            nodes: [ImageNode],
            onError: (error) => {
              throw error;
            },
          }}
        >
          <EditorCapture
            onReady={(value) => {
              editor = value;
            }}
          />
          <ImageUploadPlugin onUpload={onUpload} />
        </LexicalComposer>
      </DialogStackProvider>,
    ),
  );
  return editor;
}

async function chooseFiles(files: File[]) {
  const input = document.querySelector<HTMLInputElement>('[role="dialog"] input[type="file"]')!;
  Object.defineProperty(input, 'files', { configurable: true, value: files });
  await act(async () => {
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

function button(label: RegExp): HTMLButtonElement {
  const match = [...document.querySelectorAll('button')].find((el) =>
    label.test(el.textContent ?? ''),
  );
  if (!match) throw new Error(`No button ${label}`);
  return match;
}

function imageCount(editor: LexicalEditor): number {
  return editor.getEditorState().read(
    () =>
      $getRoot()
        .getChildren()
        .filter((node) => $isImageNode(node)).length,
  );
}

function openDialog(editor: LexicalEditor) {
  return act(async () => {
    editor.dispatchCommand(OPEN_IMAGE_UPLOAD_DIALOG_COMMAND, undefined);
  });
}

describe('ImageUploadPlugin dialog', () => {
  it('uploads both chosen images after Insert, closing the dialog and reporting via toast', async () => {
    let finish!: () => void;
    const gate = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const onUpload = vi.fn(async (file: File) => {
      await gate;
      return { src: `https://cdn.test/${file.name}` };
    });
    const editor = await mount(onUpload);

    await openDialog(editor);
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain('Insert image');
    await chooseFiles([
      new File(['a'], 'a.png', { type: 'image/png' }),
      new File(['b'], 'b.png', { type: 'image/png' }),
    ]);
    await act(async () => button(/^Insert 2 images/).click());
    await settle();

    expect(document.querySelector('[role="dialog"][data-open]')).toBeNull();
    expect(getToasts().map((item) => [item.tone, item.title])).toEqual([
      ['loading', 'Uploading 2 images…'],
    ]);

    finish();
    await settle();

    expect(onUpload).toHaveBeenCalledTimes(2);
    expect(imageCount(editor)).toBe(2);
    expect(getToasts().map((item) => [item.tone, item.title])).toEqual([
      ['success', 'Inserted 2 images'],
    ]);
  });

  it('offers Retry in an error toast when an upload fails', async () => {
    const onUpload = vi
      .fn<ImageUploadFn>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({ src: 'https://cdn.test/a.png' });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const editor = await mount(onUpload);

    await openDialog(editor);
    await chooseFiles([new File(['a'], 'a.png', { type: 'image/png' })]);
    await act(async () => button(/^Insert image/).click());
    await settle();

    const [failed] = getToasts();
    expect(failed.tone).toBe('error');
    expect(failed.title).toBe('Image upload failed');
    expect(failed.action?.label).toBe('Retry');

    await act(async () => failed.action!.onClick());
    await settle();

    expect(onUpload).toHaveBeenCalledTimes(2);
    expect(imageCount(editor)).toBe(1);
    expect(getToasts().at(-1)?.tone).toBe('success');
  });

  it('inserts a link image without uploading', async () => {
    const onUpload = vi.fn<ImageUploadFn>();
    const OriginalImage = globalThis.Image;
    globalThis.Image = class {
      naturalHeight = 30;
      naturalWidth = 40;
      onload: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    } as unknown as typeof Image;
    const editor = await mount(onUpload);

    await openDialog(editor);
    const input = document.querySelector<HTMLInputElement>('input[type="url"]')!;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    await act(async () => {
      setter.call(input, 'https://example.com/x.png');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    });
    await act(async () => button(/^Add$/).click());
    await act(async () => button(/^Insert image/).click());
    await settle();

    expect(onUpload).not.toHaveBeenCalled();
    expect(imageCount(editor)).toBe(1);
    globalThis.Image = OriginalImage;
  });
});
