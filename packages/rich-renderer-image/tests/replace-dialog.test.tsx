// @vitest-environment happy-dom
import { $createImageNode, $isImageNode, ImageNode } from '@haklex/rich-editor/nodes';
import type { ImageUploadFn } from '@haklex/rich-editor/plugins';
import { ImageUploadProvider } from '@haklex/rich-editor/plugins';
import { DialogStackProvider, dismissAllDialogs } from '@haklex/rich-editor-ui';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useAtomValue } from 'jotai';
import { $getNodeByKey, $getRoot, type LexicalEditor, type NodeKey } from 'lexical';
import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { wrapperRefAtom } from '../src/atoms';
import { ImageEditProvider } from '../src/ImageEditContext';
import { ReplacePopover } from '../src/ReplacePopover';

vi.mock('@haklex/rich-editor/renderers', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  computeImageMeta: async () => ({ height: 20, thumbhash: 'hash', width: 30 }),
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

function NodeWrapper({ nodeKey }: { nodeKey: NodeKey }) {
  const [editor] = useLexicalComposerContext();
  const wrapperRef = useAtomValue(wrapperRefAtom);
  useEffect(() => {
    const el = wrapperRef.current as unknown as Record<string, unknown> | null;
    if (el) el[`__lexicalKey_${editor.getKey()}`] = nodeKey;
  }, [editor, nodeKey, wrapperRef]);
  return (
    <div ref={wrapperRef}>
      <ReplacePopover />
    </div>
  );
}

function Seed({ onReady }: { onReady: (editor: LexicalEditor, key: NodeKey) => void }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    let key = '';
    editor.update(
      () => {
        const node = $createImageNode({ altText: '', src: '' });
        $getRoot().append(node);
        key = node.getKey();
      },
      { discrete: true },
    );
    onReady(editor, key);
  }, [editor, onReady]);
  return null;
}

async function mount(onUpload: ImageUploadFn) {
  let editor!: LexicalEditor;
  let nodeKey = '';
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  const seeded = (value: LexicalEditor, key: NodeKey) => {
    editor = value;
    nodeKey = key;
  };
  await act(async () =>
    root!.render(
      <DialogStackProvider>
        <LexicalComposer
          initialConfig={{
            namespace: 'replace-dialog',
            nodes: [ImageNode],
            onError: (error) => {
              throw error;
            },
          }}
        >
          <Seed onReady={seeded} />
        </LexicalComposer>
      </DialogStackProvider>,
    ),
  );
  await act(async () =>
    root!.render(
      <DialogStackProvider>
        <LexicalComposer
          initialConfig={{
            namespace: 'replace-dialog',
            nodes: [ImageNode],
            onError: (error) => {
              throw error;
            },
          }}
        >
          <Seed onReady={seeded} />
          <ImageUploadProvider upload={onUpload}>
            <ImageEditProvider props={{ altText: '', autoOpenOnMount: true, src: '' }}>
              <NodeWrapper nodeKey={nodeKey} />
            </ImageEditProvider>
          </ImageUploadProvider>
        </LexicalComposer>
      </DialogStackProvider>,
    ),
  );
  return { editor, nodeKey: () => nodeKey };
}

async function settle() {
  await act(async () => {
    for (let i = 0; i < 5; i++) await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

function button(label: RegExp): HTMLButtonElement {
  const match = [...document.querySelectorAll('button')].find((el) =>
    label.test(el.textContent ?? ''),
  );
  if (!match) throw new Error(`No button ${label}`);
  return match;
}

describe('Replace image dialog', () => {
  it('opens the shared dialog in replace mode for a freshly inserted image and uploads one file', async () => {
    const onUpload = vi.fn<ImageUploadFn>().mockResolvedValue({ src: 'https://cdn.test/new.png' });
    const { editor, nodeKey } = await mount(onUpload);
    await settle();

    const dialog = document.querySelector('[role="dialog"]')!;
    expect(dialog.textContent).toContain('Replace image');
    const input = dialog.querySelector<HTMLInputElement>('input[type="file"]')!;
    expect(input.multiple).toBe(false);

    const picked = new File(['x'], 'new.png', { type: 'image/png' });
    Object.defineProperty(input, 'files', { configurable: true, value: [picked] });
    await act(async () => {
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await act(async () => button(/^Replace/).click());
    await settle();

    expect(onUpload).toHaveBeenCalledWith(picked);
    const src = editor.getEditorState().read(() => {
      const node = $getNodeByKey(nodeKey());
      return $isImageNode(node) ? node.getSrc() : null;
    });
    expect(src).toBe('https://cdn.test/new.png');
  });

  it('reopens from the empty placeholder button', async () => {
    const { editor } = await mount(vi.fn<ImageUploadFn>());
    await settle();
    await act(async () => dismissAllDialogs());
    await settle();

    await act(async () => button(/Click to add image/).click());

    expect(document.querySelector('[role="dialog"][data-open]')?.textContent).toContain(
      'Replace image',
    );
    expect(editor).toBeTruthy();
  });
});
