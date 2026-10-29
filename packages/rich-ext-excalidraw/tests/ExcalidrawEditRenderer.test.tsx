// @vitest-environment happy-dom
import type { DialogStackItemProps } from '@haklex/rich-editor-ui';
import type { ReactNode } from 'react';
import { act, createElement, useEffect } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ExcalidrawConfigProvider } from '../src/ExcalidrawConfigContext';
import { ExcalidrawEditRenderer } from '../src/ExcalidrawEditRenderer';
import type { ExcalidrawSnapshot } from '../src/types';

const ui = vi.hoisted(() => ({
  presentDialog: vi.fn(),
  confirmDiscardChanges: vi.fn(),
  toast: vi.fn(),
}));

const scene = vi.hoisted(() => ({
  elements: [] as Array<Record<string, unknown>>,
  appState: {} as Record<string, unknown>,
}));

vi.mock('@haklex/rich-editor-ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@haklex/rich-editor-ui')>()),
  presentDialog: ui.presentDialog,
  confirmDiscardChanges: ui.confirmDiscardChanges,
  toast: ui.toast,
}));

vi.mock('@excalidraw/excalidraw/index.css', () => ({}));

vi.mock('@excalidraw/excalidraw', () => ({
  Excalidraw: ({
    onChange,
    excalidrawAPI,
  }: {
    onChange: (elements: unknown[]) => void;
    excalidrawAPI: (api: unknown) => void;
  }) => {
    useEffect(() => {
      excalidrawAPI({
        getSceneElements: () => scene.elements,
        getAppState: () => ({
          viewBackgroundColor: 'transparent',
          gridSize: null,
          activeTool: { type: 'selection' },
          ...scene.appState,
        }),
        getFiles: () => ({}),
      });
      onChange(scene.elements);
    }, []);
    return (
      <div className="excalidraw">
        <button
          aria-label="Draw"
          type="button"
          onClick={() => {
            scene.elements = [{ id: 'a', type: 'rectangle', version: 1 }];
            onChange(scene.elements);
          }}
        />
        <button
          aria-label="Clear"
          type="button"
          onClick={() => {
            scene.elements = [];
            onChange(scene.elements);
          }}
        />
        <textarea className="excalidraw-wysiwyg" />
      </div>
    );
  },
}));

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

let container: HTMLDivElement;
let root: Root;
const dialogRoots: Root[] = [];
const cleanups: Array<() => void> = [];

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

beforeEach(() => {
  scene.elements = [];
  scene.appState = {};
  ui.presentDialog.mockReset();
  ui.confirmDiscardChanges.mockReset();
  ui.toast.mockReset();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
  for (const dialogRoot of dialogRoots.splice(0)) act(() => dialogRoot.unmount());
  act(() => root.unmount());
  container.remove();
});

const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

