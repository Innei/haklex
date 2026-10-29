// @vitest-environment happy-dom
import { dismissToast } from '@haklex/rich-editor-ui';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DRAG_DROP_PASTE } from '@lexical/rich-text';
import { $getRoot, type LexicalEditor } from 'lexical';
import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { getToasts } from '../../rich-editor-ui/src/components/toast/store';
import { $isVideoNode, VideoNode } from '../src/nodes/VideoNode';
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
  for (const item of getToasts()) dismissToast(item.id);
  await act(async () => root?.unmount());
  host?.remove();
  root = null;
  host = null;
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

async function mount(onUpload: VideoUploadFn) {
  let editor!: LexicalEditor;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root!.render(
      <LexicalComposer
        initialConfig={{
          namespace: 'video-upload-toast',
          nodes: [VideoNode],
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
        <VideoUploadPlugin onUpload={onUpload} />
      </LexicalComposer>,
    ),
  );
  return editor;
}

function videoCount(editor: LexicalEditor): number {
  return editor.getEditorState().read(
    () =>
      $getRoot()
        .getChildren()
        .filter((node) => $isVideoNode(node)).length,
  );
}

function drop(editor: LexicalEditor) {
  return act(async () => {
    editor.dispatchCommand(DRAG_DROP_PASTE, [new File(['v'], 'v.mp4', { type: 'video/mp4' })]);
  });
}

describe('VideoUploadPlugin toasts', () => {
  it('reports progress and success through the shared toast instead of its own pill', async () => {
    let finish!: () => void;
    const onUpload = vi.fn<VideoUploadFn>(
      (_file, opts) =>
        new Promise((resolve) => {
          opts?.onProgress?.(42);
          finish = () => resolve({ src: 'https://cdn.test/v.mp4' });
        }),
    );
    const editor = await mount(onUpload);

    await drop(editor);
    await settle();

    expect(getToasts().map((item) => [item.tone, item.title])).toEqual([
      ['loading', 'Uploading video… 42%'],
    ]);
    expect(host!.querySelector('div')).toBeNull();

    finish();
    await settle();

    expect(videoCount(editor)).toBe(1);
    expect(getToasts().map((item) => [item.tone, item.title])).toEqual([
      ['success', 'Video uploaded'],
    ]);
  });

  it('offers Retry when the upload fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onUpload = vi
      .fn<VideoUploadFn>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({ src: 'https://cdn.test/v.mp4' });
    const editor = await mount(onUpload);

    await drop(editor);
    await settle();

    const [failed] = getToasts();
    expect([failed.tone, failed.title, failed.action?.label]).toEqual([
      'error',
      'Video upload failed',
      'Retry',
    ]);

    await act(async () => failed.action!.onClick());
    await settle();

    expect(onUpload).toHaveBeenCalledTimes(2);
    expect(videoCount(editor)).toBe(1);
  });
});
