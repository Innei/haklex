// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: () => [
    {
      registerUpdateListener: () => () => {},
      update: vi.fn(),
    },
  ],
}));

vi.mock('../src/components/decorators/useNestedEditorSync', () => ({
  useNestedEditorSync: () => {},
}));

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let container: HTMLDivElement | null = null;
let root: Root | null = null;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
});

describe('GridEditDecorator toolbar', () => {
  it('is a labelled toolbar that marks the current column count', async () => {
    const { GridEditDecorator } = await import('../src/components/decorators/GridEditDecorator');
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () =>
      root!.render(<GridEditDecorator cellEditors={[]} cols={2} gap="16px" nodeKey="grid" />),
    );

    const toolbar = container.querySelector('[role="toolbar"]');
    expect(toolbar?.getAttribute('aria-label')).toBe('Grid');
    const pressed = [...container.querySelectorAll('button[aria-pressed="true"]')];
    expect(pressed.map((button) => button.getAttribute('aria-label'))).toEqual(['2 columns']);
    expect(container.querySelector('[aria-label="Add row"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Remove last row"]')).not.toBeNull();
  });
});
