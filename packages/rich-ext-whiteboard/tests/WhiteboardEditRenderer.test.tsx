// @vitest-environment happy-dom
import type { DialogStackItemProps } from '@haklex/rich-editor-ui';
import type { ReactNode } from 'react';
import { act, createElement } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_FONT_CSS_HREF } from '../src';
import { setImageSizeReader } from '../src/editor/image-actions';
import type { WhiteboardSnapshot } from '../src/types';
import { WhiteboardConfigProvider } from '../src/WhiteboardConfigContext';
import { WhiteboardEditRenderer } from '../src/WhiteboardEditRenderer';
import { doubleClick, drag, key } from './harness';

const ui = vi.hoisted(() => ({
  presentDialog: vi.fn(),
  confirmDiscardChanges: vi.fn(),
  toast: vi.fn(),
}));

vi.mock('@haklex/rich-editor-ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@haklex/rich-editor-ui')>()),
  presentDialog: ui.presentDialog,
  confirmDiscardChanges: ui.confirmDiscardChanges,
  toast: ui.toast,
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
  // happy-dom throws synchronously when a stylesheet <link> connects while CSS loading is disabled.
  (
    window as unknown as { happyDOM: { settings: Record<string, unknown> } }
  ).happyDOM.settings.handleDisabledFileLoadingAsSuccess = true;
});

beforeEach(() => {
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

const RECT = {
  id: 'r1',
  type: 'rectangle',
  x: 0,
  y: 0,
  width: 100,
  height: 80,
  angle: 0,
  strokeColor: '#1e1e1e',
  backgroundColor: 'transparent',
  fillStyle: 'solid',
  strokeWidth: 2,
  strokeStyle: 'solid',
  roughness: 1,
  opacity: 100,
  seed: 1,
  version: 3,
  versionNonce: 7,
  isDeleted: false,
  groupIds: [],
  frameId: null,
  boundElements: null,
  roundness: null,
  link: null,
  locked: false,
  index: 'a0',
  updated: 1,
  customData: { keep: true },
};

async function openEditor({
  saveSnapshot,
  snapshot = null,
  uploadFile,
}: {
  saveSnapshot?: (snapshot: object, existingRef?: string) => Promise<string>;
  snapshot?: WhiteboardSnapshot | null;
  uploadFile?: (file: File) => Promise<string>;
} = {}) {
  const onSnapshotChange = vi.fn<(snapshot: WhiteboardSnapshot) => void>();
  const wrap = (node: ReactNode) =>
    saveSnapshot || uploadFile ? (
      <WhiteboardConfigProvider saveSnapshot={saveSnapshot} uploadFile={uploadFile}>
        {node}
      </WhiteboardConfigProvider>
    ) : (
      node
    );
  act(() =>
    root.render(
      wrap(<WhiteboardEditRenderer snapshot={snapshot} onSnapshotChange={onSnapshotChange} />),
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
  const canvas = () => host.querySelector<HTMLElement>('[data-whiteboard-canvas]')!;
  const draw = async () => {
    await click('[data-tool="rectangle"]');
    drag(canvas(), [200, 200], [300, 280]);
    await settle();
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
    canvas,
    draw,
    pressEscape,
    onSnapshotChange,
  };
}

describe('WhiteboardEditRenderer modal', () => {
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
    const { canvas, pressEscape, dismiss, host } = await openEditor();
    doubleClick(canvas(), 400, 300);
    await settle();
    const textarea = host.querySelector('textarea')!;
    expect(textarea).not.toBeNull();
    await pressEscape(textarea);
    expect(host.querySelector('textarea')).toBeNull();
    expect(dismiss).not.toHaveBeenCalled();
  });

  it('lets Escape leave a drawing tool before it closes the editor', async () => {
    const { click, pressEscape, dismiss, host } = await openEditor();
    await click('[data-tool="rectangle"]');
    await pressEscape();
    expect(dismiss).not.toHaveBeenCalled();
    expect(host.querySelector('[data-tool="selection"]')!.getAttribute('aria-pressed')).toBe(
      'true',
    );
    await pressEscape();
    expect(dismiss).toHaveBeenCalledOnce();
  });

  it('marks deleting everything as unsaved', async () => {
    ui.confirmDiscardChanges.mockResolvedValue(false);
    const { canvas, pressEscape, dismiss, host } = await openEditor({
      snapshot: { type: 'inline', data: { elements: [RECT] } },
    });
    expect(host.textContent).toContain('Saved');
    key(canvas(), 'a', { ctrlKey: true });
    key(canvas(), 'Delete');
    await settle();
    expect(host.textContent).toContain('Unsaved changes');
    await pressEscape();
    expect(ui.confirmDiscardChanges).toHaveBeenCalledOnce();
    expect(dismiss).not.toHaveBeenCalled();
  });

  it('saves an untouched board without changing it', async () => {
    const data = {
      type: 'excalidraw',
      version: 2,
      source: 'https://excalidraw.com',
      elements: [RECT],
      appState: { viewBackgroundColor: '#fff', gridSize: null, theme: 'light' },
      files: {},
    };
    const { button, onSnapshotChange } = await openEditor({
      snapshot: { type: 'inline', data: structuredClone(data) },
    });
    await act(async () => button('Save')!.click());
    await settle();
    expect(onSnapshotChange.mock.calls[0][0]).toEqual({ type: 'inline', data });
  });

  it('holds Save until a pending image upload finishes', async () => {
    setImageSizeReader(async () => ({ width: 100, height: 100 }));
    let finish!: (url: string) => void;
    const uploadFile = () =>
      new Promise<string>((resolve) => {
        finish = resolve;
      });
    const { button, canvas, host, onSnapshotChange } = await openEditor({ uploadFile });
    const paste = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(paste, 'clipboardData', {
      value: {
        getData: () => '',
        files: [new File([new Uint8Array([1])], 'a.png', { type: 'image/png' })],
        items: [],
      },
    });
    await act(async () => {
      canvas().dispatchEvent(paste);
    });
    await vi.waitFor(() => expect(host.textContent).toContain('Uploading'));
    expect(button('Save')!.disabled).toBe(true);
    await act(async () => button('Save')!.click());
    expect(onSnapshotChange).not.toHaveBeenCalled();
    await act(async () => finish('https://cdn.example/a.png'));
    await settle();
    expect(button('Save')!.disabled).toBe(false);
    await act(async () => button('Save')!.click());
    await settle();
    const data = onSnapshotChange.mock.calls[0][0] as {
      data: { files: Record<string, { dataURL: string }> };
    };
    expect(Object.values(data.data.files)[0].dataURL).toBe('https://cdn.example/a.png');
    setImageSizeReader(null);
  });

  it('loads the hand-drawn font from jsDelivr by default', async () => {
    await openEditor();
    expect(document.head.querySelector(`link[href="${DEFAULT_FONT_CSS_HREF}"]`)).not.toBeNull();
  });

  it('writes the drawing back and closes on Save', async () => {
    const { button, draw, dismiss, onSnapshotChange } = await openEditor();
    await draw();
    await act(async () => button('Save')!.click());
    await settle();
    expect(onSnapshotChange).toHaveBeenCalledOnce();
    expect(onSnapshotChange.mock.calls[0][0]).toMatchObject({
      type: 'inline',
      data: { elements: [{ type: 'rectangle', width: 100, height: 80 }] },
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