async function openEditor({
  saveSnapshot,
}: {
  saveSnapshot?: (snapshot: object, existingRef?: string) => Promise<string>;
} = {}) {
  const onSnapshotChange = vi.fn<(snapshot: ExcalidrawSnapshot) => void>();
  const wrap = (node: ReactNode) =>
    saveSnapshot ? (
      <ExcalidrawConfigProvider saveSnapshot={saveSnapshot}>{node}</ExcalidrawConfigProvider>
    ) : (
      node
    );
  act(() =>
    root.render(
      wrap(<ExcalidrawEditRenderer snapshot={null} onSnapshotChange={onSnapshotChange} />),
    ),
  );
  await act(async () => {
    container.querySelector<HTMLButtonElement>('[aria-label="Edit whiteboard"]')!.click();
  });
  await settle();
  const options = ui.presentDialog.mock.calls.at(-1)![0] as DialogStackItemProps;
  const dismiss = vi.fn();
  const requestDismiss = vi.fn(async () => {
    if (!options.confirmDismiss || (await options.confirmDismiss())) dismiss();
  });
  const host = document.createElement('div');
  container.append(host);
  const dialogRoot = createRoot(host);
  dialogRoots.push(dialogRoot);
  act(() => dialogRoot.render(createElement(options.content, { dismiss, requestDismiss })));
  await settle();
  const click = async (selector: string) => {
    await act(async () => {
      document.body.querySelector<HTMLElement>(selector)!.click();
    });
    await settle();
  };
  const button = (label: string) =>
    [...host.querySelectorAll('button')].find((el) => el.textContent?.startsWith(label));
  const draw = async () => {
    await new Promise((resolve) => setTimeout(resolve, 550));
    await click('[aria-label="Draw"]');
  };
  const dialogEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') void requestDismiss();
  };
  document.addEventListener('keydown', dialogEscape);
  cleanups.push(() => document.removeEventListener('keydown', dialogEscape));
  const pressEscape = async (target: EventTarget = document) => {
    await act(async () => {
      target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    await settle();
  };
  return {
    options,
    dismiss,
    requestDismiss,
    host,
    click,
    button,
    draw,
    pressEscape,
    onSnapshotChange,
  };
}

describe('ExcalidrawEditRenderer modal', () => {
  it('opens a Whiteboard shell with its own close button', async () => {
    const { options, host } = await openEditor();
    expect(options.showCloseButton).toBe(false);
    expect(host.textContent).toContain('Whiteboard');
    expect(host.textContent).toContain('Saved');
    expect(host.querySelector('[aria-label="Close"]')).not.toBeNull();
  });

  it('asks before discarding unsaved drawing and never saves on close', async () => {
    ui.confirmDiscardChanges.mockResolvedValue(false);
    const { click, draw, dismiss, host, onSnapshotChange } = await openEditor();
    await draw();
    expect(host.textContent).toContain('Unsaved changes');
    await click('[aria-label="Close"]');
    expect(ui.confirmDiscardChanges).toHaveBeenCalledOnce();
    expect(dismiss).not.toHaveBeenCalled();
    expect(onSnapshotChange).not.toHaveBeenCalled();
  });

  it('closes a clean editor without asking or saving', async () => {
    const { click, dismiss, onSnapshotChange } = await openEditor();
    await click('[aria-label="Close"]');
    expect(ui.confirmDiscardChanges).not.toHaveBeenCalled();
    expect(dismiss).toHaveBeenCalledOnce();
    expect(onSnapshotChange).not.toHaveBeenCalled();
  });

  it('routes Escape through the discard guard', async () => {
    ui.confirmDiscardChanges.mockResolvedValue(false);
    const { draw, pressEscape, requestDismiss, dismiss } = await openEditor();
    await draw();
    await pressEscape();
    expect(requestDismiss).toHaveBeenCalledOnce();
    expect(ui.confirmDiscardChanges).toHaveBeenCalledOnce();
    expect(dismiss).not.toHaveBeenCalled();
  });

  it('lets Escape finish text editing inside the canvas', async () => {
    ui.confirmDiscardChanges.mockResolvedValue(false);
    const { draw, pressEscape, dismiss, host } = await openEditor();
    await draw();
    const textarea = host.querySelector('textarea')!;
    const textEditorKeys = vi.fn();
    textarea.addEventListener('keydown', textEditorKeys);
    await pressEscape(textarea);
    expect(textEditorKeys).toHaveBeenCalledOnce();
    expect(ui.confirmDiscardChanges).not.toHaveBeenCalled();
    expect(dismiss).not.toHaveBeenCalled();
  });

  it('lets Escape leave a drawing tool before it closes the editor', async () => {
    const { pressEscape, dismiss } = await openEditor();
    scene.appState = { activeTool: { type: 'rectangle' } };
    await pressEscape();
    expect(dismiss).not.toHaveBeenCalled();
    scene.appState = { openMenu: 'canvas' };
    await pressEscape();
    expect(dismiss).not.toHaveBeenCalled();
    scene.appState = {};
    await pressEscape();
    expect(dismiss).toHaveBeenCalledOnce();
  });

  it('marks clearing the canvas as unsaved', async () => {
    ui.confirmDiscardChanges.mockResolvedValue(false);
    scene.elements = [{ id: 'a', type: 'rectangle', version: 1 }];
    const { click, pressEscape, dismiss, host } = await openEditor();
    await new Promise((resolve) => setTimeout(resolve, 550));
    await click('[aria-label="Clear"]');
    expect(host.textContent).toContain('Unsaved changes');
    await pressEscape();
    expect(ui.confirmDiscardChanges).toHaveBeenCalledOnce();
    expect(dismiss).not.toHaveBeenCalled();
  });

  it('writes the drawing back and closes on Save', async () => {
    const { button, draw, dismiss, onSnapshotChange } = await openEditor();
    await draw();
    await act(async () => button('Save')!.click());
    await settle();
    expect(onSnapshotChange).toHaveBeenCalledOnce();
    expect(onSnapshotChange.mock.calls[0][0]).toMatchObject({
      type: 'inline',
      data: { elements: [{ id: 'a' }] },
    });
    expect(dismiss).toHaveBeenCalledOnce();
    expect(ui.confirmDiscardChanges).not.toHaveBeenCalled();
  });

  it('keeps storage modes under the more menu', async () => {
    const saveSnapshot = vi.fn(async () => 'ref:file/abc');
    const { click, host } = await openEditor({ saveSnapshot });
    expect(host.textContent).not.toContain('Remote');
    await click('[aria-label="More options"]');
    expect(document.body.textContent).toContain('Advanced');
    expect(document.body.textContent).toContain('Remote');
    expect(document.body.textContent).toContain('Delta');
  });

  it('confirms a copy with a toast', async () => {
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    const { click } = await openEditor();
    await click('[aria-label="More options"]');
    const copy = [...document.body.querySelectorAll('button')].find((el) =>
      el.textContent?.includes('Copy JSON'),
    );
    await act(async () => copy!.click());
    await settle();
    expect(writeText).toHaveBeenCalledOnce();
    expect(ui.toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Copied' }));
  });
});
