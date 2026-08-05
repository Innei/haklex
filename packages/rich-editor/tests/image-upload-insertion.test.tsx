// @vitest-environment happy-dom
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DRAG_DROP_PASTE } from '@lexical/rich-text';
import { $getRoot, type LexicalEditor } from 'lexical';
import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { $isImageNode, ImageNode } from '../src/nodes/ImageNode';
import { createNestedEditor } from '../src/nodes/shared';
import { ImageUploadPlugin } from '../src/plugins/ImageUploadPlugin';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

vi.mock('../src/styles/theme', () => ({
  editorTheme: {},
}));

vi.mock('../src/styles/shared.css', () => {
  const identityProxy = new Proxy({}, { get: (_target, prop: string) => prop });
  return {
    semanticClassNames: identityProxy,
    sharedStyles: identityProxy,
  };
});

vi.mock('../src/styles/katex.css', () => {
  const identityProxy = new Proxy({}, { get: (_target, prop: string) => prop });
  return {
    katexClassNames: identityProxy,
    katexStyles: identityProxy,
  };
});

vi.mock('../src/components/utils', () => ({
  clsx: (...args: Array<string | undefined | null | false>) => args.filter(Boolean).join(' '),
  getVariantClass: () => '',
}));

vi.mock('../src/plugins/image-upload.css', () => {
  const identityProxy = new Proxy({}, { get: (_target, prop: string) => prop, has: () => true });
  return new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        if (prop === 'toastVariant' || prop === 'uploadDropzoneState') return identityProxy;
        return prop;
      },
      has: () => true,
    },
  );
});

vi.mock('../src/utils/thumbhash', () => ({
  computeImageMeta: async () => ({ width: 10, height: 10, thumbhash: 'stub-hash' }),
  decodeThumbHash: () => undefined,
}));

vi.mock('@haklex/rich-editor-ui', () => ({
  ActionBar: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  ActionButton: ({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  Dialog: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  DialogPopup: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  DialogTitle: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  SegmentedControl: () => null,
}));

function EditorCapture({ onReady }: { onReady: (editor: LexicalEditor) => void }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    onReady(editor);
  }, [editor, onReady]);
  return null;
}

async function flushMicrotasks() {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function editorHasImageNode(editor: LexicalEditor): boolean {
  let found = false;
  editor.getEditorState().read(() => {
    found = $getRoot()
      .getChildren()
      .some((node) => $isImageNode(node));
  });
  return found;
}

describe('ImageUploadPlugin insertByUpload target routing', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
      root = null;
    }
    if (container) {
      container.remove();
      container = null;
    }
  });

  it('inserts the uploaded image into the dispatching editor, not the mounted root', async () => {
    let rootEditor: LexicalEditor | undefined;

    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <LexicalComposer
          initialConfig={{
            namespace: 'ImageUploadInsertionTest',
            nodes: [ImageNode],
            onError: (error) => {
              throw error;
            },
          }}
        >
          <EditorCapture
            onReady={(editor) => {
              rootEditor = editor;
            }}
          />
          <ImageUploadPlugin onUpload={async () => ({ src: 'https://example.com/a.png' })} />
        </LexicalComposer>,
      );
    });

    if (!rootEditor) throw new Error('root editor was not captured');

    let nestedEditor: LexicalEditor | undefined;
    rootEditor.update(() => {
      nestedEditor = createNestedEditor('ImageUploadInsertionNestedCellTest');
    });
    if (!nestedEditor) throw new Error('nested editor was not created');

    const file = new File(['fake-image-bytes'], 'a.png', { type: 'image/png' });
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      nestedEditor?.dispatchCommand(DRAG_DROP_PASTE, [file]);
      await flushMicrotasks();
    });

    expect(errSpy).not.toHaveBeenCalled();
    errSpy.mockRestore();

    expect(editorHasImageNode(nestedEditor)).toBe(true);
    expect(editorHasImageNode(rootEditor)).toBe(false);
  });
});
