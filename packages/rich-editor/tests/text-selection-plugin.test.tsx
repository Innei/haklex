// @vitest-environment happy-dom
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import type { LexicalEditor } from 'lexical';
import { $createParagraphNode, $createTextNode, $getRoot, $setState } from 'lexical';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { TextSelectionStoreProvider } from '../src/context/TextSelectionContext';
import { blockIdState } from '../src/plugins/BlockIdPlugin';
import * as css from '../src/plugins/text-selection.css';
import { TextSelectionPlugin } from '../src/plugins/TextSelectionPlugin';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(() => {
  if (root) act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
});

const frame = () => new Promise((resolve) => setTimeout(resolve, 32));

async function mount() {
  let editor: LexicalEditor | undefined;
  function Capture() {
    [editor] = useLexicalComposerContext();
    return null;
  }
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root!.render(
      <LexicalComposer
        initialConfig={{
          namespace: 'TextSelectionPluginTest',
          onError: (error) => {
            throw error;
          },
          editorState: () => {
            const paragraph = $createParagraphNode().append($createTextNode('hello world'));
            $setState(paragraph, blockIdState, 'block-a');
            $getRoot().append(paragraph);
          },
        }}
      >
        <TextSelectionStoreProvider>
          <ContentEditable aria-label="Editor" />
          <TextSelectionPlugin />
          <Capture />
        </TextSelectionStoreProvider>
      </LexicalComposer>,
    );
  });
  return editor!;
}

async function select(editor: LexicalEditor, end: number) {
  await act(async () => {
    editor.update(
      () => {
        const text = $getRoot().getFirstDescendant();
        text?.select(0, end);
      },
      { discrete: true },
    );
    await frame();
  });
}

const managed = [css.nativeSelectionActive, css.nativeSelectionInactive, css.nativeSelectionHidden];

describe('TextSelectionPlugin', () => {
  it('keeps the selection class on the root while the selection extends', async () => {
    const editor = await mount();
    await select(editor, 3);
    const editable = editor.getRootElement()!;
    expect(managed.some((name) => editable.classList.contains(name))).toBe(true);

    const states: boolean[] = [];
    const observer = new MutationObserver(() => {
      states.push(managed.some((name) => editable.classList.contains(name)));
    });
    observer.observe(editable, { attributes: true, attributeFilter: ['class'] });
    await select(editor, 5);
    await select(editor, 8);
    observer.disconnect();

    expect(states).not.toContain(false);
    expect(managed.some((name) => editable.classList.contains(name))).toBe(true);
  });
});
