// @vitest-environment happy-dom
import type { DialogStackItemProps } from '@haklex/rich-editor-ui';
import {
  createLexicalComposerContext,
  LexicalComposerContext,
} from '@lexical/react/LexicalComposerContext';
import type { LexicalEditor, NodeKey } from 'lexical';
import { $getNodeByKey, $getRoot, createEditor } from 'lexical';
import { act, createElement } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatEditDecorator } from '../src/ChatEditDecorator';
import { $createChatEditNode, ChatEditNode } from '../src/nodes/ChatEditNode';
import type { ChatNode } from '../src/nodes/ChatNode';

const ui = vi.hoisted(() => ({
  presentDialog: vi.fn(),
  confirmDiscardChanges: vi.fn(),
}));

vi.mock('@haklex/rich-editor-ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@haklex/rich-editor-ui')>()),
  presentDialog: ui.presentDialog,
  confirmDiscardChanges: ui.confirmDiscardChanges,
}));

vi.mock('streamdown', () => ({
  Streamdown: ({ children }: { children: string }) => <span>{children}</span>,
}));

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

let container: HTMLDivElement;
let root: Root;
let editor: LexicalEditor;
let nodeKey: NodeKey;

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

beforeEach(() => {
  ui.presentDialog.mockReset();
  ui.confirmDiscardChanges.mockReset();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  editor = createEditor({
    nodes: [ChatEditNode],
    onError: (error) => {
      throw error;
    },
  });
  editor.update(
    () => {
      const node = $createChatEditNode({ variant: 'user-agent' });
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

function readNode() {
  return editor.read(() => $getNodeByKey(nodeKey) as ChatNode | null);
}

function mountDecorator() {
  const node = readNode()!;
  const context = createLexicalComposerContext(null, null);
  act(() =>
    root.render(
      <LexicalComposerContext.Provider value={[editor, context]}>
        <ChatEditDecorator
          messages={editor.read(() => node.getMessages())}
          nodeKey={nodeKey}
          participants={editor.read(() => node.getParticipants())}
          variant="user-agent"
        />
      </LexicalComposerContext.Provider>,
    ),
  );
}

function mountDialog() {
  const options = ui.presentDialog.mock.calls.at(-1)![0] as DialogStackItemProps;
  const dismiss = vi.fn(() => options.onClose?.());
  const requestDismiss = vi.fn(async () => {
    if (!options.confirmDismiss || (await options.confirmDismiss())) dismiss();
  });
  const host = document.createElement('div');
  container.append(host);
  const dialogRoot = createRoot(host);
  act(() => dialogRoot.render(createElement(options.content, { dismiss, requestDismiss })));
  const button = (label: string) =>
    [...host.querySelectorAll('button')].find((el) => el.textContent?.startsWith(label));
  return { options, dismiss, requestDismiss, host, dialogRoot, button };
}

describe('Chat edit modal', () => {
  it('opens a new chat as an auto sheet titled Edit chat with Save', () => {
    mountDecorator();
    expect(ui.presentDialog).toHaveBeenCalledOnce();
    const { options, host, button, dialogRoot } = mountDialog();
    expect(options.sheet).toBe('auto');
    expect(options.showCloseButton).toBe(false);
    expect(host.textContent).toContain('Edit chat');
    expect(host.textContent).toContain('0 messages');
    expect(button('Save')).toBeTruthy();
    expect(button('Done')).toBeUndefined();
    expect(host.querySelector('select')).toBeNull();
    act(() => dialogRoot.unmount());
  });

  it('removes a never-saved chat node when the dialog closes', () => {
    mountDecorator();
    const options = ui.presentDialog.mock.calls.at(-1)![0] as DialogStackItemProps;
    act(() => options.onClose?.());
    expect(readNode()).toBeNull();
  });

  it('keeps the node once saved', async () => {
    mountDecorator();
    const { button, dismiss, dialogRoot } = mountDialog();
    await act(async () => button('Add message')!.click());
    await act(async () => button('Save')!.click());
    expect(dismiss).toHaveBeenCalledOnce();
    expect(readNode()).not.toBeNull();
    expect(editor.read(() => readNode()!.getMessages())).toHaveLength(1);
    act(() => dialogRoot.unmount());
  });

  it('asks before discarding unsaved edits and does not commit', async () => {
    ui.confirmDiscardChanges.mockResolvedValue(false);
    mountDecorator();
    const { button, host, dismiss, dialogRoot } = mountDialog();
    await act(async () => button('Add message')!.click());
    expect(host.textContent).toContain('1 message');
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Close"]')!.click());
    expect(ui.confirmDiscardChanges).toHaveBeenCalledOnce();
    expect(dismiss).not.toHaveBeenCalled();
    expect(editor.read(() => readNode()!.getMessages())).toHaveLength(0);
    act(() => dialogRoot.unmount());
  });
});
