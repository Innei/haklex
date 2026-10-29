// @vitest-environment happy-dom
import { ImageNode } from '@haklex/rich-editor/nodes';
import { RendererConfigProvider } from '@haklex/rich-editor/static';
import { DialogStackProvider, dismissAllDialogs } from '@haklex/rich-editor-ui';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { $getRoot, type LexicalEditor } from 'lexical';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { ImageEditRenderer } from '../src/ImageEditRenderer';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

const RENDERERS = { Image: ImageEditRenderer };

function emptyImage() {
  return { type: 'image', version: 1, src: '', altText: '' };
}

function serialized(children: object[]) {
  return JSON.stringify({
    root: { type: 'root', version: 1, direction: null, format: '', indent: 0, children },
  });
}

let host: HTMLDivElement | null = null;
let root: Root | null = null;
let editorRef: LexicalEditor | null = null;

function CaptureEditor() {
  const [editor] = useLexicalComposerContext();
  editorRef = editor;
  return null;
}

afterEach(async () => {
  await act(async () => dismissAllDialogs());
  await act(async () => root?.unmount());
  host?.remove();
  host = null;
  root = null;
  editorRef = null;
  document.body.innerHTML = '';
});

async function settle() {
  await act(async () => {
    for (let i = 0; i < 5; i++) await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

async function mount(editorState: string) {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root!.render(
      <DialogStackProvider>
        <RendererConfigProvider config={RENDERERS} mode="editor" variant="article">
          <LexicalComposer
            initialConfig={{
              namespace: 'empty-image-auto-open',
              nodes: [ImageNode],
              editorState,
              onError: (error) => {
                throw error;
              },
            }}
          >
            <RichTextPlugin
              ErrorBoundary={LexicalErrorBoundary}
              contentEditable={<ContentEditable />}
            />
            <CaptureEditor />
          </LexicalComposer>
        </RendererConfigProvider>
      </DialogStackProvider>,
    ),
  );
  await settle();
  return editorRef!;
}

function openDialogs() {
  return document.querySelectorAll('[role="dialog"]').length;
}

function placeholders() {
  return [...document.querySelectorAll('button')].filter((el) =>
    /Click to add image/.test(el.textContent ?? ''),
  ).length;
}

async function insertFromCommand(editor: LexicalEditor) {
  await act(async () => {
    ImageNode.commandItems[0].onSelect(editor, '');
  });
  await settle();
}

describe('Empty image auto-open', () => {
  it('opens no dialog when empty images load from a saved document', async () => {
    await mount(serialized([emptyImage(), emptyImage()]));

    expect(placeholders()).toBe(2);
    expect(openDialogs()).toBe(0);
  });

  it('opens the replace dialog exactly once for a freshly inserted empty image', async () => {
    const editor = await mount(serialized([emptyImage()]));

    await insertFromCommand(editor);

    expect(placeholders()).toBe(2);
    expect(openDialogs()).toBe(1);
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain('Replace image');

    await act(async () => dismissAllDialogs());
    await settle();
    await act(async () => {
      editor.setEditorState(editor.parseEditorState(JSON.stringify(editor.getEditorState())));
    });
    await settle();

    expect(openDialogs()).toBe(0);
  });

  it('keeps the one-shot flag out of the serialized document', async () => {
    const editor = await mount(serialized([emptyImage()]));
    await act(async () => {
      editor.update(() => $getRoot().getFirstChildOrThrow().selectNext(), { discrete: true });
    });

    await insertFromCommand(editor);

    expect(openDialogs()).toBe(1);

    expect(JSON.stringify(editor.getEditorState().toJSON())).not.toMatch(/autoopen/i);
  });
});
