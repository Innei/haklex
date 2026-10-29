// @vitest-environment happy-dom
import type { DialogStackItemProps } from '@haklex/rich-editor-ui';
import { act, createElement } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { CodeSnippetEditRenderer } from '../src/CodeSnippetEditRenderer';
import type { CodeFile } from '../src/types';

const ui = vi.hoisted(() => ({
  presentDialog: vi.fn(),
  confirmDiscardChanges: vi.fn(),
}));

vi.mock('@haklex/rich-editor-ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@haklex/rich-editor-ui')>()),
  presentDialog: ui.presentDialog,
  confirmDiscardChanges: ui.confirmDiscardChanges,
}));

vi.mock('@haklex/cm-editor', () => ({
  getThemeExtensions: () => [],
  loadLanguageExtension: async () => [],
}));

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

const files: CodeFile[] = [{ filename: 'index.ts', code: 'export {}', language: 'typescript' }];

let container: HTMLDivElement;
let root: Root;

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

beforeEach(() => {
  ui.presentDialog.mockReset();
  ui.confirmDiscardChanges.mockReset();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

async function openModal(onFilesChange = vi.fn()) {
  act(() => root.render(<CodeSnippetEditRenderer files={files} onFilesChange={onFilesChange} />));
  act(() =>
    container.querySelector<HTMLButtonElement>('[aria-label="Edit code snippet"]')!.click(),
  );
  const options = ui.presentDialog.mock.calls.at(-1)![0] as DialogStackItemProps;
  const dismiss = vi.fn();
  const requestDismiss = vi.fn(async () => {
    if (!options.confirmDismiss || (await options.confirmDismiss())) dismiss();
  });
  const dialogHost = document.createElement('div');
  container.append(dialogHost);
  const dialogRoot = createRoot(dialogHost);
  act(() => dialogRoot.render(createElement(options.content, { dismiss, requestDismiss })));
  const click = async (selector: string) => {
    await act(async () => {
      dialogHost.querySelector<HTMLElement>(selector)!.click();
    });
  };
  const button = (label: string) =>
    [...dialogHost.querySelectorAll('button')].find((el) => el.textContent?.startsWith(label));
  return { options, dismiss, requestDismiss, dialogHost, dialogRoot, click, button, onFilesChange };
}

describe('CodeSnippetEditRenderer modal', () => {
  it('opens as an auto sheet with its own close button', async () => {
    const { options, dialogHost, dialogRoot } = await openModal();
    expect(options.sheet).toBe('auto');
    expect(options.showCloseButton).toBe(false);
    expect(dialogHost.textContent).toContain('Code snippet');
    expect(dialogHost.textContent).toContain('1 file');
    act(() => dialogRoot.unmount());
  });

  it('closes a clean modal without asking or saving', async () => {
    const { click, dismiss, onFilesChange, dialogRoot } = await openModal();
    await click('[aria-label="Close"]');
    expect(ui.confirmDiscardChanges).not.toHaveBeenCalled();
    expect(dismiss).toHaveBeenCalledOnce();
    expect(onFilesChange).not.toHaveBeenCalled();
    act(() => dialogRoot.unmount());
  });

  it('asks before discarding unsaved edits and never saves on close', async () => {
    ui.confirmDiscardChanges.mockResolvedValue(false);
    const { click, dismiss, onFilesChange, dialogHost, dialogRoot } = await openModal();
    await click('[aria-label="Add file"]');
    expect(dialogHost.textContent).toContain('2 files');
    await click('[aria-label="Close"]');
    expect(ui.confirmDiscardChanges).toHaveBeenCalledOnce();
    expect(dismiss).not.toHaveBeenCalled();
    expect(onFilesChange).not.toHaveBeenCalled();
    act(() => dialogRoot.unmount());
  });

  it('saves edits and closes on Save', async () => {
    const { click, button, dismiss, onFilesChange, dialogRoot } = await openModal();
    await click('[aria-label="Add file"]');
    await act(async () => button('Save')!.click());
    expect(onFilesChange).toHaveBeenCalledOnce();
    expect(onFilesChange.mock.calls[0][0]).toHaveLength(2);
    expect(dismiss).toHaveBeenCalledOnce();
    expect(ui.confirmDiscardChanges).not.toHaveBeenCalled();
    act(() => dialogRoot.unmount());
  });
});
