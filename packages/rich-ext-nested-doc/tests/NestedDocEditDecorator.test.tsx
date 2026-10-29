// @vitest-environment happy-dom
import type { DialogStackItemProps } from '@haklex/rich-editor-ui';
import {
  createLexicalComposerContext,
  LexicalComposerContext,
} from '@lexical/react/LexicalComposerContext';
import type { LexicalEditor, NodeKey, ParagraphNode, SerializedEditorState } from 'lexical';
import { $createTextNode, $getNodeByKey, $getRoot, createEditor } from 'lexical';
import { act, createElement, useEffect } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type { NestedDocDialogEditorProps } from '../src/NestedDocDialogEditorContext';
import { NestedDocDialogEditorProvider } from '../src/NestedDocDialogEditorContext';
import { NestedDocEditDecorator } from '../src/NestedDocEditDecorator';
import { $createNestedDocNode, NestedDocNode } from '../src/NestedDocNode';

const ui = vi.hoisted(() => ({
  presentDialog: vi.fn(),
  confirmDiscardChanges: vi.fn(),
}));

vi.mock('@haklex/rich-editor-ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@haklex/rich-editor-ui')>()),
  presentDialog: ui.presentDialog,
  confirmDiscardChanges: ui.confirmDiscardChanges,
}));

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

let container: HTMLDivElement;
let root: Root;
let parentEditor: LexicalEditor;
let contentEditor: LexicalEditor;
let nodeKey: NodeKey;
let dialogEditor: LexicalEditor | null = null;

function FakeDialogEditor({ initialValue, onEditorReady }: NestedDocDialogEditorProps) {
  useEffect(() => {
    const editor = createEditor({
      onError: (error) => {
        throw error;
      },
    });
    editor.setRootElement(document.createElement('div'));
    editor.setEditorState(editor.parseEditorState(initialValue));
    dialogEditor = editor;
    onEditorReady(editor);
    return () => onEditorReady(null);
  }, [initialValue, onEditorReady]);
  return null;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

beforeEach(() => {
  ui.presentDialog.mockReset();
  ui.confirmDiscardChanges.mockReset();
  dialogEditor = null;
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  const onError = (error: Error) => {
    throw error;
  };
  parentEditor = createEditor({ nodes: [NestedDocNode], onError });
  contentEditor = createEditor({ onError });
  parentEditor.update(
    () => {
      const node = $createNestedDocNode();
      $getRoot().append(node);
      nodeKey = node.getKey();
    },
    { discrete: true },
  );
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function contentText(): string {
  return parentEditor.read(() => {
    const node = $getNodeByKey<NestedDocNode>(nodeKey)!;
    const state = node.getContentState() as SerializedEditorState;
    return JSON.stringify(state);
  });
}

async function openDialog() {
  const context = createLexicalComposerContext(null, null);
  act(() =>
    root.render(
      <LexicalComposerContext.Provider value={[parentEditor, context]}>
        <NestedDocDialogEditorProvider value={FakeDialogEditor}>
          <NestedDocEditDecorator
            contentEditor={contentEditor}
            contentState={contentEditor.getEditorState().toJSON()}
            nodeKey={nodeKey}
          />
        </NestedDocDialogEditorProvider>
      </LexicalComposerContext.Provider>,
    ),
  );
  await act(async () => {
    container.querySelector<HTMLElement>('[aria-label="Open nested document editor"]')!.click();
  });
  const options = ui.presentDialog.mock.calls.at(-1)![0] as DialogStackItemProps;
  const dismiss = vi.fn();
  const requestDismiss = vi.fn(async () => {
    if (!options.confirmDismiss || (await options.confirmDismiss())) dismiss();
  });
  const host = document.createElement('div');
  container.append(host);
  const dialogRoot = createRoot(host);
  act(() => dialogRoot.render(createElement(options.content, { dismiss, requestDismiss })));
  return { options, dismiss, host, dialogRoot };
}

function typeInDialog(text: string) {
  act(() => {
    dialogEditor!.update(
      () => {
        $getRoot().getFirstChild<ParagraphNode>()!.append($createTextNode(text));
      },
      { discrete: true },
    );
  });
}

describe('NestedDocEditDecorator modal', () => {
  it('opens as an auto sheet on the shared modal shell', async () => {
    const { options, host, dialogRoot } = await openDialog();
    expect(options.sheet).toBe('auto');
    expect(options.showCloseButton).toBe(false);
    expect(host.textContent).toContain('Nested document');
    expect(host.querySelector('[aria-label="Close"]')).not.toBeNull();
    act(() => dialogRoot.unmount());
  });

  it('closes a clean document without asking', async () => {
    const { host, dismiss, dialogRoot } = await openDialog();
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Close"]')!.click());
    expect(ui.confirmDiscardChanges).not.toHaveBeenCalled();
    expect(dismiss).toHaveBeenCalledOnce();
    act(() => dialogRoot.unmount());
  });

  it('asks before discarding edits and keeps the node unchanged', async () => {
    ui.confirmDiscardChanges.mockResolvedValue(false);
    const before = contentText();
    const { host, dismiss, dialogRoot } = await openDialog();
    typeInDialog('draft');
    expect(host.textContent).toContain('1 word');
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Close"]')!.click());
    expect(ui.confirmDiscardChanges).toHaveBeenCalledOnce();
    expect(dismiss).not.toHaveBeenCalled();
    expect(contentText()).toBe(before);
    act(() => dialogRoot.unmount());
  });

  it('saves with mod+S and closes', async () => {
    const { host, dismiss, dialogRoot } = await openDialog();
    typeInDialog('saved text');
    act(() => {
      host.firstElementChild!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 's', metaKey: true, bubbles: true }),
      );
    });
    expect(dismiss).toHaveBeenCalledOnce();
    expect(contentText()).toContain('saved text');
    expect(ui.confirmDiscardChanges).not.toHaveBeenCalled();
    act(() => dialogRoot.unmount());
  });
});
