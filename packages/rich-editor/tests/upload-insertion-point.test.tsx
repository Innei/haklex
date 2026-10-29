// @vitest-environment happy-dom
import { DialogStackProvider, dismissAllDialogs, dismissToast } from '@haklex/rich-editor-ui';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DRAG_DROP_PASTE } from '@lexical/rich-text';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  type LexicalEditor,
} from 'lexical';
import { act, type ReactNode, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { getToasts } from '../../rich-editor-ui/src/components/toast/store';
import { $isImageNode, ImageNode } from '../src/nodes/ImageNode';
import { $isVideoNode, VideoNode } from '../src/nodes/VideoNode';
import { OPEN_IMAGE_UPLOAD_DIALOG_COMMAND } from '../src/plugins/image-upload-command';
import { type ImageUploadFn, ImageUploadPlugin } from '../src/plugins/ImageUploadPlugin';
import { type VideoUploadFn, VideoUploadPlugin } from '../src/plugins/VideoUploadPlugin';

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

function seed() {
  const first = $createParagraphNode().append($createTextNode('first'));
  const second = $createParagraphNode().append($createTextNode('second'));
  $getRoot().append(first, second);
  first.selectEnd();
}

async function mount(plugin: ReactNode) {
  let editor!: LexicalEditor;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root!.render(
      <DialogStackProvider>
        <LexicalComposer
          initialConfig={{
            namespace: 'upload-insertion-point',
            nodes: [ImageNode, VideoNode],
            editorState: seed,
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
          {plugin}
        </LexicalComposer>
      </DialogStackProvider>,
    ),
  );
  return editor;
}

function outline(editor: LexicalEditor): string[] {
  return editor.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .flatMap((node) => {
        if ($isImageNode(node)) return [`img:${node.getSrc()}`];
        if ($isVideoNode(node)) return ['video'];
        if ($isParagraphNode(node) && node.getTextContent() === '') return [];
        return [node.getTextContent()];
      }),
  );
}

function caretText(editor: LexicalEditor): string | null {
  return editor.getEditorState().read(() => {
    const selection = $getSelection();
    return $isRangeSelection(selection) ? selection.anchor.getNode().getTextContent() : null;
  });
}

function moveCaretToSecond(editor: LexicalEditor) {
  return act(async () => {
    editor.update(() => $getRoot().getLastChildOrThrow().selectEnd(), { discrete: true });
  });
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

function gated() {
  let open!: () => void;
  const gate = new Promise<void>((resolve) => {
    open = resolve;
  });
  return { gate, open };
}

describe('Deferred upload insertion point', () => {
  it('inserts dialog uploads where the caret was on Insert, even after the caret moves', async () => {
    const { gate, open } = gated();
    const onUpload = vi.fn<ImageUploadFn>(async (file) => {
      await gate;
      return { src: file.name };
    });
    const editor = await mount(<ImageUploadPlugin onUpload={onUpload} />);

    await act(async () => {
      editor.dispatchCommand(OPEN_IMAGE_UPLOAD_DIALOG_COMMAND, undefined);
    });
    await chooseFiles([
      new File(['a'], 'a.png', { type: 'image/png' }),
      new File(['b'], 'b.png', { type: 'image/png' }),
    ]);
    await act(async () => button(/^Insert 2 images/).click());
    await settle();
    await moveCaretToSecond(editor);

    open();
    await settle();

    expect(outline(editor)).toEqual(['first', 'img:a.png', 'img:b.png', 'second']);
    expect(caretText(editor)).toBe('second');
  });

  it('retries a failed dialog upload at the original position', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onUpload = vi
      .fn<ImageUploadFn>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({ src: 'a.png' });
    const editor = await mount(<ImageUploadPlugin onUpload={onUpload} />);

    await act(async () => {
      editor.dispatchCommand(OPEN_IMAGE_UPLOAD_DIALOG_COMMAND, undefined);
    });
    await chooseFiles([new File(['a'], 'a.png', { type: 'image/png' })]);
    await act(async () => button(/^Insert image/).click());
    await settle();
    await moveCaretToSecond(editor);

    const [failed] = getToasts();
    await act(async () => failed.action!.onClick());
    await settle();

    expect(outline(editor)).toEqual(['first', 'img:a.png', 'second']);
  });

  it('inserts a dropped image at the drop point after the caret moves', async () => {
    const { gate, open } = gated();
    const onUpload = vi.fn<ImageUploadFn>(async (file) => {
      await gate;
      return { src: file.name };
    });
    const editor = await mount(<ImageUploadPlugin onUpload={onUpload} />);

    await act(async () => {
      editor.dispatchCommand(DRAG_DROP_PASTE, [new File(['a'], 'a.png', { type: 'image/png' })]);
    });
    await settle();
    await moveCaretToSecond(editor);

    open();
    await settle();

    expect(outline(editor)).toEqual(['first', 'img:a.png', 'second']);
  });

  it('inserts a dropped video at the drop point after the caret moves', async () => {
    const { gate, open } = gated();
    const onUpload = vi.fn<VideoUploadFn>(async () => {
      await gate;
      return { src: 'v.mp4' };
    });
    const editor = await mount(<VideoUploadPlugin onUpload={onUpload} />);

    await act(async () => {
      editor.dispatchCommand(DRAG_DROP_PASTE, [new File(['v'], 'v.mp4', { type: 'video/mp4' })]);
    });
    await settle();
    await moveCaretToSecond(editor);

    open();
    await settle();

    expect(outline(editor)).toEqual(['first', 'video', 'second']);
  });

  it('retries a failed video upload at the original position', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onUpload = vi
      .fn<VideoUploadFn>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({ src: 'v.mp4' });
    const editor = await mount(<VideoUploadPlugin onUpload={onUpload} />);

    await act(async () => {
      editor.dispatchCommand(DRAG_DROP_PASTE, [new File(['v'], 'v.mp4', { type: 'video/mp4' })]);
    });
    await settle();
    await moveCaretToSecond(editor);

    const failed = getToasts().find((item) => item.tone === 'error')!;
    await act(async () => failed.action!.onClick());
    await settle();

    expect(outline(editor)).toEqual(['first', 'video', 'second']);
  });
});
