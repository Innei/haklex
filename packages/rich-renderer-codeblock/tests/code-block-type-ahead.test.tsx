// @vitest-environment happy-dom
import { EditorView } from '@codemirror/view';
import { allEditNodes } from '@haklex/rich-editor/nodes';
import { RendererConfigProvider } from '@haklex/rich-editor/static';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import type { Klass, LexicalEditor, LexicalNode, NodeKey } from 'lexical';
import {
  $createNodeSelection,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $setSelection,
} from 'lexical';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { CodeBlockEditRenderer } from '../src/CodeBlockEditRenderer';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

const CodeBlockKlass = allEditNodes.find(
  (node) => (node as Klass<LexicalNode>).getType?.() === 'code-block',
) as Klass<LexicalNode> & (new (code: string, language: string) => LexicalNode);

let container: HTMLDivElement;
let root: Root;
let editor: LexicalEditor;
let codeBlockKey: NodeKey;
let frames: FrameRequestCallback[];

// happy-dom fires selectionchange synchronously while CodeMirror writes the DOM
// selection, re-entering EditorView.update; browsers fire it asynchronously.
function dropSelectionChange(event: Event) {
  event.stopImmediatePropagation();
}

function CaptureEditor() {
  [editor] = useLexicalComposerContext();
  return null;
}

async function mount() {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      <RendererConfigProvider
        config={{ CodeBlock: CodeBlockEditRenderer }}
        mode="editor"
        variant="article"
      >
        <LexicalComposer
          initialConfig={{
            namespace: 'code-block-type-ahead-test',
            nodes: allEditNodes,
            onError: (error) => {
              throw error;
            },
            editorState: () => {
              const paragraph = $createParagraphNode().append($createTextNode('before'));
              const codeBlock = new CodeBlockKlass('', 'js');
              codeBlockKey = codeBlock.getKey();
              $getRoot().append(paragraph, codeBlock);
            },
          }}
        >
          <RichTextPlugin
            ErrorBoundary={LexicalErrorBoundary}
            contentEditable={<ContentEditable />}
          />
          <CaptureEditor />
        </LexicalComposer>
      </RendererConfigProvider>,
    );
  });
}

function codeMirrorContent() {
  return editor.getElementByKey(codeBlockKey)!.querySelector<HTMLElement>('.cm-content')!;
}

async function selectCodeBlock() {
  await act(async () => {
    editor.update(() => {
      const selection = $createNodeSelection();
      selection.add(codeBlockKey);
      $setSelection(selection);
    });
  });
}

async function flushFrames() {
  await act(async () => {
    const pending = frames;
    frames = [];
    for (const frame of pending) frame(performance.now());
  });
}

beforeEach(async () => {
  document.addEventListener('selectionchange', dropSelectionChange, true);
  frames = [];
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  await mount();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  document.removeEventListener('selectionchange', dropSelectionChange, true);
  vi.restoreAllMocks();
});

describe('code block type-ahead', () => {
  it('moves focus into CodeMirror on a printable key before the deferred focus runs', async () => {
    await selectCodeBlock();
    expect(document.activeElement).not.toBe(codeMirrorContent());

    editor
      .getRootElement()!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true }));

    expect(document.activeElement).toBe(codeMirrorContent());
  });

  it('keeps the caret where typing left it when the deferred focus runs', async () => {
    await selectCodeBlock();
    editor
      .getRootElement()!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true }));

    const view = EditorView.findFromDOM(codeMirrorContent())!;
    view.dispatch({ changes: { from: 0, insert: 'ab' }, selection: { anchor: 2 } });
    await flushFrames();

    expect(view.state.selection.main.head).toBe(2);
  });

  it('leaves modifier shortcuts to Lexical', async () => {
    await selectCodeBlock();
    editor
      .getRootElement()!
      .dispatchEvent(
        new KeyboardEvent('keydown', { key: 'z', metaKey: true, bubbles: true, cancelable: true }),
      );

    expect(document.activeElement).not.toBe(codeMirrorContent());
  });
});
