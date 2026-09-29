// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { useEscapeDismissesTopDialog } from '../src/useEscapeDismissesTopDialog';

const dismissTopDialog = vi.fn();
vi.mock('@haklex/rich-editor-ui', () => ({ dismissTopDialog: () => dismissTopDialog() }));

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let root: Root | null = null;

afterEach(() => {
  if (root) act(() => root!.unmount());
  root = null;
  dismissTopDialog.mockClear();
});

function Layer() {
  useEscapeDismissesTopDialog();
  return null;
}

describe('useEscapeDismissesTopDialog', () => {
  it('closes only the top dialog even with two stacked layers', async () => {
    const sibling = vi.fn();
    document.addEventListener('keydown', sibling);
    root = createRoot(document.createElement('div'));
    await act(async () =>
      root!.render(
        <>
          <Layer />
          <Layer />
        </>,
      ),
    );

    document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));

    expect(dismissTopDialog).toHaveBeenCalledTimes(1);
    expect(sibling).not.toHaveBeenCalled();
    document.removeEventListener('keydown', sibling);
  });

  it('ignores other keys', async () => {
    root = createRoot(document.createElement('div'));
    await act(async () => root!.render(<Layer />));

    document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));

    expect(dismissTopDialog).not.toHaveBeenCalled();
  });
});
