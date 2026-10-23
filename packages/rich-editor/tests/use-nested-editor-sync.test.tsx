// @vitest-environment happy-dom
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { LexicalEditor, NodeKey } from 'lexical';
import { $createParagraphNode, $createTextNode, $getRoot, createEditor } from 'lexical';
import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { useNestedEditorSync } from '../src/index';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

function Capture({ onReady }: { onReady: (editor: LexicalEditor) => void }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    onReady(editor);
  }, [editor, onReady]);
  return null;
}

function Sync({ nested, ownerKey }: { nested: LexicalEditor[]; ownerKey: NodeKey }) {
  useNestedEditorSync(nested, ownerKey);
  return null;
}

let root: Root | null = null;

afterEach(() => {
  act(() => root?.unmount());
  root = null;
});

const config = {
  namespace: 'sync-test',
  onError: (error: Error) => {
    throw error;
  },
};

function mount(nested: LexicalEditor[]) {
  let parent: LexicalEditor | null = null;
  const onReady = (editor: LexicalEditor) => {
    parent = editor;
  };
  root = createRoot(document.createElement('div'));
  act(() => {
    root!.render(
      <LexicalComposer initialConfig={config}>
        <Capture onReady={onReady} />
      </LexicalComposer>,
    );
  });
  let ownerKey: NodeKey = '';
  parent!.update(
    () => {
      const owner = $createParagraphNode();
      $getRoot().append(owner);
      ownerKey = owner.getKey();
    },
    { discrete: true },
  );
  act(() => {
    root!.render(
      <LexicalComposer initialConfig={config}>
        <Capture onReady={onReady} />
        <Sync nested={nested} ownerKey={ownerKey} />
      </LexicalComposer>,
    );
  });
  return { parent: parent!, ownerKey };
}

function createNested() {
  const nested = createEditor({
    onError: (error) => {
      throw error;
    },
  });
  nested.update(() => $getRoot().append($createParagraphNode()), { discrete: true });
  return nested;
}

async function type(nested: LexicalEditor) {
  await act(async () => {
    nested.update(
      () => {
        $getRoot()
          .getFirstChildOrThrow<ReturnType<typeof $createParagraphNode>>()
          .append($createTextNode('x'));
      },
      { discrete: true },
    );
    await Promise.resolve();
  });
}

describe('useNestedEditorSync', () => {
  it('dirties the owner in the composer editor for each nested editor', async () => {
    const first = createNested();
    const second = createNested();
    const { parent, ownerKey } = mount([first, second]);
    const dirtied: boolean[] = [];
    parent.registerUpdateListener(({ dirtyElements }) => dirtied.push(dirtyElements.has(ownerKey)));

    await type(first);
    await type(second);

    expect(dirtied.filter(Boolean)).toHaveLength(2);
  });

  it('stops syncing after unmount', async () => {
    const nested = createNested();
    const { parent } = mount([nested]);
    const updates: number[] = [];
    parent.registerUpdateListener(() => updates.push(1));

    act(() => root?.unmount());
    root = null;
    await type(nested);

    expect(updates).toEqual([]);
  });
});
