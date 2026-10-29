// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ColorPicker } from '../src/components/color-picker';
import { resetRecentColors } from '../src/components/color-picker/recent';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let container: HTMLDivElement | null = null;
let root: Root | null = null;

beforeEach(() => {
  resetRecentColors();
  localStorage.clear();
});

afterEach(() => {
  if (root) act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
  document.body.innerHTML = '';
});

function render(ui: React.ReactNode) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => root?.render(ui));
}

async function click(el: Element | null | undefined) {
  expect(el).toBeTruthy();
  await act(async () => {
    (el as HTMLElement).click();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

const trigger = () => document.body.querySelector('button[aria-label="Text color"]');
const swatch = (name: string, scope: ParentNode = document.body) =>
  scope.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`);

describe('ColorPicker', () => {
  it('keeps the text-only picker when no background handler is passed', async () => {
    const onSelect = vi.fn();
    render(<ColorPicker currentColor="inherit" onSelect={onSelect} />);
    await click(trigger());
    expect(document.body.querySelector('[role="tablist"]')).toBeNull();
    await click(swatch('Red'));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect.mock.calls[0][0]).toMatch(/var\(--rc-/);
  });

  it('switches between Text and Background presets', async () => {
    const onSelect = vi.fn();
    const onSelectBackground = vi.fn();
    render(
      <ColorPicker
        currentColor="inherit"
        onSelect={onSelect}
        onSelectBackground={onSelectBackground}
      />,
    );
    await click(trigger());
    const tabs = Array.from(document.body.querySelectorAll('[role="tab"]')).map(
      (t) => t.textContent,
    );
    expect(tabs).toEqual(['Text', 'Background']);

    await click(Array.from(document.body.querySelectorAll('[role="tab"]'))[1]);
    await click(swatch('Blue'));
    expect(onSelect).not.toHaveBeenCalled();
    expect(onSelectBackground).toHaveBeenCalledOnce();
    expect(onSelectBackground.mock.calls[0][0]).toMatch(/transparent/);
  });

  it('draws the Default swatch half text, half background', async () => {
    render(<ColorPicker currentColor="inherit" onSelect={() => {}} />);
    await click(trigger());
    const dot = swatch('Default')?.querySelector('[data-default-swatch]');
    expect(dot).not.toBeNull();
  });

  it('remembers recent picks across openings', async () => {
    const onSelect = vi.fn();
    render(<ColorPicker currentColor="inherit" onSelect={onSelect} />);
    await click(trigger());
    expect(document.body.querySelector('[aria-label="Recent colors"]')).toBeNull();
    await click(swatch('Green'));

    await click(trigger());
    const recent = document.body.querySelector('[aria-label="Recent colors"]');
    expect(recent).not.toBeNull();
    const recentButtons = recent!.querySelectorAll('button');
    expect(recentButtons).toHaveLength(1);
    await click(recentButtons[0]);
    expect(onSelect).toHaveBeenLastCalledWith(onSelect.mock.calls[0][0]);
  });

  it('keeps the custom view behind Custom…', async () => {
    render(<ColorPicker currentColor="inherit" onSelect={() => {}} />);
    await click(trigger());
    await click(swatch('Custom color'));
    expect(document.body.querySelector('input[aria-label="Hex color"]')).not.toBeNull();
  });
});
