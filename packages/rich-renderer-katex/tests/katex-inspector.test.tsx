// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const setEquation = vi.fn();
const remove = vi.fn();
const fakeNode = {
  kind: 'block',
  getEquation: () => 'x^2',
  setEquation,
  remove,
  setShouldAutoOpenOnMount: vi.fn(),
};
const dispatchCommand = vi.fn();
const confirmDiscardChanges = vi.hoisted(() => vi.fn<() => Promise<boolean>>());

vi.mock('@haklex/rich-editor-ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@haklex/rich-editor-ui')>()),
  confirmDiscardChanges,
}));

vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: () => [
    {
      isEditable: () => true,
      update: (fn: () => void) => fn(),
      dispatchCommand,
    },
  ],
}));

vi.mock('lexical', async (importOriginal) => ({
  ...(await importOriginal<typeof import('lexical')>()),
  $getNodeByKey: () => fakeNode,
}));

vi.mock('@haklex/rich-editor/nodes', () => ({
  $isKaTeXBlockNode: (node: { kind?: string }) => node?.kind === 'block',
  $isKaTeXInlineNode: (node: { kind?: string }) => node?.kind === 'inline',
}));

vi.mock('@haklex/rich-editor/renderers', () => ({
  KaTeXRenderer: ({ equation }: { equation: string }) => (
    <span data-testid="preview">{equation}</span>
  ),
}));

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let container: HTMLDivElement | null = null;
let root: Root | null = null;

beforeEach(() => {
  setEquation.mockClear();
  remove.mockClear();
  dispatchCommand.mockClear();
  confirmDiscardChanges.mockReset();
});

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
});

async function mount(displayMode = true) {
  const { KaTeXEditDecorator } = await import('../src/KaTeXEditDecorator');
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () =>
    root!.render(
      <KaTeXEditDecorator autoOpenOnMount displayMode={displayMode} equation="x^2" nodeKey="k">
        <span>formula</span>
      </KaTeXEditDecorator>,
    ),
  );
}

const textarea = () => document.body.querySelector<HTMLTextAreaElement>('textarea');

async function typeInto(el: HTMLTextAreaElement, text: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(el, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function press(el: HTMLElement, init: KeyboardEventInit) {
  await act(async () => {
    el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }));
  });
}

describe('KaTeX inspector', () => {
  it('labels the LaTeX field and names the node in the header', async () => {
    await mount();
    const input = textarea();
    expect(input).not.toBeNull();
    const label = document.body.querySelector(`label[for="${input!.id}"]`);
    expect(label?.textContent).toBe('LaTeX');
    expect(document.body.textContent).toContain('Math block');
    expect(document.body.querySelector('[role="tablist"]')?.textContent).toContain('Snippets');
  });

  it('names inline math in the header', async () => {
    await mount(false);
    expect(document.body.textContent).toContain('Inline math');
  });

  it('closes a clean formula on Escape without asking', async () => {
    await mount();
    await press(textarea()!, { key: 'Escape' });
    expect(confirmDiscardChanges).not.toHaveBeenCalled();
    expect(textarea()).toBeNull();
  });

  it('keeps unsaved edits open when the discard prompt is declined', async () => {
    confirmDiscardChanges.mockResolvedValue(false);
    await mount();
    await typeInto(textarea()!, 'y^3');
    await press(textarea()!, { key: 'Escape' });
    expect(confirmDiscardChanges).toHaveBeenCalledOnce();
    expect(textarea()?.value).toBe('y^3');
    expect(setEquation).not.toHaveBeenCalled();
  });

  it('restores the original formula on a confirmed Escape without saving', async () => {
    confirmDiscardChanges.mockResolvedValue(true);
    await mount();
    await typeInto(textarea()!, 'y^3');
    expect(textarea()!.value).toBe('y^3');
    await press(textarea()!, { key: 'Escape' });
    expect(confirmDiscardChanges).toHaveBeenCalledOnce();
    expect(setEquation).not.toHaveBeenCalled();
    expect(textarea()).toBeNull();

    const trigger = container!.querySelector<HTMLElement>('[title="Click to edit"]')!;
    await act(async () => trigger.click());
    expect(textarea()?.value).toBe('x^2');
  });

  it('saves with mod+Enter in a math block and shows the character count', async () => {
    await mount();
    await typeInto(textarea()!, 'y^3');
    expect(document.body.textContent).toContain('3 characters');
    await press(textarea()!, { key: 'Enter', metaKey: true });
    expect(setEquation).toHaveBeenCalledWith('y^3');
  });
});
