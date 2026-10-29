// @vitest-environment happy-dom
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $isElementNode, type LexicalEditor, type LexicalNode } from 'lexical';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { $isImageNode, ImageNode } from '../src/nodes/ImageNode';
import { ImagePlugin, INSERT_IMAGE_COMMAND } from '../src/plugins/ImagePlugin';

vi.mock('../src/components/RendererWrapper', () => ({
  createRendererDecoration: vi.fn(() => null),
}));

vi.mock('../src/components/renderers/ImageRenderer', () => ({
  ImageRenderer: vi.fn(),
}));

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

async function insert(src: string) {
  let editor: LexicalEditor | undefined;
  function Capture() {
    [editor] = useLexicalComposerContext();
    return null;
  }
  const root = createRoot(document.createElement('div'));
  await act(async () => {
    root.render(
      <LexicalComposer
        initialConfig={{
          namespace: 'ImagePluginAutoOpen',
          nodes: [ImageNode],
          onError: (e) => {
            throw e;
          },
        }}
      >
        <ImagePlugin />
        <Capture />
      </LexicalComposer>,
    );
  });
  await act(async () => {
    editor!.update(() => $getRoot().selectEnd(), { discrete: true });
    editor!.dispatchCommand(INSERT_IMAGE_COMMAND, { src, altText: '' });
  });
  const flag = editor!.getEditorState().read(() => {
    const walk = (node: LexicalNode): LexicalNode[] =>
      $isElementNode(node) ? [node, ...node.getChildren().flatMap(walk)] : [node];
    const image = walk($getRoot()).find($isImageNode);
    return $isImageNode(image) ? image.getShouldAutoOpenOnMount() : undefined;
  });
  act(() => root.unmount());
  return flag;
}

describe('INSERT_IMAGE_COMMAND', () => {
  it('opens the image dialog for a freshly inserted empty image', async () => {
    expect(await insert('')).toBe(true);
  });

  it('does not auto-open an image that already has a source', async () => {
    expect(await insert('https://example.com/a.png')).toBe(false);
  });
});
