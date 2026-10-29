// @vitest-environment happy-dom
import type { DialogStackItemProps } from '@haklex/rich-editor-ui';
import { act, createElement } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { MermaidEditRenderer } from '../src/MermaidEditRenderer';

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

const content = 'graph TD\n  A --> B';

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
  document.body.innerHTML = '';
});

function openModal(onContentChange = vi.fn()) {
  act(() =>
    root.render(<MermaidEditRenderer content={content} onContentChange={onContentChange} />),
  );
  const trigger = container.querySelector<HTMLButtonElement>('button[aria-label="Edit diagram"]')!;
  act(() => trigger.click());
  const options = ui.presentDialog.mock.calls.at(-1)![0] as DialogStackItemProps;
  const dismiss = vi.fn();
  const requestDismiss = vi.fn(async () => {
    if (!options.confirmDismiss || (await options.confirmDismiss())) dismiss();
  });
  const dialogHost = document.createElement('div');
  document.body.append(dialogHost);
  const dialogRoot = createRoot(dialogHost);
  act(() => dialogRoot.render(createElement(options.content, { dismiss, requestDismiss })));
  const textarea = () => dialogHost.querySelector('textarea')!;
  const type = (value: string) =>
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!;
      setter.call(textarea(), value);
      textarea().dispatchEvent(new Event('input', { bubbles: true }));
    });
  const button = (label: string) =>
    [...dialogHost.querySelectorAll('button')].find((el) => el.textContent?.startsWith(label));
  const chooseTemplate = async (label: string) => {
    await act(async () => {
      dialogHost.querySelector<HTMLElement>('[aria-label="Templates"]')!.click();
    });
    const item = [...document.body.querySelectorAll('[role="menuitem"]')].find(
      (el) => el.textContent === label,
    ) as HTMLElement;
    await act(async () => item.click());
  };
  return {
    options,
    dismiss,
    dialogHost,
    dialogRoot,
    textarea,
    type,
    button,
    chooseTemplate,
    onContentChange,
  };
}

describe('MermaidEditRenderer', () => {
  it('opens the editor from a focusable Edit button as an auto sheet', () => {
    const { options, dialogHost, dialogRoot } = openModal();
    expect(options.sheet).toBe('auto');
    expect(options.showCloseButton).toBe(false);
    expect(dialogHost.textContent).toContain('Mermaid diagram');
    expect(dialogHost.querySelectorAll('[role="tab"]')).toHaveLength(3);
    act(() => dialogRoot.unmount());
  });

  it('labels the zoom buttons', () => {
    act(() => root.render(<MermaidEditRenderer content={content} onContentChange={vi.fn()} />));
    expect(container.querySelector('[aria-label="Zoom in"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Zoom out"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Reset zoom"]')).not.toBeNull();
  });

  it('asks before a template overwrites code and keeps the code when declined', async () => {
    ui.confirmDiscardChanges.mockResolvedValue(false);
    const { chooseTemplate, textarea, dialogRoot } = openModal();
    await chooseTemplate('Sequence');
    expect(ui.confirmDiscardChanges).toHaveBeenCalledOnce();
    expect(textarea().value).toBe(content);
    act(() => dialogRoot.unmount());
  });

  it('applies a template once replacing is confirmed', async () => {
    ui.confirmDiscardChanges.mockResolvedValue(true);
    const { chooseTemplate, textarea, dialogRoot } = openModal();
    await chooseTemplate('Sequence');
    expect(textarea().value).toMatch(/^sequenceDiagram/);
    act(() => dialogRoot.unmount());
  });

  it('asks before discarding unsaved edits and never saves on close', async () => {
    ui.confirmDiscardChanges.mockResolvedValue(false);
    const { type, dialogHost, dismiss, onContentChange, dialogRoot } = openModal();
    type('graph TD\n  A --> C');
    await act(async () => {
      dialogHost.querySelector<HTMLElement>('[aria-label="Close"]')!.click();
    });
    expect(ui.confirmDiscardChanges).toHaveBeenCalledOnce();
    expect(dismiss).not.toHaveBeenCalled();
    expect(onContentChange).not.toHaveBeenCalled();
    act(() => dialogRoot.unmount());
  });

  it('saves edits and closes on Save', async () => {
    const { type, button, dismiss, onContentChange, dialogRoot } = openModal();
    type('graph TD\n  A --> C');
    await act(async () => button('Save')!.click());
    expect(onContentChange).toHaveBeenCalledWith('graph TD\n  A --> C');
    expect(dismiss).toHaveBeenCalledOnce();
    expect(ui.confirmDiscardChanges).not.toHaveBeenCalled();
    act(() => dialogRoot.unmount());
  });

  it('reports syntax state in the footer', () => {
    vi.useFakeTimers();
    const { dialogHost, type, dialogRoot } = openModal();
    expect(dialogHost.textContent).toContain('Syntax OK');
    type('graph TD\n  A -->');
    act(() => vi.advanceTimersByTime(400));
    expect(dialogHost.textContent).toContain('1 syntax error');
    vi.useRealTimers();
    act(() => dialogRoot.unmount());
  });
});
